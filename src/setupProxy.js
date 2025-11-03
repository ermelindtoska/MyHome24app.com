// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

// Lejojmë dev-serverin e React të proksojë thirrjet tek Firebase Storage,
// që preflight/OPTIONS dhe CORS të trajtohen lokalisht.
module.exports = function (app) {
  // Proxy për hostin zyrtar të Firebase Storage:
  app.use(
    '/__fs__',
    createProxyMiddleware({
      target: 'https://firebasestorage.googleapis.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/__fs__': '' },
      onProxyReq(proxyReq) {
        // heqim header-ë të panevojshëm që shkaktojnë preflight ekstra
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      },
    })
  );

  // (opsionale) proxy edhe për *.appspot.com nëse shfaqet në Network
  app.use(
    '/__appspot__',
    createProxyMiddleware({
      target: 'https://storage.googleapis.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/__appspot__': '' },
      onProxyReq(proxyReq) {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      },
    })
  );
};
