import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

dotenv.config();

const OWM_API_KEY = process.env.OWM_API_KEY;
console.log('Using OWM_API_KEY:', OWM_API_KEY)
const PORT = parseInt(process.env.PORT ?? '3000', 10);

if (!OWM_API_KEY) {
  console.warn('OWM_API_KEY is not set. Weather tool requests will fail until it is provided.');
}

const weatherServer = new McpServer({
  name: 'weather-app-mcp',
  version: '0.1.0',
});

const widgetShellUri = 'weather-widget://shell';

const widgetShellMarkup = `
<div id="weather-root"></div>
<link rel="stylesheet" href="/widget.css" />
<script type="module" src="/widget.js"></script>
`;

weatherServer.registerResource(
  'weather_widget_shell',
  widgetShellUri,
  {
    title: 'Weather widget shell',
    description: 'HTML scaffold that mounts the weather forecast widget.',
    mimeType: 'text/html+skybridge',
  },
  async () => ({
    contents: [
      {
        uri: widgetShellUri,
        mimeType: 'text/html+skybridge',
        text: widgetShellMarkup.trim(),
      },
    ],
  })
);

const WeatherInputShape = {
  lat: z
    .number()
    .min(-90)
    .max(90)
    .describe('Latitude for the weather lookup'),
  lon: z
    .number()
    .min(-180)
    .max(180)
    .describe('Longitude for the weather lookup'),
};

const WeatherOutputShape = {
  location: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  description: z.string(),
  temperatureC: z.number(),
  temperatureF: z.number(),
  humidity: z.number(),
  windKph: z.number(),
  observedAt: z.string(),
  source: z.literal('openweathermap'),
};

const WeatherInputSchema = z.object(WeatherInputShape);
const WeatherOutputSchema = z.object(WeatherOutputShape);

type WeatherResponse = z.infer<typeof WeatherOutputSchema>;

weatherServer.registerTool(
  'get_weather',
  {
    title: 'Current Weather by Coordinates',
    description: 'Fetches current weather conditions using OpenWeatherMap.',
    inputSchema: WeatherInputShape,
    outputSchema: WeatherOutputShape,
    _meta: {
      'openai/outputTemplate': 'ui://widget/weather-forecast',
    },
  },
  async ({ lat, lon }) => {
    if (!OWM_API_KEY) {
      throw new Error('OWM_API_KEY is not configured on the server.');
    }

    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat,
          lon,
          appid: OWM_API_KEY,
          units: 'metric',
        },
      });

      const payload = response.data;
      const description: string =
        payload.weather?.[0]?.description ?? 'Weather description unavailable';
      const temperatureC: number = payload.main?.temp ?? Number.NaN;
      const temperatureF = Number.isFinite(temperatureC)
        ? Number(((temperatureC * 9) / 5 + 32).toFixed(1))
        : Number.NaN;
      const humidity: number = payload.main?.humidity ?? Number.NaN;
      const windKph = payload.wind?.speed
        ? Number((payload.wind.speed * 3.6).toFixed(1))
        : Number.NaN;

      const normalized: WeatherResponse = {
        location: payload.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        coordinates: { lat, lon },
        description,
        temperatureC: Number.isFinite(temperatureC)
          ? Number(temperatureC.toFixed(1))
          : temperatureC,
        temperatureF,
        humidity,
        windKph,
        observedAt: payload.dt ? new Date(payload.dt * 1000).toISOString() : new Date().toISOString(),
        source: 'openweathermap' as const,
      };

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(normalized),
          },
        ],
        structuredContent: normalized,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ??
          error.message ??
          'Failed to reach OpenWeatherMap API.';
        throw new Error(`OpenWeatherMap error (${status ?? 'unknown'}): ${message}`);
      }
      throw error;
    }
  }
);

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    void transport.close();
  });

  try {
    await weatherServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('MCP request failed', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal MCP server error.' });
    }
  }
});

const staticRoot = path.resolve(__dirname, '../public');
app.use(express.static(staticRoot));

app.get('/', (_req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Weather MCP server listening on http://localhost:${PORT}`);
  console.log('POST MCP messages to http://localhost:%d/mcp', PORT);
});
