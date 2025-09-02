"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

export async function getBanners() {
  const banners = await prisma.banners.findMany({
    orderBy: { id: "desc" },
  });

  const data = banners.map((c: any) => ({
    ...c,
    fromDate: c.fromDate ? c.fromDate.toISOString() : null,
    toDate: c.toDate ? c.toDate.toISOString() : null,
  }));

  const bannerTypeIds = data.map((item: any) => item.bannerTypeId).filter(Boolean);

  const banner_types = await prisma.banner_types.findMany({
    where: { id: { in: bannerTypeIds } },
    select: { id: true, name: true },
  });

  return { data, banner_types };
}

// GET all astrologer videos
export async function GET() {
  const pages = await prisma.banners.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(pages);
}

// ADD new astrologer video
export async function POST(req: Request) {
  const body = await req.json();
  const { title, type, description } = body;

  const page = await prisma.banners.create({
    data: { title, type, description },
  });

  return NextResponse.json(page);
}

// UPDATE astrologer video
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, type, description } = body;

  const updated = await prisma.banners.update({
    where: { id: Number(params.id) },
    data: { title, type, description },
  });

  return NextResponse.json(updated);
}

// DELETE astrologer video
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.banners.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}

// TOGGLE Active astrologer video
export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const page = await prisma.banners.findUnique({ where: { id: Number(params.id) } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { isActive: !page.isActive },
  });

  return NextResponse.json(updated);
}