const { By } = require('selenium-webdriver');

class CheckoutPage {
  constructor(driver) {
    this.driver = driver;
  }

  get addressInput() {
    return By.xpath("//textarea | //label[contains(., 'Shipping Address')]/following::textarea[1]");
  }

  get paymentMethodOption() {
    return By.xpath("//label[contains(., 'Cash on Delivery')] | //label[contains(., 'Card')] | //label[contains(., 'Bank Transfer')]");
  }

  get placeOrderButton() {
    return By.xpath("//button[contains(., 'Place Order')]");
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/checkout`);
  }

  async submitOrder({ shippingAddress, paymentMethod }) {
    const addressCandidates = await this.driver.findElements(this.addressInput);
    if (addressCandidates.length === 0) {
      throw new Error('Shipping address input not found on checkout page.');
    }

    const address = addressCandidates[0];
    await address.clear();
    await address.sendKeys(shippingAddress);

    const paymentOptions = await this.driver.findElements(this.paymentMethodOption);
    if (paymentOptions.length > 0) {
      if (typeof paymentMethod === 'string' && paymentMethod.toLowerCase().includes('card')) {
        for (const option of paymentOptions) {
          const text = await option.getText();
          if (text.toLowerCase().includes('card')) {
            await option.click();
            break;
          }
        }
      } else {
        await paymentOptions[0].click();
      }
    }

    const placeOrderButtons = await this.driver.findElements(this.placeOrderButton);
    if (placeOrderButtons.length === 0) {
      throw new Error('Place Order button not found on checkout page.');
    }

    await placeOrderButtons[0].click();
  }
}

module.exports = CheckoutPage;
