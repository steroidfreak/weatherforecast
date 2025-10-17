# Weather ChatGPT App

This project hosts a minimal OpenAI Apps experience that exposes a Model Context Protocol (MCP) tool backed by OpenWeatherMap and renders a responsive inline widget that calls the tool on load.

## Prerequisites
- Node.js 18+
- An OpenWeatherMap account with the **Current Weather Data** API enabled (https://home.openweathermap.org/users/sign_up)
- An ngrok account and authtoken (https://dashboard.ngrok.com/get-started/setup)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and add your API key:
   ```bash
   cp .env.example .env
   ```
   Set `OWM_API_KEY` to your OpenWeatherMap key. Optionally change `PORT` (defaults to `3000`).

## Local Development
1. Build the widget bundle (rerun when you make React changes):
   ```bash
   npm run build:widget
   ```
   For live-updating the bundle during development, run `npm run widget:dev` in a separate terminal.
2. Start the MCP/Express server with hot reload:
   ```bash
   npm run dev
   ```
   The server exposes the MCP endpoint at `http://localhost:3000/mcp` and serves the widget at `http://localhost:3000/`.
3. In another terminal, open an HTTPS tunnel:
   ```bash
   npm run tunnel
   ```
   Copy the forwarded URL (e.g., `https://<id>.ngrok.app`) for the OpenAI app configuration.

## OpenAI Apps Integration
1. Follow the Apps SDK guide for custom UX widgets: https://developers.openai.com/apps-sdk/build/custom-ux/
2. Configure your app’s MCP server URL to point to the ngrok endpoint, appending `/mcp`.
3. Set the widget URL in the app to the same ngrok base (without `/mcp`). When the widget loads, it automatically invokes `window.openai.callTool('get_weather', { lat: 37.7749, lon: -122.4194 })` and displays the inline weather card.

## Production Build
1. Compile the TypeScript sources and widget bundle:
   ```bash
   npm run build
   ```
2. Launch the compiled server:
   ```bash
   npm start
   ```

The widget gracefully reports missing SDK integration or API errors directly in the UI to assist with troubleshooting.
