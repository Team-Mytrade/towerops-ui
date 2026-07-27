import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';

import * as L from 'leaflet';
import 'leaflet.markercluster';

import { BaseComponent } from '../../../core/base/base.component';
import {
  MapCoordinate,
  MapMarker,
  MapViewport
} from './map.models';
import {
  createMapMarkerIcon,
  createPopupContent
} from './map.utils';

/**
 * Mirrors the status modifiers already defined in map.scss
 * (.to-map-marker--healthy / --warning / --critical / --offline /
 * --maintenance / --unknown). If MapMarker doesn't yet declare `status`
 * with this union, add it in map.models.ts.
 */
type TowerStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'maintenance'
  | 'unknown';

interface LegendItem {
  color: string;
  label: string;
}

interface BaseLayerOption {
  id: string;
  label: string;
  icon: string;
  url: string;
  attribution: string;
}

const VIEWPORT_STORAGE_VERSION = 'v1';

@Component({
  selector: 'to-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrl: './map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent
  extends BaseComponent
  implements AfterViewInit {

  private readonly mapContainer =
    viewChild.required<ElementRef<HTMLDivElement>>(
      'mapContainer'
    );

  private readonly hostRef =
    inject(ElementRef<HTMLElement>);

  readonly markers = input<MapMarker[]>([]);

  readonly height = input('32rem');

  readonly center = input<MapCoordinate>([
    25.2048,
    55.2708
  ]);

  readonly zoom = input(7);

  readonly minZoom = input(3);
  readonly maxZoom = input(18);

  readonly autoFitBounds = input(true);

  readonly fitBoundsPadding = input(40);

  readonly showControls = input(true);
  readonly showZoomControls = input(true);
  readonly showFitBoundsControl = input(true);

  readonly scrollWheelZoom = input(true);
  readonly dragging = input(true);

  readonly tileUrl = input(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  );

  readonly tileAttribution = input(
    '&copy; OpenStreetMap contributors &copy; CARTO'
  );

  // ---- Marker & data density -------------------------------------------

  readonly enableClustering = input(true);
  readonly clusterMaxRadius = input(60);
  readonly clusterDisableAtZoom = input(16);

  /** Marker ids that always show a text label under them (e.g. flagged towers). */
  readonly permanentTooltipIds = input<MapMarker['id'][]>([]);

  readonly announceStatusChanges = input(true);

  // ---- Navigation & controls ---------------------------------------------

  readonly showLayerSwitcher = input(true);
  readonly showLocateControl = input(true);
  readonly showFullscreenControl = input(true);
  readonly showScaleControl = input(true);

  readonly showLegend = input(false);
  readonly legendItems = input<LegendItem[]>([]);

  // ---- Component-level polish -----------------------------------------

  readonly persistViewport = input(false);
  readonly viewportStorageKey = input('to-map-viewport');

  readonly markerSelected = output<MapMarker>();
  readonly viewportChanged = output<MapViewport>();
  readonly mapReady = output<L.Map>();
  readonly statusChanged = output<{
    marker: MapMarker;
    previousStatus: TowerStatus | undefined;
  }>();

  readonly initialized = signal(false);
  readonly selectedMarkerId =
    signal<MapMarker['id'] | null>(null);

  readonly statusAnnouncement = signal('');

  readonly isLocating = signal(false);
  readonly isFullscreen = signal(false);
  readonly layerMenuOpen = signal(false);
  readonly activeBaseLayerId = signal('street');

  readonly baseLayerOptions = computed<BaseLayerOption[]>(
    () => [
      {
        id: 'street',
        label: 'Street',
        icon: 'pi pi-map',
        url: this.tileUrl(),
        attribution: this.tileAttribution()
      },
      {
        id: 'satellite',
        label: 'Satellite',
        icon: 'pi pi-globe',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri'
      },
      {
        id: 'dark',
        label: 'Dark',
        icon: 'pi pi-moon',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
        attribution:
          '&copy; OpenStreetMap contributors &copy; CARTO'
      }
    ]
  );

  private mapInstance: L.Map | null = null;
  private markerLayer:
    | L.LayerGroup
    | L.MarkerClusterGroup
    | null = null;

  private currentTileLayer: L.TileLayer | null = null;
  private locationMarker: L.CircleMarker | null = null;
  private locationAccuracyCircle: L.Circle | null = null;

  private readonly leafletMarkers = new Map<
    MapMarker['id'],
    L.Marker
  >();

  private readonly previousStatuses = new Map<
    MapMarker['id'],
    TowerStatus | undefined
  >();

  constructor() {
    super();

    effect(() => {
      const markers = this.markers();

      if (!this.initialized()) {
        return;
      }

      this.detectStatusChanges(markers);
      this.renderMarkers(markers);
    });

    effect(() => {
      const center = this.center();
      const zoom = this.zoom();

      if (!this.initialized()) {
        return;
      }

      this.mapInstance?.setView(center, zoom, {
        animate: true
      });
    });

    const onFullscreenChange = () => {
      this.isFullscreen.set(
        document.fullscreenElement ===
          this.hostRef.nativeElement
      );

      this.invalidateSize();
    };

    document.addEventListener(
      'fullscreenchange',
      onFullscreenChange
    );

    this.destroyRef.onDestroy(() =>
      document.removeEventListener(
        'fullscreenchange',
        onFullscreenChange
      )
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.layerMenuOpen()) {
      return;
    }

    const target = event.target as HTMLElement;

    if (!target.closest('.to-map__layer-switcher')) {
      this.layerMenuOpen.set(false);
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  focusMarker(
    markerOrId: MapMarker | MapMarker['id'],
    zoom = 15
  ): void {
    const marker =
      typeof markerOrId === 'object'
        ? markerOrId
        : this.markers().find(
            item => item.id === markerOrId
          );

    if (!marker || !this.mapInstance) {
      return;
    }

    this.selectedMarkerId.set(marker.id);
    this.refreshMarkerIcons();

    this.mapInstance.flyTo(
      [marker.latitude, marker.longitude],
      zoom,
      {
        animate: true,
        duration: 0.6
      }
    );

    const leafletMarker =
      this.leafletMarkers.get(marker.id);

    leafletMarker?.openPopup();
  }

  fitToMarkers(): void {
    const validMarkers =
      this.markers().filter(marker =>
        this.hasValidCoordinates(marker)
      );

    if (!this.mapInstance || !validMarkers.length) {
      return;
    }

    if (validMarkers.length === 1) {
      const marker = validMarkers[0];

      this.mapInstance.setView(
        [marker.latitude, marker.longitude],
        Math.max(this.zoom(), 13),
        {
          animate: true
        }
      );

      return;
    }

    const bounds = L.latLngBounds(
      validMarkers.map(marker => [
        marker.latitude,
        marker.longitude
      ])
    );

    this.mapInstance.fitBounds(bounds, {
      padding: [
        this.fitBoundsPadding(),
        this.fitBoundsPadding()
      ],
      maxZoom: 15,
      animate: true
    });
  }

  setCenter(
    center: MapCoordinate,
    zoom = this.mapInstance?.getZoom() ?? this.zoom()
  ): void {
    this.mapInstance?.setView(center, zoom, {
      animate: true
    });
  }

  setZoom(zoom: number): void {
    this.mapInstance?.setZoom(zoom);
  }

  zoomIn(): void {
    this.mapInstance?.zoomIn();
  }

  zoomOut(): void {
    this.mapInstance?.zoomOut();
  }

  invalidateSize(): void {
    if (!this.mapInstance) {
      return;
    }

    window.setTimeout(() => {
      this.mapInstance?.invalidateSize({
        animate: false
      });
    });
  }

  clearMarkers(): void {
    this.markerLayer?.clearLayers();
    this.leafletMarkers.clear();
    this.selectedMarkerId.set(null);
  }

  /** Centers the map on the browser's geolocation and drops a marker there. */
  locateMe(): void {
    if (!this.mapInstance || this.isLocating()) {
      return;
    }

    this.isLocating.set(true);

    this.mapInstance.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.hostRef.nativeElement
        .requestFullscreen?.()
        .catch(() => {
          // Fullscreen denied/unsupported — button stays inert.
        });
    } else {
      document.exitFullscreen?.();
    }
  }

  toggleLayerMenu(): void {
    this.layerMenuOpen.update(open => !open);
  }

  setBaseLayer(id: string): void {
    this.applyBaseLayer(id);
    this.layerMenuOpen.set(false);
  }

  resetPersistedViewport(): void {
    try {
      window.localStorage.removeItem(
        this.viewportStorageKeyFull()
      );
    } catch {
      // localStorage unavailable (SSR, privacy mode) — ignore.
    }
  }

  private initializeMap(): void {
    const element =
      this.mapContainer().nativeElement;

    const restored = this.persistViewport()
      ? this.loadPersistedViewport()
      : null;

    this.mapInstance = L.map(element, {
      center: restored?.center ?? this.center(),
      zoom: restored?.zoom ?? this.zoom(),
      minZoom: this.minZoom(),
      maxZoom: this.maxZoom(),

      zoomControl: false,
      attributionControl: true,

      scrollWheelZoom: this.scrollWheelZoom(),
      dragging: this.dragging(),

      preferCanvas: true
    });

    this.applyBaseLayer(this.activeBaseLayerId());
    this.registerMarkerLayer(this.mapInstance);

    if (this.showScaleControl()) {
      L.control
        .scale({ imperial: false, position: 'bottomleft' })
        .addTo(this.mapInstance);
    }

    this.registerMapEvents();

    this.initialized.set(true);
    this.renderMarkers(this.markers());

    window.setTimeout(() => {
      this.invalidateSize();

      if (
        !restored &&
        this.autoFitBounds() &&
        this.markers().length > 0
      ) {
        this.fitToMarkers();
      }
    });

    this.mapReady.emit(this.mapInstance);
  }

  private applyBaseLayer(id: string): void {
    if (!this.mapInstance) {
      return;
    }

    const option = this.baseLayerOptions().find(
      layer => layer.id === id
    );

    if (!option) {
      return;
    }

    if (this.currentTileLayer) {
      this.mapInstance.removeLayer(
        this.currentTileLayer
      );
    }

    this.currentTileLayer = L.tileLayer(option.url, {
      attribution: option.attribution,
      maxZoom: this.maxZoom()
    });

    this.currentTileLayer.addTo(this.mapInstance);
    this.activeBaseLayerId.set(id);
  }

  private registerMarkerLayer(map: L.Map): void {
    this.markerLayer = this.enableClustering()
      ? L.markerClusterGroup({
          maxClusterRadius: this.clusterMaxRadius(),
          disableClusteringAtZoom:
            this.clusterDisableAtZoom(),
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          iconCreateFunction: cluster =>
            this.createClusterIcon(cluster)
        })
      : L.layerGroup();

    this.markerLayer.addTo(map);
  }

  private createClusterIcon(
    cluster: L.MarkerCluster
  ): L.DivIcon {
    const count = cluster.getChildCount();
    const size =
      count < 10
        ? 'small'
        : count < 50
        ? 'medium'
        : 'large';

    return L.divIcon({
      html: `
        <div class="to-map-cluster__core to-map-cluster__core--${size}">
          <span>${count}</span>
        </div>
      `,
      className: 'to-map-cluster',
      iconSize: L.point(40, 40)
    });
  }

  private registerMapEvents(): void {
    if (!this.mapInstance) {
      return;
    }

    this.mapInstance.on('moveend zoomend', () => {
      const center = this.mapInstance?.getCenter();
      const zoom = this.mapInstance?.getZoom();

      if (!center || zoom === undefined) {
        return;
      }

      const viewport: MapViewport = {
        center: [center.lat, center.lng],
        zoom
      };

      this.viewportChanged.emit(viewport);

      if (this.persistViewport()) {
        this.persistViewportState(viewport);
      }
    });

    this.mapInstance.on(
      'locationfound',
      (event: L.LocationEvent) => {
        this.isLocating.set(false);
        this.renderLocationMarker(
          event.latlng,
          event.accuracy
        );
      }
    );

    this.mapInstance.on('locationerror', () => {
      this.isLocating.set(false);
    });
  }

  private renderLocationMarker(
    latlng: L.LatLng,
    accuracy: number
  ): void {
    if (!this.mapInstance) {
      return;
    }

    this.locationMarker?.remove();
    this.locationAccuracyCircle?.remove();

    this.locationAccuracyCircle = L.circle(latlng, {
      radius: accuracy,
      color: 'var(--to-primary)',
      weight: 1,
      fillColor: 'var(--to-primary)',
      fillOpacity: 0.12
    }).addTo(this.mapInstance);

    this.locationMarker = L.circleMarker(latlng, {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: 'var(--to-primary)',
      fillOpacity: 1
    }).addTo(this.mapInstance);
  }

  private renderMarkers(
    markers: MapMarker[]
  ): void {
    if (!this.markerLayer) {
      return;
    }

    this.markerLayer.clearLayers();
    this.leafletMarkers.clear();

    const validMarkers = markers.filter(marker =>
      this.hasValidCoordinates(marker)
    );

    const tooltipIds = new Set(
      this.permanentTooltipIds()
    );

    for (const marker of validMarkers) {
      const leafletMarker = L.marker(
        [marker.latitude, marker.longitude],
        {
          icon: createMapMarkerIcon(
            marker,
            marker.id === this.selectedMarkerId()
          ),
          keyboard: true,
          title: marker.title,
          riseOnHover: true
        }
      );

      if (marker.popupEnabled !== false) {
        const popupContent =
          createPopupContent(marker);

        popupContent
          .querySelector<HTMLButtonElement>(
            '[data-map-marker-action]'
          )
          ?.addEventListener('click', event => {
            event.stopPropagation();
            this.selectMarker(marker);
          });

        leafletMarker.bindPopup(popupContent, {
          className: 'to-leaflet-popup',
          closeButton: true,
          autoPan: true,
          maxWidth: 300,
          minWidth: 220,
          offset: [0, -4]
        });
      }

      if (tooltipIds.has(marker.id)) {
        leafletMarker.bindTooltip(marker.title, {
          permanent: true,
          direction: 'top',
          offset: [0, -6],
          className: 'to-map-tooltip'
        });
      }

      leafletMarker.on('click', () => {
        this.selectMarker(marker);
      });

      if (this.enableClustering()) {
        (
          this.markerLayer as L.MarkerClusterGroup
        ).addLayer(leafletMarker);
      } else {
        leafletMarker.addTo(
          this.markerLayer as L.LayerGroup
        );
      }

      this.leafletMarkers.set(
        marker.id,
        leafletMarker
      );
    }

    if (
      this.autoFitBounds() &&
      validMarkers.length > 0
    ) {
      window.setTimeout(() => {
        this.fitToMarkers();
      });
    }
  }

  private selectMarker(marker: MapMarker): void {
    this.selectedMarkerId.set(marker.id);
    this.refreshMarkerIcons();
    this.markerSelected.emit(marker);
  }

  private refreshMarkerIcons(): void {
    for (const marker of this.markers()) {
      const leafletMarker =
        this.leafletMarkers.get(marker.id);

      leafletMarker?.setIcon(
        createMapMarkerIcon(
          marker,
          marker.id === this.selectedMarkerId()
        )
      );
    }
  }

  private detectStatusChanges(
    markers: MapMarker[]
  ): void {
    if (!this.announceStatusChanges()) {
      return;
    }

    for (const marker of markers) {
      const status = (
        marker as MapMarker & { status?: TowerStatus }
      ).status;

      const previous = this.previousStatuses.get(
        marker.id
      );

      if (previous !== undefined && previous !== status) {
        this.statusChanged.emit({
          marker,
          previousStatus: previous
        });

        this.statusAnnouncement.set(
          `${marker.title} status changed from ${previous} to ${status}.`
        );

        if (status !== 'critical') {
          this.flashMarker(marker.id);
        }
      }

      this.previousStatuses.set(marker.id, status);
    }
  }

  private flashMarker(id: MapMarker['id']): void {
    const element = this.leafletMarkers
      .get(id)
      ?.getElement();

    if (!element) {
      return;
    }

    element.classList.add('to-map-marker--flash');

    window.setTimeout(() => {
      element.classList.remove('to-map-marker--flash');
    }, 900);
  }

  private loadPersistedViewport(): MapViewport | null {
    try {
      const raw = window.localStorage.getItem(
        this.viewportStorageKeyFull()
      );

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as MapViewport;

      if (
        !Array.isArray(parsed.center) ||
        parsed.center.length !== 2 ||
        typeof parsed.zoom !== 'number'
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private persistViewportState(
    viewport: MapViewport
  ): void {
    try {
      window.localStorage.setItem(
        this.viewportStorageKeyFull(),
        JSON.stringify(viewport)
      );
    } catch {
      // Storage full/unavailable — silently skip persistence.
    }
  }

  private viewportStorageKeyFull(): string {
    return `${this.viewportStorageKey()}:${VIEWPORT_STORAGE_VERSION}`;
  }

  private hasValidCoordinates(
    marker: MapMarker
  ): boolean {
    return (
      Number.isFinite(marker.latitude) &&
      Number.isFinite(marker.longitude) &&
      marker.latitude >= -90 &&
      marker.latitude <= 90 &&
      marker.longitude >= -180 &&
      marker.longitude <= 180
    );
  }
}