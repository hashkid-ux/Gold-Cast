# Gold Price Prediction System

> **Batch 16 — Year/Semester: II/II | Branch/Section: DS / Group-3**

## Abstract

Gold is one of the most valuable and widely traded commodities in the world, and its price is influenced by various economic and global factors such as inflation, currency exchange rates, interest rates, crude oil prices, geopolitical events, and market demand. Due to these constant fluctuations, predicting gold prices has become a challenging task for investors, financial analysts, and individuals who rely on gold as a form of investment or savings.

The Gold Price Prediction System is developed to help address this challenge by analyzing historical gold price data and forecasting future price trends using machine learning techniques. The system examines key indicators such as past gold prices, inflation rates, stock market performance, oil prices, and currency values. By identifying hidden patterns and relationships within the data, the machine learning model can predict future price movements and provide useful insights.

The system is implemented as a full-stack web application with a simple and user-friendly interface built using HTML, CSS, and JavaScript. The backend is powered by Python, where machine learning algorithms process the data and generate predictions. This architecture allows users to easily interact with the system and obtain real-time forecasts.

In addition to predicting prices, the system helps users understand market trends and supports better financial planning. This project demonstrates how artificial intelligence can be applied in the financial sector to provide practical, data-driven solutions for smarter investment decisions in a rapidly changing economic environment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python |
| ML Algorithm | RandomForestRegressor (Scikit-Learn) |

---

## Project Structure

```
gold-price-prediction/
├── frontend/          ← User interface (HTML/CSS/JS)
│   ├── src/           ← Page components & styling
│   ├── package.json   ← Frontend dependencies
│   └── vite.config.js ← Dev server config
├── backend/           ← Python ML backend
│   ├── app.py         ← Flask API server
│   ├── train.py       ← ML training pipeline
│   ├── gold_dataset.csv
│   ├── gold_model.pkl
│   ├── model_insights.json
│   └── requirements.txt
├── docs/              ← Presentations & documentation
└── README.md          ← You are here
```

---

## How to Run This Project

Pick **one** of the three options below. Each one is a complete guide from scratch.

---

### Option 1 — Run Locally on Your Computer

**What you need installed first:**
- [Python](https://www.python.org/downloads/) (version 3.9 or above)
- [Node.js](https://nodejs.org/) (version 18 or above)
- [Git](https://git-scm.com/downloads)

**Step 1: Download the project**
```bash
git clone https://github.com/YOUR_USERNAME/gold-price-prediction.git
cd gold-price-prediction
```

**Step 2: Set up the Backend (Python)**
```bash
cd backend
pip install -r requirements.txt
```

**Step 3: Train the ML model** *(only needed once)*
```bash
python train.py
```
This creates 3 files: `gold_dataset.csv`, `gold_model.pkl`, and `model_insights.json`.

**Step 4: Start the Backend server**
```bash
python app.py
```
You should see: `Running on http://127.0.0.1:5000`. **Keep this terminal open.**

**Step 5: Set up the Frontend** *(open a NEW terminal)*
```bash
cd frontend
npm install
npm run dev
```
You should see: `Local: http://localhost:5173/`

**Step 6: Open the app**

Go to **http://localhost:5173** in your browser. Done!

> **Troubleshooting:** If charts show "Loading..." make sure the backend terminal (Step 4) is still running.

---

### Option 2 — Deploy to Vercel (Frontend) + Railway (Backend)

This is the recommended way to put the app online so anyone can access it via a link.

#### Part A — Deploy the Backend on Railway

1. Go to [railway.app](https://railway.app/) and sign up with GitHub.
2. Click **"New Project"** → **"Deploy from GitHub Repo"**.
3. Select your repository.
4. Railway will ask which folder to deploy — type: `backend`
5. Go to the **Settings** tab of the service:
   - Set **Start Command** to: `python app.py`
   - Set **Port** to: `5000`
6. Go to **Settings → Networking** and click **"Generate Domain"**.
7. Copy the generated URL (example: `https://gold-backend-production.up.railway.app`).

> Railway automatically installs everything from `requirements.txt` and runs `app.py`. No extra config needed.

#### Part B — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com/) and sign up with GitHub.
2. Click **"Add New Project"** → select your repository.
3. In the **Configure Project** screen:
   - **Root Directory:** Click "Edit" and type `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Before deploying, add an **Environment Variable**:
   - **Key:** `VITE_API_URL`
   - **Value:** Paste the Railway URL from Part A (example: `https://gold-backend-production.up.railway.app`)
5. Click **Deploy**.

#### Part C — Connect Frontend to Backend

After deploying, you need to tell the frontend where the backend lives. This is **already handled** if you set the `VITE_API_URL` environment variable in Vercel (Step 4 above).

However, if your frontend still shows "Loading..." after deploy, open `frontend/vite.config.js` and confirm the proxy is set, OR create a simple API helper:

Create a file `frontend/src/apiBase.js`:
```js
const API_BASE = import.meta.env.VITE_API_URL || '';
export default API_BASE;
```

Then in each page, prefix fetch calls:
```js
import API_BASE from '../apiBase';
fetch(`${API_BASE}/api/model-insights`)
```

> **Important:** Railway free tier gives you 500 hours/month. For a university demo, this is more than enough.

---

### Option 3 — Deploy Both to Railway Only

If you want both frontend + backend on the same platform (simpler setup):

1. Go to [railway.app](https://railway.app/) and create a **New Project**.

2. **Add the Backend service:**
   - Click "New" → "GitHub Repo" → Select your repo.
   - Set **Root Directory** to `backend`.
   - Set **Start Command** to `python app.py`.
   - Set **Port** to `5000`.
   - Click **"Generate Domain"** under Settings → Networking.

3. **Add the Frontend service:**
   - In the same Railway project, click "New" → "GitHub Repo" → Select the same repo again.
   - Set **Root Directory** to `frontend`.
   - Set **Build Command** to `npm run build`.
   - Set **Start Command** to `npx serve dist -s -l 3000`.
   - Set **Port** to `3000`.
   - Add Environment Variable: `VITE_API_URL` = your backend Railway URL from step 2.
   - Click **"Generate Domain"** under Settings → Networking.

4. Open your frontend domain URL. Everything should be live!

---

## What Each Page Does

| Page | What It Shows |
|---|---|
| **Home** | Project overview, live model accuracy stats, download links. |
| **Dataset** | Browse all 1,500 rows of training data with pagination. |
| **Market Trends** | Feature importance, scatter plots, correlation matrix, OOB convergence chart. |
| **Architecture** | ML algorithm comparison, hyperparameter justification, training code, tech stack. |
| **Predictor** | Input economic indicators → get a real-time gold price forecast with interactive charts. |

---

## Team

| Roll Number | Name |
|---|---|
| 2411CS030252 | M Purushotham |
| 2411CS030260 | Mallela Harshavardhan |
| 2411CS030238 | Kummari Sai Kiran |
| 2411CS030247 | Lanka Ramakrishna |
