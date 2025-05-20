import path from "path";
import { fileURLToPath } from "url";
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "./delivery-service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});


// Load definitions and grab OrderService from root (no package in proto)
const grpcObject = loadPackageDefinition(packageDefinition);
const { DeliveryService } = grpcObject;

// Create a gRPC client for OrderService
const deliveryClient = new DeliveryService(`${process.env.APP_SERVICES_ORDER}`, credentials.createInsecure());

export default deliveryClient;