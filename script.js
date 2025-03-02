import { GoogleGenerativeAI } from "@google/generative-ai";

// Clave de API para Google Gemini
const API_KEY = 'AIzaSyCkkFMdW8C7IJ7uSgR4oKLvGuf1ajxDUk0';
const genAI = new GoogleGenerativeAI(API_KEY);

document.getElementById('generateButton').addEventListener('click', async () => {
    const researchTopic = document.getElementById('researchTopic').value;
    const matrixContainer = document.getElementById('matrixContainer');
    const loadingElement = document.getElementById('loading');

    if (researchTopic.trim() === "") {
        alert("Por favor, introduce un tema de investigación");
        return;
    }

    // Mostrar indicador de carga
    loadingElement.style.display = 'flex';
    matrixContainer.innerHTML = '';

    try {
        // Realizar la llamada real a la API de Gemini
        const matrix = await generateMatrixWithGemini(researchTopic);
        
        // Generar y mostrar la matriz HTML
        matrixContainer.innerHTML = generateStructuredMatrixHTML(matrix);
        // Mostrar botón de exportación después de generar la matriz
        if (typeof showExportButton === 'function') {
            showExportButton();
        }
    } catch (error) {
        console.error("Error al generar la matriz:", error);
        matrixContainer.innerHTML = `<p class="error">Error al generar la matriz: ${error.message}</p>`;
    } finally {
        // Ocultar indicador de carga
        loadingElement.style.display = 'none';
    }
});

// Función para generar la matriz usando la API de Gemini
async function generateMatrixWithGemini(topic) {
    // Inicializar el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Genera una matriz de consistencia  y completa para una investigación académica sobre "${topic}".
    Estructura tu respuesta en formato JSON con la siguiente estructura:
    {
        "problema": {
            "general": "Problema general de investigación",
            "especificos": ["Problema específico 1", "Problema específico 2", "..."]
        },
        "objetivo": {
            "general": "Objetivo general de la investigación",
            "especificos": ["Objetivo específico 1", "Objetivo específico 2", "..."]
        },
        "hipotesis": {
            "general": "Hipótesis general",
            "especificas": ["Hipótesis específica 1", "Hipótesis específica 2", "..."]
        },
        "marcoTeorico": ["Elemento 1", "Elemento 2", "Elemento 3", "..."],
        "variables": {
            "independiente": {
                "nombre": "Nombre de la variable independiente",
                "dimensiones": ["Dimensión 1", "Dimensión 2", "..."],
                "indicadores": ["Indicador 1", "Indicador 2", "..."]
            },
            "dependiente": {
                "nombre": "Nombre de la variable dependiente",
                "dimensiones": ["Dimensión 1", "Dimensión 2", "..."],
                "indicadores": ["Indicador 1", "Indicador 2", "..."]
            },
            "adicionales": [
                {
                    "nombre": "Nombre de variable adicional (si aplica)",
                    "dimensiones": ["Dimensión 1", "..."],
                    "indicadores": ["Indicador 1", "..."]
                }
            ]
        },
        "disenoMetodologico": {
            "tipo": "Tipo de investigación",
            "enfoque": "Enfoque de investigación",
            "poblacion": "Descripción de la población",
            "muestra": "Descripción de la muestra",
            "tecnicas": ["Técnica 1", "Técnica 2", "..."],
            "instrumentos": ["Instrumento 1", "Instrumento 2", "..."]
        }
    }
    
    Asegúrate de que todas las partes de la matriz sean coherentes entre sí y estén relacionadas directamente con el tema de investigación. 
    IMPORTANTE: Incluye tantos elementos específicos (problemas específicos, objetivos específicos, hipótesis específicas, dimensiones, indicadores, etc.) como sean necesarios según el tema de investigación. No te limites a un número fijo.
    Si el tema requiere variables adicionales (intervinientes, moderadoras, etc.), inclúyelas en el array "adicionales". Si no, deja el array vacío.
    Responde SOLAMENTE con el JSON, sin texto adicional.
    `;

    try {
        // Generar contenido usando el modelo
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textContent = response.text();
        
        // Buscar el inicio y fin de la estructura JSON en la respuesta
        let jsonStartIndex = textContent.indexOf('{');
        let jsonEndIndex = textContent.lastIndexOf('}') + 1;
        
        if (jsonStartIndex === -1 || jsonEndIndex === 0) {
            throw new Error("No se pudo encontrar una estructura JSON válida en la respuesta");
        }
        
        // Extraer y parsear el JSON
        const jsonContent = textContent.substring(jsonStartIndex, jsonEndIndex);
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error("Error en la llamada a la API de Gemini:", error);
        throw new Error(`Error al comunicarse con la API de Gemini: ${error.message}`);
    }
}

function generateStructuredMatrixHTML(matrix) {
    let html = '';
    
    // Sección de Problema
    html += `<div class="matrix-section">
        <h2>Problema de Investigación</h2>
        <table>
            <tr>
                <th>Problema General</th>
                <td>${matrix.problema.general}</td>
            </tr>`;
    
    if (matrix.problema.especificos && matrix.problema.especificos.length > 0) {
        html += `<tr>
                <th rowspan="${matrix.problema.especificos.length}">Problemas Específicos</th>
                <td>${matrix.problema.especificos[0]}</td>
            </tr>`;
        
        for (let i = 1; i < matrix.problema.especificos.length; i++) {
            html += `<tr>
                    <td>${matrix.problema.especificos[i]}</td>
                </tr>`;
        }
    }
    html += `</table></div>`;
    
    // Sección de Objetivo
    html += `<div class="matrix-section">
        <h2>Objetivos</h2>
        <table>
            <tr>
                <th>Objetivo General</th>
                <td>${matrix.objetivo.general}</td>
            </tr>`;
    
    if (matrix.objetivo.especificos && matrix.objetivo.especificos.length > 0) {
        html += `<tr>
                <th rowspan="${matrix.objetivo.especificos.length}">Objetivos Específicos</th>
                <td>${matrix.objetivo.especificos[0]}</td>
            </tr>`;
        
        for (let i = 1; i < matrix.objetivo.especificos.length; i++) {
            html += `<tr>
                    <td>${matrix.objetivo.especificos[i]}</td>
                </tr>`;
        }
    }
    html += `</table></div>`;
    
    // Sección de Hipótesis
    html += `<div class="matrix-section">
        <h2>Hipótesis</h2>
        <table>
            <tr>
                <th>Hipótesis General</th>
                <td>${matrix.hipotesis.general}</td>
            </tr>`;
    
    if (matrix.hipotesis.especificas && matrix.hipotesis.especificas.length > 0) {
        html += `<tr>
                <th rowspan="${matrix.hipotesis.especificas.length}">Hipótesis Específicas</th>
                <td>${matrix.hipotesis.especificas[0]}</td>
            </tr>`;
        
        for (let i = 1; i < matrix.hipotesis.especificas.length; i++) {
            html += `<tr>
                    <td>${matrix.hipotesis.especificas[i]}</td>
                </tr>`;
        }
    }
    html += `</table></div>`;
    
    // Sección de Marco Teórico
    html += `<div class="matrix-section">
        <h2>Marco Teórico</h2>
        <table>
            <tr>
                <th>Elementos</th>
                <td>
                    <ul>`;
    
    if (matrix.marcoTeorico && matrix.marcoTeorico.length > 0) {
        for (const item of matrix.marcoTeorico) {
            html += `<li>${item}</li>`;
        }
    } else {
        html += `<li>No se especificaron elementos del marco teórico</li>`;
    }
    
    html += `</ul>
                </td>
            </tr>
        </table></div>`;
    
    // Sección de Variables
    html += `<div class="matrix-section">
        <h2>Variables</h2>
        <table>`;
    
    // Variable independiente
    if (matrix.variables.independiente) {
        html += `<tr>
                <th colspan="2">Variable Independiente: ${matrix.variables.independiente.nombre}</th>
            </tr>`;
        
        if (matrix.variables.independiente.dimensiones && matrix.variables.independiente.dimensiones.length > 0) {
            html += `<tr>
                    <th>Dimensiones</th>
                    <td>
                        <ul>`;
            
            for (const dim of matrix.variables.independiente.dimensiones) {
                html += `<li>${dim}</li>`;
            }
            
            html += `</ul>
                    </td>
                </tr>`;
        }
        
        if (matrix.variables.independiente.indicadores && matrix.variables.independiente.indicadores.length > 0) {
            html += `<tr>
                    <th>Indicadores</th>
                    <td>
                        <ul>`;
            
            for (const ind of matrix.variables.independiente.indicadores) {
                html += `<li>${ind}</li>`;
            }
            
            html += `</ul>
                    </td>
                </tr>`;
        }
    }
    
    // Variable dependiente
    if (matrix.variables.dependiente) {
        html += `<tr>
                <th colspan="2">Variable Dependiente: ${matrix.variables.dependiente.nombre}</th>
            </tr>`;
        
        if (matrix.variables.dependiente.dimensiones && matrix.variables.dependiente.dimensiones.length > 0) {
            html += `<tr>
                    <th>Dimensiones</th>
                    <td>
                        <ul>`;
            
            for (const dim of matrix.variables.dependiente.dimensiones) {
                html += `<li>${dim}</li>`;
            }
            
            html += `</ul>
                    </td>
                </tr>`;
        }
        
        if (matrix.variables.dependiente.indicadores && matrix.variables.dependiente.indicadores.length > 0) {
            html += `<tr>
                    <th>Indicadores</th>
                    <td>
                        <ul>`;
            
            for (const ind of matrix.variables.dependiente.indicadores) {
                html += `<li>${ind}</li>`;
            }
            
            html += `</ul>
                    </td>
                </tr>`;
        }
    }
    
    // Variables adicionales (si existen)
    if (matrix.variables.adicionales && matrix.variables.adicionales.length > 0) {
        for (const variable of matrix.variables.adicionales) {
            if (variable.nombre) {
                html += `<tr>
                        <th colspan="2">Variable Adicional: ${variable.nombre}</th>
                    </tr>`;
                
                if (variable.dimensiones && variable.dimensiones.length > 0) {
                    html += `<tr>
                            <th>Dimensiones</th>
                            <td>
                                <ul>`;
                    
                    for (const dim of variable.dimensiones) {
                        html += `<li>${dim}</li>`;
                    }
                    
                    html += `</ul>
                            </td>
                        </tr>`;
                }
                
                if (variable.indicadores && variable.indicadores.length > 0) {
                    html += `<tr>
                            <th>Indicadores</th>
                            <td>
                                <ul>`;
                    
                    for (const ind of variable.indicadores) {
                        html += `<li>${ind}</li>`;
                    }
                    
                    html += `</ul>
                            </td>
                        </tr>`;
                }
            }
        }
    }
    
    html += `</table></div>`;
    
    // Sección de Diseño Metodológico
    html += `<div class="matrix-section">
        <h2>Diseño Metodológico</h2>
        <table>`;
    
    if (matrix.disenoMetodologico.tipo) {
        html += `<tr>
                <th>Tipo de Investigación</th>
                <td>${matrix.disenoMetodologico.tipo}</td>
            </tr>`;
    }
    
    if (matrix.disenoMetodologico.enfoque) {
        html += `<tr>
                <th>Enfoque</th>
                <td>${matrix.disenoMetodologico.enfoque}</td>
            </tr>`;
    }
    
    if (matrix.disenoMetodologico.poblacion) {
        html += `<tr>
                <th>Población</th>
                <td>${matrix.disenoMetodologico.poblacion}</td>
            </tr>`;
    }
    
    if (matrix.disenoMetodologico.muestra) {
        html += `<tr>
                <th>Muestra</th>
                <td>${matrix.disenoMetodologico.muestra}</td>
            </tr>`;
    }
    
    if (matrix.disenoMetodologico.tecnicas && matrix.disenoMetodologico.tecnicas.length > 0) {
        html += `<tr>
                <th>Técnicas</th>
                <td>
                    <ul>`;
        
        for (const tec of matrix.disenoMetodologico.tecnicas) {
            html += `<li>${tec}</li>`;
        }
        
        html += `</ul>
                </td>
            </tr>`;
    }
    
    if (matrix.disenoMetodologico.instrumentos && matrix.disenoMetodologico.instrumentos.length > 0) {
        html += `<tr>
                <th>Instrumentos</th>
                <td>
                    <ul>`;
        
        for (const ins of matrix.disenoMetodologico.instrumentos) {
            html += `<li>${ins}</li>`;
        }
        
        html += `</ul>
                </td>
            </tr>`;
    }
    
    html += `</table></div>`;
    
    return html;
}