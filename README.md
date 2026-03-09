# GigShield 🛡️

**GigShield** is an AI-powered parametric insurance platform designed to protect gig delivery workers (Zomato, Swiggy, Amazon, Zepto, etc.) from income loss caused by external disruptions such as extreme weather, pollution, floods, or curfews.

## Problem Statement
Gig workers face daily income uncertainty. When bad weather, floods, or heavy smog strike, delivery services are halted, and workers lose their daily wages. The current insurance industry lacks real-time, micro-duration policies that cater to these dynamic needs.

## Core Features
1. **Dynamic Risk Assessment:** Simulated AI calculates weekly premiums based on a worker's city, risk level, and external factors.
2. **Weekly Micro-Policies:** Workers can purchase an affordable weekly insurance policy to cover income loss.
3. **Parametric Disruption Simulation:** Triggers for Rain, Flood, and Pollution automatically approve claims.
4. **Instant Payout Simulation:** Claims are processed without manual intervention, saving time for the workers.
5. **Admin Dashboard:** High-level platform analytics for monitoring risk hotspots, active policies, and claim payouts.
6. **Frontend & Backend Architecture:** Fully implemented RESTful API with React Router protected routes.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Axios, React Router Dom, Lucide-React
- **Backend:** Node.js, Express.js, Mongoose/MongoDB, JSON Web Token (JWT), BcryptJS

## Application Flow
1. **Worker Registers:** Signs up with demographic info, tracking Swiggy/Zomato profiles.
2. **AI Generates Premium:** Risk scores define the weekly cost.
3. **Policy Activation:** Worker buys the "GigShield Basic" plan.
4. **Disruption Detected:** Using the "Simulate" buttons, external events are triggered.
5. **Claims Approved:** Payout is immediately added to the "Total Protected Income" stats.

## Running the Application Locally
1. Ensure you have Node.js and MongoDB installed locally.
2. Run MongoDB on default port `27017` or change the `MONGO_URI` in `backend/.env`.
3. Install dependencies and start servers:
```sh
npm run setup
npm run dev
```
(This runs both the React dev server and the Express development server concurrently).

## Modules Implemented
- Authentication (`JWT`, `Bcrypt`)
- API Routing (`Express Router`)
- State Management (`React Context`)
- UI Ecosystem (`Tailwind CSS`, `Lucide Icons`)
