import { createPayment } from "../services/paymentService.js";
import { orderClient } from "../gRPC/orderClient.js";
import grpc from "@grpc/grpc-js";

function getOrderAsync(request) {
    return new Promise((resolve, reject) => {
      orderClient.GetOrderPrice(request, (err, order) => {
        if (err) return reject(err);
        resolve(order);
      });
    });
}
  

export const createPaymentController = async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }
  
    try {
      const order = await getOrderAsync({ orderId: orderId });
      const { transactionId } = await createPayment(orderId, order.price);
  
      return res.status(200).json({ transactionId });
    } catch (err) {
      console.error("Error in createPaymentController:", err);
      const status = err.code === grpc.status.UNAVAILABLE ? 502 : 500;
      return res.status(status).json({ error: err.message });
    }
};
  