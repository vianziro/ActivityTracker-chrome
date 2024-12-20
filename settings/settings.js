document.addEventListener('DOMContentLoaded', function() {
  loadBlockedSites();

  document.getElementById('addBlockedSite').addEventListener('click', addBlockedSite);
});

function loadBlockedSites() {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    const blockedSitesList = document.getElementById('blockedSitesList');
    blockedSitesList.innerHTML = '';

    blockedSites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      blockedSitesList.appendChild(li);
    });
  });
}

function addBlockedSite() {
  const newBlockedSiteInput = document.getElementById('newBlockedSite');
  const site = newBlockedSiteInput.value.trim();
  if (site) {
    chrome.storage.sync.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      if (!blockedSites.includes(site)) {
        blockedSites.push(site);
        chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
          loadBlockedSites();
          newBlockedSiteInput.value = '';
        });
      }
    });
  }
}
