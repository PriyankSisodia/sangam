<div align="center">

# 🚀 Sangam

**Unified Communication Platform for Small Businesses**

*Streamline your orders, chats, and catalog management in one beautiful dashboard*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-1C1C1C?style=for-the-badge&logo=sqlalchemy)](https://www.sqlalchemy.org/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

**Sangam** is a modern, full-stack platform designed to help small businesses manage their customer communications, orders, and product catalog all in one place. Whether you're handling Instagram DMs, WhatsApp messages, or Facebook chats, Sangam brings everything together in a beautiful, intuitive interface.

### Why Sangam?

- 🎯 **Unified Dashboard** - Manage orders, chats, and catalog from one place
- 💬 **Multi-Platform Support** - Handle Instagram, WhatsApp, and Facebook messages
- 📦 **Order Management** - Create orders directly from customer chats
- 🛍️ **Catalog Management** - Beautiful product catalog with image management
- 🎨 **Modern UI** - Clean, responsive design that works on all devices
- 🔒 **Secure** - JWT-based authentication and secure API endpoints

---

## ✨ Features

### 💬 **Chat Management**
- View all customer conversations in one place
- Filter by platform (Instagram, WhatsApp, Facebook)
- Filter by status (read, unread)
- Search across all chats
- Real-time message history
- Last message preview with timestamp

### 📦 **Order Management**
- Create orders directly from customer chats
- Track order status (Pending, In Transit, Production, Delivered, Delayed)
- Payment status tracking (Pending, Paid)
- Process status management
- Order search and filtering
- Beautiful order dashboard with statistics

### 🛍️ **Catalog Management**
- Product catalog with images
- Category organization
- Stock management
- Price tracking
- Sold units tracking
- Image upload and management
- Edit and delete products

### 🔐 **Authentication & Security**
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- Session management

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database (PostgreSQL ready)
- **Python 3.12+** - Programming language
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Canvas Confetti** - Celebration animations

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12 or higher
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sangam.git
   cd sangam
   ```

2. **Set up Backend**
   ```bash
   cd sangam-backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run the server
   uvicorn main:app --reload
   ```
   
   Backend will be available at `http://localhost:8000`
   API Documentation at `http://localhost:8000/docs`

3. **Set up Frontend**
   ```bash
   cd sangam-frontend
   
   # Install dependencies
   npm install
   
   # Create .env file
   echo "VITE_API_URL=http://localhost:8000" > .env
   
   # Run development server
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

4. **Create Test Data (Optional)**
   ```bash
   cd sangam-backend
   source venv/bin/activate
   python seed_test_data.py
   ```
   This will create sample chats, orders, and catalog items for testing.

---

## 📱 Usage

### 1. **Sign Up / Login**
- Navigate to the login page
- Create a new account or login with existing credentials
- You'll be redirected to the dashboard upon successful login

### 2. **Chat Management**
- View all customer conversations in the Chats tab
- Click on any chat to view message history
- Filter chats by platform, status, or date
- Use the search bar to find specific conversations

### 3. **Create Orders from Chats**
- Open a chat conversation
- Click "Create Order" button
- Select products from your catalog
- Add quantities and notes
- Set payment status and delivery address
- Submit to create the order

### 4. **Manage Orders**
- View all orders in the Orders tab
- Filter by status, payment, or date range
- Update order status as it progresses
- Track payment status
- View order details and history

### 5. **Manage Catalog**
- Add products with images, prices, and stock
- Organize products by category
- Edit product details
- Delete products when needed
- Track sold units and stock levels

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Available Endpoints

#### Authentication
- `POST /signup` - Create a new user account
- `POST /login` - Login and get access token
- `GET /users/me` - Get current user information

#### Orders
- `GET /orders/` - Get all orders
- `POST /orders/` - Create a new order
- `GET /orders/{id}` - Get order by ID
- `PUT /orders/{id}` - Update an order
- `DELETE /orders/{id}` - Delete an order

#### Chats
- `GET /chats/` - Get all chats
- `POST /chats/` - Create a new chat
- `GET /chats/{id}` - Get chat by ID
- `POST /chats/{id}/messages` - Add message to chat
- `PUT /chats/{id}/status` - Update chat status

#### Catalog
- `GET /catalog/` - Get all catalog items
- `POST /catalog/` - Create a new catalog item
- `GET /catalog/{id}` - Get catalog item by ID
- `PUT /catalog/{id}` - Update a catalog item
- `DELETE /catalog/{id}` - Delete a catalog item

### Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can:
- View all available endpoints
- Test API calls directly
- See request/response schemas
- Authenticate and test protected endpoints

---

## 📁 Project Structure

```
sangam/
├── sangam-backend/          # Backend API
│   ├── auth/                # Authentication module
│   │   ├── routes.py        # Auth endpoints
│   │   ├── auth_utils.py    # JWT utilities
│   │   └── utils.py         # Password hashing
│   ├── orders/              # Orders module
│   │   └── routes.py        # Order endpoints
│   ├── chats/               # Chats module
│   │   └── routes.py        # Chat endpoints
│   ├── catalog/             # Catalog module
│   │   └── routes.py        # Catalog endpoints
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── db.py                # Database configuration
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── seed_test_data.py    # Test data seeder
│
├── sangam-frontend/         # Frontend application
│   ├── src/
│   │   ├── api/             # API service files
│   │   │   ├── axiosInstance.ts
│   │   │   ├── orders.ts
│   │   │   ├── chats.ts
│   │   │   └── catalog.ts
│   │   ├── pages/           # React pages
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard2.tsx
│   │   │   ├── OrdersDashboard.tsx
│   │   │   └── CatalogDashboard.tsx
│   │   └── App.tsx          # Main app component
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
└── README.md                # This file
```

---

## 🎨 Screenshots

> *Screenshots coming soon!*

### Dashboard Overview
- Unified view of chats, orders, and catalog
- Quick statistics and summaries
- Beautiful, modern UI

### Chat Management
- Multi-platform chat interface
- Real-time message history
- Order creation from chats

### Order Management
- Comprehensive order tracking
- Status management
- Payment tracking

### Catalog Management
- Product catalog with images
- Stock management
- Category organization

---

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in `sangam-backend/`:

```env
DATABASE_URL=sqlite:///./sangam.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables

Create a `.env` file in `sangam-frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing

### Backend Testing
```bash
cd sangam-backend
source venv/bin/activate
python seed_test_data.py  # Create test data
```

Then test endpoints using:
- Swagger UI at `http://localhost:8000/docs`
- Or use the provided test scripts

### Frontend Testing
```bash
cd sangam-frontend
npm run dev
```

Navigate to `http://localhost:5173` and test the UI.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend code
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

- [ ] Multi-tenant support for multiple businesses
- [ ] Real-time chat updates with WebSockets
- [ ] WhatsApp/Instagram API integration
- [ ] AI-powered smart replies
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Export functionality (CSV, PDF)
- [ ] Payment integration (Stripe)
- [ ] Subscription management

See [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md) for detailed production readiness plan.

---

## 💬 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation
- Review the API docs at `/docs`

---

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- React team for the excellent UI library
- All contributors and testers

---

<div align="center">

**Made with ❤️ for small businesses**

[⭐ Star this repo](https://github.com/yourusername/sangam) if you find it helpful!

</div>
