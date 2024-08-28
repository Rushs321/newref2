'use strict';
const fastify = require('fastify')({ logger: true });
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

fastify.register((instance, opts, next) => {
  instance.get('/', proxy);
  instance.get('/favicon.ico', (req, res) => res.status(204).send());
  next();
});

fastify.listen(PORT, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
