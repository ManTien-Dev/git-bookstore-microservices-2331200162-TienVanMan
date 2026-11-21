import express from 'express';
import axios from 'axios';
import db from './db.js';
import { connectToBroker, publishMessage } from './broker.js';

const app = express();
app.use(express.json());

// RabbitMQ
connectToBroker().catch(err => console.error('Broker init error', err));

// Create order
app.post('/', async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Valid productId is required' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }

    const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8002';
    let product;
    try {
      const productRes = await axios.get(`${productServiceUrl}/${productId}`, { timeout: 5000 });
      product = productRes.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.error('Product service error:', err.message);
      return res.status(502).json({ error: 'Failed to verify product with product-service' });
    }

    const r = await db.query(
      'INSERT INTO orders (product_id, quantity, status) VALUES ($1, $2, $3) RETURNING *',
      [productId, quantity, 'PENDING']
    );
    const order = r.rows[0];

    const eventPayload = {
      event: 'ORDER_CREATED',
      orderId: order.id,
      productId: order.product_id,
      product: {
        id: product.id,
        title: product.title,
        author: product.author,
        price: product.price
      },
      quantity: order.quantity,
      status: order.status,
      createdAt: order.created_at
    };

    try {
      await publishMessage('order.created', eventPayload);
      console.log('Published ORDER_CREATED event to RabbitMQ:', JSON.stringify(eventPayload));
    } catch (brokerErr) {
      console.error('Failed to publish ORDER_CREATED event:', brokerErr.message);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List orders
app.get('/', async (_req, res) => {
  const r = await db.query('SELECT * FROM orders ORDER BY id DESC');
  res.json(r.rows);
});

// Get order by id
app.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const r = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
  if (r.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
  res.json(r.rows[0]);
});

const PORT = 8003;
app.listen(PORT, () => console.log(`Order Service running on ${PORT}`));
