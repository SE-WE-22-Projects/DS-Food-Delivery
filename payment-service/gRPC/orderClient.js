import path from "path";
import { fileURLToPath } from "url";
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "./order-service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load definitions and grab OrderService from root (no package in proto)
const grpcObject = loadPackageDefinition(packageDefinition);
const { OrderService } = grpcObject;

// Create a gRPC client for OrderService
export const orderClient = new OrderService(
  `${process.env.APP_ORDER_SERVICE_HOST}:${process.env.APP_ORDER_SERVICE_PORT}`,
  credentials.createInsecure()
);
