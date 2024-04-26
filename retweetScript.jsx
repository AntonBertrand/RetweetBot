const { log } = require('console');
const { chromium } = require('playwright');


async function retweetPost(user, page, browser, context, broadcast) {

  function logMsg(message, broadcast) {
    const time = new Date().toLocaleString();
    console.log(`${time}: ${message}`);
    broadcast(`${time}: ${message}`);
  }

  async function randomHalt(min, max, broadcast) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    logMsg(`Waiting for ${randomNum} seconds`, broadcast);
    await page.waitForTimeout(randomNum * 1000);
  }
  
  async function sensitiveContentWarningCheck() {
    const warnings = page.locator('text=Caution: This profile may');
    const count = await warnings.count();

    if (count > 0) {
        logMsg(`${count} Sensitive Content Warning(s) Found`, broadcast);

        for (let i = 0; i < count; i++) {
            const isVisible = await warnings.nth(i).isVisible();
            if (isVisible) {
                logMsg(`Sensitive Content Warning ${i + 1} is visible`, broadcast);
                const button = await page.getByTestId('empty_state_button_text');
                await button.click();
                await page.waitForTimeout(6000); // Waits for page to load, consider reworking

                // Check if a double click is needed.
                const isVisibleAgain = await warnings.nth(i).isVisible();
                if (isVisibleAgain) {
                    logMsg(`Double-clicking for Warning ${i + 1}`, broadcast);
                    if (await button.isVisible()) {
                        await button.click();
                    }
                }
            }
        }
    } else {
        logMsg("No Sensitive Content Warnings Found", broadcast);
    }
}


async function connectionErrorCheck(page, broadcast) {
  let errorCount = 0;
  let error = false;

  const connectionError = await page.getByText('Looks like you lost your').isVisible();
  const connectionErrorBtn = await page.getByRole('button', { name: 'Retry' }).isVisible();

  logMsg(`Checking for connection error...`, broadcast)

  if (connectionError && connectionErrorBtn) {
      logMsg("Connection Error Found!", broadcast);
      error = true;
  } else {
    logMsg(`No connection error found!`, broadcast);
    return true;
  }

  while (error) {
      const connectionError = await page.getByText('Looks like you lost your').isVisible();
      const connectionErrorBtn = await page.getByRole('button', { name: 'Retry' }).isVisible();

      if (!connectionError || !connectionErrorBtn) {
          logMsg("Connection Error Resolved!", broadcast);
          return false; // Error resolved
      }

      if (errorCount >= 5) {
          logMsg(`Connection Error: Retry limit exceeded!`, broadcast);
          return true; // Retry limit exceeded
      }

      logMsg(`Connection Error: Retrying for the ${errorCount + 1} time`, broadcast);
      await page.getByRole('button', { name: 'Retry' }).click();
      errorCount++;
      await page.waitForTimeout(15000); // Wait after clicking retry
  }

  return false;
}

  // Retry Navigation Function
  async function retryNavigation(url, page, broadcast, attemptCount = 0) {
    logMsg(`Attempting navigation to: ${url} (${attemptCount + 1})`, broadcast);
    try {
      await page.goto(url);
      await page.waitForSelector('[data-testid="userActions"]');
    } catch (error) {
      if (attemptCount >= 2) {
        logMsg("Navigation failed on all attempts.", broadcast);
        if ( await connectionErrorCheck(page, broadcast)) {
          throw new Error('Retries failed and no connection error found');
        }
      } else {
        logMsg(`Navigation failed, retrying... `, broadcast);
        await page.waitForTimeout(10000); // 10 seconds wait
        await retryNavigation(url, page, broadcast, attemptCount + 1);
      }
    }
  }




  
  //--------------------------------START OF THE SCRIPT-----------------------------//

  try {
    logMsg(`Starting Retweet Task (${user})`, broadcast);


    try {
      await retryNavigation(`https://twitter.com${user}`, page, broadcast);
    } catch (error) {
        logMsg(`Retweet Bot Failed, Error: ${error}`, broadcast)
        return;
    }
  
    await randomHalt(3, 7, broadcast);
  
    await sensitiveContentWarningCheck()
  
    await randomHalt(3, 7, broadcast);
  
  
    // Navigates to the users Media
    await page.getByRole('tab', { name: 'Media' }).click();
  
    // Might need sensitiveContentWarningcheck here
    await sensitiveContentWarningCheck()
  
    try {
      // Waits for Media grid to load
      await page.waitForSelector('#verticalGridItem-0-profile-grid-0');
    } catch (error) {
      // Likely failed because user has no media
      logMsg(`No Media found - Skipping user (${user})`, broadcast)
      return;
    }
  
  
    await randomHalt(3, 7, broadcast);
  
  
    // Checks if media has a NSFW spoiler
    const mediaSpoiler = await page.locator('#verticalGridItem-0-profile-grid-0').getByRole('button', { name: 'Show' }).isVisible()
    if (mediaSpoiler) {
      logMsg("Media NSFW Spoiler found", broadcast);
      await page.locator('#verticalGridItem-0-profile-grid-0').getByRole('button', { name: 'Show' }).click();
    } else {
      logMsg("Media NSFW Spoiler NOT found", broadcast);
    }
  
    // Clicks on the users first Media
    await page.locator('#verticalGridItem-0-profile-grid-0').click();
  
    await randomHalt(3, 7, broadcast);
  
  
    // Reposts the select media
  
    try {
      await page.getByTestId('retweet').first().click();
      // await page.getByText('Repost').click();  
    } catch (error) {
      logMsg(`Failed to Retweet post`, broadcast);
    }
  
    logMsg(`Post by ${user} retweeted!`, broadcast);
    return true;
  
  } catch (error) {
    logMsg(`Retweet Bot Failed, Error: ${error}`, broadcast)
    await context.close();
    await browser.close();
    return false;
  }




}

module.exports = { retweetPost };
