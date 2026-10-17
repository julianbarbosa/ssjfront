import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  isDevMode,
} from '@angular/core';
import type MapView from '@arcgis/core/views/MapView';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** Latitud (por defecto: Cali). */
  @Input() latitude = 3.4516;
  /** Longitud (por defecto: Cali). */
  @Input() longitude = -76.5225;
  @Input() zoom = 16;
  @Input() markerTitle = 'Ubicación';

  @ViewChild('mapViewNode', { static: true }) mapViewNode!: ElementRef<HTMLDivElement>;

  private mapView: MapView | null = null;
  private mapInitPromise: Promise<void> | null = null;
  private readonly host = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    this.mapInitPromise = this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapView || (!changes['latitude'] && !changes['longitude'] && !changes['markerTitle'])) {
      return;
    }
    void this.mapInitPromise?.then(() => this.updateMarker());
  }

  ngOnDestroy(): void {
    void this.mapView?.destroy();
    this.mapView = null;
  }

  private async initializeMap(): Promise<void> {
    const container = this.mapViewNode?.nativeElement;
    if (!container) {
      return;
    }

    try {
      const [
        esriConfigModule,
        EsriMapModule,
        MapViewModule,
        GraphicModule,
        PointModule,
        SimpleMarkerSymbolModule,
      ] = await Promise.all([
        import('@arcgis/core/config.js'),
        import('@arcgis/core/Map.js'),
        import('@arcgis/core/views/MapView.js'),
        import('@arcgis/core/Graphic.js'),
        import('@arcgis/core/geometry/Point.js'),
        import('@arcgis/core/symbols/SimpleMarkerSymbol.js'),
      ]);

      const esriConfig = esriConfigModule.default;
      esriConfig.assetsPath = this.resolveEsriAssetsPath();
      if (environment.ARCGIS_API_KEY) {
        esriConfig.apiKey = environment.ARCGIS_API_KEY;
      }

      const map = new EsriMapModule.default({
        basemap: 'streets-vector',
      });

      this.mapView = new MapViewModule.default({
        container,
        map,
        center: [this.longitude, this.latitude],
        zoom: this.zoom,
      });

      await this.mapView.when();

      const point = new PointModule.default({
        longitude: this.longitude,
        latitude: this.latitude,
      });

      const marker = new GraphicModule.default({
        geometry: point,
        symbol: new SimpleMarkerSymbolModule.default({
          color: '#004884',
          size: 12,
          outline: {
            color: '#ffffff',
            width: 2,
          },
        }),
        attributes: { title: this.markerTitle },
        popupTemplate: {
          title: this.markerTitle,
          content: `Lat: ${this.latitude}<br/>Lon: ${this.longitude}`,
        },
      });

      this.mapView.graphics.add(marker);
    } catch (error) {
      if (isDevMode()) {
        console.error('No se pudo inicializar el mapa ArcGIS', error);
      }
      this.showMapError();
    }
  }

  private async updateMarker(): Promise<void> {
    if (!this.mapView) {
      return;
    }

    const [GraphicModule, PointModule, SimpleMarkerSymbolModule] = await Promise.all([
      import('@arcgis/core/Graphic.js'),
      import('@arcgis/core/geometry/Point.js'),
      import('@arcgis/core/symbols/SimpleMarkerSymbol.js'),
    ]);

    this.mapView.graphics.removeAll();

    const point = new PointModule.default({
      longitude: this.longitude,
      latitude: this.latitude,
    });

    this.mapView.graphics.add(
      new GraphicModule.default({
        geometry: point,
        symbol: new SimpleMarkerSymbolModule.default({
          color: '#004884',
          size: 12,
          outline: { color: '#ffffff', width: 2 },
        }),
        popupTemplate: {
          title: this.markerTitle,
          content: `Lat: ${this.latitude}<br/>Lon: ${this.longitude}`,
        },
      }),
    );

    await this.mapView.goTo({
      center: point,
      zoom: this.zoom,
    });
  }

  /** Ruta absoluta a assets copiados en build; evita 404 en rutas hijas (/visita/gestionar/...). */
  private resolveEsriAssetsPath(): string {
    const baseHref = document.querySelector('base')?.href ?? `${window.location.origin}/`;
    return new URL('assets/esri', baseHref).href.replace(/\/$/, '');
  }

  private showMapError(): void {
    const el = this.host.nativeElement.querySelector('.map-view');
    if (el instanceof HTMLElement) {
      el.classList.add('map-view--error');
      el.setAttribute('data-error', 'No se pudo cargar el mapa.');
    }
  }
}
