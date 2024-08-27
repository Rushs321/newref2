#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Fastify hook to handle params as middleware
fastify.addHook('preHandler', params);

// Define the main route
fastify.get('/', proxy);

// Handle favicon requests with a 204 No Content response
fastify.get('/favicon.ico', (req, reply) => reply.status(204).send());

// Start the server
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
