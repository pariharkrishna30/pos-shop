import { useEffect, useState } from 'react';
import api from '../api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [period, setPeriod] = useState('weekly');
  const performanceRate = 74;
  const weeklyTrendData = [18, 24, 30, 27, 36, 42, 50];
  const monthlyTrendData = [12, 18, 23, 30, 28, 34, 40];
  const growthTrendData = [54, 66, 61, 73, 82, 79, 90];

  const trendData = period === 'monthly' ? monthlyTrendData : weeklyTrendData;

  const buildTrendPath = (data) => {
    if (!data.length) return '';
    const width = 420;
    const height = 120;
    const maxValue = Math.max(...data) * 1.2;
    const minValue = Math.min(...data);
    const step = width / (data.length - 1);
    const normalized = data.map((value, index) => {
      const x = index * step;
      const y = height - ((value - minValue) / (maxValue - minValue || 1)) * (height - 24) - 12;
      return { x, y };
    });

    return normalized.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  };

  const buildAreaPath = (data) => {
    if (!data.length) return '';
    const width = 420;
    const height = 120;
    const maxValue = Math.max(...data) * 1.2;
    const minValue = Math.min(...data);
    const step = width / (data.length - 1);
    const normalized = data.map((value, index) => {
      const x = index * step;
      const y = height - ((value - minValue) / (maxValue - minValue || 1)) * (height - 24) - 12;
      return { x, y };
    });

    const line = normalized.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
    return `${line} L ${width} ${height} L 0 ${height} Z`;
  };

  const trendLine = buildTrendPath(trendData);
  const trendArea = buildAreaPath(trendData);

  useEffect(() => {
    api.get('/api/reports/sales', { params: { period: 'daily' } }).then((response) => {
      setSummary(response.data);
    });

    api.get('/api/reports/top-products').then((response) => {
      setTopProducts(response.data.top_products);
    });

    api.get('/api/reports/inventory').then((response) => {
      setInventory(response.data.low_stock);
    });
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Quick overview of today’s sales and inventory.</p>
        </div>
      </div>

      <div className="dashboard-top-grid mb-4">
        <section className="section-card dashboard-top-chart">
          <div className="section-title-row">
            <div>
              <p className="section-title">Sales trend</p>
              <p className="text-muted small">Track weekly performance with a smooth revenue curve.</p>
            </div>
            <div className="dashboard-toggle-group">
              <button type="button" onClick={() => setPeriod('monthly')} className={period === 'monthly' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-secondary'}>Monthly</button>
              <button type="button" onClick={() => setPeriod('weekly')} className={period === 'weekly' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-secondary'}>Weekly</button>
            </div>
          </div>

          <div className="trend-chart">
            <svg viewBox="0 0 420 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={trendArea} className="trend-area" />
              <path d={trendLine} className="trend-line" />
            </svg>
            <div className="chart-badges">
              <span className="chart-badge chart-badge-primary">Revenue</span>
              <span className="chart-badge chart-badge-warning">Orders</span>
              <span className="chart-badge chart-badge-info">Traffic</span>
            </div>
          </div>

          <div className="trend-chart-meta">
            <div>
              <div className="trend-value">${summary?.total_revenue?.toFixed(2) || '0.00'}</div>
              <div className="trend-subtle">Projected revenue</div>
            </div>
            <div className="gauge-card">
              <svg viewBox="0 0 120 120" className="gauge-svg">
                <circle className="gauge-ring" cx="60" cy="60" r="52" />
                <circle
                  className="gauge-progress"
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray="326"
                  strokeDashoffset={`${326 - (326 * performanceRate) / 100}`}
                />
              </svg>
              <div className="gauge-label">
                <div className="trend-value">{performanceRate}%</div>
                <div className="trend-subtle">Goal completion</div>
              </div>
            </div>
          </div>
        </section>

        <aside className="section-card dashboard-side-summary">
          <div className="section-title-row">
            <div>
              <p className="section-title">Performance</p>
              <p className="text-muted small">Key metrics at a glance.</p>
            </div>
          </div>
          <div className="summary-list">
            <div className="summary-row"><span>Conversion rate</span><strong>68%</strong></div>
            <div className="summary-row"><span>Average order</span><strong>$76.20</strong></div>
            <div className="summary-row"><span>Active customers</span><strong>1,240</strong></div>
            <div className="summary-row"><span>Return rate</span><strong>12%</strong></div>
            <div className="summary-row"><span>Inventory health</span><strong>{inventory.length} alerts</strong></div>
          </div>
        </aside>
      </div>


      <div className="dashboard-card-row mb-4">
        <div className="section-card dashboard-small-card">
          <div className="section-title-row">
            <p className="section-title">Sales goal</p>
            <span className="status-pill status-pill-soft">+14%</span>
          </div>
          <div className="circle-progress">
            <span>65%</span>
          </div>
        </div>

        <div className="section-card dashboard-small-card">
          <div className="section-title-row">
            <p className="section-title">Trend growth</p>
            <span className="status-pill status-pill-soft">Stable</span>
          </div>
          <div className="mini-chart">
            {growthTrendData.map((value, index) => (
              <div key={index} className="mini-chart-bar" style={{ height: `${value}%` }} />
            ))}
          </div>
          <div className="text-muted small mt-2">Growth trend over the last 7 intervals.</div>
        </div>

        <div className="section-card dashboard-small-card">
          <div className="section-title-row">
            <p className="section-title">Revenue mix</p>
            <span className="status-pill status-pill-soft">Updated</span>
          </div>
          <div className="mini-bar-chart">
            <div>
              <div className="mini-bar-title">Online</div>
              <div className="progress-wrap progress-light"><div className="progress-bar" style={{ width: '75%' }} /></div>
            </div>
            <div>
              <div className="mini-bar-title">In-store</div>
              <div className="progress-wrap progress-light"><div className="progress-bar progress-bar-secondary" style={{ width: '62%' }} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-title-row">
            <p className="section-title">Inventory performance</p>
          </div>
          <div className="dashboard-progress-list">
            <div className="progress-item">
              <div>
                <strong>Product availability</strong>
                <p className="text-muted small">Most items are in stock.</p>
              </div>
              <div className="progress-wrap"><div className="progress-bar" style={{ width: '82%' }} /></div>
            </div>
            <div className="progress-item">
              <div>
                <strong>Order fulfillment</strong>
                <p className="text-muted small">Processing within 24h.</p>
              </div>
              <div className="progress-wrap"><div className="progress-bar" style={{ width: '68%' }} /></div>
            </div>
            <div className="progress-item">
              <div>
                <strong>Stock turnaround</strong>
                <p className="text-muted small">Fast replenishment.</p>
              </div>
              <div className="progress-wrap"><div className="progress-bar" style={{ width: '91%' }} /></div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-title-row">
            <p className="section-title">Top categories</p>
          </div>
          <div className="top-category-list">
            <div className="category-row"><span>Food</span><strong>$22.4k</strong></div>
            <div className="category-row"><span>Drink</span><strong>$15.8k</strong></div>
            <div className="category-row"><span>Snacks</span><strong>$9.3k</strong></div>
          </div>
        </div>

        <aside className="section-card">
          <div className="section-title-row">
            <p className="section-title">Performance split</p>
          </div>
          <div className="mini-donut-chart">
            <div className="donut-circle">50%</div>
          </div>
          <div className="split-list">
            <div className="split-row"><span>Online</span><strong>54%</strong></div>
            <div className="split-row"><span>In-store</span><strong>46%</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
