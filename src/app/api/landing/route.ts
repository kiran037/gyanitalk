// /src/app/api/landing/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch landing page data (blogs, testimonials, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'blogs', 'testimonials', 'features'

    // Example: Fetch different content types
    if (type === "blogs") {
      // TODO: Fetch from your database
      const blogs = [
        {
          id: 1,
          title: "Understanding Your Zodiac Sign",
          excerpt: "Discover what your zodiac sign says about you...",
          image: "/landing/blog1.jpg",
          date: "2024-01-15",
        },
        {
          id: 2,
          title: "Daily Horoscope Guide",
          excerpt: "Learn how to read your daily horoscope...",
          image: "/landing/blog2.jpg",
          date: "2024-01-10",
        },
      ];

      return NextResponse.json({ success: true, data: blogs });
    }

    if (type === "testimonials") {
      // TODO: Fetch from your database
      const testimonials = [
        {
          id: 1,
          name: "Rahul Sharma",
          rating: 5,
          comment: "Amazing experience! The astrologers are very knowledgeable.",
          avatar: "/landing/user1.jpg",
          date: "2024-01-20",
        },
        {
          id: 2,
          name: "Priya Patel",
          rating: 5,
          comment: "Highly accurate predictions. Totally worth it!",
          avatar: "/landing/user2.jpg",
          date: "2024-01-18",
        },
      ];

      return NextResponse.json({ success: true, data: testimonials });
    }

    if (type === "features") {
      const features = [
        {
          id: 1,
          icon: "⚡",
          title: "Quick Payment",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
          id: 2,
          icon: "💸",
          title: "Withdraw Money",
          description: "Send, withdraw money to your friends or transaction.",
        },
        {
          id: 3,
          icon: "📊",
          title: "User Activity",
          description: "Update or changes your activity to check more of activity.",
        },
      ];

      return NextResponse.json({ success: true, data: features });
    }

    // Default: return all landing page data
    return NextResponse.json({
      success: true,
      data: {
        heroTitle: "The Easiest Way to Connect with Astrologers",
        heroSubtitle: "Get expert guidance and predictions from certified astrologers",
        downloadLinks: {
          ios: "https://apps.apple.com/your-app",
          android: "https://play.google.com/store/apps/your-app",
        },
      },
    });
  } catch (error) {
    console.error("Landing API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch landing data" },
      { status: 500 }
    );
  }
}

// POST - Submit contact form or feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === "contact") {
      // TODO: Save contact form to database
      const { name, email, message } = data;

      // Validate required fields
      if (!name || !email || !message) {
        return NextResponse.json(
          { success: false, error: "All fields are required" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon.",
      });
    }

    if (type === "feedback") {
      // TODO: Save feedback to database
      const { rating, comment, userId } = data;

      if (!rating || !comment) {
        return NextResponse.json(
          { success: false, error: "Rating and comment are required" },
          { status: 400 }
        );
      }

      // TODO: Save to database
      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback!",
      });
    }

    if (type === "newsletter") {
      // TODO: Save email to newsletter list
      const { email } = data;

      if (!email) {
        return NextResponse.json(
          { success: false, error: "Email is required" },
          { status: 400 }
        );
      }

      // TODO: Save to database or email service
      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to newsletter!",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Landing API POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}