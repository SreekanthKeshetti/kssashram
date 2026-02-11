/* eslint-disable react-hooks/immutability */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import BASE_URL from "../../apiConfig";
// import {
//   Row,
//   Col,
//   Card,
//   Table,
//   Button,
//   Spinner,
//   Alert,
//   Form,
//   Tabs,
//   Tab,
//   Badge,
// } from "react-bootstrap";
// import {
//   FaRupeeSign,
//   FaArrowDown,
//   FaArrowUp,
//   FaUserGraduate,
//   FaExclamationTriangle,
//   FaDownload,
//   FaChartPie,
//   FaFilter,
// } from "react-icons/fa";

// const Reports = () => {
//   // Dashboard Stats State
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Custom Report State
//   const [reportParams, setReportParams] = useState({
//     startDate: new Date().toISOString().split("T")[0], // Today
//     endDate: new Date().toISOString().split("T")[0], // Today
//     reportType: "All",
//   });
//   const [customReport, setCustomReport] = useState(null);
//   const [reportLoading, setReportLoading] = useState(false);

//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/immutability
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data } = await axios.get(`${BASE_URL}/api/reports/stats`, config);
//       setStats(data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   // --- GENERATE CUSTOM REPORT ---
//   const handleGenerateReport = async (e) => {
//     e.preventDefault();
//     setReportLoading(true);
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

//       const query = `startDate=${reportParams.startDate}&endDate=${reportParams.endDate}&reportType=${reportParams.reportType}`;
//       const { data } = await axios.get(
//         `${BASE_URL}/api/reports/custom?${query}`,
//         config
//       );

//       setCustomReport(data);
//     } catch (error) {
//       alert("Error generating report");
//     }
//     setReportLoading(false);
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
//           <h2
//             className="text-maroon"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Executive Reports
//           </h2>
//           <p className="text-muted">Financial Health & Operational Status</p>
//         </Col>
//         <Col className="text-end">
//           <Button variant="outline-dark" onClick={() => window.print()}>
//             <FaDownload /> Print Page
//           </Button>
//         </Col>
//       </Row>

//       <Tabs defaultActiveKey="dashboard" className="mb-4">
//         {/* TAB 1: DASHBOARD OVERVIEW (Existing Code) */}
//         <Tab eventKey="dashboard" title="Dashboard Overview">
//           {/* --- Financial Cards --- */}
//           <Row className="mb-4">
//             <Col md={4}>
//               <Card
//                 className="shadow-sm border-0 text-white"
//                 style={{
//                   background: "linear-gradient(45deg, #11998e, #38ef7d)",
//                 }}
//               >
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div>
//                       <h6
//                         className="text-uppercase mb-2"
//                         style={{ opacity: 0.8 }}
//                       >
//                         Total Income
//                       </h6>
//                       <h2 className="fw-bold">
//                         <FaRupeeSign size={20} />{" "}
//                         {stats?.financials.income.toLocaleString()}
//                       </h2>
//                     </div>
//                     <FaArrowUp size={30} style={{ opacity: 0.5 }} />
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col md={4}>
//               <Card
//                 className="shadow-sm border-0 text-white"
//                 style={{
//                   background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
//                 }}
//               >
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div>
//                       <h6
//                         className="text-uppercase mb-2"
//                         style={{ opacity: 0.8 }}
//                       >
//                         Total Expenses
//                       </h6>
//                       <h2 className="fw-bold">
//                         <FaRupeeSign size={20} />{" "}
//                         {stats?.financials.expense.toLocaleString()}
//                       </h2>
//                     </div>
//                     <FaArrowDown size={30} style={{ opacity: 0.5 }} />
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col md={4}>
//               <Card
//                 className="shadow-sm border-0 text-white"
//                 style={{
//                   background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
//                 }}
//               >
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div>
//                       <h6
//                         className="text-uppercase mb-2"
//                         style={{ opacity: 0.8 }}
//                       >
//                         Net Balance
//                       </h6>
//                       <h2 className="fw-bold">
//                         <FaRupeeSign size={20} />{" "}
//                         {stats?.financials.balance.toLocaleString()}
//                       </h2>
//                     </div>
//                     <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
//                       ⚖️
//                     </div>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>

//           {/* --- Operational Stats --- */}
//           <Row className="mb-4">
//             <Col md={6}>
//               <Card className="shadow-sm border-0 h-100">
//                 <Card.Body className="d-flex align-items-center justify-content-between">
//                   <div>
//                     <h5 className="text-maroon">Active Students</h5>
//                     <h3 className="fw-bold">{stats?.counts.students}</h3>
//                     <small className="text-muted">
//                       Currently admitted in Ashram
//                     </small>
//                   </div>
//                   <div className="bg-light p-3 rounded-circle text-maroon">
//                     <FaUserGraduate size={30} />
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col md={6}>
//               <Card className="shadow-sm border-0 h-100">
//                 <Card.Body className="d-flex align-items-center justify-content-between">
//                   <div>
//                     <h5 className="text-warning">Low Stock Alerts</h5>
//                     <h3 className="fw-bold">{stats?.counts.lowStock}</h3>
//                     <small className="text-muted">
//                       Items below minimum quantity
//                     </small>
//                   </div>
//                   <div className="bg-light p-3 rounded-circle text-warning">
//                     <FaExclamationTriangle size={30} />
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Tab>

//         {/* TAB 2: CUSTOM REPORT BUILDER (New Code) */}
//         <Tab
//           eventKey="custom"
//           title={
//             <span>
//               <FaFilter /> Custom Finance Report
//             </span>
//           }
//         >
//           <Card className="border-0 shadow-sm mb-4">
//             <Card.Body className="bg-light">
//               <h5 className="mb-3 text-maroon">Generate Financial Report</h5>
//               <Form onSubmit={handleGenerateReport}>
//                 <Row className="align-items-end g-3">
//                   <Col md={3}>
//                     <Form.Label>Start Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       value={reportParams.startDate}
//                       onChange={(e) =>
//                         setReportParams({
//                           ...reportParams,
//                           startDate: e.target.value,
//                         })
//                       }
//                       required
//                     />
//                   </Col>
//                   <Col md={3}>
//                     <Form.Label>End Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       value={reportParams.endDate}
//                       onChange={(e) =>
//                         setReportParams({
//                           ...reportParams,
//                           endDate: e.target.value,
//                         })
//                       }
//                       required
//                     />
//                   </Col>
//                   <Col md={3}>
//                     <Form.Label>Report Type</Form.Label>
//                     <Form.Select
//                       value={reportParams.reportType}
//                       onChange={(e) =>
//                         setReportParams({
//                           ...reportParams,
//                           reportType: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="All">Income & Expense</option>
//                       <option value="Income">Income Only</option>
//                       <option value="Expense">Expense Only</option>
//                     </Form.Select>
//                   </Col>
//                   <Col md={3}>
//                     <Button
//                       type="submit"
//                       variant="primary"
//                       className="w-100"
//                       style={{ backgroundColor: "#581818" }}
//                       disabled={reportLoading}
//                     >
//                       {reportLoading ? "Generating..." : "Generate Analysis"}
//                     </Button>
//                   </Col>
//                 </Row>
//               </Form>
//             </Card.Body>
//           </Card>

//           {/* REPORT RESULTS */}
//           {customReport && (
//             <div className="report-results fade-in">
//               <Alert variant="info" className="text-center">
//                 <strong>Period:</strong>{" "}
//                 {new Date(reportParams.startDate).toLocaleDateString()} to{" "}
//                 {new Date(reportParams.endDate).toLocaleDateString()}
//               </Alert>

//               <Row className="mb-4">
//                 {/* Income Summary Table */}
//                 {(reportParams.reportType === "All" ||
//                   reportParams.reportType === "Income") && (
//                   <Col md={6}>
//                     <Card className="border-0 shadow-sm h-100">
//                       <Card.Header className="bg-success text-white fw-bold">
//                         Income Breakdown
//                       </Card.Header>
//                       <Table bordered size="sm" className="mb-0">
//                         <tbody>
//                           {customReport.income.breakdown.map((item, idx) => (
//                             <tr key={idx}>
//                               <td>{item.head}</td>
//                               <td className="text-end fw-bold">
//                                 ₹{item.amount.toLocaleString()}
//                               </td>
//                             </tr>
//                           ))}
//                           <tr className="bg-light">
//                             <td className="fw-bold">TOTAL INCOME</td>
//                             <td className="text-end fw-bold text-success">
//                               ₹{customReport.income.total.toLocaleString()}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </Table>
//                     </Card>
//                   </Col>
//                 )}

//                 {/* Expense Summary Table */}
//                 {(reportParams.reportType === "All" ||
//                   reportParams.reportType === "Expense") && (
//                   <Col md={6}>
//                     <Card className="border-0 shadow-sm h-100">
//                       <Card.Header className="bg-danger text-white fw-bold">
//                         Expense Breakdown
//                       </Card.Header>
//                       <Table bordered size="sm" className="mb-0">
//                         <tbody>
//                           {customReport.expense.breakdown.map((item, idx) => (
//                             <tr key={idx}>
//                               <td>{item.head}</td>
//                               <td className="text-end fw-bold">
//                                 ₹{item.amount.toLocaleString()}
//                               </td>
//                             </tr>
//                           ))}
//                           <tr className="bg-light">
//                             <td className="fw-bold">TOTAL EXPENSE</td>
//                             <td className="text-end fw-bold text-danger">
//                               ₹{customReport.expense.total.toLocaleString()}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </Table>
//                     </Card>
//                   </Col>
//                 )}
//               </Row>

//               {/* Net Result (Only for All) */}
//               {reportParams.reportType === "All" && (
//                 <Card className="text-center p-3 border-warning bg-light mb-4">
//                   <h4>
//                     Net Surplus / Deficit:
//                     <span
//                       className={
//                         customReport.netSurplus >= 0
//                           ? "text-success ms-2"
//                           : "text-danger ms-2"
//                       }
//                     >
//                       ₹{customReport.netSurplus.toLocaleString()}
//                     </span>
//                   </h4>
//                 </Card>
//               )}

//               {/* Detailed Transaction List */}
//               <h5 className="text-maroon mt-4">
//                 <FaChartPie /> Detailed Transactions
//               </h5>
//               <Card className="border-0 shadow-sm">
//                 <Table responsive hover size="sm">
//                   <thead className="bg-light">
//                     <tr>
//                       <th>Date</th>
//                       <th>Type</th>
//                       <th>Account Head</th>
//                       <th>Description</th>
//                       <th className="text-end">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {/* Combine lists for detail view */}
//                     {[
//                       ...customReport.income.details,
//                       ...customReport.expense.details,
//                     ]
//                       .sort((a, b) => new Date(b.date) - new Date(a.date))
//                       .map((item, idx) => (
//                         <tr key={idx}>
//                           <td>{new Date(item.date).toLocaleDateString()}</td>
//                           <td>
//                             <Badge
//                               bg={
//                                 item.type.includes("Debit")
//                                   ? "danger"
//                                   : "success"
//                               }
//                             >
//                               {item.type}
//                             </Badge>
//                           </td>
//                           <td>{item.head}</td>
//                           <td className="small text-muted">{item.desc}</td>
//                           <td
//                             className={`text-end fw-bold ${
//                               item.type.includes("Debit")
//                                 ? "text-danger"
//                                 : "text-success"
//                             }`}
//                           >
//                             {item.type.includes("Debit") ? "-" : "+"} ₹
//                             {item.amount.toLocaleString()}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </Table>
//               </Card>
//             </div>
//           )}
//         </Tab>
//       </Tabs>
//     </div>
//   );
// };

// export default Reports;

/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import {
  FaRupeeSign,
  FaArrowDown,
  FaArrowUp,
  FaUserGraduate,
  FaExclamationTriangle,
  FaDownload,
  FaChartPie,
  FaFilter,
  FaBook,
  FaList,
  FaFileCsv,
} from "react-icons/fa";

const Reports = () => {
  // --- STATE ---
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);

  // Custom Report State (General)
  const [reportParams, setReportParams] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reportType: "All",
  });
  const [customReport, setCustomReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Ledger Report State
  const [ledgerParams, setLedgerParams] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    accountId: "",
  });
  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAccounts();
  }, []);

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/reports/stats`, config);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/accounts`, config);
      setAccounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTIONS ---

  // 1. GENERATE GENERAL REPORT
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const query = `startDate=${reportParams.startDate}&endDate=${reportParams.endDate}&reportType=${reportParams.reportType}`;
      const { data } = await axios.get(
        `${BASE_URL}/api/reports/custom?${query}`,
        config,
      );
      setCustomReport(data);
    } catch (error) {
      alert("Error generating report");
    }
    setReportLoading(false);
  };

  // 2. DOWNLOAD GENERAL REPORT (CSV) - NEW FUNCTION
  const handleDownloadGeneralCSV = () => {
    if (!customReport) return;

    const headers = [
      "Date",
      "Type",
      "Head / Description",
      "Narration",
      "Credit (Income)",
      "Debit (Expense)",
    ];
    const rows = [];

    // Process Income
    customReport.income.details.forEach((item) => {
      rows.push([
        new Date(item.date).toLocaleDateString(),
        item.type,
        `"${item.head}"`,
        `"${item.desc}"`,
        item.amount,
        0,
      ]);
    });

    // Process Expense
    customReport.expense.details.forEach((item) => {
      rows.push([
        new Date(item.date).toLocaleDateString(),
        item.type,
        `"${item.head}"`,
        `"${item.desc}"`,
        0,
        item.amount,
      ]);
    });

    // Sort by Date
    rows.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    // Totals Rows
    const empty = ["", "", "", "", "", ""];
    const totalIncome = [
      "",
      "",
      "TOTAL INCOME",
      "",
      customReport.income.total,
      "",
    ];
    const totalExpense = [
      "",
      "",
      "TOTAL EXPENSE",
      "",
      "",
      customReport.expense.total,
    ];
    const netRow = ["", "", "NET SURPLUS", "", customReport.netSurplus, ""];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n") +
      "\n" +
      empty.join(",") +
      "\n" +
      totalIncome.join(",") +
      "\n" +
      totalExpense.join(",") +
      "\n" +
      netRow.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `General_Report_${reportParams.startDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. GENERATE LEDGER REPORT
  const handleGenerateLedger = async (e) => {
    e.preventDefault();
    if (!ledgerParams.accountId)
      return alert("Please select an Account Head / Scheme");

    setLedgerLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const query = `startDate=${ledgerParams.startDate}&endDate=${ledgerParams.endDate}&accountId=${ledgerParams.accountId}`;

      const { data } = await axios.get(
        `${BASE_URL}/api/reports/ledger?${query}`,
        config,
      );
      setLedgerData(data);
    } catch (error) {
      alert("Error generating ledger");
    }
    setLedgerLoading(false);
  };

  // 4. DOWNLOAD LEDGER CSV
  const handleDownloadLedgerCSV = () => {
    if (!ledgerData) return;

    const headers = [
      "Date",
      "Ref No",
      "Description",
      "Debit (Expense)",
      "Credit (Income)",
      "Balance",
    ];

    // Opening Balance Row
    const openingRow = [
      new Date(ledgerData.period.start).toLocaleDateString(),
      "-",
      "OPENING BALANCE",
      "-",
      "-",
      ledgerData.openingBalance,
    ];

    // Transaction Rows
    const rows = ledgerData.transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.refNo,
      `"${t.description}"`,
      t.debit,
      t.credit,
      t.balance,
    ]);

    // Closing Balance Row
    const closingRow = [
      new Date(ledgerData.period.end).toLocaleDateString(),
      "-",
      "CLOSING BALANCE",
      ledgerData.totals.totalDebit,
      ledgerData.totals.totalCredit,
      ledgerData.totals.closingBalance,
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      openingRow.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n") +
      "\n" +
      closingRow.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Ledger_${ledgerData.accountDetails.name}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <h2
        className="text-maroon mb-4"
        style={{ fontFamily: "Playfair Display" }}
      >
        Executive Reports
      </h2>

      <Tabs defaultActiveKey="ledger" className="mb-4">
        {/* --- TAB 1: LEDGER / SCHEME REPORT --- */}
        <Tab
          eventKey="ledger"
          title={
            <span>
              <FaBook className="me-2" /> Scheme & Account Ledger
            </span>
          }
        >
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="bg-light">
              <h5 className="mb-3 text-maroon">Account Head / Scheme Report</h5>
              <Form onSubmit={handleGenerateLedger}>
                <Row className="align-items-end g-3">
                  <Col md={3}>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={ledgerParams.startDate}
                      onChange={(e) =>
                        setLedgerParams({
                          ...ledgerParams,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={ledgerParams.endDate}
                      onChange={(e) =>
                        setLedgerParams({
                          ...ledgerParams,
                          endDate: e.target.value,
                        })
                      }
                      required
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Select Account / Scheme</Form.Label>
                    <Form.Select
                      value={ledgerParams.accountId}
                      onChange={(e) =>
                        setLedgerParams({
                          ...ledgerParams,
                          accountId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Choose Account Head --</option>
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      style={{ backgroundColor: "#581818" }}
                      disabled={ledgerLoading}
                    >
                      {ledgerLoading ? "..." : "Get Report"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {ledgerData && (
            <div className="fade-in">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">
                  Ledger:{" "}
                  <span className="text-primary">
                    {ledgerData.accountDetails.name}
                  </span>
                </h5>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleDownloadLedgerCSV}
                >
                  <FaFileCsv className="me-2" /> Download CSV
                </Button>
              </div>

              <Card className="shadow-sm border-0">
                <Table bordered hover responsive size="sm" className="mb-0">
                  <thead className="bg-light text-center align-middle">
                    <tr>
                      <th style={{ width: "12%" }}>Date</th>
                      <th style={{ width: "15%" }}>Ref No</th>
                      <th>Particulars / Description</th>
                      <th style={{ width: "12%" }}>Debit (Out)</th>
                      <th style={{ width: "12%" }}>Credit (In)</th>
                      <th style={{ width: "15%" }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="table-warning fw-bold">
                      <td colSpan="3" className="text-end">
                        OPENING BALANCE B/F:
                      </td>
                      <td></td>
                      <td></td>
                      <td className="text-end">
                        ₹ {ledgerData.openingBalance.toLocaleString()}
                      </td>
                    </tr>

                    {ledgerData.transactions.length > 0 ? (
                      ledgerData.transactions.map((t, idx) => (
                        <tr key={idx}>
                          <td className="text-center">
                            {new Date(t.date).toLocaleDateString()}
                          </td>
                          <td className="text-center small">{t.refNo}</td>
                          <td>{t.description}</td>
                          <td className="text-end text-danger">
                            {t.debit > 0 ? t.debit.toLocaleString() : "-"}
                          </td>
                          <td className="text-end text-success">
                            {t.credit > 0 ? t.credit.toLocaleString() : "-"}
                          </td>
                          <td className="text-end fw-bold">
                            ₹ {t.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-3 text-muted">
                          No transactions found in this period.
                        </td>
                      </tr>
                    )}

                    <tr className="table-dark fw-bold">
                      <td colSpan="3" className="text-end">
                        TOTALS & CLOSING BALANCE:
                      </td>
                      <td className="text-end text-danger">
                        ₹ {ledgerData.totals.totalDebit.toLocaleString()}
                      </td>
                      <td className="text-end text-success">
                        ₹ {ledgerData.totals.totalCredit.toLocaleString()}
                      </td>
                      <td className="text-end text-white">
                        ₹ {ledgerData.totals.closingBalance.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            </div>
          )}
        </Tab>

        {/* --- TAB 2: GENERAL SUMMARY --- */}
        <Tab
          eventKey="general"
          title={
            <span>
              <FaList className="me-2" /> General Summary
            </span>
          }
        >
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="bg-light">
              <h5 className="mb-3 text-maroon">General Summary Report</h5>
              <Form onSubmit={handleGenerateReport}>
                <Row className="align-items-end g-3">
                  <Col md={3}>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reportParams.startDate}
                      onChange={(e) =>
                        setReportParams({
                          ...reportParams,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reportParams.endDate}
                      onChange={(e) =>
                        setReportParams({
                          ...reportParams,
                          endDate: e.target.value,
                        })
                      }
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Report Type</Form.Label>
                    <Form.Select
                      value={reportParams.reportType}
                      onChange={(e) =>
                        setReportParams({
                          ...reportParams,
                          reportType: e.target.value,
                        })
                      }
                    >
                      <option value="All">Income & Expense</option>
                      <option value="Income">Income Only</option>
                      <option value="Expense">Expense Only</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      style={{ backgroundColor: "#581818" }}
                      disabled={reportLoading}
                    >
                      {reportLoading ? "..." : "Generate Analysis"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {customReport && (
            <div className="report-results fade-in">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Alert variant="info" className="py-2 mb-0 flex-grow-1 me-3">
                  Period:{" "}
                  <strong>
                    {new Date(reportParams.startDate).toLocaleDateString()}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {new Date(reportParams.endDate).toLocaleDateString()}
                  </strong>
                </Alert>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleDownloadGeneralCSV}
                >
                  <FaFileCsv className="me-2" /> Download Report
                </Button>
              </div>

              <Row className="mb-4">
                {(reportParams.reportType === "All" ||
                  reportParams.reportType === "Income") && (
                  <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-success text-white fw-bold">
                        Income Breakdown
                      </Card.Header>
                      <Table bordered size="sm" className="mb-0">
                        <tbody>
                          {customReport.income.breakdown.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.head}</td>
                              <td className="text-end fw-bold">
                                ₹{item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-light">
                            <td className="fw-bold">TOTAL INCOME</td>
                            <td className="text-end fw-bold text-success">
                              ₹{customReport.income.total.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card>
                  </Col>
                )}
                {(reportParams.reportType === "All" ||
                  reportParams.reportType === "Expense") && (
                  <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-danger text-white fw-bold">
                        Expense Breakdown
                      </Card.Header>
                      <Table bordered size="sm" className="mb-0">
                        <tbody>
                          {customReport.expense.breakdown.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.head}</td>
                              <td className="text-end fw-bold">
                                ₹{item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-light">
                            <td className="fw-bold">TOTAL EXPENSE</td>
                            <td className="text-end fw-bold text-danger">
                              ₹{customReport.expense.total.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card>
                  </Col>
                )}
              </Row>

              {/* Net Result */}
              {reportParams.reportType === "All" && (
                <Card className="text-center p-3 border-warning bg-light mb-4">
                  <h4>
                    Net Surplus / Deficit:
                    <span
                      className={
                        customReport.netSurplus >= 0
                          ? "text-success ms-2"
                          : "text-danger ms-2"
                      }
                    >
                      ₹{customReport.netSurplus.toLocaleString()}
                    </span>
                  </h4>
                </Card>
              )}

              {/* Detailed Transaction List */}
              <h5 className="text-maroon mt-4">
                <FaChartPie /> Detailed Transactions
              </h5>
              <Card className="border-0 shadow-sm">
                <Table responsive hover size="sm">
                  <thead className="bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Account Head</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...customReport.income.details,
                      ...customReport.expense.details,
                    ]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((item, idx) => (
                        <tr key={idx}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>
                            <Badge
                              bg={
                                item.type.includes("Debit")
                                  ? "danger"
                                  : "success"
                              }
                            >
                              {item.type}
                            </Badge>
                          </td>
                          <td>{item.head}</td>
                          <td className="small text-muted">{item.desc}</td>
                          <td
                            className={`text-end fw-bold ${
                              item.type.includes("Debit")
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {item.type.includes("Debit") ? "-" : "+"} ₹
                            {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Card>
            </div>
          )}
        </Tab>

        {/* --- TAB 3: DASHBOARD STATS --- */}
        <Tab
          eventKey="dashboard"
          title={
            <span>
              <FaChartPie className="me-2" /> Dashboard Overview
            </span>
          }
        >
          <Row className="mb-4">
            <Col md={4}>
              <Card
                className="shadow-sm border-0 text-white"
                style={{
                  background: "linear-gradient(45deg, #11998e, #38ef7d)",
                }}
              >
                <Card.Body>
                  <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>
                    Total Income
                  </h6>
                  <h2 className="fw-bold">
                    <FaRupeeSign /> {stats?.financials.income.toLocaleString()}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="shadow-sm border-0 text-white"
                style={{
                  background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
                }}
              >
                <Card.Body>
                  <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>
                    Total Expenses
                  </h6>
                  <h2 className="fw-bold">
                    <FaRupeeSign /> {stats?.financials.expense.toLocaleString()}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="shadow-sm border-0 text-white"
                style={{
                  background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
                }}
              >
                <Card.Body>
                  <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>
                    Net Balance
                  </h6>
                  <h2 className="fw-bold">
                    <FaRupeeSign /> {stats?.financials.balance.toLocaleString()}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Reports;
