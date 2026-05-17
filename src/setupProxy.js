const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://u8qvvaw7ek.execute-api.us-east-1.amazonaws.com',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      on: {
        proxyReq: (proxyReq, req, res) => {
          console.log('Proxying:', req.method, req.path);
        }
      }
    })
  );
};