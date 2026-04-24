require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5224/api';
const ALLOW_INSECURE_SSL = String(process.env.ALLOW_INSECURE_SSL || 'true') === 'true';

const userEmail = process.env.TEST_USER_EMAIL || 'qa_user@example.com';
const userPassword = process.env.TEST_USER_PASSWORD || 'Test1234!';
const testProductId = Number(process.env.TEST_PRODUCT_ID || 1);

const secureAgent = new https.Agent({ rejectUnauthorized: !ALLOW_INSECURE_SSL });
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  httpsAgent: secureAgent,
  validateStatus: () => true
});

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

async function measure(name, fn, iterations = 5) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = nowMs();
    try {
      await fn();
    } catch {
      // keep timing even on failure for baseline visibility
    }
    times.push(nowMs() - start);
  }

  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;

  return { name, iterations, min, max, avg, slowerThan500ms: avg > 500 };
}

async function main() {
  let token;

  const login = await client.post('/auth/login', {
    email: userEmail,
    password: userPassword
  });

  if (login.status === 200 && login.data?.token) {
    token = login.data.token;
  }

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const probes = [
    {
      name: 'GET /api/products',
      run: () => client.get('/products')
    },
    {
      name: 'GET /api/products/{id}',
      run: () => client.get(`/products/${testProductId}`)
    },
    {
      name: 'POST /api/auth/login',
      run: () => client.post('/auth/login', { email: userEmail, password: userPassword })
    },
    {
      name: 'GET /api/cart',
      run: () => client.get('/cart', { headers: authHeaders })
    },
    {
      name: 'GET /api/orders',
      run: () => client.get('/orders', { headers: authHeaders })
    }
  ];

  const results = [];
  for (const probe of probes) {
    const result = await measure(probe.name, probe.run, 5);
    results.push(result);
  }

  const slower = results.filter((r) => r.slowerThan500ms).map((r) => r.name);

  console.table(
    results.map((r) => ({
      endpoint: r.name,
      minMs: r.min.toFixed(2),
      maxMs: r.max.toFixed(2),
      avgMs: r.avg.toFixed(2),
      slow: r.slowerThan500ms
    }))
  );

  const output = {
    generatedAt: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    slowerThan500ms: slower,
    results
  };

  const outDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'performance-baseline.json');
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\nSaved performance baseline to: ${outFile}`);
}

main().catch((err) => {
  console.error('Performance baseline failed:', err.message);
  process.exit(1);
});
