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
    return By.css("a[href='/checkout'], button[data-testid='checkout-btn']");
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
    const btn = await this.driver.findElement(this.checkoutButton);
    await btn.click();
  }
}

module.exports = CartPage;
