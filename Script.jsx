const { chromium } = require('playwright');
const { retweetPost } = require('./retweetScript.jsx');

const userAgentStrings = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
];

let continueRunning = false;
let retweetCount = 0;
let retweetFailCount = 0;
let dropCount = 0;
let isRunning = false;

function logMsg(message, broadcast) {
    const time = new Date().toLocaleString();
    console.log(`${time}: ${message}`);
    broadcast(`${time}: ${message}`);
}

async function sleep(ms) {
    logMsg(`Waiting ${ms/1000} between groups`)
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
}    

/* const twitterGroupList = [
    { url: 'https://twitter.com/messages/1778153056699404702', count: 1 },
    { url: 'https://twitter.com/messages/1721214576056766674', count: 1 }
]; */

/* const secondsBetweenGroups = 30;
const secondsBetweenGroupLists = 7200; */

const retweetBot = async (twitterGroup, clientName, proxyAddress, proxyUsername, proxyPassword, broadcast) => {

    let noUsersFoundCount = 0;
    let skipGroup = false;

    console.log(`Proxy Address: ${proxyAddress} Proxy Username: ${proxyUsername}  Proxy Password: ${proxyPassword}  Client Name: ${clientName}`);
    const browser = await chromium.launch({ 
        headless: false,
        proxy: {
            server: proxyAddress,
            username: proxyUsername,
            password: proxyPassword
          }, 
        });
    const context = await browser.newContext({
        storageState: 'LoginAuth.json',
        userAgent: userAgentStrings[Math.floor(Math.random() * userAgentStrings.length)],
    });
    const page = await context.newPage();
    const twitterGroupId = twitterGroup.url.substring(29);


    async function randomHalt(min, max, broadcast) {
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        logMsg(`Waiting for ${randomNum} seconds`, broadcast);
        await page.waitForTimeout(randomNum * 1000);
    }

    async function cookieDisclaimercheck(broadcast) {
        const cookieDisclaimer = await page.getByRole('button', { name: 'Refuse non-essential cookies' }).isVisible();
        if (cookieDisclaimer) {
            logMsg("Cookie Disclaimer Found", broadcast);
            await page.getByRole('button', { name: 'Refuse non-essential cookies' }).click();
        } else {
            logMsg("Cookie Disclaimer NOT Found", broadcast);
        }
    }

    async function connectionErrorCheck(broadcast) {
        let errorCount = 0;
        let error = false;

        const connectionError = await page.getByText('Looks like you lost your').isVisible();
        const connectionErrorBtn = await page.getByRole('button', { name: 'Retry' }).isVisible();

        if (connectionError && connectionErrorBtn) {
            logMsg("Connection Error Found!", broadcast);
            error = true;
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

    async function groupInvalid(broadcast) {
        logMsg(`Checking if group URL is valid`, broadcast);
        const selectMessage = await page.getByText('Select a message').isVisible();

        if (selectMessage){
            logMsg(`Group URL is not valid`, broadcast);
            return true;
        }

        logMsg(`Group URL possibly valid`, broadcast);
        return false;
    }
    


    if (!continueRunning) {
        await context.close();
        await browser.close();
        return;
    }

    let scrapedTwitterUsers = []; 

    try {
        while (true) {

            logMsg(`Navigating to Twitter Group: ${twitterGroupId}`, broadcast);
            await page.goto(twitterGroup.url);

            await randomHalt(8, 30, broadcast);
    
            try {
                logMsg("Waiting for group chat to load", broadcast);
                await page.waitForSelector('[data-testid="dmComposerTextInput"]');        
            } catch (error) {

                if (await groupInvalid(broadcast)) {
                    retweetFailCount++;
                    await context.close();
                    await browser.close();
                    return;
                }

                if (await connectionErrorCheck(broadcast)) {
                    retweetFailCount++;
                    await context.close();
                    await browser.close();
                    return;
                } else {
                    await page.waitForSelector('[data-testid="dmComposerTextInput"]');        
                }
            }
    
            await randomHalt(4, 11, broadcast);
            await cookieDisclaimercheck(broadcast);
            await randomHalt(3, 7, broadcast);
    
            const elements = await page.$$('a.css-175oi2r.r-1pi2tsx.r-13qz1uu.r-o7ynqc.r-6416eg.r-1ny4l3l.r-1loqt21');
            scrapedTwitterUsers = []; // Clear the array at the start of each iteration
    
            for (const element of elements) {
                const href = await element.getAttribute('href');
                //logMsg(`Found user: ${href}`, broadcast);
                scrapedTwitterUsers.push(href);
            }
    
            if (scrapedTwitterUsers.length < 1) {
                noUsersFoundCount++;
                logMsg(`No users found, restarting...${noUsersFoundCount}`, broadcast);

                if (noUsersFoundCount > 3) {
                    logMsg("Restart limit reached!", broadcast);
                    skipGroup = true;
                    break;
                }

                continue; // Skip to the next iteration of the while loop

            }
            break; // Exit the loop if users are found
        }

        if (skipGroup) {
            logMsg("Skipping to the next group", broadcast);
            await context.close();
            await browser.close();
            return;
        }
    
        if (!continueRunning) {
            await context.close();
            await browser.close();
            return;
        }
        const twitterUsers = scrapedTwitterUsers.slice(-twitterGroup.count);
        logMsg(`Retweeting for users: ${twitterUsers.join(", ")}`, broadcast);
    
        
             // Add Gif to message
             
        try {
            logMsg(`Attempting to add GIF to group: ${twitterGroupId}`, broadcast)
            await page.getByLabel('Add a GIF').click();
            await page.getByTestId('gifSearchSearchInput').fill('thank you');
            await page.getByRole('button', { name: 'Love Hearts GIF' }).click();
            logMsg(`Sucessfully added GIF to group: ${twitterGroupId}`, broadcast)
        } catch (error) {
            logMsg(`FAILED to add GIF to group: ${twitterGroupId}`, broadcast)
        } 
    
        
        await randomHalt(2, 5, broadcast);
    
    
        // Post message in groupchat with custom message
        try {
            logMsg(`Attempting to post message in group: ${twitterGroupId}`, broadcast)
            await page.getByTestId('dmComposerTextInput').click();
            await page.getByTestId('dmComposerTextInput').fill(`❤️❤️ Hit my clients pinned ❤️❤️ \n@${clientName}\n@${clientName}\n@${clientName}\n@${clientName}\n❤️❤️ HIT MY CLIENT ❤️❤️`);
            await page.getByTestId('dmComposerSendButton').click();
            logMsg(`Message succesfully posted in group: ${twitterGroupId}`, broadcast)
        } catch (error) {
            logMsg(`Message FAILED to posted in group: ${twitterGroupId}`, broadcast)
        } 

        dropCount++;
        logMsg(`=========================================`, broadcast);
        logMsg(`Drop Count: ${dropCount}`, broadcast);
        logMsg(`=========================================`, broadcast);
    
        if (!continueRunning) {
            await context.close();
            await browser.close();
            return;
        }
     
        // Waiting for message to be sent
        await page.waitForTimeout(6000);
    
        for (let i = 0; i < twitterGroup.count; i++) {

            if (!await retweetPost(twitterUsers[i], page, browser, context, broadcast)) {
                retweetFailCount++;
            } else {
                retweetCount++;
                logMsg(`=========================================`, broadcast);
                logMsg(`Retweet Count: ${retweetCount}`, broadcast);
                logMsg(`=========================================`, broadcast);
            }
        }
    
        await randomHalt(3, 7, broadcast);
        await context.close();
        await browser.close();
    } catch (error) {
        logMsg(`Retweet Bot Failed, Error: ${error}`, broadcast)
        continueRunning = false;
        await context.close();
        await browser.close();
    }

    
} 

async function script(twitterGroupList, secondsBetweenGroups, secondsBetweenGroupLists, clientName, proxyAddress, proxyUsername, proxyPassword, broadcast) {

    if (isRunning) {
        logMsg("Script is already running. Concurrent execution attempt blocked.", broadcast);
        return; // Early return if the script is already running
    }

    isRunning = true; // Set the lock

    try {
        shuffleArray(twitterGroupList);
        continueRunning = true;
        while (continueRunning) {
            for (let twitterGroup of twitterGroupList) {
                if (!continueRunning) break; // Exit loop if the flag changes
                await retweetBot(twitterGroup, clientName, proxyAddress, proxyUsername, proxyPassword, broadcast);
                if (!continueRunning) break;
                logMsg(`Waiting ${secondsBetweenGroups} seconds between groups`, broadcast);
                logMsg(`Drop Count: ${dropCount}`, broadcast);
                await new Promise(resolve => setTimeout(resolve, secondsBetweenGroups * 1000));
            }
            if (!continueRunning) break;
            logMsg(`=========================================`, broadcast);
            logMsg(`Dropped in all groups, looping again in ${secondsBetweenGroupLists} seconds.`, broadcast);
            logMsg(`Drop Count: ${dropCount}`, broadcast);
            logMsg(`=========================================`, broadcast);
            await new Promise(resolve => setTimeout(resolve, secondsBetweenGroupLists * 1000)); // wait between cycles
        }
    } catch (error) {
        logMsg(`Error occurred in script: ${error.message}`, broadcast);
    } finally {
        isRunning = false; // Reset the lock regardless of how the try block exits
        logMsg(`Script execution complete. Lock reset.`, broadcast);
    }
}



function stopScript(broadcast) {
    logMsg(`Received request to stop Retweet Bot!`, broadcast);
    continueRunning = false;
}


module.exports = { script, stopScript };
