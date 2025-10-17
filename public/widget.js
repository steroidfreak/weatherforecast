(() => {
  const root = document.getElementById('weather-root');
  if (!root) {
    return;
  }

  const frame = document.createElement('main');
  frame.className = 'widget-frame';

  const card = document.createElement('article');
  card.className = 'card';
  card.id = 'weather-card';
  frame.appendChild(card);
  root.appendChild(frame);

  const applyPreferredTheme = () => {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      card.classList.add('dark');
    } else {
      card.classList.remove('dark');
    }
  };

  applyPreferredTheme();
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', applyPreferredTheme);

  const renderPlaceholder = (message, isError = false) => {
    card.innerHTML = '';
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    paragraph.className = isError ? 'error' : 'loading';
    card.appendChild(paragraph);
  };

  const formatTemperature = (value, suffix) => {
    if (Number.isFinite(value)) {
      return `${value.toFixed(1)}°${suffix}`;
    }
    return '–';
  };

  const renderWeather = (data) => {
    const observed = data.observedAt ? new Date(data.observedAt) : new Date();
    const formattedTime = observed.toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    card.innerHTML = `
      <h1>
        <span>${data.location}</span>
        <span class="temp">${formatTemperature(data.temperatureC, 'C')}</span>
      </h1>
      <p class="description">${data.description}</p>
      <div class="meta">
        <div class="meta-item">
          <span class="label">Feels Like</span>
          <strong>${formatTemperature(data.temperatureF, 'F')}</strong>
        </div>
        <div class="meta-item">
          <span class="label">Humidity</span>
          <strong>${Number.isFinite(data.humidity) ? data.humidity + '%' : '–'}</strong>
        </div>
        <div class="meta-item">
          <span class="label">Wind</span>
          <strong>${Number.isFinite(data.windKph) ? data.windKph + ' km/h' : '–'}</strong>
        </div>
        <div class="meta-item">
          <span class="label">Updated</span>
          <strong>${formattedTime}</strong>
        </div>
      </div>
      <small class="label">Source: ${data.source}</small>
    `;
  };

  const extractPayload = (toolResult) => {
    if (!toolResult) {
      return null;
    }

    if (toolResult.structuredContent) {
      return toolResult.structuredContent;
    }

    const jsonItem = toolResult.content?.find((item) => item.type === 'json');
    if (jsonItem?.json) {
      return jsonItem.json;
    }

    const textItem = toolResult.content?.find((item) => item.type === 'text');
    if (textItem?.text) {
      try {
        return JSON.parse(textItem.text);
      } catch {
        return null;
      }
    }

    return null;
  };

  const callWeatherTool = async () => {
    if (!window.openai?.callTool) {
      renderPlaceholder('OpenAI Apps SDK not detected. Load this widget within an OpenAI app session.', true);
      return;
    }

    try {
      renderPlaceholder('Fetching San Francisco weather…');

      const result = await window.openai.callTool('get_weather', {
        lat: 37.7749,
        lon: -122.4194,
      });

      const payload = extractPayload(result);
      if (!payload) {
        throw new Error('Weather tool returned an empty payload.');
      }

      renderWeather(payload);
    } catch (error) {
      console.error('Weather tool failed', error);
      renderPlaceholder(
        error instanceof Error ? error.message : 'Unable to load weather details. Please try again.',
        true
      );
    }
  };

  const init = () => {
    renderPlaceholder('Fetching San Francisco weather…');
    void callWeatherTool();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
