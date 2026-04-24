const { By } = require('selenium-webdriver');

class HomePage {
  constructor(driver) {
    this.driver = driver;
  }

  get productsHeading() {
    return By.xpath("//h4[contains(., 'Products')] | //h5[contains(., 'Products')]");
  }

  get productCards() {
    return By.css("[data-testid='product-card'], .MuiCard-root");
  }

  get cartButton() {
    return By.css("a[href='/cart'], [data-testid='cart-nav']");
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/shop`);
  }

  async openCart() {
    const btn = await this.driver.findElement(this.cartButton);
    await btn.click();
  }

  async isLoaded() {
    const elements = await this.driver.findElements(this.productsHeading);
    return elements.length > 0;
  }

  async getProductCount() {
    const cards = await this.driver.findElements(this.productCards);
    return cards.length;
  }
}

module.exports = HomePage;
