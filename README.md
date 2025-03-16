# Kanteeno

Kanteeno is a comprehensive digital platform designed to optimize canteen operations and food management through marketplace integration, automated menu planning, sustainability reporting, and data analytics.

## Overview

Kanteeno helps canteens reduce food waste, improve meal planning, and make operations more efficient through a suite of integrated tools and services. The platform serves three main user groups:

1. **Canteens** - Optimize purchasing, reduce food waste, and improve menu management
2. **Suppliers** - Digital marketplace to offer products directly to canteens
3. **Guests** - Pre-order meals and set preferences

## Key Features

### Supplier Marketplace
- Supplier registration and product management
- Pricing and kickback management
- Sales analytics dashboard

### User Management
- Role-based access control (Admin, Manager, Chef, User)
- Customizable permissions
- Activity logging

### Customer Management
- Business unit management for multi-location canteens
- Meal preferences and nutritional data tracking
- User profiles and preferences

### Sustainability & Food Optimization
- Sustainability dashboard showing CO2 footprint, food waste, and ingredient usage
- Supplier sustainability contribution monitoring
- AI-based forecasting to minimize food waste
- Canteen comparison for optimization opportunities

### Compliance & KPIs
- Compliance scoring for sustainability, food quality, and costs
- KPI reporting for key metrics
- Performance-based bonus models

### Automated Menu Planning
- AI-generated weekly menus based on user preferences and ingredient prices
- Supplier integration for price updates
- Guest app for meal planning

### Order & Delivery Management
- Delivery status monitoring
- Complaint handling
- AI-based daily summaries

## Technical Architecture

Kanteeno is built using a modern tech stack:

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT authentication
- RESTful API design

### Frontend
- Admin Portal: React with Material UI
- Guest App: React with Material UI (mobile-optimized)

### AI & Machine Learning
- Python-based forecasting models
- TensorFlow for advanced predictions
- Data analytics for waste reduction and menu optimization

### Integration
- API integrations with supplier systems
- Data export in CSV/PDF formats
- Cloud-based hosting with real-time updates

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python 3.8+ (for AI components)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/your-org/kanteeno.git
cd kanteeno
```

2. Install backend dependencies
```
cd src/backend
npm install
```

3. Install frontend dependencies
```
cd src/frontend/admin-portal
npm install

cd ../guest-app
npm install
```

4. Set up environment variables
```
cp src/backend/.env.example src/backend/.env
# Edit .env file with your configuration
```

5. Install AI dependencies
```
cd src/ai/forecasting
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server
```
cd src/backend
npm run dev
```

2. Start the admin portal
```
cd src/frontend/admin-portal
npm start
```

3. Start the guest app
```
cd src/frontend/guest-app
npm start
```

## Project Structure

```
kanteeno/
├── src/
│   ├── backend/             # Node.js backend
│   │   ├── api/             # API routes and controllers
│   │   ├── config/          # Configuration files
│   │   ├── models/          # MongoDB models
│   │   └── utils/           # Utility functions
│   ├── frontend/
│   │   ├── admin-portal/    # React admin interface
│   │   └── guest-app/       # React guest application
│   └── ai/
│       └── forecasting/     # Python ML models for forecasting
└── docs/                    # Documentation
```

## License

This project is proprietary and confidential.

## Contact

For more information, please contact [your-email@example.com](mailto:your-email@example.com).
