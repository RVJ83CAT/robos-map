import { CONFIG, sanitizeInput } from './map.js';

/**
 * Alterna la visibilidad de columnas secundarias.
 */
function toggleColumns() {
    const showAllColumns = document.querySelector('.toggle-columns-btn').textContent.includes('Mostrar');
    const secondaryColumns = document.querySelectorAll('.secondary');
    secondaryColumns.forEach(col => {
        col.style.display = showAllColumns ? '' : 'none';
    });
    document.querySelector('.toggle-columns-btn').textContent = showAllColumns ? 'Ocultar Columnas Adicionales' : 'Mostrar Columnas Adicionales';
}

/**
 * Actualiza la tabla con paginación.
 * @param {Array} data - Datos a mostrar.
 * @param {number} page - Página actual.
 */
function updateTable(data, page = 1) {
    const tbody = document.getElementById('casesTableBody');
    tbody.innerHTML = '';
    const start = (page - 1) * CONFIG.PAGE_SIZE;
    const end = start + CONFIG.PAGE_SIZE;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((d, index) => {
        const globalIndex = start + index;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="secondary">${sanitizeInput(d.CLASIFICACION || '')}</td>
            <td class="delito">${sanitizeInput(d.DELITO || '')}</td>
            <td class="fecha">${sanitizeInput(d.FECHA || '')}</td>
            <td class="secondary">${sanitizeInput(d.DIA || '')}</td>
            <td class="hora">${sanitizeInput(d.HORA || '')}</td>
            <td class="secondary">${sanitizeInput(d['RANGO HORA'] || '')}</td>
            <td class="secondary">${sanitizeInput(d.LUGAR || '')}</td>
            <td class="direccion">${sanitizeInput(d.DIRECCION || '')}</td>
            <td class="circunstancias">${sanitizeInput(d.CIRCUNSTANCIAS || '')}</td>
            <td class="secondary">${sanitizeInput(d.CUADRANTE || '')}</td>
            <td class="secondary">${sanitizeInput(d['NUMERO PARTE'] || '')}</td>
            <td class="secondary">${sanitizeInput(d['DIRECCION GEORREF'] || '')}</td>
            <td class="secondary">${sanitizeInput(d.COMUNA || '')}</td>
            <td class="secondary">${sanitizeInput(d.CONCAT || '')}</td>
            <td class="secondary">${d.LATITUD !== undefined ? d.LATITUD : ''}</td>
            <td class="secondary">${d.LONGITUD !== undefined ? d.LONGITUD : ''}</td>
            <td><button class="edit-btn" onclick="editMarker(${globalIndex})">Editar</button></td>
        `;
        row.onclick = () => {
            document.querySelectorAll('#casesTableBody tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        };
        tbody.appendChild(row);
    });

    // Actualizar controles de paginación
    const totalPages = Math.ceil(data.length / CONFIG.PAGE_SIZE);
    document.getElementById('pageInfo').textContent = `Página ${page} de ${totalPages}`;
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page === totalPages || totalPages === 0;
}

/**
 * Cambia la página de la tabla.
 * @param {number} delta - Dirección del cambio (-1 para anterior, 1 para siguiente).
 * @param {Array} data - Datos de la tabla.
 */
function changePage(delta, data) {
    const currentPage = parseInt(document.getElementById('pageInfo').textContent.match(/\d+/)[0]);
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= Math.ceil(data.length / CONFIG.PAGE_SIZE)) {
        updateTable(data, newPage);
    }
}

export { toggleColumns, updateTable, changePage };