import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Fetch single product
app.get('/api/fetch-product', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const image = $('meta[property="og:image"]').attr('content') || '';
    const priceUSD = parseFloat($('meta[property="product:price:amount"]').attr('content')) || 
                     parseFloat($('[itemprop=price]').attr('content')) || 0;
    res.json({ image, priceUSD });
  } catch (e) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Fetch shared cart
app.get('/api/fetch-cart', async (req, res) => {
  const { url } = req.query;
  // naive example: pretend we parse items from a shared-cart URL
  // In real life you'd fetch and parse properly
  res.json({ items: [] });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(Backend running on port ${PORT}));
