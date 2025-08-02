import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors()); // Enable CORS for frontend use

app.get("/api/scrape", async (req, res) => {
    const { url } = req.query;

    if (!url || !url.includes("amazon")) {
        return res.status(400).json({ error: "Valid Amazon product URL required." });
    }

    try {
        const headers = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        };

        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);

        // Extract info
        const link = $('link[rel="canonical"]').attr("href") || null;
        const title = $("#productTitle").text().trim() || null;
        const price = $(".a-price .a-offscreen").first().text().trim() || null;

        // Extract rating (only number)
        let rating = $(".a-icon-alt").first().text().trim() || null;
        if (rating) {
            const match = rating.match(/[\d.]+/);
            rating = match ? match[0] : null;
        }

        // Extract reviews count (numeric only)
        let reviewsCount = $("#acrCustomerReviewText").text().trim() || null;
        if (reviewsCount) {
            reviewsCount = reviewsCount.replace(/[^0-9]/g, "");
        }

        const availability = $("#availability span").first().text().trim() || null;

        return res.status(200).json({
            link,
            title,
            price,
            rating,
            reviewsCount,
            availability
        });
    } catch (error) {
        console.error("Scraping error:", error.message);
        return res.status(500).json({ error: "Failed to scrape product data" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
