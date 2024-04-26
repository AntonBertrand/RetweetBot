import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://twitter.com/messages/1778153056699404702');
  await page.goto('https://twitter.com/i/flow/login?redirect_after_login=%2Fmessages%2F1778153056699404702');
  await page.getByTestId('app-bar-close').click();
  await page.getByTestId('loginButton').click();
  await page.locator('label div').nth(3).click();
  await page.getByLabel('Phone, email address, or').fill('AlessaRubii');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Password', { exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill('BabyPoo123!');
  await page.getByTestId('LoginForm_Login_Button').click();
  await page.goto('https://twitter.com/messages/1778153056699404702');
  await page.getByRole('button', { name: 'Refuse non-essential cookies' }).click();


  await page.getByLabel('Add a GIF').click();
  await page.getByTestId('gifSearchSearchInput').fill('thank you');
  await page.getByRole('button', { name: 'Love Hearts GIF' }).click();
  await page.getByTestId('dmComposerTextInput').locator('div').nth(2).click();
  await page.getByTestId('dmComposerTextInput').fill('Cute doggie');
  await page.getByTestId('dmComposerSendButton').click();

});