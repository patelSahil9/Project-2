# KYC System Test Guide

## Prerequisites
1. Make sure the backend server is running on `http://localhost:5000`
2. Make sure the frontend is running on `http://localhost:5173`
3. Ensure MongoDB is connected and running

## Test Scenarios

### 1. Admin Registration and Login
1. Go to `/register`
2. Select "Admin" role
3. Fill in admin details:
   - First Name: Admin
   - Last Name: User
   - Email: admin@kycsystem.com
   - Phone: +1234567890
   - Password: admin123
   - Confirm Password: admin123
4. Click "Create Admin Account"
5. You should be redirected to `/admin` dashboard

### 2. User Registration and Login
1. Go to `/register`
2. Select "User" role
3. Fill in user details:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: +1234567891
   - Password: user123
   - Confirm Password: user123
4. Click "Create User Account"
5. You should be redirected to `/dashboard`

### 3. KYC Application Process (User)
1. Login as a user
2. Go to `/upload-kyc`
3. Fill in personal information:
   - First Name: John
   - Last Name: Doe
   - Date of Birth: 1990-01-01
   - Nationality: US
   - Passport Number: US123456789
   - Phone Number: +1234567891
4. Click "Next"
5. Fill in address information:
   - Street: 123 Main St
   - City: New York
   - State: NY
   - ZIP Code: 10001
   - Country: United States
6. Click "Next"
7. Fill in financial information:
   - Occupation: Software Engineer
   - Source of Funds: Salary
   - Expected Monthly Transaction: $1000-5000
8. Click "Next"
9. Upload documents (you can use any PDF or image files):
   - Identity Proof
   - Address Proof
   - Income Proof
   - Bank Statement
10. Click "Submit Application"

### 4. Admin Dashboard Testing
1. Login as admin
2. You should see:
   - Total Users count
   - Pending KYC count
   - Approved KYC count
   - Rejected KYC count
3. In the KYC Applications table, you should see the user's application
4. Click "View Details" to see full user information and documents
5. For pending applications, you can:
   - Click "Approve" to approve the KYC
   - Click "Reject" to reject the KYC
6. Use the filter dropdown to filter by status
7. Use the search box to search by user name or email

### 5. User Dashboard Testing
1. Login as a user
2. You should see:
   - Total Documents count
   - Verified Documents count
   - Pending Documents count
   - KYC Status
3. Check the KYC Application Status section
4. View uploaded documents in the Documents section
5. Use Quick Actions to navigate to different sections

### 6. Profile Management
1. Login as a user
2. Go to `/profile`
3. Test the different tabs:
   - Overview: Update personal information
   - Documents: View and manage uploaded documents
   - Security: Change password
   - Activity: View recent activity

### 7. Document Management
1. As a user, go to `/upload-kyc`
2. Upload different types of documents
3. Check that documents appear in the user dashboard
4. As an admin, verify that documents are visible in the admin dashboard
5. Test document viewing by clicking on document links

## Expected Behaviors

### Admin Features:
- Can view all users and their KYC applications
- Can approve/reject KYC applications
- Can view detailed user information and documents
- Can filter and search applications
- Can see real-time statistics

### User Features:
- Can only see their own information and documents
- Can upload and manage KYC documents
- Can track KYC application status
- Can update profile information
- Can view document verification status

### Security Features:
- Role-based access control
- JWT token authentication
- Protected routes
- Input validation
- File upload restrictions

## Troubleshooting

### Common Issues:
1. **Backend not running**: Make sure to start the backend server with `npm start` in the backend directory
2. **MongoDB connection error**: Check if MongoDB is running and the connection string is correct
3. **File upload issues**: Check if Cloudinary credentials are configured
4. **CORS errors**: Ensure the backend CORS configuration allows frontend requests

### Testing Tips:
1. Use different browsers or incognito mode to test multiple user sessions
2. Test with different file types and sizes for document uploads
3. Verify that admin actions are reflected in user dashboards
4. Check that error messages are displayed properly
5. Test responsive design on different screen sizes

## API Endpoints to Test

### Authentication:
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### KYC:
- POST `/api/kyc/apply` - Create KYC application
- GET `/api/kyc/my-application` - Get user's KYC application
- POST `/api/kyc/submit` - Submit KYC application
- GET `/api/kyc/status` - Get KYC status

### Admin:
- GET `/api/admin/users` - Get all users
- GET `/api/admin/kyc-applications` - Get all KYC applications
- PUT `/api/admin/kyc-applications/:id/status` - Update KYC status

### Upload:
- POST `/api/upload/document` - Upload document
- GET `/api/upload/documents` - Get user's documents
- DELETE `/api/upload/document/:type` - Delete document

This test guide covers all the major functionality of the KYC system. Make sure to test both positive and negative scenarios to ensure the system works correctly. 