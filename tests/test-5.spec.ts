import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://twitter.com/');
  await page.getByTestId('loginButton').click();
  await page.getByLabel('Phone, email address, or').click();
  await page.getByLabel('Phone, email address, or').fill('AlessaRubii');
  await page.getByLabel('Phone, email address, or').click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Password', { exact: true }).fill('BabyPoo123!');
  await page.getByTestId('LoginForm_Login_Button').click();
  await page.getByTestId('AppTabBar_DirectMessage_Link').click();
  await page.getByText('𝓷𝓸 𝓶𝓲𝓷𝓼 1/3 𝕋𝕖𝕒 𝕋𝕚𝕞𝕖 𝕨𝕚𝕥𝕙 𝕥𝕙𝕖').click();
  await page.goto('https://twitter.com/messages/');
  await page.getByText('Select a message').click();
  await page.getByText('Choose from your existing').click();
});