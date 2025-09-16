const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING)
}

module.exports = main;

// const mongoose = require('mongoose');

// async function main() {
//   try {
//     await mongoose.connect(process.env.DB_CONNECT_STRING, {
//       serverSelectionTimeoutMS: 5000, // 5 sec timeout
//       connectTimeoutMS: 10000,        // 10 sec
//     });
//     console.log("✅ MongoDB connected successfully");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err.message);
//     throw err;
//   }
// }

// module.exports = main;

