// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Table,
//   Badge,
//   Row,
//   Col,
//   Button,
//   Accordion,
//   Spinner,
// } from "react-bootstrap";
// import { FaHistory, FaArrowLeft, FaUser, FaCalendarAlt } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import axios from "axios";

// const AuditHistory = () => {
//   const [audits, setAudits] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/immutability
//     fetchAudits();
//   }, []);

//   const fetchAudits = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data } = await axios.get(
//         "http://localhost:5000/api/inventory/audit",
//         config
//       );
//       setAudits(data);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" />
//       </div>
//     );

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col>
//           <div className="d-flex align-items-center gap-3">
//             <Link
//               to="/dashboard/inventory"
//               className="btn btn-outline-secondary btn-sm"
//             >
//               <FaArrowLeft />
//             </Link>
//             <div>
//               <h2
//                 className="text-maroon m-0"
//                 style={{ fontFamily: "Playfair Display" }}
//               >
//                 Reconciliation History
//               </h2>
//               <p className="text-muted m-0">
//                 Log of all physical stock verifications
//               </p>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {audits.length === 0 ? (
//         <div className="text-center py-5 text-muted">
//           No audit history found.
//         </div>
//       ) : (
//         <Accordion defaultActiveKey="0">
//           {audits.map((audit, index) => (
//             <Accordion.Item
//               eventKey={index.toString()}
//               key={audit._id}
//               className="mb-3 shadow-sm border-0"
//             >
//               <Accordion.Header>
//                 <div className="d-flex w-100 justify-content-between align-items-center me-3">
//                   <div>
//                     <strong className="text-maroon">
//                       <FaCalendarAlt className="me-2" />{" "}
//                       {new Date(audit.createdAt).toLocaleDateString()}
//                     </strong>
//                     <span className="text-muted ms-2 small">
//                       at {new Date(audit.createdAt).toLocaleTimeString()}
//                     </span>
//                   </div>
//                   <div className="text-muted small">
//                     <FaUser className="me-1" /> Audited by:{" "}
//                     <strong>{audit.auditedBy?.name || "Unknown"}</strong>
//                   </div>
//                 </div>
//               </Accordion.Header>
//               <Accordion.Body>
//                 <Table bordered hover size="sm" className="mb-0">
//                   <thead className="bg-light">
//                     <tr>
//                       <th>Item Name</th>
//                       <th className="text-center">System Qty</th>
//                       <th className="text-center">Physical Qty</th>
//                       <th className="text-center">Difference</th>
//                       <th>Remark / Reason</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {audit.items.map((item, idx) => (
//                       <tr
//                         key={idx}
//                         className={item.difference !== 0 ? "table-warning" : ""}
//                       >
//                         <td className="fw-bold">{item.itemName}</td>
//                         <td className="text-center text-muted">
//                           {item.systemQty}
//                         </td>
//                         <td className="text-center fw-bold">
//                           {item.physicalQty}
//                         </td>
//                         <td className="text-center">
//                           {item.difference === 0 ? (
//                             <Badge bg="success">Match</Badge>
//                           ) : (
//                             <span
//                               className={
//                                 item.difference < 0
//                                   ? "text-danger fw-bold"
//                                   : "text-primary fw-bold"
//                               }
//                             >
//                               {item.difference > 0
//                                 ? `+${item.difference}`
//                                 : item.difference}
//                             </span>
//                           )}
//                         </td>
//                         <td>
//                           {item.difference !== 0 ? (
//                             <span className="text-danger fw-bold">
//                               {item.remark || "No Remark Provided"}
//                             </span>
//                           ) : (
//                             <span className="text-muted small">-</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </Accordion.Body>
//             </Accordion.Item>
//           ))}
//         </Accordion>
//       )}
//     </div>
//   );
// };

// export default AuditHistory;
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";

import {
  Card,
  Table,
  Badge,
  Row,
  Col,
  Button,
  Accordion,
  Spinner,
} from "react-bootstrap";
// Add FaTrash to imports
import {
  FaHistory,
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const AuditHistory = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // To check role

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    // eslint-disable-next-line react-hooks/immutability
    if (user) fetchAudits(user);
  }, []);

  const fetchAudits = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/inventory/audit`,
        config
      );
      setAudits(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent Accordion from opening when clicking delete
    if (
      !window.confirm(
        "Are you sure you want to delete this audit log? This cannot be undone."
      )
    )
      return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.delete(`${BASE_URL}/api/inventory/audit/${id}`, config);

      alert("Audit Log Deleted");
      fetchAudits(currentUser); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting record");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <Link
              to="/dashboard/inventory"
              className="btn btn-outline-secondary btn-sm"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <h2
                className="text-maroon m-0"
                style={{ fontFamily: "Playfair Display" }}
              >
                Reconciliation History
              </h2>
              <p className="text-muted m-0">
                Log of all physical stock verifications
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {audits.length === 0 ? (
        <div className="text-center py-5 text-muted">
          No audit history found.
        </div>
      ) : (
        <Accordion defaultActiveKey="0">
          {audits.map((audit, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={audit._id}
              className="mb-3 shadow-sm border-0"
            >
              <Accordion.Header>
                <div className="d-flex w-100 justify-content-between align-items-center me-3">
                  <div>
                    <strong className="text-maroon">
                      <FaCalendarAlt className="me-2" />{" "}
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </strong>
                    <span className="text-muted ms-2 small">
                      at {new Date(audit.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="text-muted small">
                      <FaUser className="me-1" /> Audited by:{" "}
                      <strong>{audit.auditedBy?.name || "Unknown"}</strong>
                    </div>

                    {/* DELETE BUTTON - Only for Admins */}
                    {currentUser?.role === "admin" && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => handleDelete(audit._id, e)}
                        title="Delete Log"
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Table bordered hover size="sm" className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Item Name</th>
                      <th className="text-center">System Qty</th>
                      <th className="text-center">Physical Qty</th>
                      <th className="text-center">Difference</th>
                      <th>Remark / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className={item.difference !== 0 ? "table-warning" : ""}
                      >
                        <td className="fw-bold">{item.itemName}</td>
                        <td className="text-center text-muted">
                          {item.systemQty}
                        </td>
                        <td className="text-center fw-bold">
                          {item.physicalQty}
                        </td>
                        <td className="text-center">
                          {item.difference === 0 ? (
                            <Badge bg="success">Match</Badge>
                          ) : (
                            <span
                              className={
                                item.difference < 0
                                  ? "text-danger fw-bold"
                                  : "text-primary fw-bold"
                              }
                            >
                              {item.difference > 0
                                ? `+${item.difference}`
                                : item.difference}
                            </span>
                          )}
                        </td>
                        <td>
                          {item.difference !== 0 ? (
                            <span className="text-danger fw-bold">
                              {item.remark || "No Remark Provided"}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default AuditHistory;
