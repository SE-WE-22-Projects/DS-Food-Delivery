import express from "express";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes.js";


dotenv.config();

const app = express();


// Add middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/pay", paymentRoutes); // Fixed the path

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});