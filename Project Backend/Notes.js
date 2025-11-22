// Router Kyun Use Karte Hain?
// Problem - Bina Router:
// javascript// server.js mein sab kuch ek saath
// app.get('/users', (req, res) => { /* code */ });
// app.post('/users', (req, res) => { /* code */ });
// app.get('/products', (req, res) => { /* code */ });
// app.post('/products', (req, res) => { /* code */ });
// app.get('/orders', (req, res) => { /* code */ });
// // ... 100+ routes

// // FILE BAHUT BADI HO JAYEGI! 😵

// Solution - Router Use Karo:
// Alag-alag files mein organize karo:
// 1. routes/userRoutes.js
//  const express = require('express');
// const router = express.Router();

// router.get('/', (req, res) => {
//   res.send('Get all users');
// });

// router.post('/', (req, res) => {
//   res.send('Create user');
// });

// module.exports = router;
// 2. routes/productRoutes.js
// const router = express.Router();

// router.get('/', (req, res) => {
//   res.send('Get all products');
// });

// module.exports = router;
// 3. server.js (Clean & Short!)
// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');

// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);

// Fayde (Benefits):
// ✅ 1. Organized Code

// Har feature ki alag file
// Dhoondhna easy ho jata hai

// ✅ 2. Team Work

// Ek person users pe kaam kare
// Doosra products pe kaam kare
// Koi conflict nahi

// ✅ 3. Reusable

// Same router multiple jagah use kar sakte ho

// ✅ 4. Clean Code

// server.js chhoti aur clean rahegi




//          🌐 FRONTEND (Client Side)
// ───────────────────────────────────────────────
// 🧠 JS Object created:
// {
//   name: "Prakhar",
//   email: "prakhar@gmail.com"
// }

//         |
//         |  (1) JSON.stringify()
//         v
// 📝 Converted to JSON text:
// "{ "name": "Prakhar", "email": "prakhar@gmail.com" }"

//         |
//         |  (2) Send via HTTP Request
//         |  Method: POST
//         |  URL: /api/v1/user/signup
//         |  Headers: Content-Type: application/json
//         v
// ───────────────────────────────────────────────
//         🚀 NETWORK (HTTP Transmission)
// ───────────────────────────────────────────────
// Data travels over the internet as raw text bytes
//         |
//         v
// ───────────────────────────────────────────────
//         🧩 BACKEND (Express Server)
// ───────────────────────────────────────────────
// (3) Express receives raw request body
//      → still plain JSON text

//         |
//         |  (4) Pass through middleware
//         v
// [ bodyParser.json() ]
//         |
//         |  ✅ Detects JSON
//         |  ✅ Parses text → JS object
//         v
// ───────────────────────────────────────────────
// req.body = {
//   name: "Prakhar",
//   email: "prakhar@gmail.com"
// }
// ───────────────────────────────────────────────
//         |
//         |  (5) Route Handler uses data
//         v
// router.post("/signup", (req, res) => {
//    console.log(req.body.name); // "Prakhar"
//    console.log(req.body.email); // "prakhar@gmail.com"
// });

//         |
//         |  (6) Sends response back
//         v
// ───────────────────────────────────────────────
// ✅ Response to Client: "Signup successful!"
// ───────────────────────────────────────────────
// // 


// ****************************************************************************************************************

// ...................................JWT token.....................................................

// JWT Token - Ekdum Simple
// Problem kya hai?
// Jab user login karta hai, toh server ko yaad kaise rahega ki "haan, ye banda logged in hai"?
// Har baar user kuch kare (video upload, comment, like) toh kya phir se password maangein?

// Video upload karo → Password daalo
// Comment karo → Password daalo
// Like karo → Password daalo

// Ye toh bahut irritating hoga! 😤

// Solution: Token (Ek magical ticket)
// Real life example: Movie hall

// Tum ticket counter pe jaate ho → Ticket khareedna = Login karna
// Counter wala tumhe ticket deta hai → Ticket = Token
// Jab bhi movie hall mein enter karo → Sirf ticket dikhao, ID ya payment nahi
// Ticket hai? Andar aao! ✅


// Token kaise banta hai?
// const token = jwt.sign(
//   {
//     _id: existingUser._id,        // User ka unique ID
//     email: existingUser.email,    // Email
//     channelName: "John's Channel" // Channel name
//   },
//   "mySecretPassword123",          // Secret key (server ka password)
//   { expiresIn: "10d" }            // 10 din tak valid
// );
// ```

// **Samjho aise:**

// 1. **User ki details le lo:**
//    - ID: `user123`
//    - Email: `john@example.com`
//    - Channel: `John's Channel`

// 2. **Ek secret password se sign karo** (like certificate pe stamp lagana):
//    - Secret password: `"mySecretPassword123"` (sirf tumhare server ko pata hai)
//    - Ye signature prove karta hai ki "ye token asli hai, fake nahi"

// 3. **Token ban gaya!**
// ```
//    eyJhbGci...xyz789

// Ye encrypted string hai
// Isme user ki saari info hai, but coded form mein
// Koi change nahi kar sakta without secret password


// Expiry: 10 days

// 10 din baad token expire ho jayega
// Phir user ko dobara login karna padega




// Step 5: Response bhejdo user ko
// Ab server user ko sab kuch wapas bhejta hai:
// res.status(200).json({
//     channelName: "John's Channel",
//     email: "john@example.com",
//     logoUrl: "https://cloudinary.com/johns-photo.jpg",
//     token: "eyJhbGci...xyz789",  // ← YE IMPORTANT HAI!
//     subscribers: 5000
// })

// Ab kya hota hai? (Frontend/Browser side)
// 1. Token ko save kar lo
// Browser ye token apne paas rakh leta hai:
// localStorage.setItem('token', 'eyJhbGci...xyz789');
// ```

// **localStorage** = Browser ki ek jagah jahan data store hota hai

// ---

// ### **2. User ko page pe dikhao**

// Website pe show hota hai:
// ```
// 👤 Welcome back, John's Channel!
// 📸 [Profile Photo]
// 👥 Subscribers: 5000

// 3. Har request mein token bhejo
// Jab bhi user kuch karta hai, browser automatically token bhej deta hai:
// Example 1: Video upload karna hai
// fetch('/api/upload-video', {
//   headers: {
//     'Authorization': 'Bearer eyJhbGci...xyz789'  // ← Token bheja
//   },
//   body: videoData
// })
// Example 2: Comment karna hai
// fetch('/api/add-comment', {
//   headers: {
//     'Authorization': 'Bearer eyJhbGci...xyz789'  // ← Token bheja
//   },
//   body: { comment: "Nice video!" }
// })
// ```

// ---

// ### **Server kya karta hai?**

// Server token check karta hai:
// 1. Token dekha → Decrypt kiya
// 2. "Oh, ye `user123` hai (John)"
// 3. "Token valid hai, 10 din se kam purana hai"
// 4. **Allow!** ✅ Video upload ho gaya / Comment post ho gaya

// ---

// ## **Puri Story - Ek Example**

// ### **1. Login (Pehli baar)**
// ```
// User: "Mera email john@example.com aur password hello123 hai"
// Server: "Sahi hai! Ye lo token: abc123xyz"
// Browser: "Token save kar liya!"
// ```

// ### **2. Video Upload (Token use karke)**
// ```
// User: Video upload button dabaya
// Browser: Server ko request bheji + token bhi bheja (abc123xyz)
// Server: "Token check kiya → John hai ye → Video upload allowed ✅"
// ```

// ### **3. Comment (Token use karke)**
// ```
// User: Comment likha
// Browser: Server ko request bheji + token (abc123xyz)
// Server: "Token valid hai → John ka comment post kar do ✅"
// ```

// ### **4. Like karo (Token use karke)**
// ```
// User: Like button dabaya
// Browser: Token bheja (abc123xyz)
// Server: "John ne like kiya ✅"
// Har jagah password nahi daalna pada! Sirf token bhej diya aur kaam ho gaya 🎉

// Token = Entry Pass
// School ki ID card jaisi soch lo:

// Pehli baar school mein admission = Login
// ID card mila = Token mila
// Har din school mein gate pe sirf ID card dikhaate ho = Har request mein token bhejte ho
// Password/documents phir se nahi chaiye = Password dobara nahi chaiye


// Summary - Ekdum Short

// Login karo → Email + Password bhejo
// Token mil gaya → Ek encrypted string (jaise "abc123xyz")
// Token save kar lo → Browser mein rakho
// Har kaam mein token bhejo → Upload, comment, like - sab mein
// Password phir se nahi chaiye → Token hi kaafi hai ✅

// Token = Tumhari digital ID card jo prove karti hai "Main logged in hoon"




