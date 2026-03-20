# 🚀 GigShield – AI-Powered Parametric Insurance for Gig Workers

GigShield is an AI-driven parametric insurance platform designed to protect gig economy workers from income loss caused by real-world disruptions such as floods, extreme weather, and environmental hazards.

Unlike traditional insurance systems, GigShield enables **instant, transparent, and automated payouts** using AI-based validation and real-time data signals.

---

# 🌍 Problem Statement

Gig workers (delivery partners, drivers, field workers) operate without financial safety nets.

They face income disruption due to:

* 🌧 Heavy rainfall & flooding
* 🌡 Heatwaves & extreme weather
* 🌫 Air pollution
* 🚦 Traffic congestion

These disruptions directly reduce their daily earnings.

❗ Traditional insurance systems:

* Are slow
* Require manual verification
* Are inaccessible to gig workers

---

# 💡 Solution Overview

GigShield introduces a **parametric insurance model**:

Worker pays a small premium →
System monitors environmental conditions →
If disruption occurs →
**Automatic payout is triggered**

✔ No paperwork
✔ No delays
✔ No complex claims

---

# ⚙️ How It Works

1. Worker registers on the platform
2. AI calculates risk score based on location
3. Worker activates weekly insurance policy
4. System monitors environmental signals
5. Worker submits claim (or auto-triggered)
6. System verifies disruption
7. Instant payout is issued

---

# 👤 Target Users

* Delivery partners (Swiggy, Zomato, etc.)
* Ride-sharing drivers
* Field workers in urban areas
* Gig workers in Tamil Nadu cities

---

# 🔥 Core Features

## 🧑‍💼 Worker Features

* Registration with work details
* View risk score & zone
* Activate weekly insurance policy
* Submit claim requests
* Track payouts & protected income

---

## 🤖 AI Risk Assessment

GigShield calculates a **risk score** using:

* Weather patterns
* Flood probability
* Pollution levels
* Traffic disruptions

Output:

* Risk Score
* Risk Zone
* Recommended premium

---

## 🛡 Weekly Insurance Policy

Example Policy:

* Weekly Premium: ₹20
* Daily Coverage: ₹500
* Duration: 7 Days

---

## 📩 Claim System

* Worker submits claim during disruption
* Limited to **1 claim per week**
* Prevents repeated misuse

---

## 🧑‍💻 Admin Verification System

* Admin dashboard shows pending claims
* Simulation-based verification
* Approve / Reject claims

---

## 💰 Payout System

If approved:

* ₹500 payout issued
* Dashboard updates total protected income

---

# 🚨 Adversarial Defense & Anti-Spoofing Strategy

## 🎯 Problem

Fraudulent users may attempt to exploit the system by:

* Faking GPS location
* Submitting false claims
* Coordinating fraud rings

---

## 🧠 Our Solution: Multi-Layer Fraud Detection

GigShield does NOT rely on a single signal like GPS.
Instead, it combines multiple verification layers:

---

### 📍 1. GPS Consistency Analysis

* Detect sudden location jumps
* Validate movement patterns
* Flag unrealistic travel speeds

---

### 📱 2. Device Integrity Checks

* Detect mock location usage
* Identify emulator environments
* Validate real sensor signals

---

### 🕒 3. Behavioral Analysis

* Multiple claims in short time → flagged
* Claims during non-working hours → suspicious
* Pattern-based anomaly detection

---

### 🌍 4. Environmental Cross-Verification

Each claim is validated using external signals:

* Rainfall data
* Temperature levels
* Pollution indexes

Example:

Flood claim → verified with rainfall API

---

### 🤖 5. AI-Based Validation Layer (Key Innovation)

GigShield can integrate:

* CCTV-based distress detection
* Pose detection models
* Activity recognition

Claims are validated only if **real distress conditions are detected**

---

### 🧑‍🤝‍🧑 6. Crowd Validation (Future Scope)

* Nearby workers confirm disruption
* Reduces single-user fraud

---

### ⚠️ 7. Risk Scoring System

Each claim is assigned a fraud score:

* Low Risk → Auto approval
* Medium Risk → Manual review
* High Risk → Rejection

---

## 🔐 Outcome

* Prevents fake GPS claims
* Detects coordinated fraud
* Protects genuine workers
* Maintains system fairness

---

# 🏗 System Architecture

GigShield follows a full-stack architecture:

Frontend → User Interface
Backend → API & Business Logic
Database → Data Storage

---

# 🛠 Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication

* JWT

---

# 📍 Supported Cities (Prototype)

* Chennai
* Coimbatore
* Madurai
* Pudukkottai

Each city uses a predefined risk model.

---

# 📊 Parametric Insurance Concept

Traditional insurance:

* Manual claims
* Delays
* Complex verification

GigShield:

* Condition-based triggers
* Automated payouts
* Transparent system

Example:

Rainfall > Threshold →
Work disruption →
Automatic payout

---

# 🚀 Future Improvements

* Real-time weather API integration
* Automated claim validation
* UPI payment gateway
* ML-based fraud detection
* Real-time geolocation tracking

---

# ▶️ How to Run

```bash
git clone https://github.com/yourusername/gigshield.git
cd GigShield
npm install
npm run dev
```

Frontend → http://localhost:5173
Backend → http://localhost:5000

---

# 👨‍💻 Author

Developed as a prototype for AI-powered insurance systems for gig workers.

---

# 📜 License

Educational and prototype use only.
