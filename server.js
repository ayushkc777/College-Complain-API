const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const app = express();
const Batch = require("./models/batch_model");
const Category = require("./models/category_model");
const Student = require("./models/student_model");
const Item = require("./models/items_model");

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Connect to the database
connectDB();

const seedDefaults = async () => {
  const batchCount = await Batch.countDocuments();
  if (batchCount === 0) {
    await Batch.insertMany([
      { batchName: "35A", status: "active" },
      { batchName: "35B", status: "active" },
      { batchName: "36A", status: "active" },
      { batchName: "36B", status: "active" },
    ]);
  }

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    await Category.insertMany([
      { name: "Academics", description: "Classes, exams, schedules" },
      { name: "Facilities", description: "Infrastructure and maintenance" },
      { name: "Harassment", description: "Safety and conduct issues" },
      { name: "Other", description: "Miscellaneous complaints" },
    ]);
  }

  const studentCount = await Student.countDocuments();
  let student = null;
  if (studentCount === 0) {
    const batch = await Batch.findOne();
    student = await Student.create({
      name: "Demo Student",
      email: "demo@softwarica.edu",
      username: "demo_student",
      password: "password123",
      phoneNumber: "9800000000",
      batchId: batch?._id,
      profilePicture: "default-profile.png",
    });
  } else {
    student = await Student.findOne();
  }

  const itemCount = await Item.countDocuments();
  if (itemCount === 0 && student) {
    const categories = await Category.find();
    const categoryId = categories[0]?._id;
    if (categoryId) {
      await Item.insertMany([
        {
          itemName: "Wi-Fi outage in Block A",
          description: "Network down since morning.",
          type: "lost",
          category: categoryId,
          location: "Block A, Library",
          media: "seed.jpg",
          mediaType: "photo",
          reportedBy: student._id,
          status: "available",
        },
        {
          itemName: "Cafeteria hygiene issue",
          description: "Cleanliness concerns in cafeteria.",
          type: "found",
          category: categoryId,
          location: "Cafeteria",
          media: "seed.jpg",
          mediaType: "photo",
          reportedBy: student._id,
          status: "available",
        },
        {
          itemName: "Class schedule conflict",
          description: "Two classes scheduled at same time.",
          type: "lost",
          category: categoryId,
          location: "Block C, Office",
          media: "seed.jpg",
          mediaType: "photo",
          reportedBy: student._id,
          status: "available",
        },
      ]);
    }
  }
};

seedDefaults().catch((err) => {
  console.error("Seed error:", err.message);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again after 15 minutes.",
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Middleware
app.use(express.json());
app.use(morgan("dev")); // Logging middleware
app.use(cookieParser()); // Cookie parser middleware

// Custom security middleware (compatible with Express v5)
app.use((req, res, next) => {
  // Fields that should not be sanitized (emails, URLs, etc.)
  const skipFields = [
    "email",
    "username",
    "password",
    "mediaUrl",
    "profilePicture",
  ];

  const sanitize = (obj, parentKey = "") => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        // Skip sanitization for specific fields
        if (skipFields.includes(key)) {
          continue;
        }

        if (typeof obj[key] === "string") {
          // Prevent NoSQL injection - Remove $ from strings (but keep .)
          obj[key] = obj[key].replace(/\$/g, "");

          // Prevent XSS attacks - Only escape HTML in text fields, not emails/URLs
          if (!obj[key].includes("@") && !obj[key].startsWith("http")) {
            obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key], key);
        }
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  // Note: req.query is read-only in Express v5, so we skip it

  next();
});

app.use(helmet()); // Security middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [];
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Enable CORS with options

app.use(limiter); // Apply rate limiting to all requests
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Routes
const batchRoutes = require("./routes/batch_route");
app.use("/api/v1/batches", batchRoutes);

const categoryRoutes = require("./routes/category_route");
app.use("/api/v1/categories", categoryRoutes);

// Apply stricter rate limiting to login endpoint
const studentRoutes = require("./routes/student_route");
app.use("/api/v1/students/login", authLimiter);
app.use("/api/v1/students", studentRoutes);

const itemRoutes = require("./routes/item_route");
app.use("/api/v1/items", itemRoutes);

const commentRoutes = require("./routes/comment_route");
app.use("/api/v1/comments", commentRoutes);

// const userRoutes = require("./routes/userRoutes");
// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/products", productRoutes);
// app.use("/api/v1/orders", orderRoutes);
// app.use("/api/v1/payments", paymentRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green.bold
      .underline
  );
});
