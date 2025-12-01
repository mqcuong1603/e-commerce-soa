# E-Commerce API - Postman Collection

Complete Postman collection for testing all E-Commerce SOA API endpoints.

## 📦 Contents

- **E-Commerce-API.postman_collection.json** - Main API collection with all endpoints
- **E-Commerce-API.postman_environment.json** - Environment variables for development
- **README.md** - This documentation file

## 🚀 Quick Start

### 1. Import Collection

1. Open Postman
2. Click "Import" button (top left)
3. Select `E-Commerce-API.postman_collection.json`
4. Click "Import"

### 2. Import Environment

1. Click "Import" button
2. Select `E-Commerce-API.postman_environment.json`
3. Click "Import"
4. Select "E-Commerce API - Development" from environment dropdown (top right)

### 3. Start Testing

The collection is now ready to use! The environment is preconfigured for local development.

## 🔑 Authentication

### Automatic Token Management

The collection includes automatic token storage:

1. **Login** or **Register** request automatically saves the JWT token
2. Token is stored in collection variable `{{token}}`
3. All authenticated endpoints automatically use this token
4. No manual token copying required!

### Manual Token Setup

If needed, you can manually set the token:

1. Send a **Login** request
2. Copy the `token` from response
3. Go to Collection Variables
4. Set `token` value
5. Save

### Token Usage

Authenticated endpoints automatically include:
```
Authorization: Bearer {{token}}
```

## 📚 Endpoint Categories

### 1. Authentication (8 endpoints)
- Register User
- Login (auto-saves token)
- Forgot Password
- Reset Password
- Update Password
- Google OAuth
- Facebook OAuth

**Usage:**
1. Start with **Register User** or **Login**
2. Token is automatically saved
3. Use token for protected endpoints

### 2. Products (4 endpoints)
- Get Landing Page Data
- Get All Products (with filtering)
- Get Products by Category
- Get Product by Slug

**No authentication required** ✅

### 3. Categories (4 endpoints)
- Get All Categories
- Get Category Tree
- Get Category Menu
- Get Category by Slug

**No authentication required** ✅

### 4. Shopping Cart (5 endpoints)
- Get Cart
- Add Item to Cart
- Update Cart Item
- Remove Cart Item
- Clear Cart

**Session-based** (cookies handled automatically) 🍪

### 5. Orders (7 endpoints)
- Verify Discount Code
- Create Order (Guest)
- Create Order (Authenticated)
- Get User Orders
- Get Order Details
- Track Order
- Cancel Order

**Mixed:** Guest checkout available, some require authentication

### 6. Reviews (6 endpoints)
- Get Product Reviews
- Add Review (Guest)
- Add Review (Authenticated)
- Get User Reviews
- Update Review
- Delete Review

**Mixed:** Guest reviews allowed, management requires authentication

### 7. User Profile (11 endpoints)
- Get/Update Profile
- Manage Addresses (CRUD)
- Set Default Address
- Get Loyalty Points
- Get Points History
- Deactivate Account

**All require authentication** 🔒

### 8. Discounts (1 public endpoint)
- Get Available Discounts

**No authentication required** ✅

### 9. Admin - Products (10 endpoints)
- Product CRUD operations
- Product status management
- Variant management
- Statistics

**Admin role required** 👑

### 10. Admin - Orders (5 endpoints)
- Get All Orders
- Order Statistics
- Revenue Charts
- Update Order Status

**Admin role required** 👑

### 11. Admin - Users (6 endpoints)
- User CRUD operations
- User status management
- User statistics

**Admin role required** 👑

### 12. Admin - Discounts (5 endpoints)
- Discount code CRUD
- Toggle discount status

**Admin role required** 👑

## 🔧 Environment Variables

The environment includes these pre-configured variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost/api` | API base URL (production docker-compose) |
| `token` | (empty) | JWT authentication token (auto-filled on login) |
| `userId` | (empty) | User ID for testing |
| `productId` | (empty) | Product ID for testing |
| `orderId` | (empty) | Order ID for testing |
| `variantId` | (empty) | Product variant ID for testing |
| `categoryId` | (empty) | Category ID for testing |
| `reviewId` | (empty) | Review ID for testing |
| `addressId` | (empty) | Address ID for testing |
| `discountCode` | `SUMMER2024` | Sample discount code |

### Switching Environments

**For docker-compose.dev.yml:**
```
baseUrl = http://localhost:3000/api
```

**For docker-compose.yml (production):**
```
baseUrl = http://localhost/api
```

## 📝 Testing Workflows

### Workflow 1: User Registration & Shopping

```
1. Register User
   → Token auto-saved ✓

2. Get All Products
   → Browse products

3. Add Item to Cart
   → Shopping cart created

4. Create Order (Authenticated)
   → Order placed

5. Get User Orders
   → View order history
```

### Workflow 2: Guest Checkout

```
1. Get All Products
   → Browse products

2. Add Item to Cart
   → Guest cart created

3. Create Order (Guest)
   → Provide email + shipping

4. Order created!
   → No account needed
```

### Workflow 3: Admin Management

```
1. Login (admin account)
   → Admin token saved

2. Get User Statistics
   → Dashboard data

3. Get All Orders
   → Order management

4. Update Order Status
   → Ship orders

5. Create Product
   → Inventory management
```

### Workflow 4: Product Review Flow

```
1. Get Product by Slug
   → View product details

2. Get Product Reviews
   → Read reviews

3. Add Review (Guest or Authenticated)
   → Submit review

4. Update Review (if authenticated)
   → Edit your review
```

## 🎯 Common Use Cases

### Testing Cart Functionality

```bash
# 1. Get empty cart
GET /api/cart

# 2. Add items (use actual variant IDs from products)
POST /api/cart/items
{
  "productVariantId": "abc123",
  "quantity": 2
}

# 3. Update quantity
PUT /api/cart/items/abc123
{
  "quantity": 3
}

# 4. Remove item
DELETE /api/cart/items/abc123

# 5. Clear cart
DELETE /api/cart
```

### Testing Discount Codes

```bash
# 1. Get available discounts
GET /api/discounts/available

# 2. Verify discount (in cart)
POST /api/orders/verify-discount
{
  "code": "SUMMER2024"
}

# 3. Apply during checkout
POST /api/orders
{
  ...,
  "discountCode": "SUMMER2024"
}
```

### Testing Authentication

```bash
# 1. Register
POST /api/auth/register
{
  "email": "test@example.com",
  "fullName": "Test User",
  "password": "password123",
  "address": {...}
}

# 2. Login (token auto-saved)
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# 3. Access protected endpoint
GET /api/users/profile
Authorization: Bearer {{token}}
```

## 🔍 Tips & Tricks

### 1. Using Path Variables

Replace `:paramName` with actual values:
```
/api/products/:productSlug
→ /api/products/laptop-pro-15
```

### 2. Query Parameters

Enable/disable in Params tab:
```
?page=1&limit=10&search=laptop
```

### 3. Pagination

Most list endpoints support:
```
?page=1
?limit=10
?sort=-createdAt  (descending)
?sort=price       (ascending)
```

### 4. Filtering

Products and orders support:
```
Products:
?category=electronics
?minPrice=100&maxPrice=500
?search=laptop

Orders:
?status=pending
?dateFrom=2024-01-01
?dateTo=2024-12-31
```

### 5. Debugging

- Use Postman Console (View → Show Postman Console)
- Check request/response headers
- Validate JSON in Body tab
- Monitor cookie values

## 🐛 Troubleshooting

### Token Not Working

**Issue:** 401 Unauthorized
**Solution:**
1. Check token is set: Collection Variables → `token`
2. Login again to refresh token
3. Token expires after 30 days

### Cart Not Persisting

**Issue:** Cart resets between requests
**Solution:**
- Ensure cookies are enabled in Postman
- Use same session (don't clear cookies)
- Check `ecommerce.sid` cookie is being sent

### OAuth Endpoints

**Issue:** OAuth redirects don't work in Postman
**Solution:**
- OAuth endpoints are meant for browser use
- Test in browser: `http://localhost/api/auth/google`
- Token will be in redirect URL

### CORS Errors

**Issue:** CORS policy errors
**Solution:**
- Set environment `baseUrl` correctly
- Ensure server is running
- Check nginx proxy configuration

### Image Upload Not Working

**Note:** Image upload endpoints require `multipart/form-data`
- Use Postman's form-data option
- Select file field type
- Choose file to upload

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...} or [...],
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": ["validation error 1", "..."]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔐 Admin Testing

To test admin endpoints, you need an admin account:

### Option 1: Database Seeding
If database seeding is enabled, default admin account:
```
Email: admin@example.com
Password: admin123
```

### Option 2: Manual Creation
1. Create regular user account
2. Update user role in database:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## 📖 Additional Resources

- **API Documentation:** See full endpoint documentation in collection descriptions
- **Project Repository:** [GitHub Link]
- **Server Logs:** `docker compose logs -f server`
- **MongoDB:** Port 27018 (production), 27017 (development)

## 🎉 Getting Started Checklist

- [ ] Import Postman collection
- [ ] Import environment
- [ ] Select environment from dropdown
- [ ] Start Docker containers
- [ ] Test health endpoint: `GET http://localhost/health`
- [ ] Register test user account
- [ ] Verify token auto-saved
- [ ] Test cart operations
- [ ] Create test order
- [ ] Review admin endpoints (if admin account available)

## 💡 Pro Tips

1. **Save frequently used values as variables**
2. **Use Tests tab to auto-extract IDs from responses**
3. **Create additional environments for staging/production**
4. **Use Pre-request Scripts for dynamic data**
5. **Export collection regularly for backup**

## 🆘 Support

For issues or questions:
1. Check server logs: `docker compose logs server`
2. Verify server is running: `http://localhost/health`
3. Check MongoDB connection
4. Review nginx logs: `docker compose logs nginx`

---

**Happy Testing! 🚀**

*Last updated: 2025-11-20*
