const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let orders = [];
let exchangeRate = 1000;

app.get('/', (req, res) => res.send('Webbuy API Running'));

app.post('/process-links', (req, res) => {
  const { links, cartLink } = req.body;

  let items = links.map((link, index) => ({
    name: `Item ${index + 1}`,
    price: 5000 + index * 1000
  }));

  let total = items.reduce((sum, item) => sum + item.price, 0);

  res.json({ success: true, items, total });
});

app.post('/checkout', (req, res) => {
  const { email, cartLink } = req.body;

  let order = {
    email,
    link: cartLink || 'No cart link provided',
    total: 50000
  };

  orders.push(order);
  res.json({ success: true });
});

app.get('/user-orders', (req, res) => {
  const email = req.query.email;
  const userOrders = orders.filter(order => order.email === email);
  res.json({ orders: userOrders });
});

app.get('/admin-orders', (req, res) => {
  res.json({ orders });
});

app.post('/update-rate', (req, res) => {
  exchangeRate = req.body.newRate;
  res.json({ success: true });
});

app.get('/rate', (req, res) => {
  res.json({ rate: exchangeRate });
});

app.listen(3000, () => console.log('Server running on port 3000'));
