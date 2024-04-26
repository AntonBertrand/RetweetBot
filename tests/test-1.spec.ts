import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

const twitterGroupURL = 'https://twitter.com/messages/1778153056699404702';
const twitterGroupId = twitterGroupURL.substring(29);
const retweetCount = 1;


function logMsg(message: string) {
    const time = new Date().toLocaleString();
    console.log(`${time}: ${message}`);
}

async function cookieDisclaimercheck() {

    const cookieDisclaimer = await page.getByRole('button', { name: 'Refuse non-essential cookies' }).isVisible();
    if (cookieDisclaimer) {
      logMsg("Cookie Disclaimer Found");
      await page.getByRole('button', { name: 'Refuse non-essential cookies' }).click();
    } else {
        logMsg("Cookie Disclaimer NOT Found");
    }

}

// Logins to Twitter
/* await page.goto('https://twitter.com/i/flow/login');
await page.locator('label div').nth(3).fill('AlessaRubii');
await page.getByRole('button', { name: 'Next' }).click();
await page.getByLabel('Password', { exact: true }).click();
await page.getByLabel('Password', { exact: true }).fill('BabyPoo123!');
await page.getByTestId('LoginForm_Login_Button').click();
await expect(page.getByTestId('AppTabBar_Home_Link')).toBeVisible(); */





//--------------------------------START OF THE SCRIPT-----------------------------//


logMsg(`Navigating to Twitter Group: ${twitterGroupId}`)

// Navigates to the Twitter Group
await page.goto(twitterGroupURL);


// Getting last 3 comments
/* await page.getByTestId('DmScrollerContainer').click();
console.log(await page.textContent("*")); */

// Print  links in group
/* 
const links = await page.$$('a');

for (const link of links) {
    const linktext = await link.textContent();
    console.log(linktext);
} */

// Waiting for group chat to load
logMsg("Waiting for group chat to load")
await page.waitForSelector('[data-testid="dmComposerTextInput"]');

cookieDisclaimercheck();


// Create an array of the latest posters in the groupchat
const elements = await page.$$('a.css-175oi2r.r-1pi2tsx.r-13qz1uu.r-o7ynqc.r-6416eg.r-1ny4l3l.r-1loqt21');
const twitterUsers: any = [];

for (const element of elements) {
    const href = await element.getAttribute('href');
    logMsg(`Found user: ${href}`);
    twitterUsers.push(href);
}

// Retrieves only the number of required users
const lastThree = twitterUsers.slice(-retweetCount);
console.log(lastThree);

// Add Gif to message
try {
    logMsg(`Attempting to add GIF to group: ${twitterGroupId}`)
    await page.getByLabel('Add a GIF').click();
    await page.getByTestId('gifSearchSearchInput').fill('thank you');
    await page.getByRole('button', { name: 'Love Hearts GIF' }).click();
    logMsg(`Sucessfully added GIF to group: ${twitterGroupId}`)
} catch (error) {
    logMsg(`FAILED to add GIF to group: ${twitterGroupId}`)
}


// Post message in groupchat with custom message
try {
    logMsg(`Attempting to post message in group: ${twitterGroupId}`)
    await page.getByTestId('dmComposerTextInput').click();
    await page.getByTestId('dmComposerTextInput').fill('Testing\nGifs');
    await page.getByTestId('dmComposerSendButton').click();
    logMsg(`Message succesfully posted in group: ${twitterGroupId}`)
} catch (error) {
    logMsg(`Message FAILED to posted in group: ${twitterGroupId}`)
}

}); 
