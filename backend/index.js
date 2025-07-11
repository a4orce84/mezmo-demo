const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');
const { trace } = require('@opentelemetry/api');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: process.env.OTEL_SERVICE_NAME || 'mezmo-demo-backend',
});

sdk.start();
console.log('OpenTelemetry SDK started');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 6000;

app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'db', 'ecommerce.sqlite');

// Ensure db directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Initialize DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) throw err;
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      image TEXT,
      category TEXT,
      description TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
    // Seed products if table is empty
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        console.error('Error counting products:', err);
        return;
      }
      if (row && row.count === 0) {
        const products = [
          {
            name: 'Wireless Headphones',
            price: 99.99,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
            category: 'Electronics',
            description: 'High-quality wireless headphones with noise cancellation.'
          },
          {
            name: 'Smartwatch',
            price: 149.99,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
            category: 'Electronics',
            description: 'Track your fitness and notifications with this stylish smartwatch.'
          },
          {
            name: 'Cotton T-shirt',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
            category: 'Apparel',
            description: 'Comfortable cotton t-shirt available in multiple colors.'
          },
          {
            name: 'Coffee Mug',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
            category: 'Home',
            description: 'Ceramic mug for your favorite hot beverages.'
          },
          {
            name: 'Throw Pillow',
            price: 24.99,
            image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
            category: 'Home',
            description: 'Soft and decorative throw pillow for your sofa or bed.'
          },
          {
            name: 'Running Shoes',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1515548212235-7a3bfc5c2d36?auto=format&fit=crop&w=400&q=80',
            category: 'Apparel',
            description: 'Lightweight running shoes for all-day comfort.'
          },
          {
            name: 'Bluetooth Speaker',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8?auto=format&fit=crop&w=400&q=80',
            category: 'Electronics',
            description: 'Portable Bluetooth speaker with impressive sound.'
          },
          {
            name: 'Notebook',
            price: 7.99,
            image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
            category: 'Office',
            description: 'A5 size notebook for notes, sketches, and ideas.'
          },
          {
            name: 'Desk Lamp',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
            category: 'Office',
            description: 'LED desk lamp with adjustable brightness.'
          },
          {
            name: 'Water Bottle',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1526178613658-3f1622045557?auto=format&fit=crop&w=400&q=80',
            category: 'Sports',
            description: 'Stainless steel water bottle, keeps drinks cold for 24h.'
          }
        ];
        const stmt = db.prepare('INSERT INTO products (name, price, image, category, description) VALUES (?, ?, ?, ?, ?)');
        products.forEach(p => stmt.run(p.name, p.price, p.image, p.category, p.description));
        stmt.finalize();
      }
    });
  });
});


// API endpoints
app.get('/api/products', (req, res) => {
  const tracer = trace.getTracer('ecommerce-backend');
  const span = tracer.startSpan('GET /api/products');
  console.log('Received GET /api/products request');
  const { category, search } = req.query;
  let query = 'SELECT * FROM products';
  let params = [];
  if (category && search) {
    query += ' WHERE category = ? AND (name LIKE ? OR description LIKE ?)';
    params = [category, `%${search}%`, `%${search}%`];
  } else if (category) {
    query += ' WHERE category = ?';
    params = [category];
  } else if (search) {
    query += ' WHERE name LIKE ? OR description LIKE ?';
    params = [`%${search}%`, `%${search}%`];
  }
  db.all(query, params, (err, rows) => {
    if (err) {
      span.setStatus({ code: 2, message: err.message });
      span.end();
      return res.status(500).json({ error: err.message });
    }
    span.setStatus({ code: 1 });
    span.end();
    res.json(rows);
  });
});

app.get('/api/cart', (req, res) => {
  const tracer = trace.getTracer('ecommerce-backend');
  const span = tracer.startSpan('GET /api/cart');
  console.log('Received GET /api/cart request');
  db.all('SELECT cart.id, cart.quantity, products.* FROM cart JOIN products ON cart.product_id = products.id', (err, rows) => {
    if (err) {
      span.setStatus({ code: 2, message: err.message });
      span.end();
      return res.status(500).json({ error: err.message });
    }
    span.setStatus({ code: 1 });
    span.end();
    res.json(rows);
  });
});

app.post('/api/cart', (req, res) => {
  const tracer = trace.getTracer('ecommerce-backend');
  const span = tracer.startSpan('POST /api/cart');
  const { product_id, quantity } = req.body;
  console.log(`Received POST /api/cart request: product_id=${product_id}, quantity=${quantity}`);
  db.run('INSERT INTO cart (product_id, quantity) VALUES (?, ?)', [product_id, quantity], function(err) {
    if (err) {
      span.setStatus({ code: 2, message: err.message });
      span.end();
      return res.status(500).json({ error: err.message });
    }
    span.setStatus({ code: 1 });
    span.end();
    res.json({ id: this.lastID });
  });
});

app.delete('/api/cart/:id', (req, res) => {
  const tracer = trace.getTracer('ecommerce-backend');
  const span = tracer.startSpan('DELETE /api/cart/:id');
  console.log(`Received DELETE /api/cart/${req.params.id} request`);
  db.run('DELETE FROM cart WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      span.setStatus({ code: 2, message: err.message });
      span.end();
      return res.status(500).json({ error: err.message });
    }
    span.setStatus({ code: 1 });
    span.end();
    res.json({ success: true });
  });
});

app.post('/api/checkout', (req, res) => {
  const tracer = trace.getTracer('ecommerce-backend');
  const span = tracer.startSpan('POST /api/checkout');
  console.log('Received POST /api/checkout request');
  db.run('DELETE FROM cart', [], function(err) {
    if (err) {
      span.setStatus({ code: 2, message: err.message });
      span.end();
      return res.status(500).json({ error: err.message });
    }
    span.setStatus({ code: 1 });
    span.end();
    res.json({ success: true, message: 'Checkout complete!' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
