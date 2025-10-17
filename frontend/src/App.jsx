import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TickerBar.css";
import "./App.css";

// =========================
// Chart.js Imports
// =========================
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// -------------------------
// Live Backend URL
// -------------------------
const BACKEND_URL = "https://stock-predictor-dashboard-1.onrender.com";


// =========================
// Header Component
// =========================
function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1>Stock Predictor Dashboard</h1>
          <h2>Navigate the Market with Confidence</h2>
        </div>
        <div className="header-version">V1.0.0</div>
      </div>
    </header>
  );
}

// =========================
// Sidebar Component
// =========================
function Sidebar({ onPredict }) {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onPredict) onPredict({ symbol });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <h2>Settings</h2>
        <form className="predict-form" onSubmit={handleSubmit}>
          <label htmlFor="ticker-input">Ticker</label>
          <input
            id="ticker-input"
            type="text"
            placeholder="e.g. AAPL"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
          <a
            href="https://finance.yahoo.com/lookup"
            target="_blank"
            rel="noopener noreferrer"
            className="ticker-help-link"
          >
            Don't know the ticker? Click here
          </a>
          <button type="submit">Predict</button>
        </form>
      </div>
      <div className="sidebar-logo">
        <img src="/IBP_Logo.png" alt="IBP Logo" className="logo" />
      </div>
    </div>
  );
}

// =========================
// TickerBar Component
// =========================
function TickerBar() {
  const logos = {
    AAPL: "https://logo.clearbit.com/apple.com",
    MSFT: "https://logo.clearbit.com/microsoft.com",
    GOOGL: "https://logo.clearbit.com/abc.xyz",
    AMZN: "https://logo.clearbit.com/amazon.com",
    TSLA: "https://logo.clearbit.com/tesla.com",
    META: "https://logo.clearbit.com/meta.com",
    NVDA: "https://logo.clearbit.com/nvidia.com",
    JPM: "https://logo.clearbit.com/jpmorgan.com",
    V: "https://logo.clearbit.com/visa.com",
    JNJ: "https://logo.clearbit.com/jnj.com",
    UNH: "https://logo.clearbit.com/unitedhealthgroup.com",
    PG: "https://logo.clearbit.com/us.pg.com",
    XOM: "https://logo.clearbit.com/exxonmobil.com",
    KO: "https://logo.clearbit.com/coca-cola.com",
    PEP: "https://logo.clearbit.com/pepsico.com",
    HD: "https://logo.clearbit.com/homedepot.com",
    DIS: "https://logo.clearbit.com/disney.com",
    NFLX: "https://logo.clearbit.com/netflix.com",
    INTC: "https://logo.clearbit.com/intel.com",
    PFE: "https://logo.clearbit.com/pfizer.com",
    ORCL: "https://logo.clearbit.com/oracle.com",
    CSCO: "https://logo.clearbit.com/cisco.com",
    WMT: "https://logo.clearbit.com/walmart.com",
    MCD: "https://logo.clearbit.com/mcdonalds.com",
    CVX: "https://logo.clearbit.com/chevron.com",
    NKE: "https://logo.clearbit.com/nike.com",
    COST: "https://logo.clearbit.com/costco.com",
  };

  const [tickerData, setTickerData] = useState(
    Object.keys(logos).map(symbol => ({
      symbol,
      change: 0.01,  // small dummy value to prevent zero
      logo: logos[symbol]
    }))
  );

  useEffect(() => {
    async function fetchTickerData() {
      try {
        const res = await axios.get(`${BACKEND_URL}/tickers`);
        const dataWithLogos = res.data.map(item => ({
          ...item,
          logo: logos[item.symbol] || "",
          change: item.change === 0 ? 0.01 : item.change
        }));
        setTickerData(dataWithLogos);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 10000);
    return () => clearInterval(interval);
  }, []);

  const repeatedTicker = [];
  for (let i = 0; i < 6; i++) repeatedTicker.push(...tickerData);

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {repeatedTicker.map((c, index) => {
          const isUp = c.change >= 0;
          return (
            <div key={index} className="ticker-item">
              <img src={c.logo} alt={c.symbol} className="ticker-logo" />
              <span className="ticker-symbol">{c.symbol}</span>
              <span className={`ticker-change ${isUp ? "up" : "down"}`}>
                {isUp ? "▲" : "▼"} {Math.abs(c.change.toFixed(2))}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================
// Footer Component
// =========================
function Footer() {
  return (
    <footer className="footer">
      © 2025 Daniel J. Berg (ICEBERG Projects) | Built with Python, JavaScript,
      HTML, and CSS | All Rights Reserved
    </footer>
  );
}

// =========================
// StockChart Component
// =========================
function StockChart({ data }) {
  if (!data || data.length < 1) return <p>No chart data available.</p>;

  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const past7 = sortedData.slice(-7);

  let totalChange = 0;
  for (let i = 1; i < past7.length; i++) {
    totalChange += (past7[i].price - past7[i - 1].price) / past7[i - 1].price;
  }
  const avgDailyChange = totalChange / (past7.length - 1);

  const lastPrice = past7[past7.length - 1].price;
  const future7 = [];
  let nextPrice = lastPrice;

  for (let i = 1; i <= 7; i++) {
    const randomFluctuation = (Math.random() - 0.5) * 0.01;
    nextPrice = +(nextPrice * (1 + avgDailyChange + randomFluctuation)).toFixed(2);

    const nextDate = new Date(past7[past7.length - 1].date);
    nextDate.setDate(nextDate.getDate() + i);

    future7.push({ date: nextDate.toISOString().split("T")[0], price: nextPrice });
  }

  const labels = [...past7.map(d => d.date), ...future7.map(d => d.date)];
  const pastPrices = [...past7.map(d => d.price), ...Array(future7.length).fill(null)];
  const futurePrices = [lastPrice, ...future7.map(d => d.price)];
  const paddedFuturePrices = Array(past7.length - 1).fill(null).concat(futurePrices);

  const chartDataset = {
    labels,
    datasets: [
      {
        label: "Historical Price",
        data: pastPrices,
        fill: false,
        borderColor: "#00BFFF",
        backgroundColor: "#00BFFF",
        tension: 0.3,
        pointRadius: 4
      },
      {
        label: "Predicted Price",
        data: paddedFuturePrices,
        fill: true,
        borderColor: "#00FF00",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        tension: 0.3,
        pointRadius: 4,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { mode: "index", intersect: false },
      title: { display: true, text: "Stock Price: 7 Days Past & 7 Days Ahead" }
    },
    scales: {
      x: { display: true, title: { display: true, text: "Date" } },
      y: { display: true, title: { display: true, text: "Price ($)" } }
    }
  };

  return <Line data={chartDataset} options={options} />;
}

// =========================
// App Component
// =========================
function App() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  const formatUSD = (value) => {
    if (value == null) return "-";
    return "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePredict = async ({ symbol }) => {
    setError("");
    setPrediction(null);

    if (!symbol.trim()) {
      setError("Please enter a valid ticker symbol.");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/predict`, { symbol });
      const backendData = response.data;
      setPrediction({
        ...backendData,
        chart_data: Array.isArray(backendData.chart_data) ? backendData.chart_data : [],
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="app">
      <Header />
      <TickerBar />
      <div className="content-wrapper">
        <Sidebar onPredict={handlePredict} />
        <div className="main-area" id="main-content">
          {error && <p className="error">{error}</p>}

          {prediction && (
            <>
              <div className="company-summary-card">
                <h3>{prediction.company_name || prediction.symbol}</h3>
                <p>{prediction.summary}</p>
                {prediction.sector && <p><strong>Sector:</strong> {prediction.sector}</p>}
                {prediction.industry && <p><strong>Industry:</strong> {prediction.industry}</p>}
              </div>

              {prediction.chart_data.length > 0 ? (
                <StockChart data={prediction.chart_data} />
              ) : (
                <p>No chart data available.</p>
              )}

              <div className="stock-info-table">
                <table>
                  <tbody>
                    <tr>
                      <td className="col-title">Previous Close</td>
                      <td className="col-value">{formatUSD(prediction.previous_close)}</td>
                    </tr>
                    <tr>
                      <td className="col-title">Open</td>
                      <td className="col-value">{formatUSD(prediction.open)}</td>
                    </tr>
                    <tr>
                      <td className="col-title">Day High</td>
                      <td className="col-value">{formatUSD(prediction.day_high)}</td>
                    </tr>
                    <tr>
                      <td className="col-title">Day Low</td>
                      <td className="col-value">{formatUSD(prediction.day_low)}</td>
                    </tr>
                    <tr>
                      <td className="col-title">Market Cap</td>
                      <td className="col-value">{formatUSD(prediction.market_cap)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
