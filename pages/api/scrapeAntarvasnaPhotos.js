// File: pages/api/scrapeAntarvasnaPhotos.js
import axios from "axios";
import { load } from "cheerio";
import { handleGetFullAlbum } from "./utils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { page } = req.body;

    if (!page) {
      return res.status(400).json({ message: "Missing page number" });
    }

    const finalDataArray = [];

    const response = await axios.get(`https://www.antarvasnaphotos2.com/page/${page}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Referer": "https://www.google.com/",
      },
    });

    const $ = load(response.data);


    const posts = $(".inside-article").toArray();
    for (const element of posts) {
      const title = $(element).find(".entry-title a").text();
      const original_fullalbum_href = $(element).find(".entry-title a").attr("href");

      if (!original_fullalbum_href) continue;

      const srcset = $(element).find(".post-image img").attr("srcset");
      let thumbnail = "";
      if (srcset) {
        const srcsetArray = srcset.split(", ");
        thumbnail = srcsetArray.length > 1 ? srcsetArray[1].split(" ")[0] : srcsetArray[0].split(" ")[0];
      } else {
        thumbnail = $(element).find(".post-image img").attr("src");
      }

      const category = $(element) //because sometimes it contain mutiple categories
        .find(".cat-links a")
        .map((i, el) => $(el).text())
        .get()
        .join(", ");

      const category_href = $(element).find(".cat-links a").attr("href");
      const description = $(element).find("div.entry-summary p").text().trim();
      const tags = $(element).find("span.tags-links a").toArray().map((el) => $(el).text().trim());
      const dateString = $(element).find("time.entry-date").attr("datetime");
      const date = new Date(dateString);
      const views = $(element).find("span.post-views-eye").text().trim();

      const fullAlbumData = await handleGetFullAlbum(original_fullalbum_href);
      if (!fullAlbumData) {
        console.error("Failed to fetch full album:", original_fullalbum_href);
        continue;
      }

      const { uploaded_by, imageArray, content } = fullAlbumData;

      finalDataArray.push({
        title,
        original_fullalbum_href,
        thumbnail,
        category,
        category_href,
        description,
        tags,
        date,
        views,
        content,
        uploaded_by,
        imageArray,
      });
    }

    return res.status(200).json(finalDataArray);
  } catch (error) {
    console.error("Error scraping Antarvasna Photos:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
