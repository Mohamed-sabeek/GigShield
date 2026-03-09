# GigShield – AI-Powered Parametric Insurance for Gig Workers

GigShield is a prototype platform that provides **income protection for gig economy workers** such as delivery partners.
It uses **AI-driven risk analysis and parametric insurance logic** to automatically compensate workers when environmental disruptions prevent them from working.

The system demonstrates how **technology and insurance can work together** to provide financial stability for gig workers.

---

# Problem Statement

Gig workers such as delivery partners often face **income loss due to unpredictable disruptions** like:

* Heavy rain
* Flooding
* High pollution levels
* Traffic disruptions

Unlike traditional employees, gig workers **do not have financial protection or insurance coverage** during such disruptions.

GigShield solves this problem by offering **low-cost weekly insurance coverage** that compensates workers when environmental conditions prevent them from working.

---

# Solution Overview

GigShield introduces a **parametric insurance model** where claims are triggered based on predefined disruption conditions rather than lengthy manual verification.

Key idea:

Worker pays a **small weekly premium** →
If disruption occurs →
System verifies event →
Worker receives **automatic payout**.

This allows fast and transparent compensation.

---

# Key Features

## Worker Features

Worker Registration
Workers can create an account and provide basic details such as:

* Platform (Zomato, Swiggy, etc.)
* City
* Working area
* Average daily income

---

## AI Risk Assessment

The system calculates a **risk score** based on location and environmental factors.

Risk analysis considers:

* Weather conditions
* Flood probability
* Pollution levels
* Traffic disruptions

This generates:

* Risk Score
* Risk Zone
* Recommended insurance premium

---

## Weekly Insurance Policy

Workers can activate a **GigShield Basic Policy**.

Example:

Weekly Premium: ₹20
Daily Coverage: ₹500
Policy Duration: 7 days

The policy protects the worker against income loss during disruptions.

---

## Claim Request System

Workers can submit a claim request when they cannot work due to disruptions such as:

* Heavy Rain
* Flood
* Pollution

Each policy allows **only one claim request per week** to prevent misuse.

---

## Admin Claim Verification

Admin dashboard allows verification of claims through a simulation step.

Process:

Worker submits claim →
Admin runs disruption simulation →
Admin approves or rejects the claim.

Simulation represents real-world verification using APIs such as:

* Weather APIs
* Environmental monitoring systems

---

## Payout System

If the claim is approved:

Worker receives a payout of:

₹500

The worker dashboard updates the **Total Protected Income**.

---

## Fraud Prevention

GigShield includes basic fraud prevention mechanisms:

* Only one claim allowed per weekly policy
* Admin verification before payout
* Policy status validation
* Claim request tracking

---

## Admin Dashboard

The admin panel provides system insights and controls:

* Pending Claim Requests
* Claim Verification System
* AI High-Risk Hotspots
* System Health Monitoring

This allows administrators to monitor disruptions and verify claims efficiently.

---

# System Workflow

Worker registers on the platform
↓
System calculates AI risk score
↓
Worker activates weekly policy
↓
Disruption occurs (rain/flood/pollution)
↓
Worker submits claim request
↓
Admin verifies using simulation
↓
Claim approved
↓
Worker receives payout

---

# Tech Stack

## Frontend

React.js
Vite
Tailwind CSS
Lucide Icons

---

## Backend

Node.js
Express.js

---

## Database

MongoDB
Mongoose ORM

---

## Authentication

JWT (JSON Web Tokens)

---

# Project Architecture

GigShield follows a **full-stack architecture**.

Frontend
Handles UI, dashboards, and user interaction.

Backend
Handles API logic, claim verification, and policy management.

Database
Stores user data, policies, and claim records.

---

# Supported Cities (Prototype)

For demonstration purposes the system currently supports cities within Tamil Nadu:

* Chennai
* Coimbatore
* Madurai
* Pudukkottai

Each city has a predefined **risk model** used for insurance calculations.

---

# Parametric Insurance Concept

Traditional insurance requires manual claim processing and verification.

GigShield uses **parametric insurance**, where payouts are triggered based on predefined conditions.

Example:

Rainfall exceeds threshold →
Delivery disruption occurs →
Worker receives payout automatically.

This reduces claim processing time and improves transparency.

---

# Future Improvements

Potential improvements include:

Integration with real weather APIs
Automated claim verification using real environmental data
UPI payment gateway integration for premium payments
Machine learning-based risk prediction
Geolocation-based disruption tracking

---

# How to Run the Project

Clone the repository

```
git clone https://github.com/yourusername/gigshield.git
```

Navigate to project folder

```
cd GigShield
```

Install dependencies

```
npm install
```

Start the application

```
npm run dev
```

The application will start:

Frontend → http://localhost:5173
Backend → http://localhost:5000

---

# Author

Developed as a prototype for exploring **AI-powered parametric insurance systems for gig workers**.

---

# License

This project is for educational and prototype purposes.
