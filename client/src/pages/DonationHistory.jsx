/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Badge,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";
import { FaFilePdf, FaHandHoldingHeart } from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../apiConfig";

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyDonations = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(
          `${BASE_URL}/api/donations/my`,
          config
        );
        setDonations(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMyDonations();
  }, []);

  const downloadReceipt = async (id, name) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const response = await axios.get(
        `${BASE_URL}/api/donations/${id}/receipt`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Error downloading receipt");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-light p-3 rounded-circle">
          <FaHandHoldingHeart size={30} className="text-maroon" />
        </div>
        <div>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            My Donation History
          </h2>
          <p className="text-muted m-0">Thank you for your generous support</p>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="ps-4">Date</th>
              <th>Scheme</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Status</th>
              <th className="text-center">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d._id}>
                <td className="ps-4">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <Badge bg="info" text="dark">
                    {d.scheme}
                  </Badge>
                </td>
                <td className="fw-bold">₹ {d.amount.toLocaleString()}</td>
                <td>{d.paymentMode}</td>
                <td>
                  {d.receiptStatus === "Sent" ? (
                    <Badge bg="success">Completed</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">
                      Processing
                    </Badge>
                  )}
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => downloadReceipt(d._id, d.donorName)}
                    title="Download Receipt"
                  >
                    <FaFilePdf /> Download
                  </Button>
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  You haven't made any donations yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default DonationHistory;
