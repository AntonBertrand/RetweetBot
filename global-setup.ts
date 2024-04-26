const { chromium, Page } = require('playwright');

async function globalSetup() {

    const browser = await chromium.launch({ headless: false,});
    const context = await browser.newContext();
    const page = await context.newPage();

    // Logins to Twitter
    await page.goto('https://twitter.com/i/flow/login');
    await page.locator('label div').nth(3).fill('AlessaRubii');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Password', { exact: true }).click();
    await page.getByLabel('Password', { exact: true }).fill('BabyPoo123!');
    await page.getByTestId('LoginForm_Login_Button').click();
    await page.waitForSelector('[data-testid="AppTabBar_Home_Link"]');

    // Save the state to the webpage
    await page.context().storageState({path: "./LoginAuth.json" });

    await browser.close();

}

export default globalSetup;