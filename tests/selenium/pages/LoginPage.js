const { By } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  get emailInput() {
    return By.css("input[name='email']");
  }

  get passwordInput() {
    return By.css("input[name='password']");
  }

  get rememberMeCheckbox() {
    return By.css("input[type='checkbox']");
  }

  get submitButton() {
    return By.css("button[type='submit']");
  }

  async findFirst(locators) {
    for (const locator of locators) {
      const elements = await this.driver.findElements(locator);
      if (elements.length > 0) {
        return elements[0];
      }
    }

    throw new Error('No matching element found for provided locators.');
  }

  async findEmailInput() {
    return this.findFirst([
      By.css("input[name='email']"),
      By.css("input[type='email']")
    ]);
  }

  async findPasswordInput() {
    return this.findFirst([
      By.css("input[name='password']"),
      By.css('#login-password'),
      By.css("input[type='password']")
    ]);
  }

  async findSubmitButton() {
    return this.findFirst([
      By.css("button[type='submit']"),
      By.xpath("//button[contains(., 'Sign In')]")
    ]);
  }

  async navigate(baseUrl) {
    await this.driver.get(`${baseUrl}/login`);
  }

  async login(email, password, rememberMe = true) {
    const emailInput = await this.findEmailInput();
    const passwordInput = await this.findPasswordInput();
    await emailInput.sendKeys(email);
    await passwordInput.sendKeys(password);

    const checkbox = await this.driver.findElement(this.rememberMeCheckbox);
    const checked = await checkbox.isSelected();
    if (checked !== rememberMe) {
      await checkbox.click();
    }

    const submitButton = await this.findSubmitButton();
    await submitButton.click();
  }
}

module.exports = LoginPage;
