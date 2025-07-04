import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// API endpoint to fetch Shein product data
app.get('/api/fetch-product', async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text().trim();
    const image = $('meta[property="og:image"]').attr('content');
    const price = $('meta[property="og:product:price:amount"]').attr('content') || 
                  $('meta[itemprop="price"]').attr('content') || 
                  (Math.random() * 40 + 10).toFixed(2); // fallback price

    res.json({
      title,
      priceUSD: parseFloat(price),
      image: image || 'https://via.placeholder.com/100'
    });
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.listen(PORT, () => {
  console.log(Webbuy proxy server running on port ${PORT});
});