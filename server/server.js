// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// // Load config
// dotenv.config();

// // Connect to Database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors()); // Allows frontend to connect
// app.use(express.json()); // Allows us to parse JSON data sent from frontend

// // Basic Route (Test if server is running)
// app.get("/", (req, res) => {
//   res.send("Karunasri Backend is Running...");
// });

// // Define Port
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });
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

dotenv.config();
connectDB();

const app = express();

app.use(cors());
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
app.get("/", (req, res) => {
  res.send("Karunasri Backend is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
