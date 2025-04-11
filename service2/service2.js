import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

const userProtoDefinition = protoLoader.loadSync('./grpcProtos/user.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const orderProtoDefinition = protoLoader.loadSync('./grpcProtos/order.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userProtoDefinition).UserService;
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).OrderService;

const userClient = new userProto(`localhost:${process.env.USER_PORT}`, grpc.credentials.createInsecure());

const orders = [];

function createOrder(call, callback) {
  const userId = call.request.userId;
  const product = call.request.product;

  userClient.GetUser({ userId }, (error, user) => {
    if (error) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'User not found',
      });
      return;
    }

    const orderId = orders.length + 1;
    orders.push({ orderId, userId, product });
    console.log(`Making order: ${product} for ${user.name}`);

    callback(null, { orderId, status: 'Order is maked' });
  });
}

const server = new grpc.Server();
server.addService(orderProto.service, { CreateOrder: createOrder });

server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Order service is running on port ${process.env.PORT}`);
  server.start();
});