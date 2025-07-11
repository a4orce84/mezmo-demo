import React, { useEffect, useState } from 'react';
import { tracer } from './otel-logger';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutMsg, setCheckoutMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  // Fetch categories and products
  const fetchProducts = (cat = '', searchTerm = '') => {
    let url = `${API_URL}/api/products`;
    const params = [];
    if (cat) params.push(`category=${encodeURIComponent(cat)}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        // Set categories from all unique product categories
        if (!cat && !searchTerm) {
          const cats = [...new Set(data.map(p => p.category))];
          setCategories(cats);
        }
      });
  };

  useEffect(() => {
    const rootSpan = tracer.startSpan('AppLoad');
    fetchProducts();
    fetch(`${API_URL}/api/cart`).then(res => res.json()).then(setCart);
    setLoading(false);
    rootSpan.end();
  }, []);

  const addToCart = (product) => {
    fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id, quantity: 1 })
    })
      .then(() => fetch(`${API_URL}/api/cart`).then(res => res.json()).then(setCart));
  };

  const removeFromCart = (id) => {
    fetch(`${API_URL}/api/cart/${id}`, { method: 'DELETE' })
      .then(() => fetch(`${API_URL}/api/cart`).then(res => res.json()).then(setCart));
  };

  const checkout = () => {
    fetch(`${API_URL}/api/checkout`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setCheckoutMsg(data.message);
        setCart([]);
      });
  };

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>Ecommerce Demo</h1>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ minWidth: 160, marginLeft: 8 }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => fetchProducts(selectedCategory, search)}
          style={{ marginLeft: 8 }}
        >
          Filter
        </button>
        <button
          onClick={() => {
            setSelectedCategory('');
            setSearch('');
            fetchProducts();
          }}
          style={{ marginLeft: 8 }}
        >
          Clear
        </button>
      </div>
      <h2>Products</h2>
      <div style={{
        display: 'grid',
        gap: 32,
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        marginBottom: 32
      }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, background: '#111', color: '#FFD600' }}>
            <img src={product.image} alt={product.name} width={180} height={180} style={{ objectFit: 'cover', borderRadius: 8, background: '#222' }} />
            <h3 style={{ margin: '12px 0 4px' }}>{product.name}</h3>
            <div style={{ fontSize: 14, marginBottom: 8, color: '#FFD600', opacity: 0.9 }}>{product.category}</div>
            <div style={{ fontSize: 13, marginBottom: 8, color: '#FFD600', opacity: 0.8 }}>{product.description}</div>
            <p style={{ fontWeight: 'bold', fontSize: 18 }}>${product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product)} style={{ width: '100%' }}>Add to Cart</button>
          </div>
        ))}
        {products.length === 0 && <div style={{ gridColumn: '1/-1', color: '#FFD600', textAlign: 'center' }}>No products found.</div>}
      </div>
      <h2>Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.name} x {item.quantity} (${(item.price * item.quantity).toFixed(2)})
            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 8 }}>Remove</button>
          </li>
        ))}
      </ul>
      {cart.length > 0 && <button onClick={checkout}>Checkout</button>}
      {checkoutMsg && <div style={{ marginTop: 16, color: 'green' }}>{checkoutMsg}</div>}
    </div>
  );
}

export default App;
