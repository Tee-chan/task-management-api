import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import startDbAndServer from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";


const app = express();
// Rate limiter - max 100 requests per 15 minutes per IP
const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || '*',  
  methods: ['GET', 'POST', 'PUT','PATCH','DELETE'],
  credentials: true
}));

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

app.use ((req, res, next) =>{
  console.log(`[${req.requestedAt}] ${req.method} ${req.path}`);
  console.log('Query:', req.query);

if (req.body && Object.keys(req.body).length > 0) {
  console.log('Body:', req.body);
}
next();
})

app.get("/", (req, res) => {
  res.json({ 
    message: "TaskRunner API is running 🚀",
    version: "1.0.0",
    timestamp: req.requestedAt,
    status: "active"
  });
});

// routes
app.use("/api/v1/auth", Limiter, authRoutes);
app.use("/api/v1/tasks", Limiter, taskRoutes); 


// for invalid routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    requestedRoute: `${req.method} ${req.path}`
  });
});

startDbAndServer(app);




