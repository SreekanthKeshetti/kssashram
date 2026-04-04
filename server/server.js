const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path"); // <--- Import path

// Import Routes
const contactRoutes = require("./routes/contactRoutes"); // <--- ADD THIS
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes"); // <--- Import this
const studentRoutes = require("./routes/studentRoutes"); // <--- Import
const inventoryRoutes = require("./routes/inventoryRoutes"); // <--- Import
const financeRoutes = require("./routes/financeRoutes"); // Import
const eventRoutes = require("./routes/eventRoutes"); // Import
const reportRoutes = require("./routes/reportRoutes"); // Import
const memberRoutes = require("./routes/memberRoutes"); // Import
const schemeRoutes = require("./routes/schemeRoutes"); // Import
const auditRoutes = require("./routes/auditRoutes"); // Import
const accountRoutes = require("./routes/accountRoutes"); // Import
const runScheduler = require("./utils/reminderScheduler"); // <--- Import
const occasionRoutes = require("./routes/occasionRoutes");

const backupRoutes = require("./routes/backupRoutes"); // <--- Add this

dotenv.config();
connectDB();

const app = express();
// Start the Scheduler
runScheduler(); // <--- Add this line

// app.use(cors());
// Replace app.use(cors()); with:
app.use(
  cors({
    origin: [
      "http://localhost:5173", // For your local testing
      "https://kssashram.vercel.app/",
      // <--- MUST REPLACE WITH YOUR ACTUAL VERCEL URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/contact", contactRoutes); // <--- ADD THIS
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes); // <--- Add this line
app.use("/api/schemes", schemeRoutes); // <--- Add this
app.use("/api/students", studentRoutes); // <--- Add this
app.use("/api/inventory", inventoryRoutes); // <--- Add this
app.use("/api/finance", financeRoutes); // <--- Add this line
app.use("/api/events", eventRoutes); // Add this
app.use("/api/reports", reportRoutes); // <--- Add this
app.use("/api/members", memberRoutes); // <--- Add this
app.use("/api/audit", auditRoutes); // Add this
app.use("/api/accounts", accountRoutes); // Add this
app.use("/api/occasions", occasionRoutes);
app.get("/", (req, res) => {
  res.send("Karunasri Backend is Running...");
});
app.use("/api/backup", backupRoutes); // <--- Add this route
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
