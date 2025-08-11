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

### Project Structure

```
docker-compose.yml
package.json
README.md
backend/
  Dockerfile
  package.json
  src/
    app.js
    config/
      db.config.js
    controllers/
      appointment.controller.js
      auth.controller.js
      car.controller.js
      user.controller.js
    middleware/
      auth.js
    models/
      appointment.model.js
      car.model.js
      customer.model.js
      mechanic.model.js
      secretary.model.js
      task.model.js
      user.model.js
    routes/
      appointment.routes.js
      auth.routes.js
      car.routes.js
      user.routes.js
database/
  data.sql
  init.sql
  migrations/
    add_admin_role.sql
frontend/
  Dockerfile
  package.json
  vite.config.js
  src/
    App.js
    index.js
    theme.js
    components/
      ProtectedRoute.js
    context/
      AuthContext.js
    layouts/
      MainLayout.js
    pages/
      Dashboard.js
      Landing.js
      Login.js
      Register.js
      RequestPasswordReset.js
      ResetPassword.js
      Appointments/
        AppointmentDialog.js
        AppointmentsList.js
      Cars/
        CarDialog.js
        CarsList.js
      Profile/
        ChangePasswordDialog.js
        Profile.js
      Users/
        UserDialog.js
        UsersList.js
    services/
      api.service.js
    utils/
      validationSchemas.js
nginx/
  nginx.conf

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

- **User:** username, email, password, fullName, idCardNumber, role, isActive, created_at
- **Customer:** vatNumber, address, user (Reference)
- **Mechanic:** specialty, user (Reference)
- **Car:** serialNumber, model, make, carType, fuelType, numberOfDoors, numberOfWheels, productionDate, acquisitionYear, owner (Reference)
- **Appointment:** date, time, reason, problemDescription, status, car (Reference), customer (Reference), mechanic (Reference), tasks (Reference[]), cost
- **Task:** description, materials, completionTime, cost, completed

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

- React with Material-UI
- Context API for state management
- JWT for authentication
- Axios for API requests
- Formik for form handling
- Vite for build tooling

### Features

- Responsive and modern UI design
- Role-based access control
- Protected routes
- Form validation
- User session management
- Profile management
- Car management
- Appointment scheduling
- Task management

### Components

- **Authentication:**
  - Login/Register forms
  - Password reset functionality
  - Protected route wrapper

- **Layout:**
  - Responsive navigation
  - Role-based menu items
  - User profile section

- **Dashboard:**
  - Overview statistics
  - Quick action buttons
  - Recent activities

- **User Management:**
  - User listing with filters
  - User creation/editing
  - Role management

- **Car Management:**
  - Car registration
  - Service history
  - Owner information

- **Appointment System:**
  - Appointment scheduling
  - Status tracking
  - Task assignment

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

- Complete user authentication system (login, register, password reset)
- User management with role-based access control
- Car management system (CRUD operations)
- Appointment scheduling and management
- Profile management with password change functionality
- Frontend implementation with Material-UI
- JWT handling and secure authentication
- Customer/mechanic profile management
- Secretary administrative functions
- Docker containerization with proper configurations

### What Is Missing / Next Steps

- **Email notifications** for appointments and updates
- **Report generation** system for service history
- **Analytics dashboard** for garage statistics
- **Unit/integration tests** implementation
- **Mobile responsiveness** improvements
- **Documentation** updates and API documentation completion
- **Appointment reminders** system
- **Service history tracking** enhancements
- **Automated mechanic assignment** system
- **Production deployment** optimizations

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
