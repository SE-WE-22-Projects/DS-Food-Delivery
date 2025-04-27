// grpc/orderServer.js
import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "../../shared/api/order-service.proto");

// 1) Load your .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// 2) Since there’s no `package` in your proto, OrderService lives at the root:
const { OrderService } = grpcObject;

// 3) Implement your RPC handlers
const impl = {
  GetOrderPrice(call, callback) { /* ... */ },
  SetPaymentStatus(call, callback) { /* ... */ },
  // etc.
};

// 4) Wire up & start the server
function main() {
  const server = new grpc.Server();
  // Use OrderService.service directly
  server.addService(OrderService.service, impl);

  const port = process.env.ORDER_SERVICE_PORT || "50051";
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
      if (err) {
        console.error("gRPC bind error:", err);
        process.exit(1);
      }
      console.log(`OrderService gRPC server listening on ${bindPort}`);
      server.start();
    }
  );
}

main();
