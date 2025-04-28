import express from "express";

import { createPaymentController, handlePaymentController } from "../controllers/paymentController.js";


const router = express.Router();

router.post("/:orderId", createPaymentController);
router.get("/done", handlePaymentController);

export default router;