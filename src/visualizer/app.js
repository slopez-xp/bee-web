// =============================================
// FUNCIÓN PARA CARGAR GRÁFICOS
// =============================================
function loadCharts() {
  fetch('./api/getInspStats.php')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data.error) throw new Error(data.error);
      
      // Gráfico de pastel (saludables vs no saludables)
      renderPieChart(data);
      
      // Si necesitas el gráfico de barras, añádelo aquí:
      // renderBarChart(...);
    })
    .catch(error => {
      console.error("Error al cargar gráficos:", error);
      const pieChartContainer = document.getElementById('pieChart');
      if (pieChartContainer) {
        pieChartContainer.innerHTML = `<p class="error">Error al cargar datos: ${error.message}</p>`;
      }
    });
}

// =============================================
// RENDERIZAR GRÁFICO DE PASTEL
// =============================================
function renderPieChart(data) {
  const ctx = document.getElementById('pieChart')?.getContext('2d');
  if (!ctx) return;

  // Convertir strings a números
  const healthy = Number(data.healthy);
  const unhealthy = Number(data.unhealthy);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Healthy', 'Unhealthy'],
      datasets: [{
        data: [healthy, unhealthy],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = healthy + unhealthy;
              const value = context.raw;
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

async function renderWeatherChart() {
    try {
        const response = await fetch('api/getWeatherStats.php');
        if (!response.ok) throw new Error("Network error");
        const weatherData = await response.json();

        // Mapear los datos de la API a los formatos necesarios
        const labels = weatherData.map(item => item.time);
        const tempData = weatherData.map(item => item.temperature);
        const humidityData = weatherData.map(item => item.humidity);
        const pressureData = weatherData.map(item => item.pressure);

        const ctx = document.getElementById('weatherChart').getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (window.weatherChart instanceof Chart) {
            window.weatherChart.destroy();
        }

        window.weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°F)',
                    data: tempData,
                    borderColor: '#e85d04',
                    backgroundColor: 'rgba(232, 93, 4, 0.1)',
                    borderWidth: 2,
                    tension: 0.4, // Aumentamos la suavidad
                    pointRadius: 0, // Eliminamos puntos
                    pointHoverRadius: 0, // Sin puntos al hover
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: '#1e88e5',
                    backgroundColor: 'rgba(30, 136, 229, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    yAxisID: 'y1'
                },
                {
                    label: 'Pressure (inHg)',
                    data: pressureData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 3],
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        boxWidth: 12, // Hacemos más compacta la leyenda
                        padding: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 30, // Evita rotación excesiva
                        autoSkip: true,
                        maxTicksLimit: 10 // Muestra menos etiquetas
                    }
                },
                y: {
                    position: 'left',
                    title: { display: true, text: '°F' }, // Más corto
                    ticks: { padding: 5 }
                },
                y1: {
                    position: 'right',
                    title: { display: true, text: '%' },
                    grid: { drawOnChartArea: false },
                    min: 0,
                    max: 100,
                    ticks: { padding: 5 }
                },
                y2: { display: false }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    } catch (error) {
        console.error("Error loading weather data:", error);
        const container = document.getElementById('weatherChart').closest('.chart-container');
        if (container) {
            container.innerHTML = `<p class="error">Failed to load weather data: ${error.message}</p>`;
        }
    }
}

// =============================================
// RENDERIZAR HEATMAP VERTICAL CORREGIDO
// =============================================
async function renderVerticalHeatmap(data = null) {
    try {
        // Si no se pasan datos, obtenerlos de la API
        if (!data) {
            const response = await fetch('api/getHeatmapData.php');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            data = await response.json();
        }

        // Verificar que tengamos datos
        if (!data || data.length === 0) {
            throw new Error('No data received for heatmap');
        }

        const canvas = document.getElementById('heatmapChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (window.heatmapChart instanceof Chart) {
            window.heatmapChart.destroy();
        }

        // Procesar datos para el heatmap
        const hours = [...new Set(data.map(item => item.y))].sort();
        const daylightRanges = [...new Set(data.map(item => item.x))].sort();

        // Crear matriz de datos
        const matrixData = [];
        hours.forEach((hour, hourIndex) => {
            daylightRanges.forEach((range, rangeIndex) => {
                const dataPoint = data.find(d => d.y === hour && d.x === range);
                const value = dataPoint ? dataPoint.v : 0;
                
                matrixData.push({
                    x: rangeIndex,
                    y: hourIndex,
                    v: value
                });
            });
        });

        // Configuración del heatmap usando scatter plot
        window.heatmapChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Temperature',
                    data: matrixData,
                    backgroundColor: function(context) {
                        const value = context.parsed.v || 0;
                        return getTempColor(value);
                    },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    pointRadius: function(context) {
                        // Hacer los puntos más grandes para simular celdas
                        const chartArea = context.chart.chartArea;
                        const xSize = (chartArea.right - chartArea.left) / daylightRanges.length;
                        const ySize = (chartArea.bottom - chartArea.top) / hours.length;
                        return Math.min(xSize, ySize) / 2.5;
                    },
                    pointHoverRadius: function(context) {
                        const chartArea = context.chart.chartArea;
                        const xSize = (chartArea.right - chartArea.left) / daylightRanges.length;
                        const ySize = (chartArea.bottom - chartArea.top) / hours.length;
                        return Math.min(xSize, ySize) / 2.3;
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: -0.5,
                        max: daylightRanges.length - 0.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return daylightRanges[Math.round(value)] || '';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Daylight Hours'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        min: -0.5,
                        max: hours.length - 0.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return hours[Math.round(value)] || '';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            generateLabels: function(chart) {
                                // Crear leyenda personalizada para rangos de temperatura
                                const ranges = [
                                    { label: 'Cold (<50°F)', color: '#1e88e5' },
                                    { label: 'Cool (50-65°F)', color: '#4CAF50' },
                                    { label: 'Warm (65-80°F)', color: '#ffba08' },
                                    { label: 'Hot (>80°F)', color: '#e85d04' }
                                ];
                                
                                return ranges.map(range => ({
                                    text: range.label,
                                    fillStyle: range.color,
                                    strokeStyle: range.color,
                                    lineWidth: 0,
                                    pointStyle: 'circle'
                                }));
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const point = context[0];
                                const hour = hours[Math.round(point.parsed.y)];
                                const range = daylightRanges[Math.round(point.parsed.x)];
                                return `${hour} - ${range}`;
                            },
                            label: function(context) {
                                return `Temperature: ${context.parsed.v}°F`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false
                }
            }
        });

    } catch (error) {
        console.error("Error loading heatmap:", error);
        const container = document.getElementById('heatmapChart');
        if (container && container.parentElement) {
            container.parentElement.innerHTML = `<p class="error">Failed to load heatmap data: ${error.message}</p>`;
        }
    }
}

// =============================================
// VERSIÓN ALTERNATIVA CON CANVAS PERSONALIZADO
// =============================================
async function renderCustomVerticalHeatmap(data = null) {
    try {
        // Si no se pasan datos, obtenerlos de la API
        if (!data) {
            const response = await fetch('api/getHeatmapData.php');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            data = await response.json();
        }

        const canvas = document.getElementById('heatmapChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Configurar tamaño del canvas
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 40; // Dejar espacio para labels
        canvas.height = 400;

        // Procesar datos
        const hours = [...new Set(data.map(item => item.y))].sort();
        const daylightRanges = [...new Set(data.map(item => item.x))].sort();

        // Configuraciones
        const cellWidth = (canvas.width - 120) / daylightRanges.length; // 120px para labels
        const cellHeight = (canvas.height - 80) / hours.length; // 80px para labels
        const startX = 80;
        const startY = 20;

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar celdas del heatmap
        hours.forEach((hour, hourIndex) => {
            daylightRanges.forEach((range, rangeIndex) => {
                const dataPoint = data.find(d => d.y === hour && d.x === range);
                const value = dataPoint ? dataPoint.v : 0;

                const x = startX + rangeIndex * cellWidth;
                const y = startY + hourIndex * cellHeight;

                // Dibujar celda
                ctx.fillStyle = getTempColor(value);
                ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);

                // Añadir valor del texto si la celda es lo suficientemente grande
                if (cellWidth > 30 && cellHeight > 20) {
                    ctx.fillStyle = getContrastColor(getTempColor(value));
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        Math.round(value), 
                        x + cellWidth / 2, 
                        y + cellHeight / 2
                    );
                }
            });
        });

        // Dibujar labels del eje Y (horas)
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        hours.forEach((hour, index) => {
            const y = startY + index * cellHeight + cellHeight / 2;
            ctx.fillText(hour, startX - 10, y);
        });

        // Dibujar labels del eje X (rangos de luz)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        daylightRanges.forEach((range, index) => {
            const x = startX + index * cellWidth + cellWidth / 2;
            ctx.fillText(range, x, startY + hours.length * cellHeight + 10);
        });

        // Añadir títulos de los ejes
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Daylight Hours', canvas.width / 2, canvas.height - 20);

        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Hour of Day', 0, 0);
        ctx.restore();

        // Crear leyenda
        createHeatmapLegend();

    } catch (error) {
        console.error("Error loading custom heatmap:", error);
    }
}

// =============================================
// FUNCIONES AUXILIARES MEJORADAS
// =============================================
function getTempColor(value) {
    // Definir rangos de temperatura con colores más apropiados para heatmap
    if (value < 50) return '#1e88e5';      // Azul para frío
    if (value < 65) return '#4CAF50';      // Verde para templado
    if (value < 80) return '#ffba08';      // Amarillo para cálido
    return '#e85d04';                      // Naranja/Rojo para caliente
}

function getContrastColor(hexColor) {
    // Convertir hex a RGB para determinar si usar texto blanco o negro
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

function createHeatmapLegend() {
    // Crear o actualizar la leyenda del heatmap
    let legend = document.getElementById('heatmap-legend');
    if (!legend) {
        legend = document.createElement('div');
        legend.id = 'heatmap-legend';
        legend.style.cssText = `
            display: flex;
            justify-content: center;
            margin-top: 20px;
            gap: 20px;
            flex-wrap: wrap;
        `;
        document.getElementById('heatmapChart').parentElement.appendChild(legend);
    }

    const ranges = [
        { label: 'Cold (<50°F)', color: '#1e88e5' },
        { label: 'Cool (50-65°F)', color: '#4CAF50' },
        { label: 'Warm (65-80°F)', color: '#ffba08' },
        { label: 'Hot (>80°F)', color: '#e85d04' }
    ];

    legend.innerHTML = ranges.map(range => `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; background-color: ${range.color}; border: 1px solid #ccc;"></div>
            <span style="font-size: 14px; color: #333;">${range.label}</span>
        </div>
    `).join('');
}

// =============================================
// FUNCIÓN PRINCIPAL PARA CARGAR HEATMAP
// =============================================
async function loadHeatmapData(days) {
    try {
        const response = await fetch(`api/getHeatmapData.php?days=${days}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Usar la versión personalizada para mejor control
        await renderCustomVerticalHeatmap(data);
        
        // O usar la versión de Chart.js si prefieres:
        // await renderVerticalHeatmap(data);
        
    } catch (error) {
        console.error("Error loading heatmap:", error);
        const container = document.getElementById('heatmapChart');
        if (container && container.parentElement) {
            container.parentElement.innerHTML = `<p class="error">Failed to load heatmap data: ${error.message}</p>`;
        }
    }
}

// =============================================
// SEARCH POPUP HANDLERS
// =============================================
function showPopup(content) {
  document.getElementById('popup-results').innerHTML = content;
  const popup = document.getElementById('popup');
  popup.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  const popup = document.getElementById('popup');
  popup.classList.remove('show');
  document.body.style.overflow = 'auto';
}

function handleSearchSubmit(e) {
  e.preventDefault();
  const formData = new FormData(this);
  fetch('search.php', { method: 'POST', body: formData })
    .then(resp => resp.text())
    .then(html => showPopup(html))
    .catch(err => { console.error(err); alert('Error al procesar la consulta'); });
}

function handleOutsideClick(e) {
  if (e.target === this) {
    closePopup();
  }
}

function formatDate(ms) {
  return new Date(+ms).toISOString().split('T')[0];
}

function isDate(v) {
  // Rechazar números puros o valores muy cortos
  if (!isNaN(parseFloat(v)) && isFinite(v)) return false;
  if (v.length < 4) return false;
  
  // Buscar patrones típicos de fecha
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/,           // MM-DD-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,     // M/D/YYYY
    /^\d{4}\/\d{2}\/\d{2}$/          // YYYY/MM/DD
  ];
  
  const hasDatePattern = datePatterns.some(pattern => pattern.test(v));
  const canParse = !isNaN(Date.parse(v));
  
  return hasDatePattern && canParse;
}

// =============================================
// TABLE LOAD + FILTERS
// =============================================
// Variable global para mantener los filtros activos
let activeFilters = {};

function loadTable(table) {
  // Resetear filtros al cargar nueva tabla
  activeFilters = {};
  
  fetch(`load_table.php?table=${encodeURIComponent(table)}`)
    .then(r => r.text())
    .then(html => {
      document.getElementById('content-area').innerHTML =
        `<div class="table-wrapper">${html}</div>`;
      attachHeaderFilters();
      addFilterStyles(); // Agregar estilos para checkboxes
    })
    .catch(err => {
      console.error('Error loading table:', err);
      document.getElementById('content-area').innerHTML =
        `<p>Error loading data: ${err}</p>`;
    });
}

// Función para agregar estilos CSS dinámicamente
function addFilterStyles() {
  // Verificar si ya existen los estilos
  if (document.getElementById('filter-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'filter-styles';
  style.textContent = `
    .text-filter {
      -webkit-appearance: none; /* Chrome, Safari, Edge */
      -moz-appearance: none;    /* Firefox */
      appearance: none;    
      accent-color: #f48c06;color: white;
      margin-right: 8px;
      width: 16px;
      height: 16px;
      cursor: pointer;
      position: relative; 
      border: 1px solid #ccc;  /* Borde gris por defecto */
      border-radius: 2px; 
      outline: none;   
    }
    
    .text-filter:checked {
      background-color: #f48c06;
      border-color: #f48c06;
    }
    
    .text-filter:checked::after {
      content: "✔"; /* Unicode U+2714 (check más grueso en algunas fuentes) */
      color: white;
      font-size: 12px;
      position: absolute;
      left: 2px;
      top: -1px;
      font-weight: bold; /* Puede funcionar en algunas fuentes */
    }
    
    #filter-content label {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1.4;
    }
    
    #filter-content label:hover {
      background-color: #f8f9fa;
      padding: 4px;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}

function applyAllFilters() {
  const rows = Array.from(document.querySelectorAll('.styled-table tbody tr'));
  
  rows.forEach(row => {
    let shouldShow = true;
    
    // Verificar cada filtro activo
    for (const [colIndex, filter] of Object.entries(activeFilters)) {
      const cellValue = row.cells[colIndex].textContent.trim();
      
      if (filter.type === 'numeric') {
        const num = parseFloat(cellValue);
        if (isNaN(num) || num < filter.min || num > filter.max) {
          shouldShow = false;
          break;
        }
      } else if (filter.type === 'date') {
        const parsed = Date.parse(cellValue);
        if (parsed < filter.min || parsed > filter.max) {
          shouldShow = false;
          break;
        }
      } else if (filter.type === 'text') {
        if (!filter.values.includes(cellValue)) {
          shouldShow = false;
          break;
        }
      }
    }
    
    row.style.display = shouldShow ? '' : 'none';
  });
  
  // Actualizar indicadores visuales
  updateFilterIndicators();
}

function updateFilterIndicators() {
  // Remover indicadores previos
  document.querySelectorAll('.filter-indicator').forEach(el => el.remove());
  
  // Agregar indicadores para columnas con filtros activos
  document.querySelectorAll('.styled-table th').forEach((th, index) => {
    if (activeFilters[index]) {
      const indicator = document.createElement('span');
      indicator.className = 'filter-indicator';
      indicator.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
      indicator.style.cssText = 'margin-left: 5px; color: white; font-size: 12px;';
      th.appendChild(indicator);
    }
  });
  
  // Mostrar/ocultar botón de limpiar todos los filtros
  let clearAllBtn = document.getElementById('clear-all-filters');
  let tableHeader = document.querySelector('.table-header');
  
  if (Object.keys(activeFilters).length > 0) {
    if (!clearAllBtn) {
      // Crear header si no existe
      if (!tableHeader) {
        tableHeader = document.createElement('div');
        tableHeader.className = 'table-header';
        tableHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px;';
        
        // Buscar si hay un título existente (h2, h3, etc.) o crear uno genérico
        const existingTitle = document.querySelector('.table-wrapper h1, .table-wrapper h2, .table-wrapper h3');
        let titleText = 'Tabla de Datos';
        
        if (existingTitle) {
          titleText = existingTitle.textContent;
          existingTitle.remove();
        }
        
        const title = document.createElement('h2');
        title.textContent = titleText;
        title.style.cssText = 'margin: 0; color: #333; font-size: 1.5em;';
        
        tableHeader.appendChild(title);
        document.querySelector('.table-wrapper').prepend(tableHeader);
      }
      
      clearAllBtn = document.createElement('button');
      clearAllBtn.id = 'clear-all-filters';
      clearAllBtn.innerHTML = '<i class="fas fa-undo"></i>';
      clearAllBtn.title = 'Limpiar todos los filtros';
      clearAllBtn.style.cssText = `
        padding: 8px 12px; 
        background: #dc3545; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer; 
        font-size: 16px;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Hover effect
      clearAllBtn.addEventListener('mouseenter', () => {
        clearAllBtn.style.backgroundColor = '#c82333';
      });
      clearAllBtn.addEventListener('mouseleave', () => {
        clearAllBtn.style.backgroundColor = '#dc3545';
      });
      
      clearAllBtn.addEventListener('click', () => {
        activeFilters = {};
        applyAllFilters();
      });
      
      tableHeader.appendChild(clearAllBtn);
    }
  } else if (clearAllBtn) {
    clearAllBtn.remove();
  }
}

// Función para obtener valores visibles únicos en una columna
function getVisibleUniqueValues(colIndex) {
  const visibleRows = Array.from(document.querySelectorAll('.styled-table tbody tr'))
    .filter(row => row.style.display !== 'none');
  
  const values = visibleRows
    .map(r => r.cells[colIndex].textContent.trim())
    .filter(v => v);
  
  return [...new Set(values)];
}

function attachHeaderFilters() {
  const popup = document.getElementById('filter-popup');
  const content = document.getElementById('filter-content');

  document.querySelectorAll('.styled-table th').forEach((th, colIndex) => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', (e) => {
      // Obtener valores únicos de filas visibles en lugar de todas las filas
      const unique = getVisibleUniqueValues(colIndex);
      
      const isDateColumn = unique.every(v => isDate(v));
      const isNumeric = !isDateColumn && unique.every(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num) && v.trim() !== '';
      });

      // Limpiar contenido previo
      content.innerHTML = '';

      // Añadir botones Apply y Clear primero
      content.innerHTML = `
        <div id="filter-controls"></div>
        <div class="filter-actions">
          <button id="clear-filter" class="filter-btn">Clear</button>
          <button id="apply-filter" class="filter-btn primary">Apply</button>
        </div>
      `;

      const controlsDiv = document.getElementById('filter-controls');

      if (isNumeric) {
        const nums = unique.map(Number).sort((a,b) => a-b);
        const min = nums[0], max = nums[nums.length-1];

        controlsDiv.innerHTML = `
          <div id="numeric-slider"></div>
          <div class="range-values">
            <span id="slider-min">${min}</span> – <span id="slider-max">${max}</span>
          </div>
        `;

        // Inicializar slider
        const sliderEl = document.getElementById('numeric-slider');
        if (sliderEl) {
          noUiSlider.create(sliderEl, {
            start: [min, max],
            connect: true,
            tooltips: false,
            range: { min, max },
            format: {
              to: v => Math.round(v),
              from: v => Number(v)
            }
          });

          // Actualizar valores mostrados
          const minSpan = document.getElementById('slider-min');
          const maxSpan = document.getElementById('slider-max');
          
          sliderEl.noUiSlider.on('update', (values) => {
            const [vMin, vMax] = values.map(Number);
            minSpan.textContent = vMin;
            maxSpan.textContent = vMax;
          });

          // Asignar evento Apply
          document.getElementById('apply-filter').addEventListener('click', () => {
            const [start, end] = sliderEl.noUiSlider.get().map(Number);
            
            // Guardar filtro activo
            activeFilters[colIndex] = {
              type: 'numeric',
              min: start,
              max: end
            };
            
            applyAllFilters();
            popup.classList.add('hidden');
          });
        }
      } 
      else if (isDateColumn) {
        const dates = unique.map(d => new Date(d).getTime()).sort((a, b) => a - b);
        const min = dates[0], max = dates[dates.length - 1];

        controlsDiv.innerHTML = `
          <div id="numeric-slider"></div>
          <div class="range-values">
            <span id="slider-min">${formatDate(min)}</span> – <span id="slider-max">${formatDate(max)}</span>
          </div>
        `;

        const sliderEl = document.getElementById('numeric-slider');
        if (sliderEl) {
          noUiSlider.create(sliderEl, {
            start: [min, max],
            connect: true,
            tooltips: [
              {
                to: function(value) {
                  return formatDate(value);
                }
              },
              {
                to: function(value) {
                  return formatDate(value);
                }
              }
            ],
            range: { min, max },
            format: {
              to: v => +v,
              from: v => +v
            }
          });

          const minSpan = document.getElementById('slider-min');
          const maxSpan = document.getElementById('slider-max');

          sliderEl.noUiSlider.on('update', (values) => {
            minSpan.textContent = formatDate(values[0]);
            maxSpan.textContent = formatDate(values[1]);
          });

          document.getElementById('apply-filter').addEventListener('click', () => {
            const [start, end] = sliderEl.noUiSlider.get().map(Number);
            
            // Guardar filtro activo
            activeFilters[colIndex] = {
              type: 'date',
              min: start,
              max: end
            };
            
            applyAllFilters();
            popup.classList.add('hidden');
          });
        }

      } else {
        // Filtro para texto - verificar si hay filtro activo para preseleccionar
        const activeFilter = activeFilters[colIndex];
        const selectedValues = activeFilter && activeFilter.type === 'text' 
          ? activeFilter.values 
          : unique; // Por defecto todos seleccionados
        
        controlsDiv.innerHTML = unique.map(val => {
          const isChecked = selectedValues.includes(val) ? 'checked' : '';
          return `<label><input type="checkbox" class="text-filter" value="${val}" ${isChecked}> ${val}</label>`;
        }).join('');

        // Asignar evento Apply para texto
        document.getElementById('apply-filter').addEventListener('click', () => {
          const checkedValues = Array.from(controlsDiv.querySelectorAll('.text-filter:checked'))
            .map(el => el.value);
          
          // Guardar filtro activo
          activeFilters[colIndex] = {
            type: 'text',
            values: checkedValues
          };
          
          applyAllFilters();
          popup.classList.add('hidden');
        });
      }

      // Evento Clear (compartido)
      document.getElementById('clear-filter').addEventListener('click', () => {
        // Remover este filtro específico
        delete activeFilters[colIndex];
        
        // Aplicar filtros restantes
        applyAllFilters();
        popup.classList.add('hidden');
      });

      // Mostrar popup posicionado cerca del header
      popup.classList.remove('hidden');
      positionPopupNearHeader(popup, th);
    });
  });

  // Cerrar popup al hacer clic fuera
  document.addEventListener('click', handleFilterPopupOutsideClick);
  
  // Cerrar al presionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      popup.classList.add('hidden');
    }
  });
}

// Función mejorada para posicionar el popup cerca del header
function positionPopupNearHeader(popup, headerElement) {
  const headerRect = headerElement.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Posición inicial: debajo del header, centrado
  let left = headerRect.left + (headerRect.width / 2) - (popupRect.width / 2);
  let top = headerRect.bottom + 10; // 10px de separación
  
  // Ajustar si se sale por la derecha
  if (left + popupRect.width > viewportWidth - 20) {
    left = viewportWidth - popupRect.width - 20;
  }
  
  // Ajustar si se sale por la izquierda
  if (left < 20) {
    left = 20;
  }
  
  // Si no hay espacio abajo, posicionar arriba del header
  if (top + popupRect.height > viewportHeight - 20) {
    top = headerRect.top - popupRect.height - 10;
  }
  
  // Si tampoco hay espacio arriba, centrar verticalmente
  if (top < 20) {
    top = (viewportHeight - popupRect.height) / 2;
  }
  
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.position = 'fixed';
}

// Función mejorada para manejar clics fuera del popup de filtros
function handleFilterPopupOutsideClick(e) {
  const popup = document.getElementById('filter-popup');
  if (!popup || popup.classList.contains('hidden')) return;
  
  // Verificar si el clic fue dentro del popup o en un header de tabla
  const isInsidePopup = popup.contains(e.target);
  const isTableHeader = e.target.closest('.styled-table th');
  
  if (!isInsidePopup && !isTableHeader) {
    popup.classList.add('hidden');
  }
}

// Manejo del menú activo
const menuItems = document.querySelectorAll('.menu-item');

function setActiveItem(target) {
    menuItems.forEach(item => {
        item.classList.remove('active');
        if(item.dataset.target === target) {
            item.classList.add('active');
        }
    });
    
    // Solo guarda en localStorage cuando es un click, no al cargar
    if(target !== 'dashboard') {
        localStorage.setItem('activeMenuItem', target);
    }
}

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveItem(this.dataset.target);
        
        // Aquí tu lógica para cargar contenido
        if(this.dataset.target === 'dashboard') {
            // Cargar dashboard
        }
        // ... otros casos
    });
});

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Search form popup
  const searchForm = document.querySelector('form[name="searchForm"]');
  if (searchForm) searchForm.addEventListener('submit', handleSearchSubmit);

  const closeBtn = document.querySelector('.close-popup');
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  const popup = document.getElementById('popup');
  if (popup) popup.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup.classList.contains('show')) {
      closePopup();
    }
  });

  // Sidebar: carga de tablas usando data-target en <li>
  document.querySelectorAll('li.menu-item[data-target] > a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const table = link.parentElement.dataset.target;
      loadTable(table);
    });
  });
  
  // =============================================
  // CARGAR GRÁFICOS SOLO EN EL DASHBOARD
  // =============================================
  const isDashboard = document.querySelector('#content-area h3.main--title')?.textContent.includes('Predicting Honeybee Health');
  if (isDashboard) {
    loadCharts();
  }
  if (document.getElementById('weatherChart')) {
        renderWeatherChart();
    }
      const heatmapRange = document.getElementById('heatmap-range');
    heatmapRange.addEventListener('change', (e) => {
        loadHeatmapData(e.target.value);
    });
    
    // Carga inicial
    loadHeatmapData('30');
});