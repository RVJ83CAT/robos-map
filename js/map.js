// Configuración global
const CONFIG = {
    DEFAULT_CENTER: [-36.8400, -73.1100],
    DEFAULT_ZOOM: 11,
    PAGE_SIZE: 50
};

// Proveedores de mapas
const mapProviders = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true
    }),
    carto: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
        noWrap: true
    }),
    stamen: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://maps.stamen.com">Stamen Design</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        noWrap: true
    }),
    esri_street: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© <a href="https://www.esri.com">Esri</a>, HERE, Garmin, FAO, NOAA, USGS',
        noWrap: true
    }),
    esri_imagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
        noWrap: true
    }),
    opentopo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
        noWrap: true
    }),
    thunderforest: L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.thunderforest.com">Thunderforest</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        noWrap: true
    }),
    cyclosm: L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.cyclosm.org">CyclOSM</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        noWrap: true
    }),
    mapbox: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB5xWOw', {
        attribution: '© <a href="https://www.mapbox.com">Mapbox</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        noWrap: true
    })
};

// Mapeo de iconos de delitos
const delitoIcons = {
    'ROBO EN LUGAR HABITADO': L.icon({ iconUrl: './iconos/ico-robo-lugar-habitado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO EN LUGAR NO HABITADO': L.icon({ iconUrl: './iconos/ico-robo-lugar-no-habitado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO DE ACCESORIOS DE VEHICULOS': L.icon({ iconUrl: './iconos/ico-robo-accesorios-especies-interior-vehiculo.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO DE VEHICULO MOTORIZADO': L.icon({ iconUrl: './iconos/ico-robo-vehiculo-motorizado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO POR SORPRESA': L.icon({ iconUrl: './iconos/ico-robo-sorpresa.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO EN BIENES NACIONALES': L.icon({ iconUrl: './iconos/ico-robo-bienes-nacionales-uso-publico.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO CON INTIMIDACION': L.icon({ iconUrl: './iconos/ico-robo-intimidacion.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO FRUSTRADO': L.icon({ iconUrl: './iconos/ico-robo-frustrado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO CON VIOLENCIA': L.icon({ iconUrl: './iconos/ico-robo-violencia.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'APROPIACION DE CABLES DE TENDIDO ELECTRICO': L.icon({ iconUrl: './iconos/ico_robo_cable_tendido_electrico.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'ROBO VIOLENTO DE VEHICULO': L.icon({ iconUrl: './iconos/ico_robo_vehiculo_sorpresa_violencia_int.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'HURTO': L.icon({ iconUrl: './iconos/hurto.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
    'default': L.icon({ iconUrl: './iconos/default.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
};

/**
 * Inicializa el mapa con Leaflet y MarkerCluster.
 * @returns {Object} Objeto con map y markerCluster.
 */
function initMap() {
    if (typeof L === 'undefined') {
        throw new Error('Leaflet no está cargado');
    }
    const map = L.map('map').setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);
    const markerCluster = L.markerClusterGroup();
    let currentLayer = mapProviders.osm.addTo(map);

    // Mostrar mapa
    document.getElementById('map-loading').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    map.invalidateSize();

    return { map, markerCluster, currentLayer };
}

/**
 * Cambia el proveedor de mapa.
 * @param {Object} map - Instancia del mapa.
 * @param {Object} currentLayer - Capa actual.
 * @returns {Object} Nueva capa.
 */
function changeMapProvider(map, currentLayer) {
    const provider = document.getElementById('mapProvider').value;
    if (mapProviders[provider]) {
        map.removeLayer(currentLayer);
        currentLayer = mapProviders[provider].addTo(map);
        map.invalidateSize();
    } else {
        logError('Proveedor de mapa no válido: ' + provider);
    }
    return currentLayer;
}

/**
 * Añade o actualiza un marcador en el mapa.
 * @param {Object} data - Datos del delito.
 * @param {number|null} index - Índice para actualización.
 * @param {Object} map - Instancia del mapa.
 * @param {Object} markerCluster - Grupo de marcadores.
 * @param {Array} markers - Lista de marcadores.
 * @returns {Object} Marcador creado o null.
 */
function addOrUpdateMarker(data, index, map, markerCluster, markers) {
    // Eliminar marcador anterior si existe
    if (index !== null && markers[index]?.marker) {
        markerCluster.removeLayer(markers[index].marker);
    }

    // Validar y convertir coordenadas
    const lat = parseFloat(data.LATITUD) || 0;
    const lng = parseFloat(data.LONGITUD) || 0;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        data.LATITUD = 0;
        data.LONGITUD = 0;
    }

    // Crear marcador si las coordenadas son válidas
    let marker = null;
    if (data.LATITUD !== 0 && data.LONGITUD !== 0 && !isNaN(data.LATITUD) && !isNaN(data.LONGITUD)) {
        const icon = delitoIcons[data.DELITO] || delitoIcons['default'];
        marker = L.marker([data.LATITUD, data.LONGITUD], { icon })
            .bindTooltip(data.DELITO || 'Sin Delito', { permanent: false });
        marker.bindPopup(`
            <b>${sanitizeInput(data.DELITO || 'Sin Delito')}</b><br>
            Clasificación: ${sanitizeInput(data.CLASIFICACION || '')}<br>
            Fecha: ${sanitizeInput(data.FECHA || '')}<br>
            Día: ${sanitizeInput(data.DIA || '')}<br>
            Hora: ${sanitizeInput(data.HORA || '')}<br>
            Rango Hora: ${sanitizeInput(data['RANGO HORA'] || '')}<br>
            Lugar: ${sanitizeInput(data.LUGAR || '')}<br>
            Dirección: ${sanitizeInput(data.DIRECCION || '')}<br>
            Circunstancias: ${sanitizeInput(data.CIRCUNSTANCIAS || '')}<br>
            Cuadrante: ${sanitizeInput(data.CUADRANTE || '')}<br>
            Número de Parte: ${sanitizeInput(data['NUMERO PARTE'] || '')}<br>
            Dirección Georref: ${sanitizeInput(data['DIRECCION GEORREF'] || '')}<br>
            Comuna: ${sanitizeInput(data.COMUNA || '')}<br>
            Concat: ${sanitizeInput(data.CONCAT || '')}<br>
            Coordenadas: ${data.LATITUD.toFixed(4)}, ${data.LONGITUD.toFixed(4)}<br>
            <button onclick="editMarker(${index !== null ? index : markers.length})">Editar</button>
        `);
        markerCluster.addLayer(marker);
    }

    return marker;
}

/**
 * Sanitiza entradas para prevenir XSS.
 * @param {string} input - Texto a sanitizar.
 * @returns {string} Texto sanitizado.
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

export { initMap, changeMapProvider, addOrUpdateMarker, sanitizeInput, CONFIG };