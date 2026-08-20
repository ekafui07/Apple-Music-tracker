# 🎵 Apple Music PayTrack Pro

> A full-stack Apple Music customer subscription & payment management platform powered by **React**, **Node.js / Express**, **SQLite**, and **AWS Serverless (Lambda + DynamoDB)**. Designed for digital service managers tracking subscriber memberships and collecting recurring Mobile Money fees.

![License](https://img.shields.io/badge/License-MIT-rose.svg)
![React](https://img.shields.io/badge/Frontend-React_18_|_Vite-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js_|_Express-339933?logo=nodedotjs&logoColor=white)
![Database](https://img.shields.io/badge/Database-SQLite_|_Amazon_DynamoDB-4053D6?logo=amazondynamodb&logoColor=white)
![AWS](https://img.shields.io/badge/Cloud-AWS_Lambda_|_API_Gateway-FF9900?logo=amazonaws&logoColor=white)
![Currency](https://img.shields.io/badge/Default_Currency-GHS_(₵)-10B981)

---

## 🌟 Key Features

### 🎧 Apple-Inspired Minimalist Dark UI
- Modern space-dark design system (`#0b0c10`) with Apple Music crimson (`#fa233b`) accents.
- Responsive layout optimized for desktop, tablet, and mobile devices (e.g. iPhone 14 Pro Max).

### 📱 Mobile Money Only Payment Workflow
- Strictly tailored for **Mobile Money (MoMo)** transactions.
- **1-Click MoMo Reminders**: Generates ready-to-send WhatsApp / SMS payment request text formatted with subscriber name, due date, set fee, and phone number.

### 💰 Custom Pricing & GHS Currency Default
- **Customizable Subscription Fees**: Negotiate and set custom prices per subscriber (e.g. ₵10, ₵20, ₵35, ₵50, ₵25) rather than rigid standard rates.
- **Primary Currency**: Default initialized to **Ghana Cedi GHS (₵)** with live multi-currency switcher for USD ($), EUR (€), and GBP (£).

### 📊 Financial Revenue & Audit Ledger
- **Financial Key Metrics**: Realized Cash Collected, Pending Due Balances, Collection Efficiency Rate (%), and ARPU (Average Fee Per Subscriber).
- **Cash Flow Visualizer**: Recharts dual-bar chart comparing realized monthly collections vs target revenue goals.
- **Transaction Audit Log**: Filterable ledger table tracking historical payment receipts, new registrations, and email notice dispatches.

### 🔒 Password-Resettable Admin Protection
- Single-admin portal secured with authorized admin emails.
- Integrated **Password Reset Modal** allowing admins to verify their account and update credentials persistently.

---

## ⚡ Dual Database & AWS Serverless Architecture

```
                                ┌────────────────────────────────────────────────┐
                                │             AWS SERVERLESS CLOUD               │
                                │                                                │
                                │   ┌────────────────────────────────────────┐   │
                                │   │  AWS Amplify / S3 + CloudFront CDN     │   │
User Browser ──────────────────┼──►│  (React Frontend Assets & Static UI)   │   │
  (HTTPS)                       │   └────────────────────────────────────────┘   │
                                │                       │                        │
                                │                       │ REST API (/api/*)      │
                                │                       ▼                        │
                                │   ┌────────────────────────────────────────┐   │
                                │   │  AWS API Gateway                       │   │
                                │   └───────────────────┬────────────────────┘   │
                                │                       │                        │
                                │                       ▼                        │
                                │   ┌────────────────────────────────────────┐   │
                                │   │  AWS Lambda (Node.js + Express)        │   │
                                │   │  via `@vendia/serverless-express`      │   │
                                │   └───────────────────┬────────────────────┘   │
                                │                       │                        │
                                │                       ▼                        │
                                │   ┌────────────────────────────────────────┐   │
                                │   │  Amazon DynamoDB (Pay-Per-Request NoSQL)│   │
                                │   └────────────────────────────────────────┘   │
                                └────────────────────────────────────────────────┘
```

- **Local Development**: Runs on lightweight embedded **SQLite** (`database.sqlite`).
- **Production Cloud**: Automatically switches to **Amazon DynamoDB** when deployed to AWS (`USE_DYNAMODB=true`).

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates admin login credentials |
| `POST` | `/api/auth/reset-password` | Resets admin password for authorized emails |
| `GET` | `/api/customers` | Fetches all subscribers & transaction histories |
| `POST` | `/api/customers` | Registers a new Apple Music subscriber |
| `PUT` | `/api/customers/:id` | Updates subscriber details (name, phone, fee, plan, due date, status) |
| `DELETE` | `/api/customers/:id` | Deletes a subscriber record |
| `POST` | `/api/customers/:id/mark-paid` | Records MoMo payment & advances renewal date by 1 month |
| `POST` | `/api/customers/:id/send-email` | Dispatches custom email notice & records history log |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** v20.0.0 or higher
- **npm** v10.0.0 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ekafui07/Apple-Music-tracker.git
cd Apple-Music-tracker

# Install dependencies
npm install
```

### 3. Run Local Dev Server
```bash
npm run dev
```
- Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.
- **Default Admin Credentials**:
  - Email: `edwingligah124@gmail.com` or `gligahedwin@icloud.com`
  - Password: `password123`

---

## ☁️ Deploying to AWS Serverless

Deploy the entire backend REST API, AWS Lambda functions, Amazon API Gateway, and DynamoDB database tables to AWS in **1 command**:

```bash
# 1. Configure AWS credentials
aws configure

# 2. Deploy Serverless Stack to AWS
npx serverless deploy --stage prod --region us-east-1

# 3. Build & Host Production Frontend
npm run build
```

---

## 📄 License
This project is licensed under the MIT License.
