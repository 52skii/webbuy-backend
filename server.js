// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Mock Database (You should switch to Firebase/Firestore later)
let carts = {}; // { userId: { items: [], history: [] } }
let exchangeRate = 3000; // MWK per USD

let orders = []; // Admin order tracking

// Route to fetch item details from Shein
app.post('/api/fetch-items', async (req, res) => {
    const { links } = req.body;
    try {
        const items = await Promise.all(links.map(async (link) => {
            // Basic scraping using axios - to be improved with a proper scraping strategy
            const response = await axios.get(link);
            const html = response.data;

            // Simulated scraping: since Shein pages are JavaScript-heavy, you would need Puppeteer in a real setup
            // For now, returning placeholders
            return {
                link,
                image: 'https://via.placeholder.com/60',
                priceUSD: parseFloat((10 + Math.random() * 40).toFixed(2))
            };
        }));

        res.json({ items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching items.' });
    }
});

// Route to save user cart
app.post('/api/save-cart', (req, res) => {
    const { userId, cartItems } = req.body;

    if (!carts[userId]) {
        carts[userId] = { items: [], history: [] };
    }

    carts[userId].items = cartItems;
    res.json({ message: 'Cart saved successfully.' });
});

// Route to get user cart
app.get('/api/get-cart/:userId', (req, res) => {
    const { userId } = req.params;
    const userCart = carts[userId] ? carts[userId].items : [];
    res.json({ cartItems: userCart });
});

// Route to save order history
app.post('/api/save-order', (req, res) => {
    const { userId, order } = req.body;

    if (!carts[userId]) {
        carts[userId] = { items: [], history: [] };
    }

    carts[userId].history.push(order);
    orders.push({ userId, order });

    res.json({ message: 'Order saved successfully.' });
});

// Route to get order history
app.get('/api/get-history/:userId', (req, res) => {
    const { userId } = req.params;
    const history = carts[userId] ? carts[userId].history : [];
    res.json({ history });
});

// Admin: Get all orders
app.get('/api/admin/orders', (req, res) => {
    res.json({ orders, exchangeRate });
});

// Admin: Update exchange rate
app.post('/api/admin/update-rate', (req, res) => {
    const { newRate } = req.body;
    exchangeRate = newRate;
    res.json({ message: 'Exchange rate updated.', exchangeRate });
});

// Admin: Update payment status and tracking
app.post('/api/admin/update-order', (req, res) => {
    const { userId, orderIndex, status, tracking } = req.body;

    if (carts[userId] && carts[userId].history[orderIndex]) {
        carts[userId].history[orderIndex].paid = status;
        carts[userId].history[orderIndex].tracking = tracking;
    }

    res.json({ message: 'Order updated.' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
