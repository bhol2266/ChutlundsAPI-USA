import * as cheerio from 'cheerio';
// Import fetch for Node.js environment
import extractUrls from "extract-urls";
import { Scrape_Video_Item } from '@/config/Scrape_Video_Item';

export default async function handler(req, res) {
    const body_object = await req.body;

    let href = body_object.href;
    if (href.includes("https://spankbang.com/")) {
        href = href.replace("https://spankbang.com/", "https://spankbang.party/");
    }

    let finalDataArray = {};
    let preloaded_video_quality = '';
    let relatedVideos = [];
    let pornstar = [];
    let videodetails = {};
    let noVideos = false;
    let positionsArray = [];

    // Function to move first N items to the end of an array
    function moveFirstNItemsToEnd(array, n) {
        const itemsToMove = array.slice(0, n);
        const remainingItems = array.slice(n);
        return remainingItems.concat(itemsToMove);
    }

    // Function to scrape data from the body content using Cheerio
    const scrape = async (body) => {
        const $ = cheerio.load(body);

        // Example using Scrape_Video_Item function (adjust as per your actual implementation)
        relatedVideos = moveFirstNItemsToEnd(Scrape_Video_Item($), 8);
    };

    // Function to scrape data from the URL using Fetch and Cheerio
    const scrape2 = async (url) => {
        try {
            let default_video_src = '';
            let video_qualities_available_withURL = [];
            let screenshotsArray = [];
            let video_qualities_available = [];
            let tagsArray = [];
            let categoriesArray = [];

            // Fetch the URL content
            const response = await fetch(url);
            const body = await response.text();
            const $ = cheerio.load(body);

            // Call the scrape function with the body content
            await scrape(body);

            // Example logic to extract video source
            $('video source').each((i, el) => {
                const data = $(el).attr("src");
                default_video_src = data;
            });

            // Example logic to extract video qualities URLs
            const cut1 = body.substring(body.indexOf('<main class="main-container">'), body.indexOf(`<main class="main-container">`) + 1000);
            const cut2 = cut1.substring(cut1.indexOf('var stream_data'), body.indexOf("mpd"));
            let video_qualities_url_array = extractUrls(cut2);

            // Filter unwanted URLs
            video_qualities_url_array = video_qualities_url_array.filter(url => {
                return url.includes("https://vdownload");
            });

            // Handle default video source if null
            if (default_video_src.length < 5) {
                default_video_src = video_qualities_url_array[video_qualities_url_array.length - 2];
            }

            // Determine preloaded video quality
            if (default_video_src.includes("240p.mp4")) {
                preloaded_video_quality = "240p";
            }
            if (default_video_src.includes("320p.mp4")) {
                preloaded_video_quality = "320p";
            }
            if (default_video_src.includes("480p.mp4")) {
                preloaded_video_quality = "480p";
            }
            if (default_video_src.includes("720p.mp4")) {
                preloaded_video_quality = "720p";
            }
            if (default_video_src.includes("1080p.mp4")) {
                preloaded_video_quality = "1080p";
            }
            if (default_video_src.includes("4k.mp4")) {
                preloaded_video_quality = "4k";
            }

            // Example logic to extract available video qualities
            for (let index = 0; index < video_qualities_url_array.length; index++) {
                if (video_qualities_url_array[index].includes("vdownload")) {
                    if (video_qualities_url_array[index].includes("240p.mp4")) {
                        video_qualities_available.push("240p");
                    }
                    if (video_qualities_url_array[index].includes("320p.mp4")) {
                        video_qualities_available.push("320p");
                    }
                    if (video_qualities_url_array[index].includes("480p.mp4")) {
                        video_qualities_available.push("480p");
                    }
                    if (video_qualities_url_array[index].includes("720p.mp4")) {
                        video_qualities_available.push("720p");
                    }
                    if (video_qualities_url_array[index].includes("1080p.mp4")) {
                        video_qualities_available.push("1080p");
                    }
                    if (video_qualities_url_array[index].includes("4k.mp4")) {
                        video_qualities_available.push("4k");
                    }
                }
            }

            // Example logic to extract screenshots
            $('.timeline div').each((i, el) => {
                const url = $(el).find('span img').attr("data-src");
                const seekTime = $(el).find('.nav_time').text();
                if (seekTime != "") {
                    screenshotsArray.push({ url: url, seekTime: seekTime });
                }
            });

            // Example logic to extract tags
            $('.searches a').each((i, el) => {
                const data = $(el).text();
                tagsArray.push(data);
            });

            // Example logic to extract categories
            $('.cat .ent a').each((i, el) => {
                if ($(el).attr('href').includes('/pornstar/')) {
                    const data = $(el).text();
                    pornstar.push(data);
                }
            });

            // Example logic to extract positions
            $('.positions-wrapper .positions li').each((index, element) => {
                const timestamp = $(element).attr('data-timestamp');
                const positionName = $(element).text().trim();
                positionsArray.push({ positionName, timestamp });
            });

            // Example logic to extract video details
            const Title = $('.left h1').text().trim();
            const duration = $('.hd-time .i-length').text().trim();
            const likedPercent = $('.rate').text().trim();
            const thumbnail = $('.play_cover img').attr('src');
            const views = $('.i-plays').text().trim().replace("plays", "");

            videodetails = {
                Title: Title,
                duration: duration,
                likedPercent: likedPercent,
                thumbnail: thumbnail,
                views: views,
            };

            // Prepare final data array
            finalDataArray = {
                default_video_src: default_video_src,
                video_qualities_available: video_qualities_available,
                screenshotsArray: screenshotsArray,
                tagsArray: tagsArray,
            };

        } catch (error) {
            console.error('Error scraping data:', error);
            noVideos = true; // Set noVideos flag on error
            // Handle error or retry logic here if needed
        }
    };

    // Call scrape2 function with adjusted href
    await scrape2(href);


    const result = {
        videolink_qualities_screenshots: finalDataArray,
        preloaded_video_quality: preloaded_video_quality,
        relatedVideos: relatedVideos.length > 100 ? relatedVideos.slice(0, 100) : relatedVideos,
        pornstar: pornstar,
        video_details: videodetails,
        positionsArray: positionsArray,
        noVideos: noVideos,
    };

    // Sending JSON response using res object directly
    res.status(200).json(result);
}
