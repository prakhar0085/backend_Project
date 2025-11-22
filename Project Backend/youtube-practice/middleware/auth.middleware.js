import jwt from "jsonwebtoken";

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; //

    if (!token) {
      return res.status(401).json({ error: "No token is provided" });
    }

    // decode
    const decodedUser = jwt.verify(token, process.env.JWT_TOKEN);

    // attach user
    req.user = decodedUser;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "something went wrong", message: error.message });
  }
};





// ***************************************************************************
// MIDDLEWARE KYA HAI?
// Request ──> Middleware ──> Actual Route
//             (Security     (Video upload,
//              Guard)        Comment, etc.)
// Middleware = Ek security guard jo request aane se pehle check karta hai

// CODE EXPLANATION - Line by Line
// 1. Function Declaration
// export const checkAuth = async (req, res, next) => {

// checkAuth = Middleware function ka naam
// req = Request (user ne kya bheja)
// res = Response (kya return karna hai)
// next = Agar sab sahi hai toh aage badho


// 2. Token Nikalo Header Se
// const token = req.headers.authorization?.split(" ")[1];
// //            ^^^^^^^^^^^^^^^^^^^^^^^^   ^^^^^^^  ^^^
// //            Authorization header       Split    2nd part
// ```

// **Kya ho raha hai?**
// ```
// Request headers mein ye aata hai:
// ┌────────────────────────────────────────┐
// │ authorization: "Bearer abc123xyz"      │
// └────────────────────────────────────────┘

// Step 1: req.headers.authorization
//         → "Bearer abc123xyz"

// Step 2: .split(" ")
//         → ["Bearer", "abc123xyz"]
//                       ^^^^^^^
//                       Array [0]  [1]

// Step 3: [1]
//         → "abc123xyz"  ✅ Token mil gaya!
// Optional chaining ?.

// Agar authorization header nahi hai, toh error nahi aayega
// undefined return hoga


// 3. Check Karo - Token Hai Ya Nahi?
// javascriptif (!token) {
//   return res.status(401).json({ error: "No token is provided" });
// }
// ```

// **Agar token nahi mila:**
// - Status: `401` (Unauthorized)
// - Message: "Token nahi bheja tune!"
// - Request yahi rukk jayegi, aage nahi jayegi
// ```
// No Token Flow:
// ══════════════
// Request ──> checkAuth ──X─> STOPPED!
//                        │
//                        └─> "401: No token provided"

// 4. Token Ko Verify Karo (Decode + Check)
// const decodedUser = jwt.verify(token, process.env.JWT_TOKEN);
// //    ^^^^^^^^^^^   ^^^^^^^^^^  ^^^^^  ^^^^^^^^^^^^^^^^^^^^
// //    Result        Function    Token  Secret Key
// ```

// **Kya hota hai?**
// ```
// Input Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ1c2VyMTIzIn0.xyz"
//              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//              (Encrypted hai)

// jwt.verify() karta hai:
// ═══════════════════════

// Step 1: Token ko decrypt karo secret key se
//         Secret key: "mySecretKey123"

// Step 2: Check karo:
//         ✅ Signature match karta hai?
//         ✅ Token expire toh nahi ho gaya?
//         ✅ Token valid hai?

// Step 3: Decode karke data nikalo:
//         {
//           _id: "user123",
//           email: "john@example.com",
//           channelName: "John's Channel",
//           phone: "1234567890"
//         }
// Agar kuch bhi galat hua:

// Invalid token ❌
// Expired token ❌
// Wrong secret key ❌
// Tampered token ❌

// → Error throw hoga → catch block mein jayega

// 5. User Ko Request Object Mein Attach Karo
// req.user = decodedUser;
// Kya ho raha hai?
// Request object mein user ki info add kar di:
// req.user = {
//   _id: "user123",
//   email: "john@example.com",
//   channelName: "John's Channel",
//   phone: "1234567890"
// }
// Why?
// Kyunki next route ko pata hona chahiye kaun sa user request kar raha hai!

// 6. Next() - Aage Bhejo
// javascriptnext();
// ```

// **Matlab:** "Sab kuch sahi hai! Aage wale route pe bhej do!"
// ```
// Token Valid ✅:
// ══════════════
// Request ──> checkAuth ──> next() ──> Actual Route
//             (Verified!)              (Video upload allowed!)

// 7. Error Handling

// } catch (error) {
//   console.log(error);
//   res.status(500).json({ 
//     error: "something went wrong", 
//     message: error.message 
//   });
// }
// ```

// **Agar kuch galat ho gaya:**
// - Token invalid hai
// - Token expire ho gaya
// - JWT verify fail ho gaya

// → 500 error return karo

// ---

// ## **FULL FLOW - ASCII DIAGRAM**
// ```
// ╔═══════════════════════════════════════════════════════════════╗
// ║                    checkAuth MIDDLEWARE                        ║
// ╚═══════════════════════════════════════════════════════════════╝


// SCENARIO 1: Valid Token ✅
// ═══════════════════════════

// ┌─────────┐                  ┌──────────────┐              ┌─────────────┐
// │ Browser │                  │  checkAuth   │              │ Upload Route│
// └────┬────┘                  │  Middleware  │              └──────┬──────┘
//      │                       └──────┬───────┘                     │
//      │ POST /upload-video           │                             │
//      ├─────────────────────────────>│                             │
//      │ Headers:                     │                             │
//      │ Authorization:               │                             │
//      │ "Bearer abc123xyz"           │                             │
//      │                              │                             │
//      │                              ├─> Step 1: Token nikalo      │
//      │                              │   "abc123xyz"               │
//      │                              │                             │
//      │                              ├─> Step 2: Token hai? ✅     │
//      │                              │                             │
//      │                              ├─> Step 3: Verify karo       │
//      │                              │   jwt.verify(token, secret) │
//      │                              │   → Valid! ✅              │
//      │                              │   → Decoded: {              │
//      │                              │       _id: "user123",       │
//      │                              │       email: "john@..."     │
//      │                              │     }                       │
//      │                              │                             │
//      │                              ├─> Step 4: req.user set       |
//      │                              │   req.user = decoded        │
//      │                              │                             │
//      │                              ├─> Step 5: next()            │
//      │                              │   ─────────────────────────>│
//      │                              │                             │
//      │                              │                             ├─> Video upload!
//      │                              │                             │   req.user se
//      │                              │                             │   user ID mil gaya
//      │                              │                             │
//      │ <────────────────────────────┴─────────────────────────────┤
//      │ Success! Video uploaded                                    │
//      │                                                             │



// SCENARIO 2: No Token ❌
// ═══════════════════════

// ┌─────────┐                  ┌──────────────┐
// │ Browser │                  │  checkAuth   │
// └────┬────┘                  │  Middleware  │
//      │                       └──────┬───────┘
//      │ POST /upload-video           │
//      ├─────────────────────────────>│
//      │ (No Authorization header)    │
//      │                              │
//      │                              ├─> Step 1: Token nikalo
//      │                              │   undefined ❌
//      │                              │
//      │                              ├─> Step 2: Token hai?
//      │                              │   NO! ❌
//      │                              │
//      │ <────────────────────────────┤
//      │ 401: No token provided       │
//      │ STOPPED! ⛔                   │



// SCENARIO 3: Invalid/Expired Token ❌
// ════════════════════════════════════

// ┌─────────┐                  ┌──────────────┐
// │ Browser │                  │  checkAuth   │
// └────┬────┘                  │  Middleware  │
//      │                       └──────┬───────┘
//      │ POST /upload-video           │
//      ├─────────────────────────────>│
//      │ Headers:                     │
//      │ Authorization:               │
//      │ "Bearer expired123"          │
//      │                              │
//      │                              ├─> Step 1: Token nikalo
//      │                              │   "expired123" ✅
//      │                              │
//      │                              ├─> Step 2: Token hai? ✅
//      │                              │
//      │                              ├─> Step 3: Verify karo
//      │                              │   jwt.verify(...)
//      │                              │   → Token expired! ❌
//      │                              │   → Error throw!
//      │                              │
//      │                              ├─> catch block
//      │ <────────────────────────────┤
//      │ 500: Token expired           │
//      │ STOPPED! ⛔                   │




// req.user KA FAYDA
// router.post("/upload-video", checkAuth, async (req, res) => {
  
//   // checkAuth ne req.user set kar diya hai!
//   console.log(req.user);
//   // Output:
//   // {
//   //   _id: "user123",
//   //   email: "john@example.com",
//   //   channelName: "John's Channel"
//   // }
  
//   // Ab video ko is user se link kar do
//   const video = new Video({
//     title: req.body.title,
//     uploader: req.user._id,  // ← User ka ID!
//     channelName: req.user.channelName  // ← Channel name!
//   });
  
//   await video.save();
// });
// ```

// ---

// ## **SUMMARY - Flow Chart**
// ```
// ┌──────────────────────────────────────────────────┐
// │         Request with Token                       │
// └─────────────────┬────────────────────────────────┘
//                   │
//                   ▼
//          ┌────────────────┐
//          │   checkAuth    │
//          │   Middleware   │
//          └────────┬───────┘
//                   │
//         ┌─────────┴─────────┐
//         │                   │
//         ▼                   ▼
//    Token Hai?          Token Nahi?
//         │                   │
//         ✅                  ❌
//         │                   │
//         │                   └──> 401 Error
//         │                        STOP ⛔
//         │
//         ▼
//    jwt.verify()
//         │
//    ┌────┴────┐
//    │         │
//    ▼         ▼
// Valid?    Invalid?
//    │         │
//    ✅        ❌
//    │         │
//    │         └──> 500 Error
//    │              STOP ⛔
//    │
//    ├──> req.user = decoded
//    │
//    └──> next()
//         │
//         ▼
//    ┌────────────────┐
//    │ Actual Route   │
//    │ (Upload, etc.) │
//    └────────────────┘
