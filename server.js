'use strict';
const fastify = require('fastify');
const processRequest = require('./src/proxy');

const app = fastify({ 
  logger: true,
  disableRequestLogging: true,
  trustProxy: true // Enable trust proxy
});

const PORT = process.env.PORT || 8080;

// Set up the route
app.get('/', async (req, res) => {
  return processRequest(req, res);
});

// Start the server
const start = async () => {
  try {
    await app.listen({ host: '0.0.0.0', port: PORT });
    console.log(`Listening on ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
