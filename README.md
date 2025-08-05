# Car Garage Management System

## Initial Project Requirements

- **User Roles:** Customer, Mechanic, Secretary
- **User Registration:** Customers and mechanics can register; secretaries are created by an admin
- **User Activation:** Only secretaries can activate new users
- **Authentication:** JWT-based login and protected routes
- **User Management:** Secretaries can view and manage all users
- **Customer/Mechanic Profiles:** Each user has a profile with role-specific fields (e.g., AFM, address for customers)
- **Frontend:** Simple web interface for registration, login, and user management
- **Backend:** RESTful API using Node.js/Express, MySQL database
- **Deployment:** Dockerized setup for backend, frontend, and database

---

## Project Overview

This project is a **Car Garage Management System** with a Node.js/Express backend, a MySQL database, and a static frontend served via Nginx. It supports user registration, authentication, and user management, with role-based access control.

---

## Project Structure

```
docker-compose.yml
package.json
README.md
backend/
  .env
  .gitignore
  Dockerfile
  package.json
  src/
    app.js
    config/
      db.config.js
    controllers/
      user.controller.js
    middleware/
      auth.js
    models/
      customer.model.js
      user.model.js
    routes/
      auth.routes.js
      user.routes.js
    utils/
database/
  data.sql
  init.sql
frontend/
  Dockerfile
  public/
    images/
    index.html
    css/
      style.css
    js/
      api.js
      main.js
```

---

## Backend

### Technologies

- Node.js (Express)
- Sequelize ORM
- MySQL
- JWT for authentication
- Docker

### Environment Variables

Configured in `backend/.env`:

- DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE
- JWT_SECRET, JWT_EXPIRES_IN
- PORT, NODE_ENV

### Database

- MySQL, initialized via `database/init.sql`
- Tables: `users`, `customers`, `mechanics`
- Relationships: Each customer/mechanic is a user (1:1 via `user_id`)

### Models

- **User:** username, email, password, role (`customer`, `mechanic`, `secretary`), is_active, created_at
- **Customer:** afm, address, user_id (FK to User)

### API Endpoints

#### Auth

- `POST /api/auth/register`  
  Registers a new user (role: customer or mechanic).  
  Password is hashed.  
  User is created as inactive (`is_active: false`).  
  No login endpoint yet.

#### Users

- `GET /api/users/`  
  Returns all users.  
  Requires JWT and `secretary` role.

- `PATCH /api/users/:id/activate`  
  Activates a user account.  
  Requires JWT and `secretary` role.

#### Middleware

- `auth`: JWT authentication and role-based authorization.

#### Not Implemented

- Login endpoint (no `/api/auth/login`)
- Mechanic model/controller logic
- Customer/mechanic profile creation on registration
- Password reset, email verification, etc.

---

## Frontend

### Technologies

- Static HTML/CSS/JS (served by Nginx)
- No framework (React/Vue/Angular) used

### Structure

- `index.html`: Main page, includes login/register buttons, loads JS.
- `api.js`:  
  - `apiService` object for making API requests (register, getAllUsers).
  - No login implemented.
- `main.js`:  
  - Not provided, assumed to handle UI logic.

### Not Implemented

- Login form and logic
- Registration form and logic
- User session management (JWT storage)
- Role-based UI
- Customer/mechanic profile management

---

## Docker & Deployment

- `docker-compose.yml`:  
  - Services: db (MySQL), backend (Node.js), frontend (Nginx)
  - Volumes for DB persistence and frontend static files
  - Backend runs in dev mode (`npm run dev`)
- `backend/Dockerfile`:  
  - Installs dependencies, exposes port 3000
- `frontend/Dockerfile`:  
  - Uses nginx:alpine, serves static files

---

## Current Stage & TODOs

### What Works

- User registration (customer/mechanic) via API
- User listing and activation (secretary only, via API)
- JWT-based authentication middleware (but no login endpoint)
- Database schema and models for users/customers
- Dockerized setup for DB, backend, frontend

### What Is Missing / Next Steps

- **Login endpoint** (`/api/auth/login`)
- **Frontend forms** for registration and login
- **JWT handling** on frontend (store, send with requests)
- **Customer/mechanic profile creation** on registration
- **Mechanic model/controller logic**
- **User management UI** (activation, listing)
- **Error handling and validation** improvements
- **Unit/integration tests**
- **Production configuration** (env, security, etc.)

---

## API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/create-secretary` - Create secretary (admin only)
- POST `/api/auth/bulk-register` - Bulk register users (secretary only)

[Full API documentation here...]

## Project Status

### Completed Features
- User authentication and registration
- Role-based access control
- Basic CRUD operations for users, cars, appointments
- Secretary management system
- Bulk import functionality

### In Progress
- Frontend implementation
- Email notifications
- Report generation
- Testing suite

### Planned Features
- Automated scheduling system
- Payment integration
- Mobile app support

---

## References

- `backend/src/app.js`: Main backend entrypoint
- `backend/src/routes/auth.routes.js`: Auth endpoints
- `backend/src/routes/user.routes.js`: User management endpoints
- `backend/src/middleware/auth.js`: Auth middleware
- `backend/src/models/user.model.js`: User model
- `backend/src/models/customer.model.js`: Customer model
- `frontend/public/js/api.js`: Frontend API service

---

**Summary:**  
The project is at an early MVP stage: registration and user management APIs are present, but login, full frontend flows, and some backend logic are not yet implemented. The codebase is clean and modular, ready for further development.
