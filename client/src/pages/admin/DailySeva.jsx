/* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Row,
//   Col,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Badge,
// } from "react-bootstrap";
// import {
//   FaCalendarAlt,
//   FaBirthdayCake,
//   FaPray,
//   FaPrint,
//   FaRing,
//   FaHandHoldingHeart,
// } from "react-icons/fa";
// import axios from "axios";

// const DailySeva = () => {
//   const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default Today
//   const [sevas, setSevas] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchSevaList();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [date]);

//   const fetchSevaList = async () => {
//     try {
//       setLoading(true);
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

//       const { data } = await axios.get(
//         `http://localhost:5000/api/donations/daily-seva?date=${date}`,
//         config
//       );
//       setSevas(data);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setLoading(false);
//     }
//   };

//   // Helper to get Icon and Color based on Occasion
//   const getOccasionStyle = (occasion) => {
//     const occ = occasion ? occasion.toLowerCase() : "";
//     if (occ.includes("birthday"))
//       return {
//         icon: <FaBirthdayCake />,
//         color: "success",
//         text: "Happy Birthday",
//       };
//     if (occ.includes("death") || occ.includes("memory"))
//       return { icon: <FaPray />, color: "secondary", text: "In Loving Memory" };
//     if (occ.includes("marriage") || occ.includes("anniversary"))
//       return { icon: <FaRing />, color: "info", text: "Happy Anniversary" };
//     return {
//       icon: <FaHandHoldingHeart />,
//       color: "primary",
//       text: "Special Seva",
//     };
//   };

//   return (
//     <div className="daily-seva-container">
//       {/* Header & Controls */}
//       <Row className="mb-4 align-items-end d-print-none">
//         <Col md={8}>
//           <h2
//             className="text-maroon"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Daily Seva Schedule (Nitya Annadhana)
//           </h2>
//           <p className="text-muted">
//             List of donors for prayers and wishes today.
//           </p>
//         </Col>
//         <Col md={4} className="d-flex gap-2">
//           <Form.Control
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="fw-bold border-maroon"
//           />
//           <Button variant="dark" onClick={() => window.print()}>
//             <FaPrint /> Print
//           </Button>
//         </Col>
//       </Row>

//       {/* --- PRINTABLE SECTION --- */}
//       <div className="printable-area">
//         <div className="text-center mb-4 d-none d-print-block">
//           <h3>KARUNASRI SEVA SAMITHI</h3>
//           <h5>Daily Seva List - {new Date(date).toLocaleDateString()}</h5>
//         </div>

//         {loading ? (
//           <div className="text-center py-5">
//             <Spinner animation="border" />
//           </div>
//         ) : sevas.length === 0 ? (
//           <Alert variant="light" className="text-center py-5 border shadow-sm">
//             <h5 className="text-muted">
//               No specific Sevas scheduled for this date.
//             </h5>
//             <p>Standard Ashram prayers will continue.</p>
//           </Alert>
//         ) : (
//           <Row>
//             {sevas.map((seva) => {
//               const style = getOccasionStyle(seva.occasion);
//               return (
//                 <Col md={6} lg={4} key={seva._id} className="mb-4">
//                   <Card
//                     className={`h-100 border-${style.color} shadow-sm seva-card`}
//                   >
//                     <Card.Header
//                       className={`bg-${style.color} text-white fw-bold d-flex justify-content-between align-items-center`}
//                     >
//                       <span>
//                         {style.icon} {style.text}
//                       </span>
//                       <small>{seva.branch}</small>
//                     </Card.Header>
//                     <Card.Body className="text-center">
//                       {/* Who is it for? */}
//                       <h4
//                         className="text-maroon mb-1"
//                         style={{ fontFamily: "Playfair Display" }}
//                       >
//                         {seva.inNameOf || seva.donorName}
//                       </h4>
//                       <p className="text-muted small mb-3">
//                         ({seva.occasion || "General Donation"})
//                       </p>

//                       <hr />

//                       {/* Who Donated? */}
//                       <p className="mb-0 text-muted small">Sponsored By:</p>
//                       <h6 className="fw-bold">{seva.donorName}</h6>
//                       <p className="mb-0 small">{seva.donorPhone}</p>

//                       {/* Scheme */}
//                       <div className="mt-3">
//                         <Badge bg="light" text="dark" className="border">
//                           {seva.scheme}
//                         </Badge>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>
//         )}
//       </div>

//       <style>
//         {`
//           @media print {
//             .d-print-none { display: none !important; }
//             .d-print-block { display: block !important; }
//             .dashboard-container { margin: 0; padding: 0; }
//             .sidebar { display: none; }
//             .main-content { margin-left: 0; width: 100%; }
//             .seva-card { border: 1px solid #ccc !important; box-shadow: none !important; page-break-inside: avoid; }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default DailySeva;
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import { Card, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaPrint, FaOm } from "react-icons/fa";

const DailySeva = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default Today
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSevaList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const fetchSevaList = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.get(
        `${BASE_URL}/api/donations/daily-seva?date=${date}`,
        config
      );
      setSevas(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="daily-seva-container">
      {/* --- CONTROLS (Hidden when printing) --- */}
      <Row className="mb-4 align-items-end d-print-none">
        <Col md={8}>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Today's Donors List
          </h2>
          <p className="text-muted">
            Generate the announcement list for the notice board.
          </p>
        </Col>
        <Col md={4} className="d-flex gap-2">
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="fw-bold border-maroon"
          />
          <Button variant="dark" onClick={() => window.print()}>
            <FaPrint /> Print List
          </Button>
        </Col>
      </Row>

      {/* --- PRINTABLE NOTICE BOARD AREA --- */}
      <div className="printable-area p-4 bg-white border shadow-sm">
        {/* Header for Print */}
        <div className="text-center mb-5 border-bottom pb-3">
          <h2
            className="text-maroon fw-bold"
            style={{ fontFamily: "Playfair Display", letterSpacing: "1px" }}
          >
            KARUNASRI SEVA SAMITHI
          </h2>
          <h5 className="text-uppercase text-muted mt-2">
            Donors & Sponsors List
          </h5>
          <div className="mt-2 fw-bold text-dark">
            <FaCalendarAlt className="me-2" />
            {new Date(date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : sevas.length === 0 ? (
          <Alert variant="light" className="text-center py-5">
            <h5 className="text-muted">
              No specific Sevas scheduled for this date.
            </h5>
            <p>Regular Ashram activities will continue as usual.</p>
          </Alert>
        ) : (
          <div className="seva-list">
            {sevas.map((seva, index) => (
              <div
                key={seva._id}
                className="seva-item mb-4 p-3 rounded"
                style={{
                  borderLeft: "5px solid #d35400",
                  backgroundColor: "#fffbf0",
                }}
              >
                <div className="d-flex align-items-start">
                  <div
                    className="me-3 mt-1 text-warning"
                    style={{ fontSize: "1.5rem" }}
                  >
                    <FaOm />
                  </div>
                  <div>
                    {/* --- THE SENTENCE FORMAT --- */}
                    <h5
                      className="mb-2"
                      style={{
                        lineHeight: "1.6",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      Today's{" "}
                      <span className="text-primary fw-bold">
                        {seva.scheme}
                      </span>{" "}
                      is sponsored by
                      <br className="d-block d-md-none" />{" "}
                      {/* Break line on mobile */}
                      <span className="text-maroon fw-bold fs-4 mx-1">
                        {" "}
                        Sri {seva.donorName} garu
                      </span>
                    </h5>

                    <div className="text-muted fst-italic">
                      {seva.occasion && (
                        <span>
                          on the occasion of{" "}
                          <strong className="text-dark">{seva.occasion}</strong>
                        </span>
                      )}
                      {seva.inNameOf && (
                        <span>
                          {" "}
                          in the name of{" "}
                          <strong className="text-dark">{seva.inNameOf}</strong>
                        </span>
                      )}
                      .
                    </div>
                    {/* --------------------------- */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer for Print */}
        <div className="text-center mt-5 pt-4 border-top d-none d-print-block">
          <p className="text-muted small fst-italic">
            May the blessings of the Almighty be upon the donors and their
            families.
            <br />- Ashram Management
          </p>
        </div>
      </div>

      <style>
        {`
          /* Custom Styles for "Notice Board" feel */
          .text-maroon { color: #581818; }
          
          @media print {
            .d-print-none { display: none !important; }
            .d-print-block { display: block !important; }
            
            /* Hide Sidebar & Header */
            .sidebar, .top-header { display: none; }
            .main-content { margin: 0; padding: 0; width: 100%; }
            .dashboard-container { display: block; }
            
            /* Clean Print Layout */
            body { background: white; }
            .printable-area { border: none !important; shadow: none !important; padding: 0 !important; }
            .seva-item { border: 1px solid #eee; page-break-inside: avoid; }
          }
        `}
      </style>
    </div>
  );
};

export default DailySeva;
