const CONFIG = {
    DEFAULT_CENTER: [-36.8400, -73.1100],
    DEFAULT_ZOOM: 11,
    PAGE_SIZE: 50,
    EXPECTED_COLUMNS: [
        'CLASIFICACION', 'DELITO', 'FECHA', 'DIA', 'HORA', 'RANGO HORA', 'LUGAR',
        'DIRECCION', 'CIRCUNSTANCIAS', 'CUADRANTE', 'NUMERO PARTE', 'DIRECCION GEORREF',
        'COMUNA', 'CONCAT', 'LATITUD', 'LONGITUD'
    ]
};

let markers = [];
let allData = [];
let map = null;
let currentLayer = null;

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
    if (!map) {
        console.warn('Mapa no inicializado, no se puede cambiar el proveedor.');
        return;
    }
    const provider = document.getElementById('mapProvider').value;
    const providers = {
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
    if (providers[provider]) {
        map.removeLayer(currentLayer);
        currentLayer = providers[provider].addTo(map);
        map.invalidateSize();
        console.log('Proveedor de mapa cambiado a:', provider);
    } else {
        logError('Proveedor de mapa no válido: ' + provider);
    }
}

function sanitizeInput(input) {
    if (input === null || input === undefined || input === '') return '';
    return String(input).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '');
}

function addOrUpdateMarker(data, index = null, saveFile = true) {
    if (!map) {
        console.warn('Mapa no inicializado, no se puede añadir marcador.');
        return;
    }
    if (index !== null && markers[index]?.marker) {
        map.removeLayer(markers[index].marker);
    }

    data.LATITUD = parseFloat(data.LATITUD) || 0;
    data.LONGITUD = parseFloat(data.LONGITUD) || 0;
    if (data.LATITUD < -90 || data.LATITUD > 90 || data.LONGITUD < -180 || data.LONGITUD > 180) {
        data.LATITUD = 0;
        data.LONGITUD = 0;
    }

    let marker = null;
    if (data.LATITUD !== 0 && data.LONGITUD !== 0 && !isNaN(data.LATITUD) && !isNaN(data.LONGITUD)) {
        const icon = L.icon({
            iconUrl: data.DELITO && delitoIcons[data.DELITO] ? delitoIcons[data.DELITO].options.iconUrl : './iconos/default.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        marker = L.marker([data.LATITUD, data.LONGITUD], { icon }).addTo(map);

        // Update number label based on filtered index
        const numberLabel = L.divIcon({
            className: 'number-label',
            html: `<span>${index !== null ? index + 1 : markers.length + 1}</span>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        L.marker([data.LATITUD, data.LONGITUD], { icon: numberLabel }).addTo(map);

        // Update time label with smaller size and reduced box
        const timeLabel = L.divIcon({
            className: 'time-label',
            html: `<span>${sanitizeInput(data.HORA)}</span>`,
            iconSize: [30, 15], // Reduced size
            iconAnchor: [15, -5] // Adjusted anchor
        });
        L.marker([data.LATITUD, data.LONGITUD], { icon: timeLabel }).addTo(map);

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
        markers[index] = marker ? { marker, data } : { data };
        allData[index] = data;
    } else {
        markers.push(marker ? { marker, data } : { data });
        allData.push(data);
    }

    updateTable(allData);
    if (saveFile) saveToXLSX();
}

const delitoIcons = {
    'ROBO EN LUGAR HABITADO': { options: { iconUrl: './iconos/ico-robo-lugar-habitado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO EN LUGAR NO HABITADO': { options: { iconUrl: './iconos/ico-robo-lugar-no-habitado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO DE ACCESORIOS DE VEHICULOS': { options: { iconUrl: './iconos/ico-robo-accesorios-especies-interior-vehiculo.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO DE VEHICULO MOTORIZADO': { options: { iconUrl: './iconos/ico-robo-vehiculo-motorizado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO POR SORPRESA': { options: { iconUrl: './iconos/ico-robo-sorpresa.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO EN BIENES NACIONALES': { options: { iconUrl: './iconos/ico-robo-bienes-nacionales-uso-publico.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO CON INTIMIDACION': { options: { iconUrl: './iconos/ico-robo-intimidacion.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO FRUSTRADO': { options: { iconUrl: './iconos/ico-robo-frustrado.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO CON VIOLENCIA': { options: { iconUrl: './iconos/ico-robo-violencia.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'APROPIACION DE CABLES DE TENDIDO ELECTRICO': { options: { iconUrl: './iconos/ico_robo_cable_tendido_electrico.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'ROBO VIOLENTO DE VEHICULO': { options: { iconUrl: './iconos/ico_robo_vehiculo_sorpresa_violencia_int.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'HURTO': { options: { iconUrl: './iconos/hurto.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } },
    'default': { options: { iconUrl: './iconos/default.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] } }
};

function normalizeColumnName(name) {
    if (!name) return '';
    return name.toString().trim().toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ');
}

function normalizeTime(timeStr) {
    if (!timeStr) return '';
    timeStr = timeStr.toString().trim();
    try {
        if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        } else if (/^\d{3,4}$/.test(timeStr)) {
            const hours = parseInt(timeStr.slice(0, -2));
            const minutes = parseInt(timeStr.slice(-2));
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        }
        if (!isNaN(timeStr) && timeStr !== '') {
            const totalMinutes = Math.round(parseFloat(timeStr) * 24 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        }
    } catch (err) {
        console.warn('Error al normalizar hora:', timeStr, err);
    }
    return '';
}

function normalizeDate(dateStr) {
    if (!dateStr) return '';
    dateStr = dateStr.toString().trim();
    try {
        const regexCommon = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/;
        const regexISO = /^(\d{4})-(\d{2})-(\d{2})$/;
        let day, month, year;

        if (regexCommon.test(dateStr)) {
            const match = dateStr.match(regexCommon);
            day = parseInt(match[1]);
            month = parseInt(match[2]);
            year = parseInt(match[3]);
            year = year < 100 ? year + 2000 : year;
        } else if (regexISO.test(dateStr)) {
            const match = dateStr.match(regexISO);
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
        } else if (!isNaN(dateStr) && dateStr !== '') {
            const serial = parseFloat(dateStr);
            if (serial > 0) {
                const baseDate = new Date(Date.UTC(1899, 11, 30));
                const milliseconds = Math.round(serial * 24 * 60 * 60 * 1000);
                const date = new Date(baseDate.getTime() + milliseconds);
                day = date.getUTCDate();
                month = date.getUTCMonth() + 1;
                year = date.getUTCFullYear();
            }
        }

        if (day && month && year) {
            const date = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(date) && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
                return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
            }
        }
    } catch (err) {
        console.warn('Error al normalizar fecha:', dateStr, err);
    }
    return '';
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(Date.UTC(year, month - 1, day));
}

function isRowEmpty(row) {
    return row.every(cell => cell === '' || cell === null || cell === undefined);
}

function logError(message) {
    console.error(message);
    document.getElementById('errorMessage').textContent = message;
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

function populateFilterOptions() {
    const delitoFilter = document.getElementById('delitoFilter');
    const rangoHoraFilter = document.getElementById('rangoHoraFilter');
    const cuadranteFilter = document.getElementById('cuadranteFilter');

    // Limpiar opciones existentes, excepto la opción "Todos"
    delitoFilter.innerHTML = '<option value="">Todos</option>';
    rangoHoraFilter.innerHTML = '<option value="">Todos</option>';
    cuadranteFilter.innerHTML = '<option value="">Todos</option>';

    // Obtener valores únicos
    const delitos = [...new Set(allData.map(d => d['DELITO']).filter(d => d))].sort();
    const rangosHora = [...new Set(allData.map(d => d['RANGO HORA']).filter(r => r))].sort();
    const cuadrantes = [...new Set(allData.map(d => d['CUADRANTE']).filter(c => c))].sort();

    // Poblar delitoFilter
    delitos.forEach(delito => {
        const option = document.createElement('option');
        option.value = delito;
        option.textContent = delito;
        delitoFilter.appendChild(option);
    });

    // Poblar rangoHoraFilter
    rangosHora.forEach(rango => {
        const option = document.createElement('option');
        option.value = rango;
        option.textContent = rango;
        rangoHoraFilter.appendChild(option);
    });

    // Poblar cuadranteFilter
    cuadrantes.forEach(cuadrante => {
        const option = document.createElement('option');
        option.value = cuadrante;
        option.textContent = cuadrante;
        cuadranteFilter.appendChild(option);
    });

    console.log('Filtros poblados:', { delitos, rangosHora, cuadrantes });
}

function updateTable(data, page = 1) {
    console.log('Actualizando tabla con datos:', data);
    const tbody = document.getElementById('casesTableBody');
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13">No hay datos para mostrar</td></tr>';
        document.getElementById('pageInfo').textContent = 'Página 1 de 1';
        document.getElementById('prevPage').disabled = true;
        document.getElementById('nextPage').disabled = true;
        console.log('No hay datos para mostrar en la tabla.');
        return;
    }

    const start = (page - 1) * CONFIG.PAGE_SIZE;
    const end = Math.min(start + CONFIG.PAGE_SIZE, data.length);
    const paginatedData = data.slice(start, end);
    console.log('Datos paginados para la página', page, ':', paginatedData);

    const violentos = ['ROBO CON VIOLENCIA', 'ROBO CON INTIMIDACION', 'ROBO POR SORPRESA', 'ROBO VIOLENTO DE VEHICULO'];
    const propiedad = ['ROBO EN LUGAR HABITADO', 'ROBO EN LUGAR NO HABITADO', 'ROBO DE ACCESORIOS DE VEHICULOS', 'ROBO DE VEHICULO MOTORIZADO', 'ROBO EN BIENES NACIONALES'];
    const frustrado = ['ROBO FRUSTRADO'];

    paginatedData.forEach((d, index) => {
        const globalIndex = start + index;
        let colorClass = '';
        if (violentos.includes(d['DELITO'])) {
            colorClass = 'numero-violento';
        } else if (propiedad.includes(d['DELITO'])) {
            colorClass = 'numero-propiedad';
        } else if (frustrado.includes(d['DELITO'])) {
            colorClass = 'numero-frustrado';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="numero ${colorClass}">${globalIndex + 1}</td>
            <td class="clasificacion">${sanitizeInput(d['CLASIFICACION'])}</td>
            <td class="delito">${sanitizeInput(d['DELITO'])}</td>
            <td class="fecha">${sanitizeInput(d['FECHA'])}</td>
            <td class="dia">${sanitizeInput(d['DIA'])}</td>
            <td class="hora">${sanitizeInput(d['HORA'])}</td>
            <td class="rango-hora">${sanitizeInput(d['RANGO HORA'])}</td>
            <td class="lugar">${sanitizeInput(d['LUGAR'])}</td>
            <td class="direccion">${sanitizeInput(d['DIRECCION'])}</td>
            <td class="circunstancias">${sanitizeInput(d['CIRCUNSTANCIAS'])}</td>
            <td class="cuadrante">${sanitizeInput(d['CUADRANTE'])}</td>
            <td class="numero-parte">${sanitizeInput(d['NUMERO PARTE'])}</td>
            <td class="accion"><button class="edit-btn" onclick="editMarker(${globalIndex})">Editar</button></td>
        `;
        row.onclick = () => {
            document.querySelectorAll('#casesTableBody tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        };
        tbody.appendChild(row);
    });

    const totalPages = Math.ceil(data.length / CONFIG.PAGE_SIZE);
    document.getElementById('pageInfo').textContent = `Página ${page} de ${totalPages}`;
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page === totalPages || totalPages === 0;
    console.log('Tabla actualizada: Página', page, 'de', totalPages);
}

function changePage(delta) {
    const currentPage = parseInt(document.getElementById('pageInfo').textContent.match(/\d+/)[0]);
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= Math.ceil(allData.length / CONFIG.PAGE_SIZE)) {
        updateTable(allData, newPage);
    }
}

function editMarker(index) {
    const data = markers[index].data;
    document.getElementById('editIndex').value = index;
    document.getElementById('lat').value = data.LATITUD !== undefined ? data.LATITUD : '';
    document.getElementById('lng').value = data.LONGITUD !== undefined ? data.LONGITUD : '';
}

function saveToXLSX() {
    try {
        const wb = XLSX.utils.book_new();
        const wsData = [CONFIG.EXPECTED_COLUMNS];
        allData.forEach(d => {
            const row = CONFIG.EXPECTED_COLUMNS.map(col => d[col] !== undefined ? d[col] : '');
            wsData.push(row);
        });
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Delitos');
        XLSX.writeFile(wb, 'delitos.xlsx');
        console.log('Archivo XLSX guardado correctamente.');
    } catch (err) {
        logError('Error al guardar delitos.xlsx: ' + err.message);
        console.error('Error en saveToXLSX:', err);
    }
}

function downloadCSV() {
    try {
        if (!confirm('¿Descargar todos los datos como CSV?')) return;
        let csv = CONFIG.EXPECTED_COLUMNS.join(',') + '\n';
        allData.forEach(d => {
            const row = CONFIG.EXPECTED_COLUMNS.map(col => {
                const value = d[col] !== undefined ? d[col] : '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csv += row.join(',') + '\n';
        });
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "delitos.csv");
        downloadAnchor.click();
        console.log('CSV descargado correctamente.');
    } catch (err) {
        logError('Error al descargar CSV: ' + err.message);
        console.error('Error en downloadCSV:', err);
    }
}

function processExcelFile(file) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
    console.log('Procesando archivo:', file ? file.name : 'Ningún archivo seleccionado');

    if (!file) {
        errorMessage.textContent = 'Por favor, seleccione un archivo.';
        return;
    }
    if (!file.name.endsWith('.xlsx')) {
        errorMessage.textContent = 'Solo se permiten archivos .xlsx';
        return;
    }

    showLoading(true);
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            console.log('Leyendo contenido del archivo...');
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

            if (rows.length < 1) {
                throw new Error('El archivo está vacío');
            }

            console.log('Filas leídas del Excel:', rows);
            const headers = rows[0].slice(0, CONFIG.EXPECTED_COLUMNS.length).map(normalizeColumnName);
            const expectedNormalized = CONFIG.EXPECTED_COLUMNS.map(normalizeColumnName);
            console.log('Encabezados detectados:', headers);
            console.log('Encabezados esperados:', expectedNormalized);

            markers.forEach(m => m.marker && map.removeLayer(m.marker));
            markers = [];
            allData = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].slice(0, CONFIG.EXPECTED_COLUMNS.length);
                if (!isRowEmpty(row)) {
                    const data = {};
                    CONFIG.EXPECTED_COLUMNS.forEach((header, index) => {
                        try {
                            if (header === 'HORA') {
                                data[header] = normalizeTime(row[index]);
                            } else if (header === 'FECHA') {
                                console.log(`Procesando FECHA para fila ${i}:`, row[index]);
                                data[header] = normalizeDate(row[index]);
                                console.log(`FECHA normalizada para fila ${i}:`, data[header]);
                            } else {
                                data[header] = row[index] !== undefined ? row[index].toString() : '';
                            }
                        } catch (err) {
                            data[header] = '';
                            console.warn(`Error procesando columna ${header} en fila ${i}:`, err);
                        }
                    });
                    addOrUpdateMarker(data, null, false);
                }
            }

            // Poblar las opciones de los filtros después de cargar los datos
            populateFilterOptions();

            errorMessage.textContent = allData.length === 0 ?
                'No se encontraron datos válidos en el archivo.' :
                `Cargados ${allData.length} casos exitosamente.`;
            if (map) map.invalidateSize();
            console.log('Procesamiento completado. Datos cargados:', allData.length);
        } catch (err) {
            logError('Error al procesar el archivo: ' + err.message);
            console.error('Error en processExcelFile:', err);
        } finally {
            showLoading(false);
        }
    };
    reader.onerror = function() {
        logError('Error al leer el archivo. Verifique que el archivo sea válido y no esté corrupto.');
        console.error('Error en FileReader');
        showLoading(false);
    };
    reader.readAsArrayBuffer(file);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando aplicación...');
    if (!initMap()) {
        document.getElementById('map-loading').textContent = 'Error al cargar el mapa.';
        console.warn('Mapa no inicializado.');
        return;
    }

    document.getElementById('fileInput').addEventListener('change', function(e) {
        console.log('Archivo seleccionado:', e.target.files[0]);
        processExcelFile(e.target.files[0]);
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
        e.preventDefault();
        const startDateStr = document.getElementById('startDate').value;
        const endDateStr = document.getElementById('endDate').value;
        const delitoFilter = document.getElementById('delitoFilter').value;
        const rangoHoraFilter = document.getElementById('rangoHoraFilter').value;
        const cuadranteFilter = document.getElementById('cuadranteFilter').value;

        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        if (startDateStr && endDateStr && startDate > endDate) {
            alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
            return;
        }

        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        markers.forEach(m => m.marker && map.removeLayer(m.marker));
        markers = [];

        const filteredData = allData.filter((data, index) => {
            // Filtro por fecha
            const dataDate = parseDate(data.FECHA);
            const dateInRange = (!startDate || !dataDate || dataDate >= startDate) && (!endDate || !dataDate || dataDate <= endDate);

            // Filtro por delito
            const delitoMatch = !delitoFilter || data['DELITO'] === delitoFilter;

            // Filtro por rango horario
            const rangoHoraMatch = !rangoHoraFilter || data['RANGO HORA'] === rangoHoraFilter;

            // Filtro por cuadrante
            const cuadranteMatch = !cuadranteFilter || data['CUADRANTE'] === cuadranteFilter;

            // Combinar todos los filtros
            const show = dateInRange && delitoMatch && rangoHoraMatch && cuadranteMatch;

            if (show) {
                addOrUpdateMarker(data, index, false); // Use the original index for numbering
                return true;
            }
            return false;
        });

        updateTable(filteredData);
        document.getElementById('errorMessage').textContent = filteredData.length === 0 ?
            'No hay casos que coincidan con los filtros seleccionados.' :
            `Mostrando ${filteredData.length} casos.`;
        if (map) map.invalidateSize();
        console.log('Filtro aplicado. Datos filtrados:', filteredData.length);
    });

    window.resetFilter = function() {
        document.getElementById('filterForm').reset();
        markers.forEach(m => m.marker && map.removeLayer(m.marker));
        markers = [];
        allData.forEach((data, index) => addOrUpdateMarker(data, index, false));
        updateTable(allData);
        document.getElementById('errorMessage').textContent = `Cargados ${allData.length} casos exitosamente.`;
        if (map) map.invalidateSize();
        console.log('Filtro restablecido. Mostrando todos los datos:', allData.length);
    };

    if (map) {
        map.on('click', function(e) {
            document.getElementById('lat').value = e.latlng.lat.toFixed(6);
            document.getElementById('lng').value = e.latlng.lng.toFixed(6);
            console.log('Mapa clicado. Coordenadas:', e.latlng.lat, e.latlng.lng);
        });
    }
});