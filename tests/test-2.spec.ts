import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  const user = 'lettuvase';

  function logMsg(message: string) {
    const time = new Date().toLocaleString();
    console.log(`${time}: ${message}`);
  }


  async function sensitiveContentWarningCheck() {
    // Check if users account has a sensitive content warning
    const sensitiveContentWarning = await page.getByText('Caution: This profile may').isVisible();

    if (sensitiveContentWarning) {
      logMsg("Sensitive Content Warning Found");
      await page.getByTestId('empty_state_button_text').click();

      // Waits for page to load (Needs Rework)
      await page.waitForTimeout(6000);

      // Sometimes the button must be clicked twice, so here we check if a double click is needd.
      const sensitiveContentWarning2 = await page.getByText('Caution: This profile may').isVisible();
      if (sensitiveContentWarning2) {
        logMsg("Sensitive Content Warning 2 Found");
        await page.getByTestId('empty_state_button_text').click();
      } else {
        logMsg("Sensitive Content Warning 2 NOT Found");
      }

    } else {
      logMsg("Sensitive Content Warning NOT Found");
    }
  }


  
  //--------------------------------START OF THE SCRIPT-----------------------------//


  logMsg(`Starting Retweet Task (${user})`);

  // Navigates to the users Twitter profile
  await page.goto(`https://twitter.com/${user}`);

  // Waits for Twitter profile to load
  await page.waitForSelector('[data-testid="userActions"]');


  sensitiveContentWarningCheck()


  // Navigates to the users Media
  await page.getByRole('tab', { name: 'Media' }).click();

  // Might need sensitiveContentWarningcheck here

  // Waits for Media grid to load
  await page.waitForSelector('#verticalGridItem-0-profile-grid-0');

  
  // Checks if media has a NSFW spoiler
  const mediaSpoiler = await page.locator('#verticalGridItem-0-profile-grid-0').getByRole('button', { name: 'Show' }).isVisible()

  if (mediaSpoiler) {
    logMsg("Media NSFW Spoiler found");
    await page.locator('#verticalGridItem-0-profile-grid-0').getByRole('button', { name: 'Show' }).click();
  } else {
    logMsg("Media NSFW Spoiler NOT found");
  }

  // Clicks on the users first Media
  await page.locator('#verticalGridItem-0-profile-grid-0').click();


  // Reposts the select media

  try {
    await page.getByTestId('retweet').first().click();
    await page.getByText('Repost').click();  
  } catch (error) {
    logMsg(`Failed to Retweet post`);
  }

  logMsg(`Post by ${user} retweeted!`);

  // Halt for 6 seconds
  await page.waitForTimeout(6000);

});