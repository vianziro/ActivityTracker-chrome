chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    updateBlockedSites(blockedSites);
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedSites) {
    const blockedSites = changes.blockedSites.newValue || [];
    updateBlockedSites(blockedSites);
  }
});

function updateBlockedSites(sites) {
  const rules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `*://${site}/*`,
      resourceTypes: ["main_frame"]
    }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({ length: sites.length }, (_, i) => i + 1),
    addRules: rules
  });
}
