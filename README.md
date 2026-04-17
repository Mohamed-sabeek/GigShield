# 🚀 GigShield – AI-Powered Parametric Insurance for Gig Workers
> 🚀 Real-time insurance powered by AI, weather data, and automated claim validation.

GigShield is a prototype AI-driven parametric insurance platform designed to protect gig economy workers from income loss caused by real-world disruptions such as floods, extreme weather, and environmental hazards. 

Unlike traditional insurance systems, GigShield uses a **hybrid parametric model** that combines user-triggered claims with automated machine learning validation and real-time environmental data.

---

# 🌐 Live Demo

- **Frontend**: [https://gig-shield-rho.vercel.app](https://gig-shield-rho.vercel.app)
- **Backend API**: [https://gigshield.onrender.com](https://gigshield.onrender.com)

---

## 🎥 Demo Video

[Watch Demo](https://drive.google.com/file/d/14nk4KxGK3Ml9_4IBjpVhNuN_2Pv8V5GC/view?usp=sharing)

---

## 🎤 Pitch Deck

[View Pitch Deck](https://drive.google.com/file/d/1w1GFzkQD2Nb8KMMaJqsALgBHuxEcqa5U/view?usp=sharing)

---


# 💡 Solution Overview

GigShield introduces a state-of-the-art **Modern Parametric Model**:

Worker submits a claim → System validates using real-time environmental data and AI fraud detection → If conditions are met → **Payout is processed instantly within the platform.**

✔ No complex manual paperwork  
✔ Instant internal payout processing  
✔ Transparent validation logic  
✔ AI-powered fraud detection ensures only valid claims are approved and prevents system misuse.

### 🔍 Claim Validation Logic

$$Approval = WeatherValid \land LocationVerified \land FraudScoreSafe$$

---

# 🧠 ML Fraud Detection Engine

GigShield uses a sophisticated internal Machine Learning engine to ensure system integrity and prevent insurance fraud.

*   **Model**: Trained Logistic Regression classifier.
*   **Feature Set**:
    *   `totalClaims`: Transactional history frequency.
    *   `approvedClaims`: Historical validity ratio.
    *   `rejectedClaims`: Anomaly detection signal.
*   **Explainability**: The system provides behavioral explainability by tracking frequent rejections, abnormal claim patterns, and rapid submissions.

---

# 🛡️ Fraud Lifecycle System

We implement a multi-stage security lifecycle to protect the liquidity pool:

*   **Score < 50 (Safe)**: Account in good standing; eligible for instant payouts.
*   **Score 50–79 (Warning ⚠️)**: Account flagged for suspicious activity; manual review required for claims.
*   **Score ≥ 80 (Account Freeze 🚫)**: Immediate 3-day account suspension with auto-unfreeze logic.

---

# 📊 Financial Sustainability Analytics

GigShield includes an advanced admin-level financial monitoring system to ensure platform longevity:

- **Total Premium Collected**: Calculated in real-time based on active workers and fixed policy pricing.
- **Total Payout Issued**: Aggregated directly from verified and approved claims.
- **Net Sustainability**: Real-time profit/loss tracking to evaluate system health.
- **Risk Exposure**: Instant visibility into the platform's loss ratio and operational surplus.

---

# 🔁 Claim Processing Flow

Unlike traditional "set and forget" parametric systems, GigShield uses a **Hybrid Validation Flow**:

1.  **Manual Trigger**: Users submit claims during a work disruption.
2.  **Parametric Validation**: System cross-references the user's synced location with the **OpenWeather API**.
3.  **Integrity Check**: The AI Fraud Engine analyzes the submission against historical user behavior.
4.  **Instant Settlement**: Approved claims are credited to the user's internal wallet instantly.

---

# ⏱️ Claim Policy Rules

To ensure system sustainability and prevent pool exhaustion:
- **Policy Duration**: 7 consecutive days from activation.
- **Claim Frequency**: 1 claim per day (maximum 7 claims per policy).
- **Validation Thresholds**: Payouts are only triggered when verified weather data meets critical thresholds (e.g., Rain ≥ 2mm, Heat ≥ 40°C).

---

# 🔄 Dual Mode System

*   **Production Mode**: Enforces real-world constraints (1 claim/day).
*   **Test Mode**: Bypasses claim frequency limits for **ML model validation** and rapid stress-testing.

---

# 📍 Location Sync System

*   **Home Base Sync**: Users must synchronize their GPS coordinates once.
*   **Weather Anchoring**: All environmental claims are validated against this specific "Home Base" to prevent spoofing.

---

# 📧 Email & OTP Verification

*   **Secure Auth**: 6-digit OTPs for all account registrations.
*   **Timer Reset**: Requesting a new OTP automatically invalidates the previous one and resets the 5-minute expiry.

---

# 🧑‍💻 Admin Intelligence Dashboard

*   **Accurate Metrics**: Active policies count strictly uses **unique verified users**.
*   **Fraud Monitoring**: Deep-dive filters for **Frozen, Suspicious, and High Risk** accounts.

---

# 🚀 Why GigShield is Different

*   **Hybrid Intelligence**: Combines parametric insurance triggers with AI behavioral fraud detection.
*   **Hyper-Local Precision**: Real-time validation using live weather APIs anchored to verified GPS nodes.
*   **Frictionless Settlement**: Fully automated claim approval system with instant internal wallet updates.
*   **Operational Integrity**: Integrated financial sustainability tracking and loss-ratio analytics for long-term viability.

---

# 🏗️ System Architecture

```text
Frontend (React + Vite)  <--->  Backend (Node + Express)  <--->  ML Engine (Python)
          |                            |                            |
    Vercel Hosting                Render API                 Predictive Analysis
```

---

# 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Axios.
*   **Backend**: Node.js, Express.js, JWT, Nodemailer.
*   **Database**: MongoDB Atlas, Mongoose.
*   **AI/ML**: Python, Scikit-learn, Numpy, Pandas.
*   **Environmental Data**: OpenWeather API.

---

# 👨‍💻 Team

*   **Mohamed Sabeek H** (Full Stack & AI)
*   **Mohamed Asif I**
*   **Deva S**
*   **Monish R K**
*   **Karthik Vishaal M**

---

# 📜 License

Educational and prototype use only.

---

**GigShield is not just a concept — it is a fully working prototype with real-time validation, deployed frontend and backend, and an integrated ML decision system.**
