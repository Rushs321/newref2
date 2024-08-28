#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Defaults to '0.0.0.0' for external accessibility

fastify.get('/', async (req, reply) => {
  return proxy(req, reply);
});

fastify.get('/favicon.ico', async (req, reply) => {
  res.status(204).send();
});

// Start the server
fastify.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
