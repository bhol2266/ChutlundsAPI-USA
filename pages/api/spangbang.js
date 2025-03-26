import * as cheerio from 'cheerio';
import { Scrape_Video_Item } from '@/config/Scrape_Video_Item';

export const scrapeVideos = async (url) => {
  try {
    let finalDataArray = [];
    let pages = [];

    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    finalDataArray = Scrape_Video_Item($);

    $('.paginate-bar .status').each((i, el) => {
      const data = $(el).text().replace('page', '');
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

    return { finalDataArray, pages };
  } catch (error) {
    console.error('Error scraping videos:', error);
    return { finalDataArray: [], pages: [], error: 'Failed to scrape videos' };
  }
};
