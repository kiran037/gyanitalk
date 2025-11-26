export const runtime = "nodejs";

import gplay from "google-play-scraper";

export async function GET() {
  try {
    const result = await gplay.reviews({
      appId: "com.app.gyanitalk",
      sort: gplay.sort.RATING, // sorting by rating
      num: 50,                 // get more then filter 🔥
      lang: "en",
      country: "in"
    });

    // filter 4★ & 5★ only
    const filtered = result.data.filter(r => r.score >= 4);

    // format response EXACT as your component needs
    const reviews = filtered.map(r => ({
      id: r.id,
      user: {
        name: r.userName,
        avatar: r.userImage || null
      },
      rating: r.score,
      comment: r.text,
      replyText: r.replyText || null,
      replyDate: r.replyDate || null,
      thumbsUp: r.thumbsUp || 0,
      date: r.date,
      version: r.version || null,
      dateFormatted: r.date
        ? new Date(r.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : null
    }));

    // calculate stats
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return new Response(
      JSON.stringify({
        success: true,
        total: reviews.length,
        avgRating,
        reviews
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("PLAYSTORE ERROR →", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch Play Store reviews",
        error: err.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
