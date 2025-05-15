const CONFIG = {
    DEFAULT_CENTER: [-36.8400, -73.1100],
    DEFAULT_ZOOM: 11,
    PAGE_SIZE: 50,
    EXPECTED_COLUMNS: [
        'CLASIFICACION', 'DELITO', 'FECHA', 'DIA', 'HORA', 'RANGO HORA', 'LUGAR',
        'DIRECCION', 'CIRCUNSTANCIAS', 'CUADRANTE', 'NUMERO PARTE', 'DIRECCION GEORREF',
        'COMUNA', 'CONCAT', 'LATITUD', 'LONGITUD'
    ],
    SHEETS_API_URL: 'https://script.google.com/macros/s/[TU_ID]/exec' // Reemplaza con la URL de tu API
};

let markers = [];
let allData = [];
let map = null;
let currentLayer = null;
let filteredIndices = [];
let currentCuadrante = '';
let currentDateRange = '';
let currentTextFilter = '';

function initMap() {
    console.log('Inicializando mapa...');
    try {
        map = L.map('map').setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);
        currentLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            noWrap: true
        }).addTo(map);
        document.getElementById('map-loading').style.display = 'none';
        document.getElementById('map').style.display = 'block';
        map.invalidateSize();
        console.log('Mapa inicializado correctamente.');
        return true;
    } catch (err) {
        logError('Error al inicializar el mapa: ' + err.message);
        console.error('Error en initMap:', err);
        return false;
    }
}

function changeMapProvider() {
    // Código sin cambios
}

function sanitizeInput(input) {
    if (input === null || input === undefined || input === '') return '';
    return String(input).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function addOrUpdateMarker(data, index = null, saveToSheets = true) {
    if (!map) {
        console.warn('Mapa no inicializado, no se puede añadir marcador.');
        return;
    }

    if (index !== null && markers[index]?.layers) {
        markers[index].layers.forEach(layer => map.removeLayer(layer));
    }

    data.LATITUD = parseFloat(data.LATITUD) || 0;
    data.LONGITUD = parseFloat(data.LONGITUD) || 0;
    if (data.LATITUD < -90 || data.LATITUD > 90 || data.LONGITUD < -180 || data.LONGITUD > 180) {
        data.LATITUD = 0;
        data.LONGITUD = 0;
    }

    let markerLayers = [];
    if (data.LATITUD !== 0 && data.LONGITUD !== 0 && !isNaN(data.LATITUD) && !isNaN(data.LONGITUD)) {
        const icon = L.icon({
            iconUrl: data.DELITO && delitoIcons[data.DELITO] ? delitoIcons[data.DELITO].options.iconUrl : './iconos/default.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        const marker = L.marker([data.LATITUD, data.LONGITUD], { icon }).addTo(map);
        markerLayers.push(marker);

        const filteredIndex = filteredIndices.indexOf(index !== null ? index : allData.length - 1);
        if (filteredIndex !== -1) {
            const numberLabel = L.divIcon({
                className: 'number-label',
                html: `<span>${filteredIndex + 1}</span>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            const numberMarker = L.marker([data.LATITUD, data.LONGITUD], { icon: numberLabel }).addTo(map);
            markerLayers.push(numberMarker);

            const timeLabel = L.divIcon({
                className: 'time-label',
                html: `<span>${sanitizeInput(data.HORA)}</span>`,
                iconSize: [30, 15],
                iconAnchor: [15, -5]
            });
            const timeMarker = L.marker([data.LATITUD, data.LONGITUD], { icon: timeLabel }).addTo(map);
            markerLayers.push(timeMarker);
        }

        marker.bindPopup(`
            <b>${sanitizeInput(data.DELITO)}</b><br>
            Clasificación: ${sanitizeInput(data.CLASIFICACION)}<br>
            Fecha: ${sanitizeInput(data.FECHA)}<br>
            Día: ${sanitizeInput(data.DIA)}<br>
            Hora: ${sanitizeInput(data.HORA)}<br>
            Rango Hora: ${sanitizeInput(data['RANGO HORA'])}<br>
            Lugar: ${sanitizeInput(data.LUGAR)}<br>
            Dirección: ${sanitizeInput(data.DIRECCION)}<br>
            Circunstancias: ${sanitizeInput(data.CIRCUNSTANCIAS)}<br>
            Cuadrante: ${sanitizeInput(data.CUADRANTE)}<br>
            Número de Parte: ${sanitizeInput(data['NUMERO PARTE'])}<br>
            Dirección Georref: ${sanitizeInput(data['DIRECCION GEORREF'])}<br>
            Comuna: ${sanitizeInput(data.COMUNA)}<br>
            Concat: ${sanitizeInput(data.CONCAT)}<br>
            Coordenadas: ${data.LATITUD.toFixed(4)}, ${data.LONGITUD.toFixed(4)}<br>
            <button onclick="editMarker(${index !== null ? index : markers.length})">Editar</button>
        `);
    }

    if (index !== null) {
        markers[index] = { layers: markerLayers, data };
        allData[index] = data;
    } else {
        markers.push({ layers: markerLayers, data });
        allData.push(data);
    }

    updateTable(allData);
    if (saveToSheets) {
        saveToGoogleSheets(data, index);
    }
}

const delitoIcons = {
    // Código sin cambios
};

function normalizeColumnName(name) {
    // Código sin cambios
}

function normalizeTime(timeStr) {
    // Código sin cambios
}

function normalizeDate(dateStr) {
    // Código sin cambios
}

function parseDate(dateStr) {
    // Código sin cambios
}

function isRowEmpty(row) {
    // Código sin cambios
}

function logError(message) {
    console.error(message);
    document.getElementById('errorMessage').textContent = message;
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

function populateFilterOptions() {
    // Código sin cambios
}

function updateSubtitles() {
    // Código sin cambios
}

function updateTable(data, page = 1) {
    // Código sin cambios
}

function changePage(delta) {
    // Código sin cambios
}

function editMarker(index) {
    // Código sin cambios
}

function saveToGoogleSheets(data, index = null) {
    showLoading(true);
    const payload = {
        action: index !== null ? 'update' : 'add',
        data: data,
        index: index
    };

    fetch(CONFIG.SHEETS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            console.log(result.message);
            document.getElementById('errorMessage').textContent = result.message;
        } else {
            logError('Error al guardar en Google Sheets: ' + result.message);
        }
    })
    .catch(error => {
        logError('Error al conectar con Google Sheets: ' + error.message);
    })
    .finally(() => {
        showLoading(false);
    });
}

function downloadCSV() {
    // Código sin cambios
}

function loadFromGoogleSheets() {
    showLoading(true);
    fetch(CONFIG.SHEETS_API_URL)
        .then(response => response.json())
        .then(data => {
            markers.forEach(m => m.layers?.forEach(layer => map.removeLayer(layer)));
            markers = [];
            allData = [];
            filteredIndices = [];

            data.forEach((row, i) => {
                const dataRow = {};
                CONFIG.EXPECTED_COLUMNS.forEach(header => {
                    dataRow[header] = row[header] !== undefined ? row[header].toString() : '';
                    if (header === 'HORA') dataRow[header] = normalizeTime(row[header]);
                    if (header === 'FECHA') dataRow[header] = normalizeDate(row[header]);
                });
                addOrUpdateMarker(dataRow, null, false);
            });

            filteredIndices = Array.from({ length: allData.length }, (_, i) => i);
            populateFilterOptions();
            document.getElementById('errorMessage').textContent = `Cargados ${allData.length} casos desde Google Sheets.`;
            map.invalidateSize();
        })
        .catch(error => {
            logError('Error al cargar desde Google Sheets: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando aplicación...');
    if (!initMap()) {
        document.getElementById('map-loading').textContent = 'Error al cargar el mapa.';
        console.warn('Mapa no inicializado.');
        return;
    }

    document.getElementById('loadFromSheets').addEventListener('click', function() {
        console.log('Cargando datos desde Google Sheets...');
        loadFromGoogleSheets();
    });

    document.getElementById('pointForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const lat = parseFloat(document.getElementById('lat').value);
        const lng = parseFloat(document.getElementById('lng').value);

        if (isNaN(lat) || isNaN(lng)) {
            document.getElementById('errorMessage').textContent = 'Por favor, ingrese valores numéricos válidos para Latitud y Longitud.';
            return;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            document.getElementById('errorMessage').textContent = 'Latitud debe estar entre -90 y 90, y Longitud entre -180 y 180.';
            return;
        }

        const data = {};
        CONFIG.EXPECTED_COLUMNS.forEach(col => {
            data[col] = '';
        });
        data.LATITUD = lat;
        data.LONGITUD = lng;

        const editIndex = document.getElementById('editIndex').value;
        addOrUpdateMarker(data, editIndex ? parseInt(editIndex) : null);
        document.getElementById('pointForm').reset();
        document.getElementById('editIndex').value = '';
        document.getElementById('errorMessage').textContent = '';
        console.log('Delito añadido/editado:', { lat, lng });
    });

    document.getElementById('filterForm').addEventListener('submit', function(e) {
        // Código sin cambios
    });

    window.resetFilter = function() {
        // Código sin cambios
    };

    if (map) {
        map.on('click', function(e) {
            document.getElementById('lat').value = e.latlng.lat.toFixed(6);
            document.getElementById('lng').value = e.latlng.lng.toFixed(6);
            console.log('Mapa clicado. Coordenadas:', e.latlng.lat, e.latlng.lng);
        });
    }

    const sidebar = document.getElementById('sidebar');
    
    document.addEventListener('mousemove', (e) => {
        const triggerZone = 50;
        if (e.clientX >= window.innerWidth - triggerZone) {
            sidebar.classList.add('visible');
        } else if (e.clientX < window.innerWidth - sidebar.offsetWidth - triggerZone) {
            sidebar.classList.remove('visible');
        }
    });
});