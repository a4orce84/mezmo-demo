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
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    image TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
});

// Seed products if table is empty
function seedProducts() {
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error counting products:', err);
      return;
    }
    if (row && row.count === 0) {
      const stmt = db.prepare('INSERT INTO products (name, price, image) VALUES (?, ?, ?)');
      stmt.run('T-shirt', 19.99, 'https://via.placeholder.com/150');
      stmt.run('Mug', 9.99, 'https://via.placeholder.com/150');
      stmt.run('Sticker', 2.99, 'https://via.placeholder.com/150');
      stmt.finalize();
    }
  });
}
seedProducts();

// API endpoints
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/cart', (req, res) => {
  db.all('SELECT cart.id, cart.quantity, products.* FROM cart JOIN products ON cart.product_id = products.id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/cart', (req, res) => {
  const { product_id, quantity } = req.body;
  db.run('INSERT INTO cart (product_id, quantity) VALUES (?, ?)', [product_id, quantity], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.delete('/api/cart/:id', (req, res) => {
  db.run('DELETE FROM cart WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/checkout', (req, res) => {
  db.run('DELETE FROM cart', [], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Checkout complete!' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
