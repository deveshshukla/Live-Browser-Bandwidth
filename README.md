# Live Browser Bandwidth

A simple browser extension that displays live download speed on the extension icon.

## Overview

- Name: **Live Browser Bandwidth**
- Version: **1.0**
- Description: Displays live browser download speed on the extension icon.
- Built for Chromium-based browsers using Manifest V3.
- Live on the Microsoft Edge Add-ons store.

## Files

- `manifest.json` — extension metadata and permissions
- `background.js` — service worker logic for tracking network activity
- `icons/` — extension icons for different sizes

## Local Setup

You can load this extension locally in any Chromium-based browser with developer mode enabled.

### Google Chrome / Brave / Opera

1. Open the browser and go to `chrome://extensions` (or the equivalent for your browser).
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the folder eg: `NetSpeedExt`.

## Notes

- The extension uses `webRequest` and `<all_urls>` host permissions to monitor download speed.
- Make sure developer mode is enabled when loading locally.

## Publishing

- This extension is available on the Microsoft Edge Add-ons store.

[Link: ](https://microsoftedge.microsoft.com/addons/detail/live-browser-bandwidth/nkipknchncjoajfcknadbjkokbcbhbfh)

## License

This project is free to use for personal purposes only. Commercial use is not permitted.

You may not claim this project as your own work.