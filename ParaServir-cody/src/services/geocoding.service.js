import axios from 'axios';

/**
 * Servicio de geocodificación GRATUITO usando Nominatim (OpenStreetMap)
 * No requiere API key - 100% gratuito
 */

/**
 * Convierte una dirección en coordenadas (lat, lng)
 * @param {string} address - Dirección a geocodificar (ej: "Quito, Ecuador")
 * @returns {Promise<{latitude: number, longitude: number, formatted_address: string} | null>}
 */
export async function geocodeAddress(address) {
    try {
        if (!address || typeof address !== 'string' || address.trim().length === 0) {
            throw new Error('La dirección no puede estar vacía');
        }

        // Nominatim es el servicio gratuito de geocodificación de OpenStreetMap
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address.trim(),
                format: 'json',
                limit: 1,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'ParaServir-App/1.0' // Requerido por Nominatim
            },
            timeout: 10000 // 10 segundos de timeout
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                formatted_address: result.display_name
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error en geocodificación:', error.message);
        throw new Error(`No se pudo obtener la ubicación: ${error.message}`);
    }
}

/**
 * Geocodificación inversa: convierte coordenadas en dirección
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<{formatted_address: string, address: object} | null>}
 */
export async function reverseGeocode(latitude, longitude) {
    try {
        if (!latitude || !longitude) {
            throw new Error('Se requieren latitude y longitude');
        }

        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'ParaServir-App/1.0'
            },
            timeout: 10000
        });

        if (response.data && response.data.address) {
            return {
                formatted_address: response.data.display_name,
                address: response.data.address
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error en geocodificación inversa:', error.message);
        throw new Error(`No se pudo obtener la dirección: ${error.message}`);
    }
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
}
