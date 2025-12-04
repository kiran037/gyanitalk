// // app/api/support/contact/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getContactId(context: RouteContext): Promise<number> {
  const { params } = context;      // params is a Promise
  const { id } = await params;     // unwrap it

  const num = Number(id);
  if (!Number.isInteger(num)) {
    throw new Error(`Invalid contact id: "${id}"`);
  }
  return num;
}

// GET single contact by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const id = await getContactId(context);

    const contact = await prisma.contact_us.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contact });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update contact
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const id = await getContactId(context);
    const body = await req.json();

    const existingContact = await prisma.contact_us.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    const contact = await prisma.contact_us.update({
      where: { id },
      data: {
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_message: body.contact_message,
      },
    });

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE contact
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const id = await getContactId(context);

    const existingContact = await prisma.contact_us.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    await prisma.contact_us.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
