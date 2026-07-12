# 🚗 AutoParts Pro — Vehicle Spare Parts Management System

A high-performance, full-stack enterprise solution designed to streamline spare parts inventory, customer data, and booking operations. Built with a modular architecture for scalability and ease of maintenance.

---

## 🚀 Technical Architecture

This system utilizes a decoupled architecture to ensure robustness and separation of concerns.

* **Frontend:** [React.js](https://reactjs.org/) (SPA) with responsive design for seamless user experience.
* **Backend:** [Django REST Framework](https://www.django-rest-framework.org/) (DRF) providing a secure and scalable API.
* **Database:** [MySQL](https://www.mysql.com/) for reliable, relational data integrity.

## 🏗️ Project Structure

```text
spareParts/
├── backend/               # Django REST API (Business Logic & Models)
│   ├── api/               # Core app (Models, Serializers, ViewSets)
│   ├── settings.py        # Environment & Security Configuration
│   └── mysql_setup.sql    # Database schema initialization
└── frontend/              # React SPA (UI/UX)
    ├── src/pages/         # Functional modules (Dashboard, CRUD, Bookings)
    ├── src/components/    # Reusable UI components (Modals, Toasts)
    └── api.js             # Centralized API service layer

```

## 🛠️ Key Features

* **Inventory Management:** Full CRUD operations for spare parts and categories.
* **Intelligent Bookings:** Automated booking system with cart management.
* **Real-time Dashboard:** Executive overview of sales and inventory performance.
* **Secure API:** Robust authentication and serialized data handling.

## ⚙️ Quick Start

### 1. Database Setup

Ensure MySQL is running, then initialize the database:

```bash
mysql -u root -p < backend/mysql_setup.sql

```

### 2. Backend Installation

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver

```

### 3. Frontend Installation

```bash
cd frontend
npm install
npm start

```

---

Developed by Abdul Wasay 
<img width="1897" height="813" alt="image" src="https://github.com/user-attachments/assets/f90fc3fa-7357-4b7a-9a3f-67baa572c051" />


