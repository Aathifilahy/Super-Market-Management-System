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

  async navigate(baseUrl, isAdmin = false) {
    await this.driver.get(`${baseUrl}${isAdmin ? '/admin/login' : '/login'}`);
  }

  async login(email, password, rememberMe = true) {
    await this.driver.findElement(this.emailInput).sendKeys(email);
    await this.driver.findElement(this.passwordInput).sendKeys(password);

    const checkbox = await this.driver.findElement(this.rememberMeCheckbox);
    const checked = await checkbox.isSelected();
    if (checked !== rememberMe) {
      await checkbox.click();
    }

    await this.driver.findElement(this.submitButton).click();
  }
}

module.exports = LoginPage;
