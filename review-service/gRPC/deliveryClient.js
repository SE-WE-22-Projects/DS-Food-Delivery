const path = require("path");
const { fileURLToPath } = require("url");
const { loadPackageDefinition, credentials } = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");


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
const { DeliveryService } = grpcObject;

// Create a gRPC client for OrderService
const deliveryClient = new DeliveryService(`${process.env.APP_SERVICES_ORDER}`, credentials.createInsecure());

module.exports = { 
    deliveryClient
}