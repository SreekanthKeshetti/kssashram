/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaHandHoldingHeart,
  FaUserGraduate,
  FaBoxOpen,
  FaRupeeSign,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaCogs,
  FaShieldAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const allowedRoles = [
      "admin",
      "employee",
      "president",
      "secretary",
      "treasurer",
      "warden_food",
      "warden_nonfood",
      "accountant",
      "clerk",
      "kba_manager",
      "ksa_manager",
    ];

    if (!userInfo || !allowedRoles.includes(userInfo.role)) {
      navigate("/login");
      return;
    }

    if (
      location.pathname === "/dashboard" &&
      ["kba_manager", "ksa_manager"].includes(userInfo.role)
    ) {
      navigate("/dashboard/donations");
    }

    setUser(userInfo);
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) => (location.pathname.includes(path) ? "active" : "");
  const isBranchManager = ["kba_manager", "ksa_manager"].includes(user.role);

  return (
    <div className="dashboard-container">
      <div
        className={`sidebar-overlay ${showSidebar ? "show" : ""}`}
        onClick={() => setShowSidebar(false)}
      ></div>

      <aside className={`sidebar ${showSidebar ? "show" : ""}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center">
          <div>
            <Link to="/" className="sidebar-brand">
              Karunasri ERP
            </Link>
            {/* Removing the text-muted  */}
            <div className=" small mt-1">
              Branch: {user.branch || "Headquarters"}
            </div>
          </div>
          <button
            className="btn text-white d-lg-none"
            onClick={() => setShowSidebar(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {!isBranchManager && (
            <li>
              <Link
                to="/dashboard"
                className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`}
              >
                <FaTachometerAlt /> Overview
              </Link>
            </li>
          )}

          <li>
            <Link
              to="/dashboard/donations"
              className={`menu-item ${isActive("donations")}`}
            >
              <FaHandHoldingHeart /> Donations
            </Link>
          </li>

          {/* --- UPDATED: ADDED MANAGERS TO STUDENT VIEW --- */}
          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "warden_food",
            "warden_nonfood",
            "clerk",
            "employee",
            "kba_manager",
            "ksa_manager",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/students"
                className={`menu-item ${isActive("students")}`}
              >
                <FaUserGraduate /> Students
              </Link>
            </li>
          )}

          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "warden_food",
            "warden_nonfood",
            "clerk",
            "employee",
            "kba_manager",
            "ksa_manager",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/inventory"
                className={`menu-item ${isActive("inventory")}`}
              >
                <FaBoxOpen /> Inventory
              </Link>
            </li>
          )}

          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "accountant",
            "employee",
            "kba_manager",
            "ksa_manager",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/finance"
                className={`menu-item ${isActive("finance")}`}
              >
                <FaRupeeSign /> Finance
              </Link>
            </li>
          )}

          <li>
            <Link
              to="/dashboard/events"
              className={`menu-item ${isActive("events")}`}
            >
              <FaCalendarAlt /> Skill Development
            </Link>
          </li>

          <li>
            <Link
              to="/dashboard/daily-seva"
              className={`menu-item ${isActive("daily-seva")}`}
            >
              <FaCalendarAlt /> Today's Donors
            </Link>
          </li>

          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "clerk",
            "employee",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/members"
                className={`menu-item ${isActive("members")}`}
              >
                <FaUsers /> Members
              </Link>
            </li>
          )}

          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "accountant",
            "employee",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/reports"
                className={`menu-item ${isActive("reports")}`}
              >
                <FaChartBar /> Reports
              </Link>
            </li>
          )}

          {["admin", "president", "secretary", "treasurer"].includes(
            user.role,
          ) && (
            <li>
              <Link
                to="/dashboard/settings"
                className={`menu-item ${isActive("settings")}`}
              >
                <FaCogs /> Settings
              </Link>
            </li>
          )}

          {user.role === "admin" && (
            <li>
              <Link
                to="/dashboard/audit"
                className={`menu-item ${isActive("audit")}`}
              >
                <FaShieldAlt /> Audit Trail
              </Link>
            </li>
          )}

          <li style={{ marginTop: "auto" }}>
            <button
              onClick={handleLogout}
              className="menu-item"
              style={{
                background: "transparent",
                border: "none",
                width: "100%",
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-lg-none border"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <FaBars size={20} />
            </button>
            <h5 className="m-0 text-secondary d-none d-md-block">
              {location.pathname === "/dashboard"
                ? "DASHBOARD"
                : location.pathname.split("/")[2]?.toUpperCase()}
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold text-maroon">{user.name}</div>
              <div
                style={{ fontSize: "0.8rem" }}
                className="text-muted text-uppercase"
              >
                {user.role}
              </div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#581818",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
