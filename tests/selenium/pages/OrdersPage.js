const { By } = require('selenium-webdriver');

class OrdersPage {
  constructor(driver) {
    this.driver = driver;
  }

  get orderCards() {
    return By.css("[data-testid='order-card'], .MuiCard-root");
  }

  get emptyMessage() {
    return By.xpath("//*[contains(., 'No orders')]");
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/orders`);
  }

  async getOrderCount() {
    const cards = await this.driver.findElements(this.orderCards);
    return cards.length;
  }

  async isVisible() {
    const cards = await this.driver.findElements(this.orderCards);
    if (cards.length > 0) {
      return true;
    }

    const empty = await this.driver.findElements(this.emptyMessage);
    return empty.length > 0;
  }
}

module.exports = OrdersPage;
