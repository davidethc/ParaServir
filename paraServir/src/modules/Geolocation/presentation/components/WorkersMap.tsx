import { useEffect, useRef } from "react";
import { Card } from "@/shared/components/ui/card";
import { MapPin } from "lucide-react";

interface WorkerLocation {
  worker_id: string;
  first_name: string;
  last_name: string;
  location?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
}

interface WorkersMapProps {
  workers: WorkerLocation[];
  centerLatitude?: number;
  centerLongitude?: number;
  radius?: number;
}

export function WorkersMap({ workers, centerLatitude, centerLongitude, radius }: WorkersMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Usar OpenStreetMap con Leaflet (gratis)
    const loadMap = async () => {
      try {
        // Cargar Leaflet dinámicamente
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        // Limpiar mapa anterior si existe
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Determinar centro del mapa
        let center: [number, number] = [-0.1807, -78.4678]; // Quito por defecto
        if (centerLatitude && centerLongitude) {
          center = [centerLatitude, centerLongitude];
        } else if (workers.length > 0 && workers[0].latitude && workers[0].longitude) {
          center = [workers[0].latitude, workers[0].longitude];
        }

        // Crear mapa
        const map = L.default.map(mapContainerRef.current).setView(center, radius && radius < 10 ? 13 : 11);

        // Agregar capa de OpenStreetMap
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Agregar marcador para el centro de búsqueda si existe
        if (centerLatitude && centerLongitude) {
          L.default.marker([centerLatitude, centerLongitude], {
            icon: L.default.divIcon({
              className: 'custom-marker-center',
              html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          }).addTo(map).bindPopup('Tu ubicación de búsqueda');

          // Agregar círculo para el radio de búsqueda
          if (radius) {
            L.default.circle([centerLatitude, centerLongitude], {
              radius: radius * 1000, // Convertir km a metros
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              color: '#3b82f6',
              weight: 2,
            }).addTo(map);
          }
        }

        // Agregar marcadores para cada trabajador
        workers.forEach((worker) => {
          if (worker.latitude && worker.longitude) {
            const marker = L.default.marker([worker.latitude, worker.longitude], {
              icon: L.default.divIcon({
                className: 'custom-marker-worker',
                html: '<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            });

            const popupContent = `
              <div style="min-width: 150px;">
                <strong>${worker.first_name} ${worker.last_name}</strong>
                ${worker.location ? `<br><small>${worker.location}</small>` : ''}
                ${worker.distance_km ? `<br><small style="color: #10b981;">📍 ${worker.distance_km.toFixed(1)} km</small>` : ''}
              </div>
            `;

            marker.addTo(map).bindPopup(popupContent);
          }
        });

        // Ajustar vista para mostrar todos los marcadores
        if (workers.length > 0) {
          const bounds = L.default.latLngBounds(
            workers
              .filter(w => w.latitude && w.longitude)
              .map(w => [w.latitude, w.longitude] as [number, number])
          );
          if (centerLatitude && centerLongitude) {
            bounds.extend([centerLatitude, centerLongitude]);
          }
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('Error al cargar el mapa:', error);
        // Fallback: mostrar mensaje si no se puede cargar el mapa
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; padding: 20px; text-align: center;">
              <div>
                <p style="margin-bottom: 8px;">No se pudo cargar el mapa</p>
                <p style="font-size: 12px;">Verifica tu conexión a internet</p>
              </div>
            </div>
          `;
        }
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [workers, centerLatitude, centerLongitude, radius]);

  if (workers.length === 0 && !centerLatitude) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No hay trabajadores para mostrar en el mapa</p>
          <p className="text-xs mt-2">Busca por ubicación para ver trabajadores cercanos</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-1">Mapa de Trabajadores</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Tu búsqueda</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Trabajadores ({workers.length})</span>
          </div>
        </div>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-lg overflow-hidden border border-border"
        style={{ minHeight: '400px' }}
      />
    </Card>
  );
}
