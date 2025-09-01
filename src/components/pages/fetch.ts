"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

export async function getPages() {

  const [pages] = await Promise.all([
    prisma.pages.findMany({
      // skip: offset,
      // take: limit,
    }),
  ]);

  // ✅ Format Date objects into strings
  const data = pages.map((c: any) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
  }));

  return {
    data,
  };
}

// GET all pages
export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(pages);
}

// ADD new page
export async function POST(req: Request) {
  const body = await req.json();
  const { title, type, description } = body;

  const page = await prisma.page.create({
    data: { title, type, description },
  });

  return NextResponse.json(page);
}

// UPDATE Page
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, type, description } = body;

  const updated = await prisma.page.update({
    where: { id: Number(params.id) },
    data: { title, type, description },
  });

  return NextResponse.json(updated);
}

// DELETE Page
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.page.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}

// TOGGLE Active
export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const page = await prisma.pages.findUnique({ where: { id: Number(params.id) } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { isActive: !page.isActive },
  });

  return NextResponse.json(updated);
}