// Automatically chooses the right URL based on where it's running
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000" // Local
    : "https://karunasri-backend.onrender.com"; // We will get this URL from Render later

export default BASE_URL;
