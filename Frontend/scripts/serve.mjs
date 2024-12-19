import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import {createProxyMiddleware} from 'http-proxy-middleware';
import _ from 'underscore';
import open from "open";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

if (process.argv.length != 3) {
  console.log('#### usage: node scripts/serve.mjs <basedir>');
  process.exit(1);
}

const basePath = _(process.argv.slice(2)).first();

app.use('/', express.static(basePath));

app.use(
    '/api',
    createProxyMiddleware({

      target: 'http://localhost:5000/',
      changeOrigin: true,
    }),
);
app.use(
    '/connect',
    createProxyMiddleware({

      target: 'http://localhost:5000/',
      changeOrigin: true,
    }),
);
app.use(
    '/callback',
    createProxyMiddleware({

      target: 'http://localhost:5000/',
      changeOrigin: true,
    }),
);
app.use(
    '/signalr',
    createProxyMiddleware({

      target: 'http://localhost:5000/',
      changeOrigin: true,
      ws: true,
    }),
);

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (request, response) {

  response.sendFile( 'index.html',{ root:path.resolve(__dirname,"../",basePath) });
});

app.listen(8080);

open("http://localhost:8080");