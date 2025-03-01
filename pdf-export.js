// pdf-export.js - Script para exportar la matriz de consistencia a PDF

// Importamos jsPDF y html2canvas mediante CDN en el HTML
// No los importamos aquí porque se cargarán como scripts globales

document.addEventListener('DOMContentLoaded', function() {
    // Agregar botón de exportación después del botón generar
    const inputContainer = document.querySelector('.input-container');
    const exportButton = document.createElement('button');
    exportButton.id = 'exportPdfButton';
    exportButton.textContent = 'Exportar a PDF';
    exportButton.style.display = 'none'; // Inicialmente oculto
    exportButton.classList.add('export-button');
    inputContainer.appendChild(exportButton);

    // Evento para exportar a PDF
    exportButton.addEventListener('click', exportToPdf);
});

// Función para mostrar el botón de exportación cuando hay una matriz generada
function showExportButton() {
    const exportButton = document.getElementById('exportPdfButton');
    if (exportButton) {
        exportButton.style.display = 'inline-block';
    }
}

// Función para ocultar el botón de exportación
function hideExportButton() {
    const exportButton = document.getElementById('exportPdfButton');
    if (exportButton) {
        exportButton.style.display = 'none';
    }
}

// Función para exportar el contenido a PDF
async function exportToPdf() {
    const matrixContainer = document.getElementById('matrixContainer');
    const researchTopic = document.getElementById('researchTopic').value;
    const loadingElement = document.getElementById('loading');
    
    if (!matrixContainer.innerHTML.trim()) {
        alert('No hay matriz para exportar. Por favor, genera una matriz primero.');
        return;
    }
    
    // Mostrar indicador de carga
    loadingElement.style.display = 'flex';
    loadingElement.querySelector('p').textContent = 'Generando PDF...';
    
    try {
        // Crear un elemento temporal para el PDF sin afectar el diseño original
        const tempElement = document.createElement('div');
        tempElement.innerHTML = matrixContainer.innerHTML;
        tempElement.classList.add('pdf-container');
        document.body.appendChild(tempElement);
        
        // Aplicar estilos específicos para PDF
        stylePdfContent(tempElement);
        
        // Añadir un título y encabezado al PDF
        const header = document.createElement('div');
        header.classList.add('pdf-header');
        header.innerHTML = `
            <h1>Matriz de Consistencia</h1>
            <h2>Tema: ${researchTopic}</h2>
            <p>Generado el: ${new Date().toLocaleDateString()}</p>
        `;
        tempElement.prepend(header);
        
        // Capturar el elemento como imagen usando html2canvas
        const canvas = await html2canvas(tempElement, {
            scale: 2, // Mayor calidad
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Determinar dimensiones del PDF
        // Usar orientación landscape si el contenido es más ancho que alto
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
        const pdf = new jspdf.jsPDF(orientation, 'mm', 'a4');
        let position = 0;
        
        // Añadir la primera página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Añadir páginas adicionales si es necesario
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Guardar el PDF
        pdf.save(`Matriz_Consistencia_${researchTopic.replace(/\s+/g, '_')}.pdf`);
        
        // Remover el elemento temporal
        document.body.removeChild(tempElement);
        
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Error al generar el PDF: " + error.message);
    } finally {
        // Restaurar texto de carga y ocultar indicador
        loadingElement.querySelector('p').textContent = 'Generando matriz...';
        loadingElement.style.display = 'none';
    }
}

// Función para aplicar estilos específicos al contenido del PDF
function stylePdfContent(element) {
    // Aplicar estilos para el PDF
    element.style.padding = '20px';
    element.style.fontSize = '10pt';
    
    // Estilos para las secciones
    const sections = element.querySelectorAll('.matrix-section');
    sections.forEach(section => {
        section.style.marginBottom = '20px';
        section.style.pageBreakInside = 'avoid';
        section.style.width = '100%';
    });
    
    // Estilos para las tablas
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '15px';
    });
    
    // Estilos para los encabezados de tabla y celdas
    const thElements = element.querySelectorAll('th');
    thElements.forEach(th => {
        th.style.backgroundColor = '#f2f2f2';
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.fontWeight = 'bold';
    });
    
    const tdElements = element.querySelectorAll('td');
    tdElements.forEach(td => {
        td.style.border = '1px solid #ddd';
        td.style.padding = '8px';
    });
    
    // Estilos para los encabezados
    const headers = element.querySelectorAll('h2');
    headers.forEach(header => {
        header.style.color = '#333';
        header.style.borderBottom = '2px solid #333';
        header.style.paddingBottom = '5px';
        header.style.marginBottom = '10px';
    });
    
    // Estilos para las listas
    const lists = element.querySelectorAll('ul');
    lists.forEach(list => {
        list.style.margin = '0';
        list.style.paddingLeft = '20px';
    });
}