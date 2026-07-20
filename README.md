# Ops Watch

A minimal Chrome extension that monitors your web services and alerts you when they go down.

## Features

- Monitors multiple URLs by polling for HTTP 200
- Badge turns red with a count of failing services
- Shows response time (ms) and HTTP status code per service
- Desktop notification when a service goes down or recovers
- Configurable check interval (1, 5, 15, or 30 minutes)
- "Check now" button for on-demand checks
- Everything in the popup — no separate options page
- No dependencies, no build step

## Screenshot

> Status tab shows each service with a live UP/DOWN indicator.

<img width="117" height="55" alt="image" src="https://github.com/user-attachments/assets/74c52bde-fc87-4888-82da-85af9b45f07b" />

> icon with a number, indicating services down or not

<img width="267" height="187" alt="image" src="https://github.com/user-attachments/assets/2a43d88c-8f17-4255-82b2-5b73dc414dfa" />

> Configure tab lets you add/remove URLs and set the check interval.

<img width="271" height="205" alt="image" src="https://github.com/user-attachments/assets/938e29d3-beaa-4074-83dc-df32546921de" />

## Installation

1. Clone or download this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `extension/` folder

<img width="478" height="186" alt="image" src="https://github.com/user-attachments/assets/b20de1ce-f8b1-461e-99a9-bec187fd134c" />

## Usage

1. Click the Ops Watch icon in your toolbar
2. Go to the **Configure** tab
3. Add your service names and URLs
4. Set your preferred check interval
5. Click **Save**

The extension will start polling immediately and update the badge if any service goes down.

## Requirements

- The monitored URL must return HTTP 200 to be considered healthy
- Minimum check interval is 1 minute (Chrome platform limit)
- URLs must be accessible from your browser (CORS/network restrictions apply)

## Tech

- Manifest V3
- Chrome Alarms API
- Chrome Storage API (local)
- No dependencies, no build step

## License

MIT
