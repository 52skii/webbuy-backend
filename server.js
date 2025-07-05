// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = {
  "type": "service_account",
  "project_id": "webbuy-be987",
  "private_key_id": "YOUR-PRIVATE-KEY-ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY-HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-1738@webbuy-be987.iam.gserviceaccount.com",
  "client_id": "YOUR-CLIENT-ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "YOUR-CERT-URL"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Default exchange rate
let exchangeRate = 3000;

// Get exchange rate
app.get('/rate', (req, res) => {
  res.json({ rate: exchangeRate });
});

// Update exchange rate
app.post('/update-rate', async (req, res) => {
  const { rate } = req.body;
  exchangeRate = rate;
  await db.collection('settings').doc('rate').set({ rate });
  res.json({ success: true });
});

// Load exchange rate from Firestore on startup
const loadRate = async () => {
  const doc = await db.collection('settings').doc('rate').get();
  if (doc.exists) {
    exchangeRate = doc.data().rate;
  }
};
loadRate();

// Process Shein links (simulated)
app.post('/process-links', async (req, res) => {
  const { links } = req.body;
  const items = links.map(link => {
    const fakeUSD = parseFloat((10 + Math.random() * 40).toFixed(2));
    return {
      link,
      image: 'https://via.placeholder.com/60',
      priceUSD: fakeUSD,
      priceMWK: fakeUSD * exchangeRate
    };
  });
  res.json({ items });
});

// Save order to Firestore
app.post('/save-order', async (req, res) => {
  const { email, items, total } = req.body;
  const orderRef = await db.collection('orders').add({
    email,
    items,
    total,
    paid: false,
    tracking: 'Processing',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ success: true, id: orderRef.id });
});

// Get user orders
app.get('/orders/:email', async (req, res) => {
  const { email } = req.params;
  const snapshot = await db.collection('orders').where('email', '==', email).orderBy('timestamp', 'desc').get();
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json({ orders });
});

// Get all orders for admin
app.get('/admin/orders', async (req, res) => {
  const snapshot = await db.collection('orders').orderBy('timestamp', 'desc').get();
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json({ orders });
});

// Update order status
app.post('/admin/update-order', async (req, res) => {
  const { orderId, paid, tracking } = req.body;
  const orderRef = db.collection('orders').doc(orderId);
  await orderRef.update({ paid, tracking });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
