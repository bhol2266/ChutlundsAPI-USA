import { load } from "cheerio";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests are allowed' });
        return;
    }

    let finalDataArray_Array = [];
    let trendingChannelArray = [];
    let tagsArray = [];
    let trendingCategoryArray = [];
    let trendingPornstarsArray = [];

    try {
        const body_object = req.body;
        let href = body_object.href;

        const response = await fetch(href);
        const body = await response.text();
        const $2 = load(body);
        $2(".video-rotate").each((i, ele) => {
            const select2 = load(ele);
            let finalDataArray = [];
            select2(".video-item").each((i2, el) => {
                const thumbnail = select2(el).find("picture img").attr("data-src");
                const title = select2(el).find("picture img").attr("alt");
                const duration = select2(el).find(".l").text();
                const views = $2(el).find('span[data-testid="views"]').find('span').last().text().trim();
                const likePercentage = $2(el).find('span[data-testid="rates"]').find('span').last().text().trim();
                const channelName = $2(el).find('a[data-testid="title"] span').text().trim();
                const channelHref = $2(el).find('a[data-testid="title"]').attr('href') || '';
                const videoBadge = select2(el).find(".video-badge.h").text().trim();
                const previewVideo = select2(el).find("picture img").attr("data-preview");
                const href2 = `https://spankbang.com${$2(el).find("a").attr("href")}`;
                var refrenceLinkType = ''

                if (channelHref.includes("/channel/")) refrenceLinkType = "channel"
                if (channelHref.includes("/s/")) refrenceLinkType = "search"
                if (channelHref.includes("/creator/")) refrenceLinkType = "creator"
                if (channelHref.includes("/pornstar/")) refrenceLinkType = "pornstar"



                if (href2 !== void 0 && previewVideo !== void 0 && !thumbnail.includes("//assets.sb-cd.com")) {
                    finalDataArray.push({
                        thumbnail,
                        title,
                        duration,
                        views,
                        likePercentage,
                        channelName,
                        channelHref,
                        refrenceLinkType,
                        videoBadge,
                        previewVideo,
                        href: href2
                    });
                }
            });
            if (finalDataArray.length > 2) {
                let videosGroupName = "";
                if (finalDataArray_Array.length == 0)
                    videosGroupName = "Trending";
                if (finalDataArray_Array.length == 1)
                    videosGroupName = "Upcoming";
                if (finalDataArray_Array.length == 2)
                    videosGroupName = "Featured";
                if (finalDataArray_Array.length == 3)
                    videosGroupName = "Popular";
                if (finalDataArray_Array.length == 4)
                    videosGroupName = "New videos";
                if (finalDataArray_Array.length == 5)
                    videosGroupName = "Random";
                finalDataArray_Array.push({ videosGroupName, finalDataArray });
            }
        });
        $2(".sub_channels .channels a").each((i, el) => {
            const channelName = $2(el).text().trim();
            const Href = $2(el).attr("href").trim();
            let imageUrl = $2(el).find("img").attr("data-src") || $2(el).find("img").attr("src");
            trendingChannelArray.push({ channelName, href: Href, imageUrl: imageUrl.replace("//spankbang.com", " https://spankbang.party") });
        });
        $2(".tag_head a").each((i, el) => {
            const tag = $2(el).text().trim();
            const tagHref = $2(el).attr("href").trim();
            tagsArray.push({ tag, href: tagHref });
        });
        $2(".sub_pornstars .pornstars a").each((i, el) => {
            const pornstarName = $2(el).text().trim();
            const Href = $2(el).attr("href").trim();
            let imageUrl = $2(el).find("img").attr("data-src") || $2(el).find("img").attr("src");
            trendingPornstarsArray.push({ pornstarName, href: Href, imageUrl: imageUrl.replace(".com", ".party") });
        });
        $2(".trending_categories a").each((i, el) => {
            const categoryName = $2(el).text().trim();
            const Href = $2(el).attr("href").trim();
            trendingCategoryArray.push({ categoryName, href: Href });
        });
        const result = {
            finalDataArray_Array,
            trendingChannels: trendingChannelArray,
            tags: tagsArray,
            trendingCategories: trendingCategoryArray,
            trendingPornstars: trendingPornstarsArray
        };

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
