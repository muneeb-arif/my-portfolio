# Portfolio API Server

Next.js API server for the portfolio management system with MySQL database integration.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Environment Setup
Make sure your `.env` file in the root directory has the correct MySQL credentials:
```env
MYSQL_HOST=localhost
MYSQL_PORT=8889
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=portfolio
JWT_SECRET=your-secret-key
REACT_APP_PORTFOLIO_OWNER_EMAIL=muneebarif11@gmail.com
```

### 3. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects (Public)
- `GET /api/projects` - Get published projects for portfolio owner

### Projects (Protected - Dashboard)
- `GET /api/dashboard/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project by ID
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

## 🧪 Testing

### Run API Tests
```bash
node test-api.js
```

This will test:
- ✅ API connection
- ✅ Public projects endpoint
- ✅ Authentication endpoints
- ✅ Protected endpoints

### Manual Testing with curl

#### Test Public Projects
```bash
curl http://localhost:3001/api/projects
```

#### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

#### Get User Projects (with token)
```bash
curl http://localhost:3001/api/dashboard/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Project Structure

```
standalone-api/
├── src/
│   ├── app/api/           # Next.js API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project endpoints
│   │   └── dashboard/     # Dashboard endpoints
│   ├── lib/               # Database utilities
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── middleware/        # Authentication middleware
├── test-api.js            # API testing script
└── README.md              # This file
```

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** to get a token
2. **Include token** in Authorization header: `Bearer YOUR_TOKEN`
3. **Protected routes** require valid token

## 📊 Data Filtering

- **Public endpoints** return data for the portfolio owner (configured in `REACT_APP_PORTFOLIO_OWNER_EMAIL`)
- **Protected endpoints** return data for the authenticated user
- **User isolation** ensures users can only access their own data

## 🚨 Troubleshooting

### Database Connection Issues
- Check MySQL is running on MAMP
- Verify credentials in `.env`
- Ensure database exists

### Authentication Issues
- Check JWT_SECRET is set
- Verify token format: `Bearer TOKEN`
- Check token expiration

### CORS Issues
- API includes CORS headers for cross-origin requests
- Frontend should be configured to use the API URL

## 🔄 Next Steps

After testing this module successfully, we'll add:
1. Categories API
2. Technologies API
3. Settings API
4. File upload handling
5. Contact queries API 