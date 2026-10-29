import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardLayout from "./components/DashboardLayout";
import DonationList from "./pages/admin/DonationList";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicReceipt from "./pages/PublicReceipt";

import DashboardHome from "./pages/admin/DashboardHome";
import StudentList from "./pages/admin/StudentList";
import StudentProfile from "./pages/admin/StudentProfile";
import InventoryList from "./pages/admin/InventoryList";
import FinanceList from "./pages/admin/FinanceList";
import EventList from "./pages/admin/EventList";
import Reports from "./pages/admin/Reports";
import MemberList from "./pages/admin/MemberList";
import StockAudit from "./pages/admin/StockAudit";
import AuditHistory from "./pages/admin/AuditHistory";
import Settings from "./pages/admin/Settings";
import SystemAudit from "./pages/admin/SystemAudit";
import CashReconciliation from "./pages/admin/CashReconciliation";
import UserProfile from "./pages/UserProfile";
import DonationHistory from "./pages/DonationHistory";
import DailySeva from "./pages/admin/DailySeva";
import MemberProfile from "./pages/admin/MemberProfile";
import Renewals from "./pages/admin/Renewals"; // <--- NEW IMPORT

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/history" element={<DonationHistory />} />
        <Route path="/receipt/:id" element={<PublicReceipt />} />
      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="donations" element={<DonationList />} />

        {/* NEW ROUTE */}
        <Route path="renewals" element={<Renewals />} />

        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="inventory" element={<InventoryList />} />
        <Route path="finance" element={<FinanceList />} />
        <Route path="events" element={<EventList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="members" element={<MemberList />} />
        <Route path="members/:id" element={<MemberProfile />} />
        <Route path="inventory/audit" element={<StockAudit />} />
        <Route path="inventory/history" element={<AuditHistory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="audit" element={<SystemAudit />} />
        <Route path="finance/reconcile" element={<CashReconciliation />} />
        <Route path="daily-seva" element={<DailySeva />} />
      </Route>
    </Routes>
  );
}

export default App;
