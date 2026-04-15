const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/env');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: RATE_LIMIT || 100,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

module.exports = limiter;