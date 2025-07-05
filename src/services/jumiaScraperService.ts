import axios from "axios";
import * as cheerio from "cheerio";

export interface JumiaProduct {
  name: string;
  price: string;
  rating: string;
  link: string;
  image: string;
}

export async function scrapeJumiaProducts(query: string, page = 1): Promise<JumiaProduct[]> {
  const url = `https://www.jumia.co.ke/catalog/?q=${encodeURIComponent(query)}&page=${page}#catalog-listing`;
  const headers = { "User-Agent": "Mozilla/5.0" };
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const items = $("article.prd._fb.col.c-prd");
    const productList: JumiaProduct[] = [];

    items.slice(0, 10).each((_, el) => {
      try {
        const name = $(el).find("h3.name").text().trim();
        const price = $(el).find("div.prc").text().trim();
        const rating = $(el).find("div.rev").text().trim() || "No rating";
        const link = "https://www.jumia.co.ke" + $(el).find("a.core").attr("href");
        const imageTag = $(el).find("img");
        const image = imageTag.attr("data-src") || imageTag.attr("src");
        productList.push({ name, price, rating, link, image });
      } catch {}
    });

    return productList;
  } catch {
    return [];
  }
} 