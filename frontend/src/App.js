import React, { useEffect, useState } from 'react';
import { tracer } from './otel-logger';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutMsg, setCheckoutMsg] = useState('');

  useEffect(() => {
    const rootSpan = tracer.startSpan('AppLoad');
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const span = tracer.startSpan('FetchProducts', { parent: rootSpan });
        span.setAttribute('products.count', data.length);
        span.end();
      });
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
    <div style={{ maxWidth: 800, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>Ecommerce Demo</h1>
      <h2>Products</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
            <img src={product.image} alt={product.name} width={120} height={120} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
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
