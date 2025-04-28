import Stripe from "stripe";
import dotenv from "dotenv";
import { orderClient } from "../gRPC/orderClient.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.APP_STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const domain = process.env.APP_DOMAIN;

function getOrderAsync(request) {
  return new Promise((resolve, reject) => {
    orderClient.GetOrderPrice(request, (err, order) => {
      if (err) return reject(err);
      resolve(order);
    });
  });
}

function updateOrderAsync(request) {
  return new Promise((resolve, reject) => {
    orderClient.SetPaymentStatus(request, (err, order) => {
      if (err) return reject(err);
      resolve(order);
    });
  });
}


export const createPayment = async (orderId) => {
  const order = await getOrderAsync({ orderId: orderId });

  const completeUrl = domain + "/api/v1/payments/done?session_id={CHECKOUT_SESSION_ID}";
  const paymentIntent = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price_data: {
            product_data: { name: "test item" },
            unit_amount: Math.round(order.price * 100),
            currency: "LKR",
          },
          quantity: 1
        }
      ],
      currency: "lkr",
      metadata: { orderId },
      success_url: completeUrl,
      cancel_url: completeUrl,
    },
    { idempotencyKey: `pi_${orderId}` }
  );

  return paymentIntent.url;
};


export const getPayment = async (sessionId) => {
  const payment = await stripe.checkout.sessions.retrieve(sessionId);

  const success = payment.payment_status === "no_payment_required" || payment.payment_status === "paid";
  const result = { orderId: payment.metadata.orderId, success: success, transactionId: payment.id }

  await updateOrderAsync(result)
};