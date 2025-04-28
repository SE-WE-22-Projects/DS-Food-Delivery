import { createPayment, getPayment } from "../services/paymentService.js";
import grpc from "@grpc/grpc-js";
import express from "express";


/**
 * 
 * @param {express.Request} req 
 * @param {*} res 
 * @returns 
 */
export const createPaymentController = async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }

  try {
    const pay_url = await createPayment(orderId);

    return res.status(200).json({ ok: true, data: { pay_url } });
  } catch (err) {
    console.error("Error in createPaymentController:", err);
    const status = err.code === grpc.status.UNAVAILABLE ? 502 : 500;
    return res.status(status).json({ ok: false, error: err.message });
  }
};

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @returns 
 */
export const handlePaymentController = async (req, res) => {
  const { session_id: sessionId } = req.query;
  try {
    const orderId = await getPayment(sessionId);
    return res.redirect(process.env.APP_DOMAIN + "/order/" + orderId);
  } catch (err) {
    if (err.code === grpc.status.FAILED_PRECONDITION) {
      return res.status(200).json({ ok: false, error: "Payment already complete" });
    }

    console.error("Error in createPaymentController:", err);
    const status = err.code === grpc.status.UNAVAILABLE ? 502 : 500;
    return res.status(status).json({ ok: false, error: err.message });
  }

};
