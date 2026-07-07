import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { EventMapMarker } from '../../../models/event';

// Fix Leaflet default marker icon paths broken by webpack bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-shell">
      @if (!markers || markers.length === 0) {
        <div class="map-empty-overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8aaace" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <p>No in-person events found</p>
        </div>
      }
      <div [id]="mapId" class="map-container"></div>
    </div>
  `,
  styles: [`
    .map-shell { position: relative; width: 100%; height: 100%; min-height: 400px; }
    .map-container { width: 100%; height: 100%; min-height: 400px; border-radius: 12px; z-index: 0; }
    .map-empty-overlay {
      position: absolute; inset: 0; z-index: 10;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; background: rgba(248,250,255,0.92); border-radius: 12px;
      color: #8aaace; font-size: 13px; font-weight: 500; pointer-events: none;
    }
  `],
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() markers: EventMapMarker[] = [];
  @Input() draggable = false;
  @Input() onDrag?: (lat: number, lng: number) => void;

  protected readonly mapId = `map-${Math.random().toString(36).slice(2)}`;

  private map: L.Map | null = null;
  private markerLayer: L.LayerGroup | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private pendingInvalidate: number | null = null;
  private readonly windowResizeHandler = () => this.scheduleInvalidate();

  constructor(
    private readonly router: Router,
    private readonly hostRef: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['markers'] && this.map) {
      this.refreshMarkers();
    }
  }

  ngOnDestroy(): void {
    this.teardownResizeHandling();
    if (this.pendingInvalidate !== null) {
      window.clearTimeout(this.pendingInvalidate);
      this.pendingInvalidate = null;
    }
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    const el = document.getElementById(this.mapId);
    if (!el || this.map) return;

    this.map = L.map(el, { zoomControl: true, scrollWheelZoom: true })
      .setView([34, 9], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    this.setupResizeHandling();
    this.refreshMarkers();
    this.scheduleInvalidate(120);
  }

  private refreshMarkers(): void {
    this.markerLayer?.clearLayers();
    if (!this.markers?.length || !this.markerLayer) return;

    const bounds: L.LatLngTuple[] = [];

    for (const m of this.markers) {
      const latlng: L.LatLngTuple = [m.latitude, m.longitude];
      bounds.push(latlng);

      const marker = L.marker(latlng, { draggable: this.draggable });

      if (this.draggable && this.onDrag) {
        const cb = this.onDrag;
        marker.on('dragend', (e: L.LeafletEvent) => {
          const pos = (e as L.DragEndEvent).target.getLatLng();
          cb(pos.lat, pos.lng);
        });
      }

      const date = m.startDate
        ? new Date(m.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

      marker.bindPopup(this.buildPopupContent(m, date));
      this.markerLayer.addLayer(marker);
    }

    if (bounds.length === 1) {
      this.map?.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      this.map?.fitBounds(bounds, { padding: [40, 40] });
    }

    this.scheduleInvalidate();
  }

  private buildPopupContent(marker: EventMapMarker, date: string): HTMLElement {
    const root = document.createElement('div');
    root.style.fontFamily = 'system-ui, sans-serif';
    root.style.minWidth = '200px';

    if (marker.coverImage) {
      const img = document.createElement('img');
      img.src = marker.coverImage;
      img.alt = '';
      img.style.width = '100%';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      img.style.marginBottom = '8px';
      root.appendChild(img);
    }

    const type = document.createElement('span');
    type.textContent = marker.type;
    type.style.fontSize = '11px';
    type.style.fontWeight = '600';
    type.style.background = '#eff6ff';
    type.style.color = '#1d4ed8';
    type.style.padding = '2px 7px';
    type.style.borderRadius = '4px';
    root.appendChild(type);

    const title = document.createElement('p');
    title.textContent = marker.title;
    title.style.fontSize = '13px';
    title.style.fontWeight = '700';
    title.style.margin = '6px 0 2px';
    title.style.color = '#1e293b';
    root.appendChild(title);

    if (date) {
      const dateEl = document.createElement('p');
      dateEl.textContent = date;
      dateEl.style.fontSize = '11px';
      dateEl.style.color = '#64748b';
      dateEl.style.margin = '0 0 2px';
      root.appendChild(dateEl);
    }

    if (marker.address) {
      const address = document.createElement('p');
      address.textContent = marker.address;
      address.style.fontSize = '11px';
      address.style.color = '#64748b';
      address.style.margin = '0 0 8px';
      root.appendChild(address);
    }

    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = 'View Event';
    action.style.width = '100%';
    action.style.background = '#1C4FC3';
    action.style.color = '#fff';
    action.style.border = 'none';
    action.style.padding = '6px';
    action.style.borderRadius = '6px';
    action.style.fontSize = '12px';
    action.style.fontWeight = '600';
    action.style.cursor = 'pointer';
    action.addEventListener('click', () => {
      this.router.navigate(['/events'], { queryParams: { open: marker.id } });
    });
    root.appendChild(action);

    return root;
  }

  private setupResizeHandling(): void {
    const host = this.hostRef.nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleInvalidate());
      this.resizeObserver.observe(host);
    }
    window.addEventListener('resize', this.windowResizeHandler, { passive: true });
  }

  private teardownResizeHandling(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener('resize', this.windowResizeHandler);
  }

  private scheduleInvalidate(delayMs = 0): void {
    if (!this.map) return;
    if (this.pendingInvalidate !== null) {
      window.clearTimeout(this.pendingInvalidate);
    }
    this.pendingInvalidate = window.setTimeout(() => {
      this.map?.invalidateSize();
      this.pendingInvalidate = null;
    }, delayMs);
  }
}