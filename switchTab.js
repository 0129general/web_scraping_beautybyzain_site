async function switchTab(action, originalTabId) {
    const authMethod = action.authMethod;
    console.log(`Switching to ${authMethod} OAuth tab...`);
  
    let oauthUrlPattern = "";
  
    if (authMethod === "google") {
      oauthUrlPattern = "https://accounts.google.com/o/oauth2/v2/*";
    } else if (authMethod === "facebook") {
      oauthUrlPattern = "https://www.facebook.com/dialog/oauth*";
    }
  
    // Locate the OAuth tab
    const [oauthTab] = await new Promise((resolve) =>
      chrome.tabs.query({ url: oauthUrlPattern }, resolve)
    );
  
    if (oauthTab) {
      console.log(`Found ${authMethod} OAuth tab with ID:`, oauthTab.id);
  
      // Add a listener to detect when the OAuth tab is closed
      chrome.tabs.onRemoved.addListener(function closedTabListener(tabId) {
        if (tabId === oauthTab.id) {
          console.log(
            `OAuth tab with ID ${tabId} closed. Switching back to original tab.`
          );
  
          // Switch back to the original tab
          chrome.tabs.update(originalTabId, { active: true });
  
          // Remove this listener to avoid memory leaks
          chrome.tabs.onRemoved.removeListener(closedTabListener);
        }
      });
  
      return oauthTab.id; // Return the new tabId for subsequent actions
    } else {
      throw new Error(`Failed to find ${authMethod} OAuth tab.`);
    }
  }