function analyzeData() {
  chrome.storage.local.get(['siteStats'], (result) => {
    const stats = result.siteStats || {};
    const recommendations = generateRecommendations(stats);
    displayRecommendations(recommendations);
  });
}

function generateRecommendations(stats) {
  let totalTime = 0;
  const recommendations = [];

  for (const site in stats) {
    totalTime += stats[site];
  }

  for (const site in stats) {
    const percentage = (stats[site] / totalTime) * 100;
    if (percentage > 20) {
      recommendations.push(`Consider reducing time on ${site} (currently ${percentage.toFixed(1)}% of your time).`);
    }
  }

  if (totalTime > 8 * 60 * 60 * 1000) {
    recommendations.push("You've spent more than 8 hours online today. Consider taking a break.");
  }

  return recommendations;
}

function displayRecommendations(recommendations) {
  const recommendationsDiv = document.getElementById('recommendations');
  recommendationsDiv.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
}
