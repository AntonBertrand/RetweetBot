const { log } = require('console');
const { chromium } = require('playwright');
const fs = require('fs');

const setLoginAuth = async () => {

  try {
      fs.unlinkSync('./LoginAuth.json');
      logMsg('LoginAuth JSON deleted successfully');
    } catch (err) {
      logMsg(`Error deleting file: ${err.message}`);
    }

  const browser = await chromium.launch({ 
      headless: false,
      proxy: {
          server: proxyAddress,
          username: proxyUsername,
          password: proxyPassword
        }, 
  });

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

  await page.waitForTimeout(10 * 1000);
      
  const welcomeMsg = await page.getByText('Welcome to x.com!').isVisible();

  if (welcomeMsg) {
          await page.getByTestId('xMigrationBottomBar').click();
          await logMsg('Succesfully closed welcome message!');
  }

  await page.waitForTimeout(5 * 1000);

  // Save the state to the webpage
  await page.context().storageState({path: "./LoginAuth.json" });

  await browser.close();

}



async function retweetPost(user, page, browser, context) {

  function logMsg(message) {
    const time = new Date().toLocaleString();
    console.log(`${time}: ${message}`);
  }

  async function randomHalt(min, max) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    logMsg(`Waiting for ${randomNum} seconds`);
    await page.waitForTimeout(randomNum * 1000);
  }
  
  async function sensitiveContentWarningCheck() {
    const warnings = page.locator('text=Caution: This profile may');
    const count = await warnings.count();

    if (count > 0) {
        logMsg(`${count} Sensitive Content Warning(s) Found`);

        for (let i = 0; i < count; i++) {
            const isVisible = await warnings.nth(i).isVisible();
            if (isVisible) {
                logMsg(`Sensitive Content Warning ${i + 1} is visible`);
                const button = await page.getByTestId('empty_state_button_text');
                await button.click();
                await page.waitForTimeout(6000); // Waits for page to load, consider reworking

                // Check if a double click is needed.
                const isVisibleAgain = await warnings.nth(i).isVisible();
                if (isVisibleAgain) {
                    logMsg(`Double-clicking for Warning ${i + 1}`);
                    if (await button.isVisible()) {
                        await button.click();
                    }
                }
            }
        }
    } else {
        logMsg("No Sensitive Content Warnings Found");
    }
}


async function connectionErrorCheck(page) {
  let errorCount = 0;
  let error = false;

  const connectionError = await page.getByText('Looks like you lost your').isVisible();
  const connectionErrorBtn = await page.getByRole('button', { name: 'Retry' }).isVisible();

  logMsg(`Checking for connection error...`)

  if (connectionError && connectionErrorBtn) {
      logMsg("Connection Error Found!");
      error = true;
  } else {
    logMsg(`No connection error found!`);
    return true;
  }

  while (error) {
      const connectionError = await page.getByText('Looks like you lost your').isVisible();
      const connectionErrorBtn = await page.getByRole('button', { name: 'Retry' }).isVisible();

      if (!connectionError || !connectionErrorBtn) {
          logMsg("Connection Error Resolved!");
          return false; // Error resolved
      }

      if (errorCount >= 5) {
          logMsg(`Connection Error: Retry limit exceeded!`);
          return true; // Retry limit exceeded
      }

      logMsg(`Connection Error: Retrying for the ${errorCount + 1} time`);
      await page.getByRole('button', { name: 'Retry' }).click();
      errorCount++;
      await page.waitForTimeout(15000); // Wait after clicking retry
  }

  return false;
}

  // Retry Navigation Function
  async function retryNavigation(url, page, attemptCount = 0) {
    logMsg(`Attempting navigation to: ${url} (${attemptCount + 1})`);
    try {
      await page.goto(url);
      await page.waitForTimeout(10000); // 10 seconds wait
      await page.waitForSelector('[data-testid="userActions"]');
    } catch (error) {
      if (attemptCount >= 2) {
        logMsg("Navigation failed on all attempts.");
        if ( await connectionErrorCheck(page)) {
          throw new Error('Retries failed and no connection error found');
        }
      } else {
        logMsg(`Navigation failed, retrying... `);
        await page.waitForTimeout(20000); // 30 seconds wait
        await retryNavigation(url, page, attemptCount + 1);
      }
    }
  }


  // Auth Check Function

  const checkForLoginScreen = async () => {
    await logMsg("Checking for login screen");

    const signInText = await page.getByText('Sign in to X').isVisible();
    const signInText2 = await page.getByLabel('Phone, email address, or').isVisible();

    if (signInText || signInText2) {
        await logMsg("Sign In text found - running login script");
        await setLoginAuth();
        return true;

    } else {
        await logMsg("No login screen found");
        return false;
    }

}



  
  //--------------------------------START OF THE SCRIPT-----------------------------//

  try {
    logMsg(`Starting Retweet Task (${user})`);


    try {
      await retryNavigation(`https://twitter.com${user}`, page);
    } catch (error) {
        logMsg(`Retweet Bot Failed, Error: ${error}`)
        return;
    }

    if (await checkForLoginScreen()) {
      logMsg("Login issue was found and auth succesfully re-issued!");
      await context.close();
      await browser.close();
      return;
    }
  
    await randomHalt(6, 11);
  
    await sensitiveContentWarningCheck()
  
    await randomHalt(4, 11);
  
  
    // Navigates to the users Media
    try {
      await page.getByRole('tab', { name: 'Media' }).click();
    } catch (error) {
            // Likely failed because user has no media
            logMsg(`Couldn't find the Media tab - Skipping user (${user})`)
            return;
    }
  
    // Might need sensitiveContentWarningcheck here
    await sensitiveContentWarningCheck()
  
    try {
      // Waits for Media grid to load
      await page.waitForSelector('#verticalGridItem-0-profile-grid-0');
    } catch (error) {
      // Likely failed because user has no media
      logMsg(`No Media found - Skipping user (${user})`)
      return;
    }
  
  
    await randomHalt(6, 20);
  
  
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
  
    await randomHalt(6, 21);
  
  
    // Reposts the select media
  
    try {
      await page.getByTestId('retweet').first().click();
      await randomHalt(1, 5);
      await page.getByText('Repost').click();  
    } catch (error) {
      logMsg(`Failed to Retweet post`);
    }
  
    await randomHalt(3, 7);
    logMsg(`Post by ${user} retweeted!`);
    return true;
  
  } catch (error) {
    logMsg(`Retweet Bot Failed, Error: ${error}`)
    await context.close();
    await browser.close();
    return false;
  }




}

module.exports = { retweetPost };
