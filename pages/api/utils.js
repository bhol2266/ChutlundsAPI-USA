import { load } from "cheerio";


export async function handleGetFullAlbum(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Referer": "https://www.google.com/"
      }
    });

    const html = await response.text();

            const $ = load(html);


    const uploaded_by = $(".entry-meta .author .author-name").text();
    const content = $(".entry-content p").last().text();

    const imageArray = [];
    $(".entry-content p a").each((_, el) => {
      const href = $(el).attr("href");
      if (href?.includes("https://www.antarvasnaphotos2.com")) {
        imageArray.push(href);
      }
    });

    return { uploaded_by, imageArray, content };
  } catch (error) {
    console.error("Error processing full album:", error);
    return null;
  }
}