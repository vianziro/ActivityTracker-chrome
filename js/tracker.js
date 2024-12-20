let currentTabId = null;
let startTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (currentTabId !== null) {
    const endTime = new Date();
    const timeSpent = endTime - startTime;
    updateTimeSpent(currentTabId, timeSpent);
  }

  currentTabId = activeInfo.tabId;
  startTime = new Date();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === 'complete') {
    const endTime = new Date();
    const timeSpent = endTime - startTime;
    updateTimeSpent(tabId, timeSpent);
    startTime = new Date();
  }
});

function updateTimeSpent(tabId, timeSpent) {
  chrome.storage.local.get(['siteStats'], (result) => {
    let stats = result.siteStats || {};
    chrome.tabs.get(tabId, (tab) => {
      const url = new URL(tab.url);
      const domain = url.hostname;
      stats[domain] = (stats[domain] || 0) + timeSpent;
      chrome.storage.local.set({ siteStats: stats });
    });
  });
}
