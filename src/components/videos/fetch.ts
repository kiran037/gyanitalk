"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

export async function getVideos() {

  const [astrology_videos] = await Promise.all([
    prisma.astrology_videos.findMany({
      // skip: offset,
      // take: limit,
      orderBy: { id: "desc" },
    }),
  ]);

  // ✅ Format Date objects into strings
  const data = astrology_videos.map((c: any) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
  }));

  return {
    data,
  };
}

// GET all astrologer videos
export async function GET() {
  const pages = await prisma.astrology_videos.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(pages);
}

// ADD new astrologer video
export async function POST(req: Request) {
  const body = await req.json();
  const { title, type, description } = body;

  const page = await prisma.astrology_videos.create({
    data: { title, type, description },
  });

  return NextResponse.json(page);
}

// UPDATE astrologer video
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, type, description } = body;

  const updated = await prisma.astrology_videos.update({
    where: { id: Number(params.id) },
    data: { title, type, description },
  });

  return NextResponse.json(updated);
}

// DELETE astrologer video
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.astrology_videos.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}

// TOGGLE Active astrologer video
export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const page = await prisma.astrology_videos.findUnique({ where: { id: Number(params.id) } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { isActive: !page.isActive },
  });

  return NextResponse.json(updated);
}