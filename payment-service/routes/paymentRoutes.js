import express from "express";

import { createPaymentController } from "../controllers/paymentController.js";


const router = express.Router();

router.post("/", createPaymentController);

export default router;