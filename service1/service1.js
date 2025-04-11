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

const userProto = grpc.loadPackageDefinition(userProtoDefinition).UserService;

const users = [
  { userId: 1, name: 'Alex', email: 'alex@example.com' },
  { userId: 2, name: 'Maria', email: 'maria@example.com' },
];

function getUser(call, callback) {
  const userId = call.request.userId;
  const user = users.find(u => u.userId === userId);
  if (user) {
    callback(null, { userId: user.userId, name: user.name, email: user.email });
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'User not found',
    });
  }
}

const server = new grpc.Server();
server.addService(userProto.service, { GetUser: getUser });

server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`User's service is running on PORT: ${process.env.PORT}`);
  server.start();
});