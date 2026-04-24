const { By } = require('selenium-webdriver');

class RegistrationPage {
  constructor(driver) {
    this.driver = driver;
  }

  get nameInput() {
    return By.css("input[name='name']");
  }

  get emailInput() {
    return By.css("input[name='email']");
  }

  get passwordInput() {
    return By.css("input[name='password']");
  }

  get confirmPasswordInput() {
    return By.css("input[name='confirmPassword']");
  }

  get addressInput() {
    return By.css("textarea[name='address']");
  }

  get phoneInput() {
    return By.css("input[name='phone']");
  }

  get submitButton() {
    return By.css("button[type='submit']");
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/register`);
  }

  async register(user) {
    await this.driver.findElement(this.nameInput).sendKeys(user.name);
    await this.driver.findElement(this.emailInput).sendKeys(user.email);
    await this.driver.findElement(this.passwordInput).sendKeys(user.password);
    await this.driver.findElement(this.confirmPasswordInput).sendKeys(user.password);

    if (user.address) {
      await this.driver.findElement(this.addressInput).sendKeys(user.address);
    }

    if (user.phone) {
      await this.driver.findElement(this.phoneInput).sendKeys(user.phone);
    }

    await this.driver.findElement(this.submitButton).click();
  }
}

module.exports = RegistrationPage;
