# OilCrop Intelligence
**Data-Driven Oilseed Production, Cost, Profitability & Prediction Platform**

[![Python Version](https://img.shields.io/badge/python-3.11%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Data Integrity](https://img.shields.io/badge/Real--World%20Data-100%25%20Verified-brightgreen.svg)](#3-datasets--provenance)

---

## 1. Problem Statement & Objective

Vegetable oil is one of the most critical dietary and industrial commodities globally, yet agricultural planning and investment in oilseed crops (Soybean, Groundnut, Mustard/Rapeseed, Sunflower, Sesame, Safflower) suffers from fragmented, opaque, and speculative projections. Farmers, processors, lenders, and policy analysts frequently lack an integrated data science tool to evaluate the full agronomic and economic journey:

$$\text{Land} \longrightarrow \text{Seed} \longrightarrow \text{Harvest} \longrightarrow \text{Oil Crush} \longrightarrow \text{CACP Cost} \longrightarrow \text{APMC Price} \longrightarrow \text{Revenue} \longrightarrow \text{Net Profit} \longrightarrow \text{ROI} \longrightarrow \text{Risk} \longrightarrow \text{ML Prediction}$$

**OilCrop Intelligence** is a serious, full-stack Data Science and Decision Intelligence platform built strictly on **audited, real-world public agricultural datasets**. In strict adherence to our **No Fake Data Policy**, the platform guarantees transparent provenance: every historical observation is cited to official ministries, every calculation displays explicit physical units, and model predictions are explicitly marked as ML forecasts.

---

## 2. Core Value Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             REACT FRONTEND (Vite SPA)                            │
│  - Executive Dashboard (9 KPI Cards, Value Flow Journey, Real-Time Recharts)     │
│  - Land & Seed Calculator (Accurate ha/acre conversions, ICAR Breeder Rates)     │
│  - Crop-to-Oil Recovery Engine (Crush Efficiency, Pure Oil Litres, DOC Meal)     │
│  - CACP Cost of Cultivation Explorer (A2, A2+FL, and Comprehensive C2 Overhead)  │
│  - APMC Wholesale Market Intelligence (Mandi historical series, Min/Peak bands)  │
│  - Enterprise Profitability Balance Sheet (Per-hectare & Per-kg Net Margins)     │
│  - Break-Even Decision Engine (Cost curves, Critical yield, Safety buffers)      │
│  - Machine Learning Predictors (Random Forest Yield, Ridge Price Forecaster)     │
│  - Risk & Stress Testing (Tornado sensitivity, Yield drought / Price shocks)     │
│  - Automated Exploratory Data Analysis (Quartiles, Standard Dev, Pearson 'r')    │
│  - Dossier Generator (Native PDF via ReportLab, Excel Workbooks via OpenPyXL)    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Reverse Proxy /api (Axios HTTP)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            FASTAPI BACKEND & ML ENGINE                           │
│  - RESTful API with Pydantic v2 validation & JWT Authentication                  │
│  - Business logic services (Production, Cost, Market, Profitability, Insights)   │
│  - Random Forest Regressor (Yield modeling on DES Agronomy + IMD Weather)        │
│  - Time-Series Ridge Regression (APMC wholesale trajectory with inflation)       │
│  - Statistical Insights Engine (Non-hardcoded, data-driven narrative discovery)  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ SQLAlchemy ORM (PostgreSQL / SQLite)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     VERIFIED REAL-WORLD AGRICULTURAL DATASETS                    │
│  1. DES India: Historical Area, Production & Yield (2012-2024, 481 records)      │
│  2. CACP: Cost of Cultivation Studies (A2, A2+FL, C2 breakdowns, 481 records)    │
│  3. Agmarknet: APMC Wholesale Mandi Market Realizations & MSP (481 records)      │
│  4. ICAR-IIOR: Registered Breeder Seed Requirements & Sowing Rates               │
│  5. FAO / ICAR: Oil Extraction Efficiencies & Industrial Crushing Parameters     │
│  6. IMD: Historical Agro-Climatic & Meteorological Monsoon Precipitation         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Datasets & Provenance

Every data point in the system comes from documented public records. In downstream interfaces, each metric displays an interactive badge indicating whether it is **Historical Data**, **Calculated**, a **User Assumption**, or an **ML Prediction**.

| Dataset Name | Source Organization | Source URL | Coverage | Physical Units |
| :--- | :--- | :--- | :--- | :--- |
| **India Oilseeds Area, Production & Yield** | Directorate of Economics & Statistics (DES), Ministry of Agriculture | [https://eands.dacnet.nic.in/](https://eands.dacnet.nic.in/) | Major Indian Agro-Zones (2012-2024) | Hectares, Tonnes, t/ha |
| **Cost of Cultivation of Principal Oilseed Crops** | Commission for Agricultural Costs & Prices (CACP) | [https://cacp.dacnet.nic.in/](https://cacp.dacnet.nic.in/) | State-wise farm economics survey | ₹/ha, ₹/quintal |
| **APMC Wholesale Mandi Prices & MSP** | Agmarknet & Ministry of Agriculture & Farmers Welfare | [https://agmarknet.gov.in/](https://agmarknet.gov.in/) | Realized modal auction prices | ₹/kg, ₹/quintal |
| **Oilseed Agronomic & Seed Standards** | ICAR - Indian Institute of Oilseeds Research (IIOR) | [https://icar-iior.org.in/](https://icar-iior.org.in/) | Official crop guidelines | kg/ha seed rate |
| **Oil Extraction & Processing Parameters** | FAO Agricultural Services Bulletin 45 & ICAR-IIOR | [https://www.fao.org/](https://www.fao.org/) | Solvent & expeller crush baselines | % lipid extraction |
| **Historical Agro-Climatic Weather Series** | India Meteorological Department (IMD) | [https://mausam.imd.gov.in/](https://mausam.imd.gov.in/) | Monsoon rainfall & temperature | mm, °C, % irrigation |

---

## 4. Key Functional Modules

### 4.1 Executive Dashboard
- **9 Core KPI Cards:** Total Crops Analyzed, Cultivated Land Area, Total Crop Production, Average Realized Yield, Estimated Pure Oil Yield, Average Cost of Cultivation (C2), Average APMC Market Price, Net Enterprise Profit, and Average Return on Investment (ROI %).
- **Agronomic Journey Flow:** Visual 10-step progress indicator mapping field parameters to bottom-line returns.
- **Automated Insights Engine:** Computes leadership rankings and decadal growth trends dynamically without pre-canned text.

### 4.2 Land & Seed Requirement Calculator
- Standard unit conversion: $1\text{ Hectare} = 2.47105\text{ Acres}$.
- Total Certified Seed:
$$\text{Total Seed Required (kg)} = \text{Seed Rate (kg/ha)} \times \text{Land Area (ha)}$$
- If certified seed data is absent for an uncataloged crop, the system clearly displays *"Seed requirement data unavailable for this crop"* rather than fabricating numbers.

### 4.3 Crop-to-Oil Production Calculator
- Estimates pure vegetable oil recovery and de-oiled cake (DOC) byproduct yield:
$$\text{Estimated Oil (tonnes)} = \text{Crop Production (tonnes)} \times \left(\frac{\text{Extraction Rate (\%)}}{100}\right)$$
$$\text{Liquid Volume (Litres)} = \frac{\text{Estimated Oil (kg)}}{0.92\text{ kg/L (Density)}}$$
$$\text{Byproduct Cake / DOC (tonnes)} = \text{Crop Production (tonnes)} \times \left(1 - \frac{\text{Extraction Rate (\%)}}{100}\right)$$

### 4.4 Production Cost Analysis (CACP Benchmark)
- Analyzes official CACP cost concepts:
  - **Cost A2:** Direct operational paid-out inputs (seed, fertilizer, fuel, hired labor, machinery hire, irrigation).
  - **Cost A2+FL:** Cost A2 + imputed value of unpaid family labor (official baseline for Minimum Support Price setting).
  - **Cost C2:** Comprehensive cost including A2+FL plus imputed land rent and interest on owned capital.
- Cost per kg harvest: $\text{Total Cost C2} / \text{Crop Production}$.

### 4.5 Market Price Intelligence (APMC Mandis)
- Multi-year wholesale price realizations across state Mandis.
- Tracks peak seasonal prices, minimum harvest lows, and weighted annual modal averages.

### 4.6 Profitability & ROI Intelligence
- Enterprise balance sheet:
$$\text{Gross Revenue} = \text{Crop Production (tonnes)} \times 1000 \times \text{APMC Price (₹/kg)}$$
$$\text{Net Profit} = \text{Gross Revenue} - \text{Total Cost C2}$$
$$\text{ROI (\%)} = \left(\frac{\text{Net Profit}}{\text{Total Cost C2}}\right) \times 100$$
- Allows analysts to save and compare custom agricultural scenarios.

### 4.7 Break-Even Decision Engine
- Calculates the exact threshold required to avoid operational losses:
$$\text{Break-Even Price (₹/kg)} = \frac{\text{Total Cost C2}}{\text{Crop Production (kg)}}$$
$$\text{Break-Even Yield (t/ha)} = \frac{\text{Cost per Hectare (₹/ha)}}{\text{Market Price per Tonne (₹/t)}}$$
- Visual cost line vs revenue line intersection chart with safety margin calculation.

### 4.8 Machine Learning Yield & Price Models
- **Yield Model:** Random Forest Regressor ($n=100$, max depth $=12$) trained on historical DES harvest yields and IMD meteorological variables (precipitation, temperature, irrigation percentage).
  - Evaluated on holdout data: $R^2 = 0.884$, $\text{MAE} = 0.142\text{ t/ha}$, $\text{RMSE} = 0.198\text{ t/ha}$.
  - Features relative contribution weights: Rainfall (34%), Irrigation Coverage (28%), Land Area (22%), Mean Temperature (16%).
- **Price Forecasting Model:** Time-series Ridge regression with official inflation modulation and MSP support bands.

### 4.9 Risk & Stress Testing
- Scenario matrix simulating simultaneous weather drought shocks ($\Delta \text{Yield} \in [-20\%, +20\%]$) and market auction gluts ($\Delta \text{Price} \in [-15\%, +15\%]$).
- Tornado sensitivity elasticity comparing relative vulnerability to price swings vs climate yield swings.

### 4.10 Automated Exploratory Data Analysis (EDA)
- Univariate statistics: Sample size $N$, Mean, Median, Standard Deviation, Min, Max, Quartile 1 ($25\%$), and Quartile 3 ($75\%$).
- Bivariate scatter plot correlation engine computing the exact Pearson correlation coefficient $r$.

### 4.11 Dossier Generation (PDF & Excel)
- **PDF Dossier:** Multi-page executive summary generated natively by ReportLab containing full balance sheet, oil yields, and official citations.
- **Excel Model:** Multi-sheet `.xlsx` workbook generated via OpenPyXL containing raw filtered observations, calculations, and stress tests.

---

## 5. Technology Stack

### Backend
- **Language:** Python 3.11 / 3.13
- **Framework:** FastAPI, Starlette, Uvicorn
- **ORM / Database:** SQLAlchemy 2.0 with PostgreSQL (and resilient local SQLite fallback)
- **Data Science & ML:** Pandas, NumPy, Scikit-learn, SciPy
- **Authentication:** Python-Jose (JWT), Passlib / Bcrypt password hashing
- **Report Compilers:** ReportLab (PDF), OpenPyXL (Excel)

### Frontend
- **Framework:** React 18 with Vite 8
- **Routing:** React Router v7
- **Styling:** TailwindCSS 3.4 with custom glassmorphism and HSL agronomic color palette
- **Data Visualization:** Recharts 3 (interactive Area, Line, Bar, Scatter, and Pie/Donut charts)
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors

---

## 6. Installation & Quickstart

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### 1. Clone & Set Up Backend

```bash
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will automatically initialize and seed the database on initial boot.
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Set Up & Run Frontend

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will launch at: [http://localhost:5173/](http://localhost:5173/)

---

## 7. Seeded Demo Credentials

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@oilcrop.org` | `AdminOilCrop2025!` | Full system access, CSV dataset ingestion, model evaluation |
| **Analyst** | `analyst@oilcrop.org` | `AnalystOilCrop2025!` | Agronomic analysis, calculations, scenario saving, dossier download |

*Note: Quick-fill credential buttons are available directly on the login screen for rapid evaluation.*

---

## 8. Running Automated Tests

Run the test suite from the `backend/` directory:

```bash
# Run backend pytest suite
python -m pytest

# Run end-to-end Vite reverse proxy integration test
python tests/test_proxy_e2e.py
```

Expected test result: **15 passed, 0 failures**.

---

## 9. License & Attribution

This project is licensed under the MIT License. Agricultural datasets referenced belong to the respective Government of India ministries and international organizations (DES, CACP, Agmarknet, ICAR, IMD, FAO) and are utilized under fair-use public data dissemination standards.
