# Car Garage Management System - Project Guide

## 1. Basic Information

### Project Name
Car Garage Management System (CGMS)

### Purpose
A comprehensive management system for car repair garages that handles customer appointments, mechanic scheduling, and vehicle maintenance tracking. The system streamlines the workflow between customers, mechanics, and secretarial staff while maintaining detailed service records.

### Technologies
- **Frontend**: HTML, CSS, JavaScript (Static, served via Nginx)
- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest, Supertest
- **Deployment**: Docker, Docker Compose
- **Other Tools**: bcryptjs, cors, dotenv, csv-parse

### Current Status
- ✅ Backend API structure implemented
- ✅ Database models and relationships established
- ✅ Basic authentication system
- ✅ Role-based access control
- 🟡 Testing suite setup in progress
- ❌ Frontend implementation pending
- ❌ Email notifications pending

## 2. Project Structure
```plaintext
📂 Web/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── app.js         # Main application file
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   ├── tests/             # Test suites
│   ├── .env               # Environment variables
│   └── package.json       # Dependencies
├── frontend/              # Frontend application
│   ├── public/           # Static files
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── Dockerfile
├── database/             # Database scripts
│   ├── init.sql         # Initial schema
│   └── data.sql         # Sample data
└── docker-compose.yml   # Docker configuration
```

## 3. Key Features

### User Management
- Multiple user roles (Customer, Mechanic, Secretary)
- Role-based access control
- User activation system
- Bulk user import via CSV

### Vehicle Management
- Detailed vehicle information tracking
- Vehicle service history
- Multiple vehicle types support

### Appointment System
- Automated mechanic assignment
- Time slot management (8:00-16:00)
- Service type categorization
- Status tracking

### Admin Features
- User activation/deactivation
- System monitoring
- Report generation

## 4. API Structure

### Authentication Endpoints
```plaintext
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/create-secretary  # Create secretary (admin only)
```

### User Management
```plaintext
GET    /api/users          # List users
GET    /api/users/:id      # Get user details
PATCH  /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
```

### Appointment Management
```plaintext
POST   /api/appointments   # Create appointment
GET    /api/appointments   # List appointments
PATCH  /api/appointments/:id  # Update appointment
DELETE /api/appointments/:id  # Cancel appointment
```

## 5. Development Guide

### Setup Development Environment
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Database Management
```bash
# Start database
docker-compose up db

# Run migrations
docker-compose exec db mysql -u root -p garage_db < database/init.sql
```

## 6. Next Steps

### Priority 1 (Current Sprint)
- [ ] Complete testing suite implementation
- [ ] Add request retry logic
- [ ] Implement email notifications
- [ ] Start frontend development

### Priority 2 (Next Sprint)
- [ ] Add report generation
- [ ] Implement file upload for documents
- [ ] Add payment integration
- [ ] Create admin dashboard

### Priority 3 (Future)
- [ ] Mobile app development
- [ ] Analytics dashboard
- [ ] Customer feedback system
- [ ] Integration with parts inventory

## 7. Contributing

### Code Style
- Use ESLint configuration
- Follow JavaScript Standard Style
- Maintain consistent file structure

### Git Workflow
- Feature branches from `develop`
- Pull requests for all changes
- Squash commits before merging

## 8. Deployment

### Production Setup
```bash
# Build and start all services
docker-compose up -d

# Monitor logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=2
```

### Backup Procedures
- Daily database backups
- Regular configuration backups
- Log rotation setup

## 9. Support

### Troubleshooting
- Check logs in `docker-compose logs`
- Verify environment variables
- Ensure database connectivity

### Contact
- Technical Lead: [Your Name]
- Project Manager: [PM Name]