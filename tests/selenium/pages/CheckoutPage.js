const { By } = require('selenium-webdriver');

class CheckoutPage {
  constructor(driver) {
    this.driver = driver;
  }

  get addressInput() {
    return By.css("textarea[name='shippingAddress'], textarea[name='address']");
  }

  get paymentInput() {
    return By.css("input[name='paymentMethod'], input[name='payment']");
  }

  get placeOrderButton() {
    return By.css("button[type='submit'], button[data-testid='place-order-btn']");
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/checkout`);
  }

  async submitOrder({ shippingAddress, paymentMethod }) {
    const address = await this.driver.findElement(this.addressInput);
    await address.clear();
    await address.sendKeys(shippingAddress);

    const payment = await this.driver.findElement(this.paymentInput);
    await payment.clear();
    await payment.sendKeys(paymentMethod);

    await this.driver.findElement(this.placeOrderButton).click();
  }
}

module.exports = CheckoutPage;
