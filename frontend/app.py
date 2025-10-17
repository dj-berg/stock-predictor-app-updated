from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

# =========================
# Predict stock endpoint
# =========================
@app.route("/predict", methods=["POST"])
def predict_stock():
    data = request.get_json()
    symbol = data.get("symbol", "").upper()

    if not symbol:
        return jsonify({"error": "No stock symbol provided", "chart_data": []}), 400

    try:
        stock = yf.Ticker(symbol)

        # --- Get historical data ---
        hist = stock.history(period="1mo")
        if hist.empty:
            return jsonify({"error": f"No data found for symbol '{symbol}'", "chart_data": []}), 400

        hist.reset_index(inplace=True)
        hist["Date"] = pd.to_datetime(hist["Date"])
        hist["Day"] = np.arange(len(hist))

        X = hist[["Day"]]
        y = hist["Close"]
        model = LinearRegression()
        model.fit(X, y)

        next_day = pd.DataFrame({"Day": [len(hist)]})
        predicted_price = float(model.predict(next_day)[0])
        latest_price = float(hist["Close"].iloc[-1])

        chart_data = [
            {"date": row["Date"].strftime("%Y-%m-%d"), "price": round(float(row["Close"]), 2)}
            for _, row in hist.iterrows()
        ]

        # --- Get company info ---
        info = stock.info
        company_name = info.get("longName", symbol)
        summary = info.get("longBusinessSummary", "No summary available.")
        sector = info.get("sector", "N/A")
        industry = info.get("industry", "N/A")

        # --- Monetary info ---
        previous_close = info.get("previousClose", 0)
        open_price = info.get("open", 0)
        day_high = info.get("dayHigh", 0)
        day_low = info.get("dayLow", 0)
        market_cap = info.get("marketCap", 0)

        return jsonify({
            "symbol": symbol,
            "latest_price": round(latest_price, 2),
            "predicted_price": round(predicted_price, 2),
            "chart_data": chart_data,
            "company_name": company_name,
            "summary": summary,
            "sector": sector,
            "industry": industry,
            "previous_close": previous_close,
            "open": open_price,
            "day_high": day_high,
            "day_low": day_low,
            "market_cap": market_cap
        })

    except Exception as e:
        return jsonify({"error": str(e), "chart_data": []}), 500


# =========================
# Live ticker percent changes
# =========================
@app.route("/tickers", methods=["GET"])
def get_tickers():
    tickers = [
        "AAPL","MSFT","GOOGL","AMZN","TSLA","META","NVDA",
        "JPM","V","JNJ","UNH","PG","XOM","KO","PEP",
        "HD","DIS","NFLX","INTC","PFE","ORCL","CSCO",
        "WMT","MCD","CVX","NKE","COST"
    ]
    results = []

    for symbol in tickers:
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            latest = info.get("regularMarketPrice")
            prev_close = info.get("previousClose")
            if latest is None or prev_close is None or prev_close == 0:
                change = 0
            else:
                change = round(((latest - prev_close) / prev_close) * 100, 2)
            results.append({"symbol": symbol, "change": change})
        except:
            results.append({"symbol": symbol, "change": 0})

    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
