import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { contact_name, contact_email, contact_message } = body;

        // Validation
        if (!contact_name || !contact_email || !contact_message) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact_email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Save to database
        const contact = await prisma.contact_us.create({
            data: {
                contact_name,
                contact_email,
                contact_message,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        return NextResponse.json(
            { 
                success: true, 
                message: "Thank you for contacting us! We'll get back to you soon.",
                data: contact 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Failed to submit contact form. Please try again later." },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: "Contact API is working" },
        { status: 200 }
    );
}