// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
// import Home from "./pages/Home";
// import Footer from "./components/Footer";
// import About from "./pages/About";
// import Activities from "./pages/Activities"; // Import
// import Events from "./pages/Events";
// import Contact from "./pages/Contact"; // <--- Import
// import Donate from "./pages/Donate"; // <--- Import
// import Login from "./pages/Login";
// import Register from "./pages/Register";

// // We will create these placeholders later

// function App() {
//   return (
//     <div className="d-flex flex-column min-vh-100">
//       {/* Header stays at top */}
//       <Header />

//       {/* Main Content Area */}
//       <main className="flex-grow-1">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about-us" element={<About />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/donate" element={<Donate />} />
//           <Route path="/activities" element={<Activities />} />
//           <Route path="/events" element={<Events />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/donate" element={<Donate />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           {/* Add more routes here later */}
//         </Routes>
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default App;
import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";

// --- Components ---
import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardLayout from "./components/DashboardLayout"; // The Sidebar Layout
import DonationList from "./pages/admin/DonationList"; // <--- Import this

// --- Public Pages ---
import Home from "./pages/Home";
import About from "./pages/About";
import Activities from "./pages/Activities";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import Login from "./pages/Login";
import Register from "./pages/Register";

// --- Admin/Dashboard Pages ---
import DashboardHome from "./pages/admin/DashboardHome";
import StudentList from "./pages/admin/StudentList";
import InventoryList from "./pages/admin/InventoryList";
import FinanceList from "./pages/admin/FinanceList";
import EventList from "./pages/admin/EventList";
import Reports from "./pages/admin/Reports";
import MemberList from "./pages/admin/MemberList";
import StockAudit from "./pages/admin/StockAudit";
import AuditHistory from "./pages/admin/AuditHistory";
import StudentProfile from "./pages/admin/StudentProfile";
import SchemeManager from "./pages/admin/SchemeManager";
import SystemAudit from "./pages/admin/SystemAudit";
import CashReconciliation from "./pages/admin/CashReconciliation";
import UserProfile from "./pages/UserProfile";
import DonationHistory from "./pages/DonationHistory";

// --- Layout Wrapper for Public Pages ---
// This ensures Header and Footer only appear on public pages, not the dashboard
const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet /> {/* This renders the child page (Home, About, etc.) */}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES GROUP */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/history" element={<DonationHistory />} />
      </Route>

      {/* 2. DASHBOARD ROUTES GROUP */}
      {/* All paths starting with /dashboard will use the Sidebar Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Default page when you go to /dashboard */}
        <Route index element={<DashboardHome />} />
        <Route path="donations" element={<DonationList />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentProfile />} />{" "}
        <Route path="inventory" element={<InventoryList />} />
        <Route path="finance" element={<FinanceList />} />
        <Route path="events" element={<EventList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="members" element={<MemberList />} />
        <Route path="inventory/audit" element={<StockAudit />} />{" "}
        <Route path="inventory/history" element={<AuditHistory />} />{" "}
        <Route path="settings" element={<SchemeManager />} />{" "}
        <Route path="audit" element={<SystemAudit />} />
        <Route path="finance/reconcile" element={<CashReconciliation />} />{" "}
        {/* New Route */}
        {/* Admin Settings */}
        {/* New Route */}
        {/* New Route */}
        {/* FUTURE SCREENS WILL GO HERE: */}
        {/* <Route path="donations" element={<DonationList />} /> */}
        {/* <Route path="students" element={<StudentList />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
