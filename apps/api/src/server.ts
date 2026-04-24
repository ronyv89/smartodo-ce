import 'dotenv/config';
import { buildApp } from './app.js';

const app = buildApp();

app.listen({ port: 3002, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('API service listening on http://0.0.0.0:3002');
});
