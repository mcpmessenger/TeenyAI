const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

module.exports = { isDev };