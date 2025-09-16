const express = require('express')
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173', // ✅ Local frontend
    //   'https://re-build-frontend.onrender.com',  // 🌍 Production frontend (deploy ke baad kaam aayega)
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

require('dotenv').config();

console.log("DB_CONNECT_STRING =", process.env.DB_CONNECT_STRING); // ✅ Debug ke liye

const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const leaderboardRouter = require("./routes/leaderboard");
const contestLeaderboardRouter = require("./routes/contestLeaderboard");
const socialAuthRouter = require("./routes/socialAuth");
const streakRouter = require("./routes/streak");
const navigationAIRouter = require("./routes/navigationAI");
const discussionRouter = require("./routes/discussion");
// Temporarily comment out multiplayer imports to test
// const { router: multiplayerRouter } = require("../../routes/multiplayerRoutes");
// const { setupMultiplayerSocket } = require("../../socket/multiplayerSocket");
const passport = require('./config/passport');
const cors = require('cors')

// console.log("Hello")

// Configure CORS origins from environment variables
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174', // For development
    // 'https://re-build-frontend.onrender.com', // Production frontend
];

// Add production origins if specified
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}

// More permissive CORS for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions))

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Make io available to routes
app.set('io', io);

// Initialize Passport
app.use(passport.initialize());

// Setup Socket.IO for multiplayer
// setupMultiplayerSocket(io);

// Routes
app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/contest-leaderboard', contestLeaderboardRouter);
app.use('/streak', streakRouter);
app.use('/navigation-ai', navigationAIRouter);
app.use('/discussion', discussionRouter);
app.use('/user/auth', socialAuthRouter);
// app.use('/multiplayer', multiplayerRouter);

// Test endpoint to check cookies and headers or Debug endpoint
app.get('/test-auth', (req, res) => {
    console.log('Cookies received:', req.cookies);
    console.log('Headers:', req.headers);
    
    let token = req.cookies?.token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    res.json({
        cookies: req.cookies,
        hasTokenInCookie: !!req.cookies?.token,
        hasTokenInHeader: !!(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')),
        token: token ? 'Present' : 'Missing',
        headers: {
            origin: req.headers.origin,
            cookie: req.headers.cookie,
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            userAgent: req.headers['user-agent']
        }
    });
});

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const InitalizeConnection = async ()=>{
    try{
        console.log("Starting server initialization...");
        console.log("OAuth Configuration:");
        console.log("- Google OAuth:", !!process.env.GOOGLE_CLIENT_ID ? "✓ Configured" : "✗ Missing");
        console.log("- GitHub OAuth:", !!process.env.GITHUB_CLIENT_ID ? "✓ Configured" : "✗ Missing");

         await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        server.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
            console.log("Socket.IO enabled for multiplayer challenges");
            console.log("OAuth routes available at:");
            const baseUrl = process.env.NODE_ENV === 'production' //After deploy change to production 
                ? `https://${process.env.DOMAIN || 'localhost'}`  // after deploy 'rebuild.services'
                : `http://localhost:${process.env.PORT}`;
            console.log(`- ${baseUrl}/user/auth/test`);
            console.log(`- ${baseUrl}/user/auth/google`);
            console.log(`- ${baseUrl}/user/auth/github`);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();

