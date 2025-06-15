const { createClient } = require('redis');

const redisClient = createClient({ url: 'redis://10.0.1.5:6379' });
redisClient.connect().catch(console.error);

module.exports = redisClient;

