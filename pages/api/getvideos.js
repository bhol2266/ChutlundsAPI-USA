import * as cheerio from 'cheerio';
import { Scrape_Video_Item } from '@/config/Scrape_Video_Item';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }

  try {
    const body_object = req.body;
    let url = body_object.url;

    if (url.includes("https://spankbang.com/")) {
      url = url.replace("https://spankbang.com/", "https://spankbang.party/");
    }

    var finalDataArray = [];
    var pages = [];

    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    finalDataArray = Scrape_Video_Item($);

    $('.paginate-bar .status').each((i, el) => {
      const data = $(el).text().replace("page", '');
      pages = data.split('/');
    });

    if (pages.length === 0) {
      // This is for pornstar page because the pornstar page is not updated to new
      let tempArray = [];
      $('.pagination ul li').each((i, el) => {
        const data = $(el).text();
        tempArray.push(data);
      });

      if (tempArray.length !== 0) {
        pages.push(tempArray[1]);
        pages.push(tempArray[tempArray.length - 2]);
      }
    }

    let result = {
      finalDataArray: finalDataArray,
      pages: pages,
      noVideos: finalDataArray.length === 0
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
