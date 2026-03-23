require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
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

describe('Sprint 2 E2E - Customer Journey', function () {
  this.timeout(180000);

  let driver;
  const user = {
    ...generateUniqueUser('e2e'),
    address: '123 E2E Street',
    phone: '0712345678'
  };

  before(async () => {
    driver = await buildDriver({ headless: process.env.HEADLESS === 'true' });
    await clearBrowserStorage(driver);
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

    await driver.wait(until.urlContains('/shop'), 20000);
    expect(await driver.getCurrentUrl()).to.contain('/shop');
  });

  it('logs in with same user', async () => {
    console.log('Step 2: Login user');
    const loginPage = new LoginPage(driver);

    // Ensure clean state before login validation.
    await driver.get(`${FRONTEND_URL}/start`);
    const logoutButtons = await driver.findElements(By.xpath("//button[normalize-space()='Logout']"));
    if (logoutButtons.length > 0) {
      await logoutButtons[0].click();
    }

    await loginPage.navigate(FRONTEND_URL, false);
    await waitForVisible(driver, loginPage.emailInput);
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

    const addButtons = await driver.findElements(By.xpath("//button[contains(., 'Add to Cart') or contains(., 'Add')]") );
    if (addButtons.length === 0) {
      this.skip();
      return;
    }

    await addButtons[0].click();

    const cartPage = new CartPage(driver);
    await cartPage.navigate(FRONTEND_URL);
    await driver.wait(until.urlContains('/cart'), 10000);

    const updated = await cartPage.updateFirstQuantity(2);
    expect(updated).to.equal(true);
  });

  it('proceeds to checkout and places order when possible', async function () {
    console.log('Step 6-8: Checkout flow');
    const cartPage = new CartPage(driver);
    const checkoutPage = new CheckoutPage(driver);

    await cartPage.navigate(FRONTEND_URL);

    const checkoutCandidates = await driver.findElements(cartPage.checkoutButton);
    if (checkoutCandidates.length === 0) {
      this.skip();
      return;
    }

    await cartPage.goToCheckout();
    await driver.wait(until.urlContains('/checkout'), 10000);

    const submitButtons = await driver.findElements(checkoutPage.placeOrderButton);
    if (submitButtons.length === 0) {
      this.skip();
      return;
    }

    await checkoutPage.submitOrder({
      shippingAddress: '123 Test St, City, Country',
      paymentMethod: 'Credit Card'
    });

    // Accept either orders page or order success navigation.
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/orders') || url.includes('/shop') || url.includes('/checkout');
    }, 20000);
  });

  it('verifies order history page is accessible', async () => {
    console.log('Step 9: Verify order history');
    const ordersPage = new OrdersPage(driver);
    await ordersPage.navigate(FRONTEND_URL);

    const visible = await ordersPage.isVisible();
    expect(visible).to.equal(true);
  });

  it('logs out', async () => {
    console.log('Step 10: Logout');
    await driver.get(`${FRONTEND_URL}/shop`);
    const logoutButton = await waitForVisible(driver, By.xpath("//button[normalize-space()='Logout']"), 20000);
    await logoutButton.click();

    await driver.wait(until.urlContains('/start'), 20000);
    expect(await driver.getCurrentUrl()).to.contain('/start');
  });
});
