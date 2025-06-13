require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');

const app = express();
const PORT = 3000;

// MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const User = mongoose.model('User', { name: String });

// Redis
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

redisClient.connect();
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', err => console.log('Redis Error:', err));

// Routes
app.get('/users', async (req, res) => {
  const cache = await redisClient.get('users');
  if (cache) {
    return res.json({ from: 'cache', data: JSON.parse(cache) });
  }

  const users = await User.find();
  await redisClient.set('users', JSON.stringify(users), { EX: 60 }); // cache for 60 seconds
  res.json({ from: 'db', data: users });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
