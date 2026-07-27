import * as L from 'leaflet';

import { SiteHealthStatus } from '../../../core/models/application.enums';
import { MapMarker } from './map.models';

const HEALTH_CLASS_MAP: Record<SiteHealthStatus, string> = {
  HEALTHY: 'to-map-marker--healthy',
  WARNING: 'to-map-marker--warning',
  CRITICAL: 'to-map-marker--critical',
  OFFLINE: 'to-map-marker--offline',
  MAINTENANCE: 'to-map-marker--maintenance',
  UNKNOWN: 'to-map-marker--unknown'
};

export function createMapMarkerIcon(
  marker: MapMarker,
  selected = false
): L.DivIcon {
  const healthStatus =
    marker.healthStatus ?? 'UNKNOWN';

  const healthClass =
    HEALTH_CLASS_MAP[healthStatus];

  const selectedClass = selected
    ? 'to-map-marker--selected'
    : '';

  return L.divIcon({
    className: 'to-map-marker-wrapper',

    html: `
      <span
        class="to-map-marker ${healthClass} ${selectedClass}"
        aria-hidden="true"
      >
        <span class="to-map-marker__pulse"></span>
        <span class="to-map-marker__core">
          <i class="pi pi-map-marker"></i>
        </span>
      </span>
    `,

    iconSize: [38, 38],
    iconAnchor: [19, 34],
    popupAnchor: [0, -32]
  });
}

export function createPopupContent(
  marker: MapMarker
): HTMLElement {
  const container = document.createElement('article');
  container.className = 'to-map-popup';

  const header = document.createElement('header');
  header.className = 'to-map-popup__header';

  const titleSection = document.createElement('div');

  const eyebrow = document.createElement('span');
  eyebrow.className = 'to-map-popup__eyebrow';
  eyebrow.textContent =
    marker.siteCode ??
    marker.category?.replaceAll('_', ' ') ??
    'Site';

  const title = document.createElement('strong');
  title.className = 'to-map-popup__title';
  title.textContent = marker.title;

  titleSection.append(eyebrow, title);

  const status = document.createElement('span');
  status.className = [
    'to-map-popup__status',
    `to-map-popup__status--${
      (marker.healthStatus ?? 'UNKNOWN').toLowerCase()
    }`
  ].join(' ');

  status.textContent =
    marker.healthStatus ?? 'UNKNOWN';

  header.append(titleSection, status);
  container.append(header);

  if (marker.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'to-map-popup__subtitle';
    subtitle.textContent = marker.subtitle;

    container.append(subtitle);
  }

  const metrics = document.createElement('div');
  metrics.className = 'to-map-popup__metrics';

  if (marker.deviceCount !== undefined) {
    metrics.append(
      createMetric(
        'Devices',
        String(marker.deviceCount)
      )
    );
  }

  if (marker.openAlerts !== undefined) {
    metrics.append(
      createMetric(
        'Open alerts',
        String(marker.openAlerts)
      )
    );
  }

  if (metrics.childElementCount > 0) {
    container.append(metrics);
  }

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'to-map-popup__action';
  action.dataset['mapMarkerAction'] = String(marker.id);

  const actionLabel = document.createElement('span');
  actionLabel.textContent = 'View site';

  const actionIcon = document.createElement('i');
  actionIcon.className = 'pi pi-arrow-right';

  action.append(actionLabel, actionIcon);
  container.append(action);

  return container;
}

function createMetric(
  label: string,
  value: string
): HTMLElement {
  const metric = document.createElement('div');

  const metricLabel = document.createElement('span');
  metricLabel.textContent = label;

  const metricValue = document.createElement('strong');
  metricValue.textContent = value;

  metric.append(metricLabel, metricValue);

  return metric;
}