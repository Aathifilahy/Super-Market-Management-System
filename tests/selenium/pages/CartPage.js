const { By } = require('selenium-webdriver');

class CartPage {
  constructor(driver) {
    this.driver = driver;
  }

  get cartItems() {
    return By.css("[data-testid='cart-item'], .MuiCard-root");
  }

  get quantityInputs() {
    return By.css("input[type='number']");
  }

  get checkoutButton() {
    return By.xpath("//button[contains(., 'Proceed to Checkout')] | //a[@href='/checkout']");
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/cart`);
  }

  async getItemCount() {
    const items = await this.driver.findElements(this.cartItems);
    return items.length;
  }

  async updateFirstQuantity(value) {
    const inputs = await this.driver.findElements(this.quantityInputs);
    if (inputs.length === 0) {
      return false;
    }

    const input = inputs[0];
    await input.clear();
    await input.sendKeys(String(value));
    return true;
  }

  async goToCheckout() {
    const buttons = await this.driver.findElements(this.checkoutButton);
    if (buttons.length === 0) {
      throw new Error('Checkout button not found on cart page.');
    }

    const btn = buttons[0];
    await btn.click();
  }
}

module.exports = CartPage;
