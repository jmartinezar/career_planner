document.addEventListener('DOMContentLoaded', function() {
    // Cargar estado guardado
    loadSavedState();

    // Configurar tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Desactivar todas las pestañas
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activar la pestaña seleccionada
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
    
    // Configurar botones de aprobación
    let lastClickedtoggle = null;
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const materia = this.parentElement;
            const isAprobada = materia.classList.contains('aprobada');
            
            if (isAprobada) {
                materia.classList.remove('aprobada');
                this.textContent = 'No Aprobada';
            } else {
                materia.classList.add('aprobada');
                this.textContent = 'Aprobada';
            }

            lastClickedtoggle = materia;
            
            // Actualizar estado de la agrupación y progreso
            updateAgrupacionState(materia.closest('.tree').querySelector('.agrupacion'));
            updateProgress();
            
            // Guardar estado
            saveState();
        });
    });
    
    // Función para actualizar el estado de la agrupación
    function updateAgrupacionState(agrupacion) {
        const materias = agrupacion.nextElementSibling.querySelectorAll('.materia');
        let creditosRequeridos = parseInt(agrupacion.textContent.match(/\d+/)[0]);
        let creditosAprobados = 0;
        
        materias.forEach(materia => {
            if (materia.classList.contains('aprobada')) {
                const creditos = parseInt(materia.querySelector('.materia-creditos').textContent);
                creditosAprobados += creditos;
            }
        });
        
        // Verificar si la agrupación está completa
        if (creditosAprobados >= creditosRequeridos) {
            agrupacion.classList.add('completed');
            
            // Marcar materias adicionales como extra
            let creditosAcumulados = 0;
            
            if(creditosAprobados - parseInt(lastClickedtoggle.querySelector('.materia-creditos').textContent) >= creditosRequeridos)
            {
                lastClickedtoggle.classList.add('extra');
                creditosAcumulados += parseInt(lastClickedtoggle.querySelector('.materia-creditos').textContent);
            }
        } else {
            agrupacion.classList.remove('completed');
            materias.forEach(materia => materia.classList.remove('extra'));
        }
    }
    
    // Función para actualizar el progreso general
    function updateProgress() {
        const activeTab = document.querySelector('.tab-content.active');
        const progressTitle = activeTab.querySelector('.progress-title span:first-child');
        const progressPercent = activeTab.querySelector('.progress-title span:last-child');
        const progressFill = activeTab.querySelector('.progress-fill');
        
        let totalCreditos = 0;
        if(activeTab.id === 'fundamentacion')
        {
            totalCreditos = 20;
        }
        else
        {
            totalCreditos = 124;
        }
        let creditosAprobados = 0;
        
        // Calcular créditos totales y aprobados
        const materias = activeTab.querySelectorAll('.materia');
        materias.forEach(materia => {
            const creditos = parseInt(materia.querySelector('.materia-creditos').textContent);
            
            if (materia.classList.contains('aprobada')) {
                creditosAprobados += creditos;
            }
        });
        
        const porcentaje = ((creditosAprobados / totalCreditos) * 100).toFixed(2);
        
        // Actualizar UI
        if (activeTab.id === 'fundamentacion') {
            progressTitle.textContent = `Progreso de Fundamentación: ${creditosAprobados}/20 créditos`;
        } else {
            progressTitle.textContent = `Progreso de Formación Disciplinar: ${creditosAprobados}/124 créditos`;
        }
        
        progressPercent.textContent = `${porcentaje}%`;
        progressFill.style.width = `${porcentaje}%`;
        
        // Actualizar todas las agrupaciones
        const agrupaciones = activeTab.querySelectorAll('.agrupacion');
        agrupaciones.forEach(agrupacion => {
            updateAgrupacionState(agrupacion);
        });
    }
    
    // Función para guardar el estado
    function saveState() {
        const state = {};
        
        document.querySelectorAll('.materia').forEach(materia => {
            state[materia.dataset.id] = materia.classList.contains('aprobada');
        });

        localStorage.setItem('materiasState', JSON.stringify(state));
    }
    
    // Función para cargar el estado guardado
    function loadSavedState() {
        const savedState = localStorage.getItem('materiasState');
        
        if (savedState) {
            const state = JSON.parse(savedState);
            
            for (const id in state) {
                const materia = document.querySelector(`.materia[data-id="${id}"]`);
                if (materia) {
                    if (state[id]) {
                        materia.classList.add('aprobada');
                        materia.querySelector('.toggle-btn').textContent = 'Aprobada';
                    }
                }
            }
            
            // Actualizar UI
            updateProgress();
        }
    }
});