const express = require('express');
const mongoose = require('mongoose');
const redisClient = require('./redisClient');
const User = require('./mongoModel');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://10.0.1.4:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/user', async (req, res) => {
  const { name } = req.body;

  // Save to MongoDB
  const newUser = new User({ name });
  await newUser.save();

  // Save to Redis
  await redisClient.set(name, JSON.stringify(newUser));

  res.json({ mongo: newUser, redis: `Cached ${name}` });
});

app.listen(3000, () => {
  console.log('Server running at http://0.0.0.0:3000');
});
