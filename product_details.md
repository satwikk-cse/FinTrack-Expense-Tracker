# FinTrack Lite

## Product Overview

FinTrack Lite is a simple personal expense tracking web application designed for students and hostel residents to manage and understand their daily expenses.

The first version focuses on recording expenses, categorizing them, and providing a simple overview of spending.

FinTrack Lite is intentionally designed with a small scope so that the core expense-tracking experience can be built and tested before introducing more advanced features.

---

## Problem Statement

Students often spend money on food, travel, shopping, recharge, subscriptions, and other daily needs without keeping track of where their money is going.

FinTrack Lite aims to provide a simple way to record these expenses and understand basic spending patterns.

---

## Target Users

* College students
* Hostel residents
* Young individuals managing daily expenses

---

# Core Features

## 1. Add Expense

Users can add an expense with:

* Amount
* Category
* Description
* Date

Example:

```text
Amount: ₹150
Category: Food
Description: Lunch
Date: 17 September 2026
```

---

## 2. Expense Categories

Users can classify expenses into categories such as:

* Food
* Travel
* Shopping
* Education
* Recharge
* Entertainment
* Other

The category list may be expanded in future versions.

---

## 3. Expense History

Users can view all their recorded expenses in a list.

Each expense should display:

* Description
* Amount
* Category
* Date

---

## 4. Total Spending

The application displays the total amount spent across all recorded expenses.

Example:

```text
Total Spending: ₹4,250
```

---

## 5. Category-wise Spending

Users can see how much they have spent in each category.

Example:

```text
Food           ₹1,500
Travel           ₹800
Shopping         ₹650
Recharge         ₹300
Other          ₹1,000
```

---

## 6. Delete Expense

Users can remove an expense from their records.

Deleting an expense should also update the total spending and category-wise calculations.

---

## 7. Local Data Storage

Expense data will initially be stored using browser `localStorage`.

This allows expenses to remain available after refreshing or reopening the browser on the same device.

No external database will be required for the MVP.

---

# MVP Scope

The first version will include:

* Expense creation
* Expense categorization
* Expense listing
* Expense deletion
* Total spending calculation
* Category-wise spending
* Date handling
* Browser `localStorage`

The MVP will be completely frontend-based.

```text
HTML
  ↓
CSS
  ↓
JavaScript
  ↓
localStorage
```

---

# Out of Scope for MVP

The following features will **not** be implemented initially:

* User authentication
* Backend server
* Database
* Online payments
* Bank account integration
* AI-based expense classification
* Python analytics
* Cloud synchronization
* Mobile application
* Advanced forecasting

These features may be considered in future versions.

---

# Future Scope

Once the FinTrack Lite MVP is complete, the project can gradually evolve into a more advanced version of FinTrack.

Possible future improvements include:

### Backend

* User authentication
* Node.js/Express backend
* Database integration
* Cloud synchronization

### Analytics

* Monthly spending analysis
* Spending trends
* Advanced statistics
* Data visualization
* Python-based analytics

### AI

* AI-powered expense classification
* AI-generated spending insights
* Natural-language expense queries
* Spending-pattern detection
* Expense forecasting

### Financial Management

* Monthly budgets
* Spending alerts
* Recurring expenses
* Income tracking
* Savings tracking

### Data Management

* Export expenses to CSV
* Export reports to PDF
* Cloud backup

### Platform

* Progressive Web App
* Mobile application

---

# Technology

## Frontend

* HTML5
* CSS3
* JavaScript

## Storage

* Browser `localStorage`

## Development Tools

* VS Code
* Git
* GitHub

---

# Project Goal

The goal of FinTrack Lite is to build a practical and easy-to-use expense tracking application while developing real-world frontend development skills.

The project is intentionally kept small in its first version so that the fundamentals of:

* HTML
* CSS
* JavaScript
* DOM manipulation
* Event handling
* Data handling
* `localStorage`
* Basic application structure

can be understood through an actual project.

FinTrack Lite will later serve as the foundation for a more advanced full-stack version of **FinTrack**, potentially incorporating backend services, databases, Python-based analytics, data visualization, and AI-powered features.