const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT = 15000;

function buildDriver({ headless = false } = {}) {
  const options = new chrome.Options();
  if (headless) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--window-size=1440,900');
  options.addArguments('--disable-search-engine-choice-screen');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--no-sandbox');

  const service = new chrome.ServiceBuilder(chromedriver.path);

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();
}

async function waitForVisible(driver, locator, timeout = DEFAULT_TIMEOUT) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function waitAndClick(driver, locator, timeout = DEFAULT_TIMEOUT) {
  const element = await waitForVisible(driver, locator, timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  await element.click();
  return element;
}

async function takeScreenshot(driver, testName) {
  const dir = path.join(__dirname, '..', 'reports', 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const safeName = testName.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
  const filePath = path.join(dir, `${safeName}_${Date.now()}.png`);
  const image = await driver.takeScreenshot();
  fs.writeFileSync(filePath, image, 'base64');
  return filePath;
}

function generateUniqueUser(prefix = 'qa') {
  const stamp = Date.now();
  return {
    name: `${prefix.toUpperCase()} User ${stamp}`,
    email: `${prefix}.${stamp}@example.com`,
    password: 'Test1234!'
  };
}

async function clearBrowserStorage(driver) {
  await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
}

module.exports = {
  By,
  FRONTEND_URL,
  DEFAULT_TIMEOUT,
  buildDriver,
  waitForVisible,
  waitAndClick,
  takeScreenshot,
  generateUniqueUser,
  clearBrowserStorage
};
