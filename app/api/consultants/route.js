import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

// Offentlig oversigt over konsulenter, der selv har markeret, at de vil
// vises (profiles.listed) og har valgt mindst én kategori. Bruges af
// /konsulenter til at gøre "de skriver hvad de kan"-siden af platformen
// browsbar, ved siden af selve bud-flowet på opgaverne.
export async function GET(request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const { rows } = await pool.query(
      `SELECT name, bio, skills, categories, avatar_url, website_url, linkedin_url, stripe_payouts_enabled
       FROM profiles
       WHERE listed = true AND categories IS NOT NULL AND categories <> ''`
    );

    const { rows: reviewRows } = await pool.query(
      `SELECT reviewee_name, COALESCE(AVG(rating), 0)::float AS avg_rating, COUNT(*)::int AS count
       FROM reviews GROUP BY reviewee_name`
    );
    const reviewsByName = {};
    reviewRows.forEach((r) => {
      reviewsByName[r.reviewee_name] = { avgRating: r.avg_rating, reviewCount: r.count };
    });

    let consultants = rows.map((p) => ({
      name: p.name,
      bio: p.bio,
      skills: p.skills,
      categories: (p.categories || "").split(",").map((c) => c.trim()).filter(Boolean),
      avatarUrl: p.avatar_url,
      websiteUrl: p.website_url,
      linkedinUrl: p.linkedin_url,
      verified: !!p.stripe_payouts_enabled,
      avgRating: reviewsByName[p.name]?.avgRating ?? 0,
      reviewCount: reviewsByName[p.name]?.reviewCount ?? 0,
    }));

    if (category) {
      consultants = consultants.filter((c) => c.categories.includes(category));
    }

    // Flest anmeldelser først, dernæst bedst bedømt - giver et rimeligt,
    // svært-at-game standard-sortering uden at kræve manuel kuratering.
    consultants.sort((a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating);

    return NextResponse.json({ consultants });
  } catch (err) {
    console.error("Kunne ikke hente konsulenter:", err);
    return NextResponse.json({ error: "Kunne ikke hente konsulenter." }, { status: 500 });
  }
}
