#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true, disableRequestLogging: true, trustProxy: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Route for the main functionality
fastify.get('/', { preHandler: params }, proxy);

// Route for favicon.ico to avoid unnecessary requests
fastify.get('/favicon.ico', async (request, reply) => {
  reply.status(204).send();
});

// Start the server
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
