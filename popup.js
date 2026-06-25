document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const pingValue = document.getElementById('pingValue');
  const dlValue = document.getElementById('dlValue');
  const ulValue = document.getElementById('ulValue');
  
  const mainSpeed = document.getElementById('mainSpeed');
  const mainLabel = document.getElementById('mainLabel');
  const mainUnit = document.getElementById('mainUnit');
  const gaugeCircle = document.querySelector('.gauge-circle');

  startBtn.addEventListener('click', runSpeedTest);

  async function runSpeedTest() {
    startBtn.disabled = true;
    startBtn.innerText = 'TESTING...';
    gaugeCircle.classList.add('spinning'); // Start animation
    
    // Reset UI
    pingValue.innerText = '-- ms';
    dlValue.innerText = '-- Mbps';
    ulValue.innerText = '-- Mbps';
    document.getElementById('summary')?.classList.add('hidden'); // Hide summary on new test

    try {
      // --- 1. PING TEST ---
      mainLabel.innerText = 'PING';
      mainLabel.style.color = '#f38ba8'; // Pink
      mainUnit.innerText = 'ms';
      const ping = await measurePing();
      pingValue.innerText = `${Math.round(ping)} ms`;
      mainSpeed.innerText = Math.round(ping);
      
      await sleep(500); // Brief pause for visual transition

      // --- 2. DOWNLOAD TEST (25MB File) ---
      mainLabel.innerText = 'DOWNLOAD';
      mainLabel.style.color = '#89b4fa'; // Blue
      mainUnit.innerText = 'Mbps';
      
      const downloadSpeed = await measureDownload((currentSpeed) => {
        mainSpeed.innerText = currentSpeed.toFixed(1);
        dlValue.innerText = `${currentSpeed.toFixed(1)} Mbps`;
      });
      
      dlValue.innerText = `${downloadSpeed.toFixed(1)} Mbps`;
      mainSpeed.innerText = downloadSpeed.toFixed(1);

      await sleep(500);

      // --- 3. UPLOAD TEST (10MB Payload) ---
      mainLabel.innerText = 'UPLOAD';
      mainLabel.style.color = '#a6e3a1'; // Green
      
      const uploadSpeed = await measureUpload((currentSpeed) => {
        mainSpeed.innerText = currentSpeed.toFixed(1);
        ulValue.innerText = `${currentSpeed.toFixed(1)} Mbps`;
      });
      
      ulValue.innerText = `${uploadSpeed.toFixed(1)} Mbps`;
      mainSpeed.innerText = uploadSpeed.toFixed(1);

      // --- FINISHED ---
      mainLabel.innerText = 'DOWNLOAD SPEED';
      mainLabel.style.color = '#89b4fa'; // Change back to the blue download color
      mainSpeed.innerText = downloadSpeed.toFixed(1); // Set the big number back to the Download Speed

      // Show real-world usage summary
      const summary = document.getElementById('summary');
      const summaryTitle = document.getElementById('summaryTitle');
      const summaryDesc = document.getElementById('summaryDesc');

      if (downloadSpeed < 3) {
        summaryTitle.innerText = "Your internet connection is slow.";
        summaryDesc.innerText = "Your network can handle basic web browsing and emails, but video streaming and calls will likely buffer or lag.";
      } else if (downloadSpeed < 25) {
        summaryTitle.innerText = "Your internet connection is okay.";
        summaryDesc.innerText = "Your network can handle streaming HD video on a single device, but adding multiple devices might cause slowdowns.";
      } else if (downloadSpeed < 100) {
        summaryTitle.innerText = "Your internet connection is fast.";
        summaryDesc.innerText = "Your network can easily handle multiple devices streaming HD video, video conferencing, and online gaming at the same time.";
      } else {
        summaryTitle.innerText = "Your internet connection is very fast.";
        summaryDesc.innerText = "Your network can handle multiple devices streaming 4K video, downloading large files, and competitive gaming simultaneously without any issues.";
      }

      summary.classList.remove('hidden');

    } catch (error) {
      mainLabel.innerText = 'ERROR';
      console.error("Speed Test Error:", error);
    } finally {
      gaugeCircle.classList.remove('spinning'); // Stop animation
      startBtn.disabled = false;
      startBtn.innerText = 'TEST AGAIN';
    }
  }

  // --- Utility Functions ---

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function measurePing() {
    const start = performance.now();
    // Fetch a tiny 0-byte file from Cloudflare to measure latency
    await fetch('https://speed.cloudflare.com/__down?bytes=0', { cache: 'no-store' });
    return performance.now() - start;
  }

  async function measureDownload(onProgress) {
    const start = performance.now();
    // Fetch a 25MB test file
    const response = await fetch('https://speed.cloudflare.com/__down?bytes=25000000', { cache: 'no-store' }); 
    const reader = response.body.getReader();
    let receivedBytes = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.length;
      
      const durationSec = (performance.now() - start) / 1000;
      if (durationSec > 0.1) { // Only update UI after a fraction of a second to prevent jitter
         const speedMbps = (receivedBytes * 8 / 1000000) / durationSec;
         onProgress(speedMbps);
      }
    }
    const finalDuration = (performance.now() - start) / 1000;
    return (receivedBytes * 8 / 1000000) / finalDuration; // Return final Megabits per second
  }

  async function measureUpload(onProgress) {
    // Generate 10MB of random dummy data to upload
    const payloadSize = 10 * 1024 * 1024; 
    const payload = new Uint8Array(payloadSize);
    for (let i = 0; i < payloadSize; i++) payload[i] = Math.floor(Math.random() * 256);

    const start = performance.now();
    
    // Using XMLHttpRequest instead of Fetch here because XHR natively supports upload progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://speed.cloudflare.com/__up', true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const durationSec = (performance.now() - start) / 1000;
          if (durationSec > 0.1) {
            const speedMbps = (event.loaded * 8 / 1000000) / durationSec;
            onProgress(speedMbps);
          }
        }
      };
      
      xhr.onload = () => {
        const finalDuration = (performance.now() - start) / 1000;
        const finalSpeed = (payloadSize * 8 / 1000000) / finalDuration;
        resolve(finalSpeed);
      };
      
      xhr.onerror = () => reject('Upload failed');
      
      xhr.send(payload);
    });
  }
});