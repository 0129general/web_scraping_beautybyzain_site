// let activeCollections = 0;
// let maxCollections = 4; // Default max collections
// const collectionQueue = [];

// async function performCollection(
//     accountId,
//     accountName,
//     URL,
//     isActive = false
// ) {
//     // Set collection limits based on whether this is an active (foreground) collection
//     maxCollections = isActive ? 1 : 4;

//     console.log(`Attempting collection for ${accountName}:`, {
//         accountId,
//         URL,
//         isActive,
//         currentActive: activeCollections,
//         maxAllowed: maxCollections,
//         queueLength: collectionQueue.length,
//     });

//     // If we're at max collections, add to queue and exit
//     if (activeCollections >= maxCollections) {
//         console.log(
//             `Queue: Adding ${accountName} (active: ${activeCollections}/${maxCollections})`
//         );
//         collectionQueue.push({ accountId, accountName, URL, isActive });
//         return;
//     }

//     // Increment active collections counter
//     activeCollections++;

//     try {
//         // Get authentication method for this account
//         const result = await getStorageData(storageKeys.authMethod(accountId));
//         const authMethod = result[storageKeys.authMethod(accountId)] || "email";

//         // Create new tab
//         chrome.tabs.create({ url: URL, active: isActive }, async (newTab) => {
//             // Wait for tab to be ready
//             setTimeout(async () => {
//                 try {
//                     // Get and validate action sequence
//                     const actionSequence = getActionSequenceForAccount(
//                         accountId,
//                         authMethod
//                     );
//                     if (!actionSequence || actionSequence.length === 0) {
//                         throw new Error(
//                             `No action sequence for ${accountName} (${authMethod})`
//                         );
//                     }

//                     // Execute the sequence
//                     await executeSequence(newTab.id, actionSequence, 0, accountId);

//                     // Clean up
//                     chrome.tabs.remove(newTab.id);
//                     checkAndSetAlarmForAccount(accountId);

//                     console.log(`Successfully completed collection for ${accountName}`);
//                 } catch (error) {
//                     console.error(`Error during collection for ${accountName}:`, error);
//                     chrome.tabs.remove(newTab.id);
//                 } finally {
//                     // Always decrement active collections
//                     activeCollections--;

//                     // Always process queue after completion
//                     processQueue();

//                     console.log(
//                         `Collection finished for ${accountName}. Active: ${activeCollections}, Queue: ${collectionQueue.length}`
//                     );
//                 }
//             }, 2000); // Wait 2s for tab to load
//         });
//     } catch (error) {
//         console.error(`Failed to start collection for ${accountName}:`, error);
//         // Decrement counter and process queue on error
//         activeCollections--;
//         processQueue();
//     }
// }

// // Function to process the next collection in the queue if there's capacity
// function processQueue() {
//     if (activeCollections < maxCollections && collectionQueue.length > 0) {
//         const { accountId, accountName, URL, isActive } = collectionQueue.shift();
//         console.log(
//             `Processing queued collection for account: ${accountName} (${accountId}), Active: ${isActive}`
//         );
//         performCollection(accountId, accountName, URL, isActive);
//     } else if (collectionQueue.length > 0) {
//         console.log(
//             `Queue waiting: ${collectionQueue.length} items, Active collections: ${activeCollections}/${maxCollections}`
//         );
//     }
// }
const {performClick} = require('./click');
const {performFindText} = require('./findText');
const {navigateToURL} = require('./navigate');

async function executeSequence(page, actionSequence, index) {
    await waitForInternetConnection();

    if (index >= actionSequence.length) {
        console.log("Sequence complete.");
        return;
    }

    const action = actionSequence[index];
    const delay = Math.random() * 2 * 1000;
    try {
        // Mimic human-like interaction delay
        await new Promise((resolve) =>
            setTimeout(resolve, action.duration || 1000 + delay)
        );
        const originalTabId = tabId; // Store the original tab ID

        // Map action types to their corresponding functions
        const actionMap = {
            clickButton: async () => {
                console.log("Clicking button...");
                await performClick(page, action);
            },
            findVal: async () => {
                console.log("Finding value...");
                await performFindText(page, action);
            },
            navigate: async () => {
                console.log("Navigating to URL...");
                //console.log("Action URL:", action.URL);
                await navigateToURL(page, action);
            },
            windowClose: async () => {
                console.log("Closing window...");
                //chrome.tabs.remove(tabId);
                return;
            },
            type: async () => {
                console.log("Typing credentials...");
                //console.log("Action:", action);
                await triggerSimulateTyping(tabId, action);
            },
            switchTab: async () => {
                console.log(`Switching to OAuth tab...`);

                try {
                    const newTabId = await switchTab(action, originalTabId);
                    console.log("Switched to tab with ID:", newTabId);

                    // Perform actions on the new tab using newTabId
                    // After the new tab is closed, the tab will automatically switch back to originalTabId
                } catch (error) {
                    console.error("Error switching tabs:", error.message);
                }
            },
        };
        // Execute the action if it exists in the map
        if (actionMap[action.action]) {
            await actionMap[action.action]();
        } else {
            throw new Error(`Unknown action type: ${action.action}`);
        }

        // Proceed to the next action in the sequence
        await executeSequence(tabId, actionSequence, index + 1, accountId);
    } catch (error) {
        console.error(
            `Error executing action: ${action.action} for account: ${accountId} - Error: ${error.message}`
        );
        throw error; // Propagate error to stop the sequence
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "navigate":
            handleNavigate(request, sendResponse);
            break;

        case "simulateTyping":
            handleSimulateTyping(request, sendResponse);
            break;

        case "clickButton":
            //console.log("Received clickButton action with options:", request);
            handleClickButton(request, sendResponse);
            break;

        case "findVal":
            handleFindVal(request, sendResponse);
            break;
    }
    return true;
});

//Helper function check if internet connection is available
const checkInternetConnection = () => {
    return fetch("https://www.google.com", {
        mode: "no-cors",
        cache: "no-store",
    })
        .then(() => true)
        .catch(() => false);
};

// Helper function to wait for internet connection
const waitForInternetConnection = async (maxAttempts = 10, interval = 5000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (await checkInternetConnection()) {
            //console.log("Internet connection established.");
            return;
        }
        console.log(
            `No internet connection. Retrying in ${interval / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(
        "Failed to establish internet connection after multiple attempts."
    );
};

module.exports = {
    executeSequence,
}