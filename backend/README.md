# KYC System Backend API

A comprehensive backend API for a Know Your Customer (KYC) system built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Admin, Moderator)
  - Email verification
  - Password reset functionality
  - Account lockout protection

- **KYC Management**
  - Complete KYC application workflow
  - Document upload and verification
  - Application status tracking
  - Timeline tracking for all actions

- **File Management**
  - Secure file uploads to Cloudinary
  - Image optimization and compression
  - Support for multiple file formats (PDF, JPG, PNG)
  - File validation and size limits

- **Admin Dashboard**
  - Application review and approval system
  - User management
  - Statistics and analytics
  - Export functionality

- **Security Features**
  - Rate limiting
  - Input validation and sanitization
  - CORS protection
  - Helmet security headers
  - Password hashing with bcrypt

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Cloudinary account (for file uploads)
- Email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/kyc_system
   MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/kyc_system

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### KYC Endpoints

#### Create KYC Application
```http
POST /api/kyc/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "personalInfo": {
    "fullName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "nationality": "Indian",
    "phone": "1234567890",
    "email": "john@example.com"
  },
  "address": {
    "current": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    }
  }
}
```

#### Upload Document
```http
POST /api/upload/document
Authorization: Bearer <token>
Content-Type: multipart/form-data

document: <file>
documentType: "aadhaar"
```

#### Get Application Status
```http
GET /api/kyc/status
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Applications
```http
GET /api/admin/applications?page=1&limit=10&status=submitted
Authorization: Bearer <admin-token>
```

#### Review Application
```http
PUT /api/admin/applications/:id/review
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",
  "notes": "All documents verified successfully"
}
```

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload

The system supports file uploads for KYC documents:

- **Supported formats**: PDF, JPG, JPEG, PNG
- **Maximum file size**: 10MB
- **Storage**: Cloudinary (cloud storage)
- **Optimization**: Automatic image compression and resizing

## 🏗️ Project Structure

```
backend/
├── models/              # Database models
│   ├── User.js         # User model
│   └── KYCApplication.js # KYC application model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── kyc.js          # KYC application routes
│   ├── admin.js        # Admin routes
│   └── upload.js       # File upload routes
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── errorHandler.js # Error handling
│   └── notFound.js     # 404 handler
├── utils/              # Utility functions
│   ├── generateToken.js # JWT token generation
│   ├── uploadToCloudinary.js # File upload utilities
│   └── emailService.js # Email service
├── server.js           # Main server file
├── package.json        # Dependencies
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |

### Database Schema

#### User Model
- Basic info (name, email, password)
- KYC status and documents
- Role-based permissions
- Account security features

#### KYC Application Model
- Personal information
- Address details
- Document uploads
- Application timeline
- Review status and notes

## 🚀 Deployment

### Production Setup

1. **Set environment variables for production**
2. **Use a production MongoDB instance**
3. **Configure Cloudinary for file storage**
4. **Set up email service**
5. **Use PM2 or similar for process management**

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "kyc-backend"

# Monitor
pm2 monit

# Logs
pm2 logs kyc-backend
```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    // Validation errors
  ]
}
```

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens have expiration times
- Rate limiting prevents abuse
- Input validation on all endpoints
- CORS protection enabled
- Security headers with Helmet
- File upload validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core KYC functionality
- **v1.1.0** - Added admin dashboard and user management
- **v1.2.0** - Enhanced security and file upload features 