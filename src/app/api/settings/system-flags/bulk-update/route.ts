// app/api/settings/system-flags/bulk-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// PUT - Bulk update system flags
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body;

    // Validation
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Limit bulk operations to reasonable size
    if (updates.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Cannot update more than 100 flags at once' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      try {
        const { id, value, isActive, displayName, description } = update;

        if (!id) {
          errors.push({ id: 'unknown', error: 'Flag ID is required' });
          continue;
        }

        // Check if flag exists
        const existing = await prisma.systemflag.findFirst({
          where: {
            id: parseInt(id),
            isDelete: '0',
          },
        });

        if (!existing) {
          errors.push({ id, error: 'Flag not found' });
          continue;
        }

        // Prepare update data
        const updateData: any = {
          updated_at: new Date(),
        };

        if (value !== undefined) updateData.value = value;
        if (isActive !== undefined) updateData.isActive = isActive ? '1' : '0';
        if (displayName !== undefined) updateData.displayName = displayName;
        if (description !== undefined) updateData.description = description;

        const updated = await prisma.systemflag.update({
          where: { id: parseInt(id) },
          data: updateData,
        });

        results.push({
          id: updated.id,
          name: updated.name,
          success: true,
        });
      } catch (error: any) {
        errors.push({
          id: update.id,
          error: error.message || 'Update failed',
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Successfully updated ${results.length} flags${
        errors.length > 0 ? `, ${errors.length} failed` : ''
      }`,
      data: {
        successful: results,
        failed: errors,
      },
    });
  } catch (error: any) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}

// POST - Bulk create system flags
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flags } = body;

    // Validation
    if (!Array.isArray(flags) || flags.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Flags array is required' },
        { status: 400 }
      );
    }

    // Limit bulk operations
    if (flags.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Cannot create more than 50 flags at once' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const flag of flags) {
      try {
        const { name, displayName, value, valueType, flagGroupId, description } = flag;

        if (!name || !flagGroupId) {
          errors.push({
            name: name || 'unknown',
            error: 'Name and flagGroupId are required',
          });
          continue;
        }

        // Check for duplicates
        const existing = await prisma.systemflag.findFirst({
          where: {
            name: name.trim(),
            flagGroupId: parseInt(flagGroupId),
            isDelete: '0',
          },
        });

        if (existing) {
          errors.push({
            name,
            error: 'Flag already exists in this group',
          });
          continue;
        }

        const newFlag = await prisma.systemflag.create({
          data: {
            name: name.trim(),
            displayName: displayName || name.trim(),
            value: value || '',
            valueType: valueType || 'text',
            flagGroupId: parseInt(flagGroupId),
            description: description || '',
            isActive: '1',
            isDelete: '0',
            viewenable: true,
            parent_id: 0,
          },
        });

        results.push({
          id: newFlag.id,
          name: newFlag.name,
          success: true,
        });
      } catch (error: any) {
        errors.push({
          name: flag.name || 'unknown',
          error: error.message || 'Creation failed',
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Successfully created ${results.length} flags${
        errors.length > 0 ? `, ${errors.length} failed` : ''
      }`,
      data: {
        successful: results,
        failed: errors,
      },
    });
  } catch (error: any) {
    console.error('Error in bulk create:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk create' },
      { status: 500 }
    );
  }
}