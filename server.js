#!/usr/bin/env node
'use strict';
const fastify = require('fastify')({ logger: true });
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

fastify.register(require('@fastify/express')); // Required for compatibility with some middlewares

fastify.addHook('onRequest', params);

fastify.get('/', proxy);

fastify.get('/favicon.ico', (req, reply) => reply.status(204).send());
// Start the server
fastify.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
