document.addEventListener('DOMContentLoaded', function() {
  initializeChart();
  displayTopSites();
  loadTasks();
  loadBlockedSites();
  analyzeData();

  document.getElementById('addTask').addEventListener('click', addTask);
  document.getElementById('addBlockedSite').addEventListener('click', addBlockedSite);
});

function initializeChart() {
  const ctx = document.getElementById('activityChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00'],
      datasets: [{
        label: 'Produktivitas',
        data: [65, 80, 75, 90, 85],
        borderColor: '#007bff',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function displayTopSites() {
  chrome.storage.local.get(['siteStats'], (result) => {
    const stats = result.siteStats || {};
    const sitesList = document.getElementById('sitesList');
    sitesList.innerHTML = '';

    const sortedSites = Object.entries(stats).sort((a, b) => b[1](citation_1) - a[1](citation_1));

    sortedSites.slice(0, 5).forEach(([site, time]) => {
      const timeSpent = formatTime(time);
      const div = document.createElement('div');
      div.className = 'mb-2';
      div.innerHTML = `<span>${site}</span> - <span>${timeSpent}</span>`;

      if (time > 4 * 60 * 60 * 1000) {
        const warning = document.createElement('span');
        warning.className = 'text-red-500 ml-2';
        warning.textContent = `Warning: More than 4 hours spent on ${site} today!`;
        div.appendChild(warning);
      }

      sitesList.appendChild(div);
    });
  });
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function loadTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    const tasksList = document.getElementById('tasks');
    tasksList.innerHTML = '';

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${task.name} (${task.priority})
        <button class="text-blue-500 ml-2 edit-task" data-index="${index}">Edit</button>
        <button class="text-red-500 ml-2 delete-task" data-index="${index}">Delete</button>
      `;
      tasksList.appendChild(li);
    });

    // Add event listeners for dynamically created buttons
    document.querySelectorAll('.edit-task').forEach(button => {
      button.addEventListener('click', function() {
        editTask(this.dataset.index);
      });
    });

    document.querySelectorAll('.delete-task').forEach(button => {
      button.addEventListener('click', function() {
        deleteTask(this.dataset.index);
      });
    });
  });
}

function addTask() {
  const newTaskInput = document.getElementById('newTask');
  const prioritySelect = document.getElementById('priority');
  const task = newTaskInput.value.trim();
  const priority = prioritySelect.value;

  if (task) {
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks.push({ name: task, priority: priority });
      chrome.storage.local.set({ tasks: tasks }, () => {
        loadTasks();
        newTaskInput.value = '';
      });
    });
  }
}

function editTask(index) {
  const newTask = prompt("Edit task:");
  if (newTask !== null && newTask.trim() !== "") {
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks[index].name = newTask.trim();
      chrome.storage.local.set({ tasks: tasks }, loadTasks);
    });
  }
}

function deleteTask(index) {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    tasks.splice(index, 1);
    chrome.storage.local.set({ tasks: tasks }, loadTasks);
  });
}

function loadBlockedSites() {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    const blockedSitesList = document.getElementById('blockedSitesList');
    blockedSitesList.innerHTML = '';

    blockedSites.forEach((site, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${site}
        <button class="text-red-500 ml-2 delete-blocked-site" data-index="${index}">Delete</button>
      `;
      blockedSitesList.appendChild(li);
    });

    // Add event listeners for dynamically created buttons
    document.querySelectorAll('.delete-blocked-site').forEach(button => {
      button.addEventListener('click', function() {
        deleteBlockedSite(this.dataset.index);
      });
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

function deleteBlockedSite(index) {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    blockedSites.splice(index, 1);
    chrome.storage.sync.set({ blockedSites: blockedSites }, loadBlockedSites);
  });
}
