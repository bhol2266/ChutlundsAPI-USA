// File: pages/api/getAntarvasnaCategories.js
import axios from "axios";
import { load } from "cheerio";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { url } = req.body;

      let finalDataArray = [];

        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive",
                Referer: "https://www.google.com/",
            },
        });

        const $ = load(response.data);

        const posts = $(".inside-article").toArray();
        for (const element of posts) {


            const category = $(element) //because sometimes it contain mutiple categories
                .find(".cat-links a")
                .map((i, el) => $(el).text())
                .get()
                .join(", ");




            finalDataArray.push({
                url,
                category,
            });
        }

        return res.status(200).json(finalDataArray);
    } catch (error) {
        console.error("Error scraping categories:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
