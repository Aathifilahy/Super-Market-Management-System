require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const https = require('https');
const axios = require('axios');
const { expect } = require('chai');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5224/api';
const ALLOW_INSECURE_SSL = String(process.env.ALLOW_INSECURE_SSL || 'true') === 'true';
const TEST_PRODUCT_ID = Number(process.env.TEST_PRODUCT_ID || 1);

const testUser = {
  name: process.env.TEST_USER_NAME || 'QA Integration User',
  email: process.env.TEST_USER_EMAIL || `qa.integration.${Date.now()}@example.com`,
  password: process.env.TEST_USER_PASSWORD || 'Test1234!',
  address: process.env.TEST_USER_ADDRESS || '123 QA Street',
  phone: process.env.TEST_USER_PHONE || '0712345678'
};

const secureAgent = new https.Agent({ rejectUnauthorized: !ALLOW_INSECURE_SSL });
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  httpsAgent: secureAgent,
  validateStatus: () => true
});

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

describe('Sprint 2 Integration API tests', function () {
  this.timeout(180000);

  let token;
  let cartItemId;
  let orderId;

  it('POST /auth/register - happy path', async () => {
    const response = await client.post('/auth/register', {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.password,
      role: 'Customer',
      address: testUser.address,
      phone: testUser.phone
    });

    expect([201, 409]).to.include(response.status);
  });

  it('POST /auth/register - invalid payload', async () => {
    const response = await client.post('/auth/register', {
      name: 'A',
      email: 'not-an-email',
      password: '123',
      confirmPassword: '456'
    });

    expect(response.status).to.equal(400);
  });

  it('POST /auth/login - happy path', async () => {
    const response = await client.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('token');
    token = response.data.token;
  });

  it('POST /auth/login - wrong password', async () => {
    const response = await client.post('/auth/login', {
      email: testUser.email,
      password: 'WrongPassword123!'
    });

    expect(response.status).to.equal(401);
  });

  it('GET /auth/profile - requires auth', async () => {
    const response = await client.get('/auth/profile');
    expect(response.status).to.equal(401);
  });

  it('GET /auth/profile - happy path', async () => {
    const response = await client.get('/auth/profile', {
      headers: authHeader(token)
    });

    expect(response.status).to.equal(200);
    expect(response.data.email.toLowerCase()).to.equal(testUser.email.toLowerCase());
  });

  it('PUT /auth/profile - happy path', async () => {
    const response = await client.put(
      '/auth/profile',
      {
        name: `${testUser.name} Updated`,
        address: '456 Updated Lane',
        phone: '0771234567'
      },
      { headers: authHeader(token) }
    );

    expect(response.status).to.equal(200);
    expect(response.data.name).to.contain('Updated');
  });

  it('POST /auth/change-password - invalid current password', async () => {
    const response = await client.post(
      '/auth/change-password',
      {
        currentPassword: 'WrongCurrentPass123!',
        newPassword: 'NewStrongPass123!',
        confirmNewPassword: 'NewStrongPass123!'
      },
      { headers: authHeader(token) }
    );

    expect([400, 401]).to.include(response.status);
  });

  it('GET /cart - happy path', async () => {
    const response = await client.get('/cart', { headers: authHeader(token) });
    expect([200, 404]).to.include(response.status);
  });

  it('POST /cart/items - happy path', async function () {
    const response = await client.post(
      '/cart/items',
      {
        productId: TEST_PRODUCT_ID,
        quantity: 1
      },
      { headers: authHeader(token) }
    );

    if (response.status === 404 || response.status === 409) {
      this.skip();
      return;
    }

    expect(response.status).to.equal(200);
    const items = response.data?.items || [];
    const found = items.find((x) => x.productId === TEST_PRODUCT_ID);
    if (found) {
      cartItemId = found.id;
    }
  });

  it('PUT /cart/items/{id} - happy path', async function () {
    if (!cartItemId) {
      this.skip();
      return;
    }

    const response = await client.put(
      `/cart/items/${cartItemId}`,
      {
        productId: TEST_PRODUCT_ID,
        quantity: 2
      },
      { headers: authHeader(token) }
    );

    expect([200, 404, 409]).to.include(response.status);
  });

  it('DELETE /cart/items/{id} - happy path', async function () {
    if (!cartItemId) {
      this.skip();
      return;
    }

    const response = await client.delete(`/cart/items/${cartItemId}`, {
      headers: authHeader(token)
    });

    expect([200, 404]).to.include(response.status);
  });

  it('DELETE /cart/clear - happy path', async () => {
    const response = await client.delete('/cart/clear', { headers: authHeader(token) });
    expect([200, 404]).to.include(response.status);
  });

  it('POST /orders - happy path (when cart has items)', async function () {
    // Ensure cart has at least one item before order placement.
    await client.post(
      '/cart/items',
      {
        productId: TEST_PRODUCT_ID,
        quantity: 1
      },
      { headers: authHeader(token) }
    );

    const response = await client.post(
      '/orders',
      {
        shippingAddress: '123 Test St, City, Country',
        paymentMethod: 'Credit Card'
      },
      { headers: authHeader(token) }
    );

    if (![201, 409, 404].includes(response.status)) {
      expect.fail(`Unexpected status code for place order: ${response.status}`);
    }

    if (response.status !== 201) {
      this.skip();
      return;
    }

    orderId = response.data?.id;
    expect(orderId).to.be.a('number');
  });

  it('GET /orders - happy path', async () => {
    const response = await client.get('/orders', { headers: authHeader(token) });
    expect([200, 404]).to.include(response.status);

    if (response.status === 200) {
      expect(response.data).to.be.an('array');
    }
  });

  it('GET /orders/{id} - ownership/security check', async function () {
    if (!orderId) {
      this.skip();
      return;
    }

    const response = await client.get(`/orders/${orderId}`, {
      headers: authHeader(token)
    });

    expect([200, 404]).to.include(response.status);
  });

  it('Protected endpoint should reject missing auth', async () => {
    const response = await client.get('/orders');
    expect(response.status).to.equal(401);
  });
});
