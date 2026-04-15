import { useEffect, useMemo, useState } from 'react';
import api from '../api';

export default function POSPage() {
  const [barcode, setBarcode] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get('/api/products');
        setProducts(response.data.products || []);
      } catch {
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  const addProductToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const handleScan = async (event) => {
    event.preventDefault();
    setMessage('');

    const scanCode = barcode.trim();
    if (!scanCode) {
      setMessage('Enter or scan a barcode.');
      return;
    }

    try {
      const response = await api.get('/api/products', { params: { barcode: scanCode } });
      const product = response.data.products?.[0];

      if (!product) {
        const fallback = products.find(
          (item) =>
            item.barcode?.toString().trim() === scanCode ||
            item.name?.toLowerCase().includes(scanCode.toLowerCase())
        );

        if (fallback) {
          addProductToCart(fallback);
          setBarcode('');
          return;
        }

        setMessage('Product not found');
        return;
      }

      addProductToCart(product);
      setBarcode('');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Unable to scan item');
    }
  };

  const removeItem = (productId) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const tax = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + tax - Number(discount)).toFixed(2);

  const handleCheckout = async () => {
    setMessage('');
    if (!cart.length) {
      setMessage('Add items to the cart before checkout.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        discount: Number(discount) || 0,
      };

      const response = await api.post('/api/checkout', payload);
      setMessage(`Sale completed. Invoice ID: ${response.data.sale.id}`);
      setCart([]);
      setDiscount(0);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">POS</h1>
          <p className="page-subtitle">Tap products, scan codes, and close the sale quickly.</p>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="pos-grid">
        <section className="section-card">
          <div className="section-title-row">
            <div>
              <p className="section-title">Current order</p>
              <p className="text-muted small">Build the ticket and review the line items.</p>
            </div>
            <span className="status-pill">Live</span>
          </div>

          <form className="scan-form" onSubmit={handleScan}>
            <input
              type="text"
              value={barcode}
              className="form-control"
              placeholder="Scan barcode or enter code"
              onChange={(e) => setBarcode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Add item
            </button>
          </form>

          <div className="order-table-wrapper">
            <table className="table table-borderless table-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product.id}>
                    <td>{item.product.name}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatMoney(item.product.price * item.quantity)}</td>
                  </tr>
                ))}
                {!cart.length && (
                  <tr>
                    <td colSpan="3" className="text-muted">
                      Add products to start the order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section-card">
          <div className="section-title-row">
            <div>
              <p className="section-title">Products</p>
              <p className="text-muted small">Tap any item to add it to the order.</p>
            </div>
            <span className="status-pill status-pill-soft">{products.length} items</span>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <button
                type="button"
                key={product.id}
                className="product-card"
                onClick={() => addProductToCart(product)}
              >
                <div className="product-card-top">
                  <span className="product-label">{product.category?.name || 'General'}</span>
                  <span className={`badge ${product.stock_quantity > 8 ? 'bg-success' : 'bg-danger'}`}>
                    {product.stock_quantity} left
                  </span>
                </div>
                <div className="product-card-body">
                  <h6>{product.name}</h6>
                  <p>{product.barcode || 'No barcode'}</p>
                </div>
                <div className="product-footer">
                  <span className="product-price">{formatMoney(product.price)}</span>
                  <span className="badge bg-primary rounded-pill">Add</span>
                </div>
              </button>
            ))}
            {!products.length && <div className="text-muted">No products available.</div>}
          </div>
        </section>

        <aside className="section-card">
          <div className="section-title-row">
            <div>
              <p className="section-title">Invoice summary</p>
              <p className="text-muted small">Review totals and finalize the payment.</p>
            </div>
            <span className="status-pill status-pill-soft">Ready</span>
          </div>

          <div className="order-summary">
            <div className="summary-item">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <div className="summary-item">
              <span>Tax (10%)</span>
              <strong>{formatMoney(tax)}</strong>
            </div>
            <div className="summary-item">
              <span>Discount</span>
              <strong>{formatMoney(Number(discount) || 0)}</strong>
            </div>
            <div className="summary-total">
              <div className="d-flex justify-content-between align-items-center">
                <span>Grand total</span>
                <strong>{formatMoney(total)}</strong>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Discount</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Payment method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <button className="btn btn-success w-50 mx-auto d-block" onClick={handleCheckout} disabled={loading || !cart.length}>
            {loading ? 'Processing…' : 'Finish order'}
          </button>
        </aside>
      </div>
    </div>
  );
}
