// app/api/scrape/route.js
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// --- Scrape listing page ---
async function scrapeListingPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const finalDataArray = [];

  $("article").each((_, el) => {
    const title = $(el).find("h2.entry-title a").text().trim();
    const href = $(el).find("h2.entry-title a").attr("href") || "";
    finalDataArray.push({ Title: title, href });
  });

  return finalDataArray;
}

// --- Scrape individual story detail page ---
async function scrapeStoryDetail(storyUrl) {
  const res = await fetch(storyUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const Title = $("h1.entry-title").text().trim();

  // Author
  const authorName = $(".author-name, .entry-author a").first().text().trim();
  const authorHref = $(".entry-author a").first().attr("href") || "";

  // Description paragraphs
  const description = [];
  $(".entry-content p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 0) description.push(text);
  });

  // Category
  const categoryTitle = $(".cat-links a").first().text().trim();

  // Date  (format: YYYYMMDD)
  const dateRaw = $("time.entry-date").attr("datetime") || "";
  const completeDate = dateRaw.replace(/-/g, "").substring(0, 8) || "00000000";

  // Related story links
  const relatedStoriesLinks = [];
  $(".related-posts a, .yarpp-related a").each((_, el) => {
    relatedStoriesLinks.push({
      title: $(el).text().trim(),
      href: $(el).attr("href") || "",
    });
  });

  // Links inside paragraphs
  const storiesLink_insideParagrapgh = [];
  $(".entry-content p a").each((_, el) => {
    storiesLink_insideParagrapgh.push({
      title: $(el).text().trim(),
      href: $(el).attr("href") || "",
    });
  });

  return {
    Title,
    author: { name: authorName, href: authorHref },
    description,
    category: { title: categoryTitle },
    completeDate,
    relatedStoriesLinks,
    storiesLink_insideParagrapgh,
  };
}

// --- Route Handler ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, url } = body;

    // mode = "listing" | "story"
    if (!mode || !url) {
      return NextResponse.json(
        { error: "Missing required fields: mode, url" },
        { status: 400 }
      );
    }

    if (mode === "listing") {
      const finalDataArray = await scrapeListingPage(url);
      return NextResponse.json({ success: true, finalDataArray });
    }

    if (mode === "story") {
      const storyData = await scrapeStoryDetail(url);
      return NextResponse.json({ success: true, storyData });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: "Scraping failed", details: error.message },
      { status: 500 }
    );
  }
}