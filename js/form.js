import { normalizeDate, normalizeTime, parseDate, isRowEmpty, logError } from './script.js';
import { addOrUpdateMarker, sanitizeInput, CONFIG } from './map.js';
import { updateTable } from './table.js';

/**
 * Valida la fecha en tiempo real.
 */
function validateDateInput() {
    const fechaInput = document.getElementById('fecha');
    const fechaError = document.getElementById('fechaError');
    const value = fechaInput.value;
    if (value && !/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        fechaError.textContent = 'Formato: DD-MM-YYYY';
        fechaInput.setCustomValidity('Formato inválido');
    } else if (value && !normalizeDate(value)) {
        fechaError.textContent = 'Fecha inválida';
        fechaInput.setCustomValidity('Fecha inválida');
    } else {
        fechaError.textContent = '';
        fechaInput.setCustomValidity('');
    }
}

/**
 * Valida la hora en tiempo real.
 */
function validateTimeInput() {
    const horaInput = document.getElementById('hora');
    const horaError = document.getElementById('horaError');
    const value = horaInput.value;
    if (value && !/^\d{2}:\d{2}$/.test(value)) {
        horaError.textContent = 'Formato: HH:MM';
        horaInput.setCustomValidity('Formato inválido');
    } else if (value && !normalizeTime(value)) {
        horaError.textContent = 'Hora inválida (00:00-23:59)';
        horaInput.setCustomValidity('Hora inválida');
    } else {
        horaError.textContent = '';
        horaInput.setCustomValidity('');
    }
}

/**
 * Carga datos en el formulario para edición.
 * @param {number} index - Índice del marcador.
 * @param {Array} markers - Lista de marcadores.
 */
function editMarker(index, markers) {
    const data = markers[index].data;
    document.getElementById('editIndex').value = index;
    document.getElementById('clasificacion').value = sanitizeInput(data.CLASIFICACION || '');
    document.getElementById('delito').value = sanitizeInput(data.DELITO || '');
    document.getElementById('fecha').value = sanitizeInput(data.FECHA || '');
    document.getElementById('dia').value = sanitizeInput(data.DIA || '');
    document.getElementById('hora').value = sanitizeInput(data.HORA || '');
    document.getElementById('rango_hora').value = sanitizeInput(data['RANGO HORA'] || '');
    document.getElementById('lugar').value = sanitizeInput(data.LUGAR || '');
    document.getElementById('direccion').value = sanitizeInput(data.DIRECCION || '');
    document.getElementById('circunstancias').value = sanitizeInput(data.CIRCUNSTANCIAS || '');
    document.getElementById('cuadrante').value = sanitizeInput(data.CUADRANTE || '');
    document.getElementById('numero_parte').value = sanitizeInput(data['NUMERO PARTE'] || '');
    document.getElementById('direccion_georref').value = sanitizeInput(data['DIRECCION GEORREF'] || '');
    document.getElementById('comuna').value = sanitizeInput(data.COMUNA || '');
    document.getElementById('concat').value = sanitizeInput(data.CONCAT || '');
    document.getElementById('lat').value = data.LATITUD !== undefined ? data.LATITUD : '';
    document.getElementById('lng').value = data.LONGITUD !== undefined ? data.LONGITUD : '';
}

/**
 * Procesa el archivo Excel cargado.
 * @param {File} file - Archivo Excel.
 * @param {Object} map - Instancia del mapa.
 * @param {Object} markerCluster - Grupo de marcadores.
 * @param {Array} markers - Lista de marcadores.
 * @param {Array} allData - Datos completos.
 */
function processExcelFile(file, map, markerCluster, markers, allData) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';

    if (!file.name.endsWith('.xlsx')) {
        errorMessage.textContent = 'Solo se permiten archivos .xlsx';
        return;
    }

    if (typeof XLSX === 'undefined') {
        errorMessage.textContent = 'Error: No se pudo cargar la biblioteca de Excel.';
        return;
    }

    showLoading(true);
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

            if (rows.length < 1) {
                throw new Error('El archivo está vacío');
            }

            const headers = rows[0].slice(0, 16).map(normalizeColumnName);
            const expectedNormalized = CONFIG.EXPECTED_COLUMNS.map(normalizeColumnName);
            const matchingColumns = headers.filter((h, i) => {
                if (i >= expectedNormalized.length) return false;
                const header = h.replace(/\s/g, '');
                const expected = expectedNormalized[i].replace(/\s/g, '');
                return header.includes(expected) || expected.includes(header);
            }).length;

            if (matchingColumns < 3) {
                throw new Error(`Las columnas no coinciden. Esperadas: ${CONFIG.EXPECTED_COLUMNS.join(', ')}`);
            }

            // Limpiar datos existentes
            markerCluster.clearLayers();
            markers.length = 0;
            allData.length = 0;

            // Procesar filas
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].slice(0, 16);
                if (!isRowEmpty(row)) {
                    const data = {};
                    CONFIG.EXPECTED_COLUMNS.forEach((header, index) => {
                        try {
                            if (header === 'HORA') {
                                data[header] = normalizeTime(row[index]);
                            } else if (header === 'FECHA') {
                                data[header] = normalizeDate(row[index]);
                            } else {
                                data[header] = row[index] !== undefined ? row[index].toString() : '';
                            }
                        } catch (err) {
                            data[header] = '';
                        }
                    });
                    const marker = addOrUpdateMarker(data, null, map, markerCluster, markers);
                    markers.push(marker ? { marker, data } : { data });
                    allData.push(data);
                }
            }

            updateTable(allData);
            errorMessage.textContent = `Cargados ${allData.length} casos exitosamente.`;
            map.invalidateSize();
        } catch (err) {
            logError('Error al procesar el archivo: ' + err.message, err);
        } finally {
            showLoading(false);
        }
    };
    reader.onerror = function(err) {
        logError('Error al leer el archivo: ' + err.message, err);
        showLoading(false);
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Muestra u oculta el spinner de carga.
 * @param {boolean} show - Mostrar u ocultar.
 */
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

export { validateDateInput, validateTimeInput, editMarker, processExcelFile, showLoading };