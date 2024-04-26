import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://twitter.com/');
  await page.getByTestId('loginButton').click();
  await page.locator('label div').nth(3).click();
  await page.getByLabel('Phone, email address, or').fill('AlessaRubii');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Password', { exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill('BabyPoo123!');
  await page.getByTestId('LoginForm_Login_Button').click();
  await page.getByRole('main').click({
    button: 'right'
  });
  await page.getByTestId('AppTabBar_DirectMessage_Link').click();
  await page.getByTestId('AppTabBar_DirectMessage_Link').click();
  await page.locator('div').filter({ hasText: /^214★彡\[ᴘɪᴋᴀᴀᴀ ᴘɪᴋᴀᴀ 1\/4 - 10ᴋ\+\]彡★·2mKitty Louise sent a GIF$/ }).nth(3).click();
  await page.getByRole('tablist').locator('div').filter({ hasText: '189ⓞⓟⓔⓝ ⓐⓓⓓ $ 1/4 Bal Random' }).nth(3).click();
  await page.getByRole('tablist').locator('div').filter({ hasText: '105 1/4' }).nth(3).click();
  await page.getByRole('link', { name: 'Lady K' }).nth(1).click();
  await page.getByRole('tab', { name: 'Media' }).click();
  await page.getByRole('tab', { name: 'Posts' }).click();
  await page.getByTestId('AppTabBar_DirectMessage_Link').click();
  await page.getByRole('link', { name: '✨ Roksana 🌹FREE OnlyFans🌹' }).click();
  await page.getByText('Looks like you lost your').click();
  await page.getByRole('button', { name: 'Retry' }).click();
  await page.getByRole('button', { name: 'Retry' }).click();
  
  await page.getByText('Looks like you lost your').click();
  await page.getByRole('button', { name: 'Retry' }).click();
});