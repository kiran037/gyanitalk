// app/api/settings/route.ts
// Overview/Dashboard endpoint for settings
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch settings overview/statistics
export async function GET(req: NextRequest) {
  try {
    // Fetch counts for all setting types
    const [
      rechargeCount,
      horoscopeSignsCount,
      defaultProfilesCount,
      bannersCount,
      activeBannersCount,
      giftsCount,
      languagesCount,
      notificationsCount,
      systemFlagsCount,
      flagGroupsCount,
    ] = await Promise.all([
      prisma.rechargeamount.count(),
      prisma.hororscope_signs.count({ where: { isDelete: false } }),
      prisma.defaultprofile.count({ where: { isDelete: false } }),
      prisma.banners.count({ where: { isDelete: false } }),
      prisma.banners.count({
        where: {
          isDelete: false,
          isActive: true,
          fromDate: { lte: new Date() },
          toDate: { gte: new Date() },
        },
      }),
      prisma.gifts.count({ where: { isDelete: false } }),
      prisma.languages.count(),
      prisma.notifications.count({ where: { isDelete: false } }),
      prisma.systemflag.count({ where: { isDelete: '0' } }),
      prisma.flaggroup.count({ where: { isDelete: '0' } }),
    ]);

    // Fetch recent activity (last 10 updates across different tables)
    const recentRecharges = await prisma.rechargeamount.findMany({
      take: 3,
      orderBy: { updated_at: 'desc' },
      select: { id: true, amount: true, updated_at: true },
    });

    const recentBanners = await prisma.banners.findMany({
      take: 3,
      where: { isDelete: false },
      orderBy: { updated_at: 'desc' },
      select: { id: true, bannerImage: true, updated_at: true },
    });

    const recentFlags = await prisma.systemflag.findMany({
      take: 5,
      where: { isDelete: '0' },
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        updated_at: true,
        flagGroup: {
          select: {
            flagGroupName: true,
          },
        },
      },
    });

    // Get flag groups with counts
    const flagGroupsWithCounts = await prisma.flaggroup.findMany({
      where: { isDelete: '0' },
      select: {
        id: true,
        flagGroupName: true,
        description: true,
        _count: {
          select: {
            systemflags: {
              where: { isDelete: '0' },
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
      take: 10,
    });

    // Get critical system flags (commonly used ones)
    const criticalFlags = await prisma.systemflag.findMany({
      where: {
        isDelete: '0',
        OR: [
          { name: { contains: 'gst' } },
          { name: { contains: 'commission' } },
          { name: { contains: 'maintenance' } },
          { name: { contains: 'version' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        displayName: true,
        value: true,
        isActive: true,
        flagGroup: {
          select: {
            flagGroupName: true,
          },
        },
      },
    });

    const overview = {
      statistics: {
        recharge: {
          total: rechargeCount,
          label: 'Recharge Amounts',
          icon: '💰',
        },
        horoscopeSigns: {
          total: horoscopeSignsCount,
          label: 'Horoscope Signs',
          icon: '♈',
        },
        defaultProfiles: {
          total: defaultProfilesCount,
          label: 'Default Profiles',
          icon: '👤',
        },
        banners: {
          total: bannersCount,
          active: activeBannersCount,
          label: 'Banners',
          icon: '🎯',
        },
        gifts: {
          total: giftsCount,
          label: 'Gifts',
          icon: '🎁',
        },
        languages: {
          total: languagesCount,
          label: 'Languages',
          icon: '🌐',
        },
        notifications: {
          total: notificationsCount,
          label: 'Notification Templates',
          icon: '🔔',
        },
        systemFlags: {
          total: systemFlagsCount,
          groups: flagGroupsCount,
          label: 'System Flags',
          icon: '⚙️',
        },
      },
      recentActivity: {
        recharges: recentRecharges.map((r) => ({
          type: 'recharge',
          id: r.id,
          label: `₹${r.amount}`,
          updated_at: r.updated_at,
        })),
        banners: recentBanners.map((b) => ({
          type: 'banner',
          id: b.id.toString(),
          label: 'Banner updated',
          updated_at: b.updated_at,
        })),
        flags: recentFlags.map((f) => ({
          type: 'flag',
          id: f.id,
          label: f.displayName || f.name,
          group: f.flagGroup?.flagGroupName,
          updated_at: f.updated_at,
        })),
      },
      flagGroups: flagGroupsWithCounts.map((g) => ({
        id: g.id,
        name: g.flagGroupName,
        description: g.description,
        flagCount: g._count.systemflags,
      })),
      criticalSettings: criticalFlags.map((f) => ({
        id: f.id,
        name: f.name,
        displayName: f.displayName,
        value: f.value,
        isActive: f.isActive === '1',
        group: f.flagGroup?.flagGroupName,
      })),
    };

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    console.error('Error fetching settings overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings overview' },
      { status: 500 }
    );
  }
}