import { memo } from 'react';
import { formatObservedAt, formatTemperature } from '../utils';
import { WeatherPayload } from '../types';

type WeatherCardProps = {
  payload: WeatherPayload;
  isDarkMode: boolean;
};

export const WeatherCard = memo(({ payload, isDarkMode }: WeatherCardProps) => {
  return (
    <article className={`card${isDarkMode ? ' dark' : ''}`} aria-live="polite">
      <header className="card-header">
        <h1>
          <span>{payload.location}</span>
          <span className="temp">{formatTemperature(payload.temperatureC, 'C')}</span>
        </h1>
        <p className="description">{payload.description}</p>
      </header>

      <section className="meta" aria-label="Weather statistics">
        <div className="meta-item">
          <span className="label">Feels Like</span>
          <strong>{formatTemperature(payload.temperatureF, 'F')}</strong>
        </div>
        <div className="meta-item">
          <span className="label">Humidity</span>
          <strong>{Number.isFinite(payload.humidity) ? `${payload.humidity}%` : '–'}</strong>
        </div>
        <div className="meta-item">
          <span className="label">Wind</span>
          <strong>{Number.isFinite(payload.windKph) ? `${payload.windKph} km/h` : '–'}</strong>
        </div>
        <div className="meta-item">
          <span className="label">Updated</span>
          <strong>{formatObservedAt(payload.observedAt)}</strong>
        </div>
      </section>

      <footer>
        <small className="label">Source: {payload.source}</small>
      </footer>
    </article>
  );
});

WeatherCard.displayName = 'WeatherCard';
