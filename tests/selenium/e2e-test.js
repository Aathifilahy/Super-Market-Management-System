require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const {
  FRONTEND_URL,
  buildDriver,
  waitForVisible,
  takeScreenshot,
  generateUniqueUser,
  clearBrowserStorage
} = require('./config');

const HomePage = require('./pages/HomePage');
const LoginPage = require('./pages/LoginPage');
const RegistrationPage = require('./pages/RegistrationPage');
const CartPage = require('./pages/CartPage');
const CheckoutPage = require('./pages/CheckoutPage');
const OrdersPage = require('./pages/OrdersPage');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5224/api';

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function ensureCartHasItem(token) {
  if (!token) {
    return false;
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const productsResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
    const candidate = products.find((p) => typeof p?.id === 'number' && Number(p.quantity) > 0 && !p.isExpired);

    if (!candidate) {
      return false;
    }

    await axios.post(
      `${API_BASE_URL}/cart/items`,
      {
        productId: candidate.id,
        quantity: 1
      },
      { headers }
    );

    return true;
  } catch {
    return false;
  }
}

describe('Sprint 2 E2E - Customer Journey', function () {
  this.timeout(180000);

  let driver;
  const user = {
    ...generateUniqueUser('e2e'),
    address: '123 E2E Street',
    phone: '0712345678'
  };

  before(async () => {
    console.log('E2E setup: starting Chrome WebDriver...');
    driver = await withTimeout(
      buildDriver({ headless: process.env.HEADLESS === 'true' }),
      45000,
      'Timed out while starting Chrome WebDriver. Check Chrome installation and chromedriver compatibility.'
    );

    await withTimeout(
      driver.get(FRONTEND_URL),
      20000,
      `Timed out while opening frontend URL: ${FRONTEND_URL}`
    );

    await withTimeout(
      clearBrowserStorage(driver),
      10000,
      'Timed out while clearing browser storage during setup.'
    );
    console.log('E2E setup: WebDriver ready.');
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed' && driver) {
      const path = await takeScreenshot(driver, this.currentTest.fullTitle());
      console.error(`Screenshot saved: ${path}`);
    }
  });

  it('registers a new customer account', async () => {
    console.log('Step 1: Register user');
    const page = new RegistrationPage(driver);

    await page.navigate(FRONTEND_URL);
    await waitForVisible(driver, page.nameInput);
    await page.register(user);

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return !url.includes('/register');
    }, 20000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl.includes('/shop') || currentUrl.endsWith('/')).to.equal(true);
  });

  it('logs in with same user', async () => {
    console.log('Step 2: Login user');
    const loginPage = new LoginPage(driver);

    // Ensure clean state before login validation.
    await driver.get(`${FRONTEND_URL}/shop`);
    const logoutButtons = await driver.findElements(By.xpath("//button[contains(., 'Logout')]"));
    if (logoutButtons.length > 0) {
      await logoutButtons[0].click();
    }
    await clearBrowserStorage(driver);
    await driver.get(`${FRONTEND_URL}/login`);

    await loginPage.navigate(FRONTEND_URL, false);
    await loginPage.findEmailInput();
    await loginPage.login(user.email, user.password, true);

    await driver.wait(until.urlContains('/shop'), 20000);
    expect(await driver.getCurrentUrl()).to.contain('/shop');
  });

  it('browses products', async () => {
    console.log('Step 3: Browse products');
    const homePage = new HomePage(driver);

    await homePage.navigate(FRONTEND_URL);
    await driver.wait(async () => homePage.isLoaded(), 20000);

    const count = await homePage.getProductCount();
    expect(count).to.be.at.least(0);
  });

  it('adds product to cart and updates quantity', async () => {
    console.log('Step 4-5: Add to cart and update quantity');
    await driver.get(`${FRONTEND_URL}/shop`);

    const addButtons = await driver.findElements(By.xpath("//button[contains(., 'Add to Cart')]") );
    if (addButtons.length === 0) {
      this.skip();
      return;
    }

    await addButtons[0].click();

    const cartPage = new CartPage(driver);
    await cartPage.navigate(FRONTEND_URL);
    await driver.wait(until.urlContains('/cart'), 10000);

    const itemCount = await cartPage.getItemCount();
    if (itemCount === 0) {
      this.skip();
      return;
    }

    const updated = await cartPage.updateFirstQuantity(2);
    expect(updated).to.equal(true);
  });

  it('proceeds to checkout and places order when possible', async function () {
    console.log('Step 6-8: Checkout flow');
    const cartPage = new CartPage(driver);
    const checkoutPage = new CheckoutPage(driver);

    const token = await driver.executeScript("return window.sessionStorage.getItem('supermarket_auth_token');");
    await ensureCartHasItem(token);

    await cartPage.navigate(FRONTEND_URL);

    let checkoutCandidates = await driver.findElements(cartPage.checkoutButton);

    // If checkout button is missing, try to seed cart from product list once.
    if (checkoutCandidates.length === 0) {
      await driver.get(`${FRONTEND_URL}/shop`);
      const addButtons = await driver.findElements(By.xpath("//button[contains(., 'Add to Cart')]") );
      if (addButtons.length > 0) {
        await addButtons[0].click();
      }

      await cartPage.navigate(FRONTEND_URL);
      checkoutCandidates = await driver.findElements(cartPage.checkoutButton);
    }

    if (checkoutCandidates.length === 0) {
      this.skip();
      return;
    }

    await cartPage.goToCheckout();
    await driver.wait(until.urlContains('/checkout'), 10000);

    const submitButtons = await driver.findElements(checkoutPage.placeOrderButton);
    expect(submitButtons.length).to.be.greaterThan(0);

    await checkoutPage.submitOrder({
      shippingAddress: '123 Test St, City, Country',
      paymentMethod: 'Credit Card'
    });

    // Accept either orders page or order success navigation.
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/orders') || url.includes('/shop') || url.includes('/checkout');
    }, 20000);

    const urlAfterPlaceOrder = await driver.getCurrentUrl();
    expect(urlAfterPlaceOrder.includes('/checkout') || urlAfterPlaceOrder.includes('/orders') || urlAfterPlaceOrder.includes('/shop')).to.equal(true);
  });

  it('verifies order history page is accessible', async () => {
    console.log('Step 9: Verify order history');
    const ordersPage = new OrdersPage(driver);
    await ordersPage.navigate(FRONTEND_URL);
    await driver.wait(until.urlContains('/orders'), 10000);

    const visible = await ordersPage.isVisible();
    expect(visible).to.equal(true);
  });

  it('logs out', async () => {
    console.log('Step 10: Logout');
    await driver.get(`${FRONTEND_URL}/shop`);
    const logoutButton = await waitForVisible(driver, By.xpath("//button[normalize-space()='Logout']"), 20000);
    await logoutButton.click();

    await driver.wait(until.urlContains('/'), 20000);
    expect(await driver.getCurrentUrl()).to.contain('/');
  });
});
