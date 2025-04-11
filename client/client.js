import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });
const app = express();


const orderProtoDefinition = protoLoader.loadSync('./grpcProtos/order.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).OrderService;
const client = new orderProto(`localhost:${process.env.ORDER_PORT}`, grpc.credentials.createInsecure());

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log('Client get method');
  return res.status(200).json({ message: 'Client is running' });
});

app.post('/order', (req, res) => {
  console.log('Client post method');
  const { userId, product } = req.body;
  client.CreateOrder({ userId, product }, (error, response) => {
    if (error) {
      console.error('Error:', error.details);
      return res.status(500).json({ error: error.details });
    }
    console.log('Response:', response);
    return res.status(200).json(response);
  });
});

// app.get('/order/:id', (req, res) => {
//   console.log('Client get order by id method');
//   console.log(req.params);
//   const { id } = req.params;
//   client.GetOrder(id , (error, response) => {
//     if (error) {
//       console.error('Error:', error.details);
//       return res.status(500).json({ error: error.details });
//     }
//     console.log('Response:', response);
//     return res.status(200).json(response);
//   });
// });

app.listen(process.env.PORT, () => {
  console.log(`Client is running on port ${process.env.PORT}`);
});