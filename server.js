'use strict';
const fastify = require('fastify');
const proxy = require('./src/proxy');

const app = fastify({
  logger: true,
  disableRequestLogging: false,
  trustProxy: true // Enable trust proxy
});

const PORT = process.env.PORT || 8080;

// Set up the route
app.get('/', proxy);

// Define a route for favicon.ico
fastify.get('/favicon.ico', async (req, res) => {
  reply.code(204); // Set status code to 204 No Content
  reply.raw.end(); // Explicitly end the response without sending any content
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
