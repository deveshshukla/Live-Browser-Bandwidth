let totalBytes = 0;
let lastUpdateTime = Date.now();

// 1. Listen to all completed network requests to calculate data size
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const header = details.responseHeaders?.find(h => h.name.toLowerCase() === 'content-length');
    if (header) {
      totalBytes += parseInt(header.value, 10);
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// 2. Format bytes into a readable string (e.g., "1.2", "MB")
function formatSpeed(bytesPerSec) {
  if (bytesPerSec === 0) return { value: '0', unit: 'KB' };
  
  const k = 1024;
  if (bytesPerSec < k * k) {
    return { value: (bytesPerSec / k).toFixed(0), unit: 'KB' };
  } else {
    return { value: (bytesPerSec / (k * k)).toFixed(1), unit: 'MB' };
  }
}

// 3. Draw the speed dynamically on popup-badge
function updateIcon(speedData) {
  let badgeText = '';
  
  if (speedData.value === '0') {
    badgeText = '0KB';
  } else {
    // Round large numbers to save space (e.g., turn "120.5" into "121")
    let val = speedData.value;
    if (val.length > 3) {
      val = Math.round(parseFloat(val)).toString();
    }
    
    // Combine the number with the first letter of the unit (e.g., "12" + "M" = "12M", "800" + "K" = "800K")
    badgeText = val + speedData.unit.charAt(0);
  }

  // Set a single, sleek neutral background color for the badge (Dark Grey)
  // You can change this hex code if you want a different solid color!
  chrome.action.setBadgeBackgroundColor({ color: '#4A4A4A' }); 

  // Set the native badge text
  chrome.action.setBadgeText({ text: badgeText });
}

// 4. Update the speed every 2 seconds
setInterval(() => {
  const now = Date.now();
  const timeDiff = (now - lastUpdateTime) / 1000; // in seconds
  
  const bytesPerSec = totalBytes / timeDiff;
  const speedData = formatSpeed(bytesPerSec);
  
  updateIcon(speedData);

  // Reset for the next interval
  totalBytes = 0;
  lastUpdateTime = now;
}, 2000);