import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

export const createPayment = async (orderId, amount) => {
  const paymentIntent = await stripe.paymentIntents.create(
    { amount: Math.round(amount * 100), currency: "lkr", metadata: { orderId } },
    { idempotencyKey: `pi_${orderId}` }
  );
  return {
    transactionId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status
  };
};
