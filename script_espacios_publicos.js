// =====================================================
// Script Frontend - Sistema de Gestion de Actividades
// Espacios Publicos - Ayuntamiento de Matamoros, Tam.
// =====================================================

const API = '';   // mismo origen (servidor Node.js)

// =====================================================
// UTILIDADES
// =====================================================

function fmt(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showAlert(id, msg, tipo) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'alert alert-' + tipo;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// Reemplaza confirm() nativo con un modal estilizado
let _confirmCallback = null;
function showConfirm(titulo, mensaje, onSi) {
    document.getElementById('confirmTitle').textContent = titulo;
    document.getElementById('confirmMsg').textContent   = mensaje;
    _confirmCallback = onSi;
    document.getElementById('modalConfirm').style.display = 'flex';
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnConfirmSi').addEventListener('click', function() {
        document.getElementById('modalConfirm').style.display = 'none';
        if (typeof _confirmCallback === 'function') _confirmCallback();
        _confirmCallback = null;
    });
    document.getElementById('btnConfirmNo').addEventListener('click', function() {
        document.getElementById('modalConfirm').style.display = 'none';
        _confirmCallback = null;
    });
});

function setHeaderDate() {
    const el = document.getElementById('headerDate');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleDateString('es-MX', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        });
    }
}

function setDefaultDate() {
    const el = document.getElementById('dateFecha');
    if (el && !el.value) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm   = String(now.getMonth() + 1).padStart(2, '0');
        const dd   = String(now.getDate()).padStart(2, '0');
        el.value = yyyy + '-' + mm + '-' + dd;
    }
}

async function apiFetch(url, opts) {
    const resp = await fetch(API + url, opts);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error en la solicitud');
    return data;
}

// =====================================================
// LOGIN
// =====================================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    const errEl = document.getElementById('loginError');
    errEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
        const usuario    = document.getElementById('inputUsuario').value.trim();
        const contrasena = document.getElementById('inputContrasena').value;
        const data = await apiFetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena })
        });
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('headerUserName').textContent = data.usuario.Nombre;
        setHeaderDate();
        setDefaultDate();
        cargarCatalogos();
    } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesion';
    }
});

document.getElementById('btnLogout').addEventListener('click', function() {
    sessionStorage.removeItem('usuario');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
});

// =====================================================
// NAVEGACION POR PESTANAS
// =====================================================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const tab = this.getAttribute('data-tab');
        document.getElementById('tab-' + tab).classList.add('active');
        if (tab === 'dashboard') cargarDashboard();
        if (tab === 'consultas') cargarConsultas();
        if (tab === 'admin')     cargarAdminPMD();
    });
});

// Sub-tab navigation for admin panel
document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sub-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
        this.classList.add('active');
        const sub = this.getAttribute('data-subtab');
        const panel = document.getElementById('subtab-' + sub);
        if (panel) { panel.classList.add('active'); panel.style.display = 'block'; }
        if (sub === 'pmd') cargarAdminPMD();
        if (sub === 'poa') cargarAdminPOA();
    });
});

// =====================================================
// AUTO-COMPLETADO: Numero de Area -> datos del campo
// =====================================================

function autocompletarArea() {
    const num = parseInt(document.getElementById('txtNumArea').value);
    if (!num) return;
    apiFetch('/api/areas/' + num).then(data => {
        const a      = data.data;
        const selEst   = document.getElementById('selEstrategia');
        const selLinea = document.getElementById('selLineaAccion');
        const selInd   = document.getElementById('selIndicador');
        const selODS   = document.getElementById('selODS');
        if (a.Ubicacion)     document.getElementById('txtColonia').value = a.Ubicacion;
        if (a.Entre_Calle_1) document.getElementById('txtCalle').value   = a.Entre_Calle_1;
        if (a.ID_Estrategia) {
            selEst.value = a.ID_Estrategia;
            selLinea.innerHTML = '<option value="">-- Seleccione linea de accion --</option>';
            selInd.innerHTML   = '<option value="">-- Seleccione indicador --</option>';
            apiFetch('/api/lineas-accion?id_estrategia=' + a.ID_Estrategia).then(lineasData => {
                lineasData.data.forEach(la => {
                    const opt = document.createElement('option');
                    opt.value = la.ID_Linea_Accion;
                    opt.textContent = la.Clave_Linea + ' - ' + la.Descripcion_Linea;
                    selLinea.appendChild(opt);
                });
                if (a.ID_Linea_Accion) {
                    selLinea.value = a.ID_Linea_Accion;
                    apiFetch('/api/indicadores?id_linea=' + a.ID_Linea_Accion).then(indData => {
                        indData.data.forEach(ind => {
                            const opt = document.createElement('option');
                            opt.value = ind.ID_Indicador;
                            opt.textContent = ind.Codigo_Indicador + ' - ' + ind.Descripcion;
                            selInd.appendChild(opt);
                        });
                        if (a.ID_Indicador) selInd.value = a.ID_Indicador;
                    }).catch(() => {});
                }
            }).catch(() => {});
        }
        if (a.ID_ODS) selODS.value = a.ID_ODS;
    }).catch(() => {});
}

document.getElementById('txtNumArea').addEventListener('change', autocompletarArea);
document.getElementById('txtNumArea').addEventListener('blur',   autocompletarArea);

// Boton Ver Areas
document.getElementById('btnVerAreas').addEventListener('click', async function() {
    const tbody = document.getElementById('areasBody');
    tbody.innerHTML = '<tr><td colspan="6" class="td-empty">Cargando...</td></tr>';
    document.getElementById('modalAreas').style.display = 'flex';
    try {
        const data = await apiFetch('/api/areas');
        if (!data.data.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="td-empty">No hay areas registradas.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        data.data.forEach(a => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.title = 'Clic para usar el area ' + a.Numero_Area;
            tr.innerHTML =
                '<td><strong>' + esc(a.Numero_Area) + '</strong></td>' +
                '<td>' + esc(a.Ubicacion) + '</td>' +
                '<td>' + esc(a.Tipo_Area) + '</td>' +
                '<td>' + esc(a.Entre_Calle_1) + (a.Entre_Calle_2 ? ' / ' + esc(a.Entre_Calle_2) : '') + '</td>' +
                '<td>' + (a.Es_Prioritaria ? 'Si' : 'No') + '</td>' +
                '<td>' + esc(a.Clave_Linea || '-') + '</td>';
            tr.addEventListener('click', function() {
                document.getElementById('txtNumArea').value = a.Numero_Area;
                document.getElementById('modalAreas').style.display = 'none';
                autocompletarArea();
            });
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="td-empty">Error: ' + esc(err.message) + '</td></tr>';
    }
});
document.getElementById('btnCerrarAreas').addEventListener('click', function() {
    document.getElementById('modalAreas').style.display = 'none';
});
document.getElementById('modalAreas').addEventListener('click', function(e) {
    if (e.target === this) this.style.display = 'none';
});

// =====================================================
// CARGA DE CATALOGOS
// =====================================================

async function cargarCatalogos() {
    await Promise.all([
        cargarEstrategias(),
        cargarODS(),
        cargarEstrategiasEdit(),
        cargarODSEdit()
    ]);
}

async function cargarEstrategias() {
    try {
        const data = await apiFetch('/api/estrategias');
        const sel = document.getElementById('selEstrategia');
        sel.innerHTML = '<option value="">-- Seleccione estrategia --</option>';
        data.data.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.ID_Estrategia;
            opt.textContent = e.Clave_Estrategia + ' - ' + e.Nombre_Estrategia;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar estrategias:', err);
    }
}

document.getElementById('selEstrategia').addEventListener('change', async function() {
    const idEstrategia = this.value;
    const selLinea = document.getElementById('selLineaAccion');
    const selInd   = document.getElementById('selIndicador');

    selLinea.innerHTML = '<option value="">-- Seleccione estrategia primero --</option>';
    selInd.innerHTML   = '<option value="">-- Seleccione linea primero --</option>';

    if (!idEstrategia) return;

    try {
        const data = await apiFetch('/api/lineas-accion?id_estrategia=' + idEstrategia);
        selLinea.innerHTML = '<option value="">-- Seleccione linea de accion --</option>';
        data.data.forEach(la => {
            const opt = document.createElement('option');
            opt.value = la.ID_Linea_Accion;
            opt.textContent = la.Clave_Linea + ' - ' + la.Descripcion_Linea;
            selLinea.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar lineas de accion:', err);
    }
});

document.getElementById('selLineaAccion').addEventListener('change', async function() {
    const idLinea = this.value;
    const selInd  = document.getElementById('selIndicador');
    selInd.innerHTML = '<option value="">-- Seleccione linea primero --</option>';
    if (!idLinea) return;

    try {
        const data = await apiFetch('/api/indicadores?id_linea=' + idLinea);
        selInd.innerHTML = '<option value="">-- Seleccione indicador --</option>';
        data.data.forEach(ind => {
            const opt = document.createElement('option');
            opt.value = ind.ID_Indicador;
            opt.textContent = ind.Codigo_Indicador + ' - ' + ind.Descripcion;
            selInd.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar indicadores:', err);
    }
});

async function cargarODS() {
    try {
        const data = await apiFetch('/api/ods');
        const sel  = document.getElementById('selODS');
        sel.innerHTML = '<option value="">-- Seleccione ODS --</option>';
        data.data.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.ID_ODS;
            opt.textContent = 'ODS ' + o.Numero_ODS + ': ' + o.Nombre_ODS;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar ODS:', err);
    }
}

// =====================================================
// FORMULARIO DE CAPTURA
// =====================================================

document.getElementById('formActividad').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnGuardar');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const payload = {
            id_estrategia:  document.getElementById('selEstrategia').value,
            orden_trabajo:  document.getElementById('txtOrdenTrabajo').value.trim(),
            fecha:          document.getElementById('dateFecha').value,
            id_linea_accion: document.getElementById('selLineaAccion').value,
            numero_area:    document.getElementById('txtNumArea').value || null,
            id_indicador:   document.getElementById('selIndicador').value || null,
            colonia:        document.getElementById('txtColonia').value.trim(),
            calle:          document.getElementById('txtCalle').value.trim(),
            acciones:       document.getElementById('txtAcciones').value.trim(),
            id_ods:         document.getElementById('selODS').value || null,
            cantidad:       document.getElementById('txtCantidad').value || null,
            superficie:     document.getElementById('txtSuperficie').value.trim(),
            barrida:        document.getElementById('chkBarrida').checked,
            metaliqueo:     document.getElementById('chkMetaliqueo').checked,
            wireado:        document.getElementById('chkWireado').checked,
            raspado:        document.getElementById('chkRaspado').checked,
            jefe:           document.getElementById('txtJefe').value.trim(),
            supervisor:     document.getElementById('txtSupervisor').value.trim(),
            comentarios:    document.getElementById('txtComentarios').value.trim(),
            origen_peticion: document.getElementById('selOrigenPeticion').value || null
        };

        if (!payload.id_estrategia || !payload.fecha || !payload.id_linea_accion) {
            showAlert('alertCaptura', 'Por favor complete los campos obligatorios: Estrategia, Fecha y Linea de Accion.', 'error');
            return;
        }

        await apiFetch('/api/actividades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        showAlert('alertCaptura', 'Actividad registrada exitosamente.', 'success');
        limpiarFormulario();
    } catch (err) {
        showAlert('alertCaptura', 'Error al guardar: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Actividad';
    }
});

document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);

// Mostrar/ocultar campos de medicion segun tipo de trabajo (solo uno a la vez)
(function() {
    const chks = ['chkBarrida','chkMetaliqueo','chkWireado','chkRaspado'];
    function onChange(e) {
        if (e.target.checked) {
            chks.forEach(id => { if (id !== e.target.id) document.getElementById(id).checked = false; });
        }
        const alguno = chks.some(id => document.getElementById(id).checked);
        document.getElementById('camposMedicion').style.display = alguno ? '' : 'none';
    }
    chks.forEach(id => document.getElementById(id).addEventListener('change', onChange));
})();

// Mismo para modal editar (solo uno a la vez)
(function() {
    const chks = ['editChkBarrida','editChkMetaliqueo','editChkWireado','editChkRaspado'];
    function onChange(e) {
        if (e.target.checked) {
            chks.forEach(id => { if (id !== e.target.id) document.getElementById(id).checked = false; });
        }
        const alguno = chks.some(id => document.getElementById(id).checked);
        document.getElementById('editCamposMedicion').style.display = alguno ? '' : 'none';
    }
    chks.forEach(id => document.getElementById(id).addEventListener('change', onChange));
})();

function limpiarFormulario() {
    document.getElementById('formActividad').reset();
    document.getElementById('selLineaAccion').innerHTML = '<option value="">-- Seleccione estrategia primero --</option>';
    document.getElementById('selIndicador').innerHTML   = '<option value="">-- Seleccione linea primero --</option>';
    document.getElementById('camposMedicion').style.display = 'none';
    setDefaultDate();
}

// =====================================================
// DASHBOARD
// =====================================================

document.getElementById('btnActualizarDash').addEventListener('click', cargarDashboard);

async function cargarDashboard() {
    const tbody = document.getElementById('dashBody');
    tbody.innerHTML = '<tr><td colspan="9" class="td-empty">Cargando datos...</td></tr>';

    try {
        const data = await apiFetch('/api/dashboard');
        const filas = data.data;

        document.getElementById('kpiTotal').textContent    = filas.length;
        document.getElementById('kpiVerde').textContent    = filas.filter(f => f.Semaforo === 'VERDE').length;
        document.getElementById('kpiAmarillo').textContent = filas.filter(f => f.Semaforo === 'AMARILLO').length;
        document.getElementById('kpiRojo').textContent     = filas.filter(f => f.Semaforo === 'ROJO').length;

        if (filas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="td-empty">No hay datos registrados aun.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        filas.forEach(f => {
            const pct  = parseFloat(f.Porcentaje_Avance || 0).toFixed(1);
            const sem  = buildSemaforo(f.Semaforo);
            const tr   = document.createElement('tr');
            tr.innerHTML =
                '<td>' + esc(f.Clave_Programa) + '</td>' +
                '<td>' + esc(f.Clave_Estrategia) + '</td>' +
                '<td>' + esc(f.Clave_Linea) + '</td>' +
                '<td>' + esc(f.Descripcion_Linea) + '</td>' +
                '<td>' + esc(f.Unidad_Medida) + '</td>' +
                '<td>' + esc(f.Meta_Anual) + '</td>' +
                '<td>' + esc(f.Total_Realizado) + '</td>' +
                '<td>' + pct + '%</td>' +
                '<td>' + sem + '</td>';
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" class="td-empty">Error al cargar datos: ' + esc(err.message) + '</td></tr>';
    }
}

function buildSemaforo(valor) {
    const mapa = {
        'VERDE':    { cls: 'semaforo-verde',    txt: 'En Meta' },
        'AMARILLO': { cls: 'semaforo-amarillo', txt: 'En Progreso' },
        'ROJO':     { cls: 'semaforo-rojo',     txt: 'En Riesgo' }
    };
    const cfg = mapa[valor] || mapa['ROJO'];
    return '<span class="semaforo ' + cfg.cls + '"><span class="semaforo-dot"></span>' + cfg.txt + '</span>';
}

// =====================================================
// CONSULTAS
// =====================================================

document.getElementById('btnCargarConsulta').addEventListener('click', cargarConsultas);

async function cargarConsultas() {
    const tbody = document.getElementById('consultasBody');
    tbody.innerHTML = '<tr><td colspan="12" class="td-empty">Cargando registros...</td></tr>';

    try {
        const data  = await apiFetch('/api/actividades');
        const filas = data.data;

        if (filas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="13" class="td-empty">No hay actividades registradas.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        filas.forEach((f, i) => {
            const id = f.ID_Actividad;
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + (i + 1) + '</td>' +
                '<td>' + fmt(f.Fecha) + '</td>' +
                '<td>' + esc(f.Orden_Trabajo) + '</td>' +
                '<td>' + esc(f.Clave_Estrategia) + '</td>' +
                '<td>' + esc(f.Clave_Linea) + '</td>' +
                '<td>' + esc(f.Numero_Area) + '</td>' +
                '<td>' + esc(f.Colonia) + '</td>' +
                '<td>' + esc(f.Calle) + '</td>' +
                '<td>' + esc(f.Cantidad) + '</td>' +
                '<td>' + esc(f.Jefe) + '</td>' +
                '<td>' + esc(f.Supervisor) + '</td>' +
                '<td>' + esc(f.Origen_Peticion) + '</td>' +
                '<td class="td-acciones">' +
                    '<button class="btn-sm btn-edit" onclick="abrirModalEditar(' + id + ')">Editar</button>' +
                    '<button class="btn-sm btn-delete" onclick="eliminarActividad(' + id + ')">Eliminar</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="13" class="td-empty">Error: ' + esc(err.message) + '</td></tr>';
    }
}

// =====================================================
// EDICION DE ACTIVIDADES
// =====================================================

async function cargarEstrategiasEdit() {
    try {
        const data = await apiFetch('/api/estrategias');
        const sel  = document.getElementById('editSelEstrategia');
        sel.innerHTML = '<option value="">-- Seleccione estrategia --</option>';
        data.data.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.ID_Estrategia;
            opt.textContent = e.Clave_Estrategia + ' - ' + e.Nombre_Estrategia;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar estrategias en modal:', err);
    }
}

async function cargarODSEdit() {
    try {
        const data = await apiFetch('/api/ods');
        const sel  = document.getElementById('editSelODS');
        sel.innerHTML = '<option value="">-- Seleccione ODS --</option>';
        data.data.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.ID_ODS;
            opt.textContent = 'ODS ' + o.Numero_ODS + ': ' + o.Nombre_ODS;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar ODS en modal:', err);
    }
}

document.getElementById('editSelEstrategia').addEventListener('change', async function() {
    const idEstrategia = this.value;
    const selLinea = document.getElementById('editSelLineaAccion');
    const selInd   = document.getElementById('editSelIndicador');
    selLinea.innerHTML = '<option value="">-- Seleccione estrategia primero --</option>';
    selInd.innerHTML   = '<option value="">-- Seleccione linea primero --</option>';
    if (!idEstrategia) return;
    try {
        const data = await apiFetch('/api/lineas-accion?id_estrategia=' + idEstrategia);
        selLinea.innerHTML = '<option value="">-- Seleccione linea de accion --</option>';
        data.data.forEach(la => {
            const opt = document.createElement('option');
            opt.value = la.ID_Linea_Accion;
            opt.textContent = la.Clave_Linea + ' - ' + la.Descripcion_Linea;
            selLinea.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar lineas en modal:', err);
    }
});

document.getElementById('editSelLineaAccion').addEventListener('change', async function() {
    const idLinea = this.value;
    const selInd  = document.getElementById('editSelIndicador');
    selInd.innerHTML = '<option value="">-- Seleccione linea primero --</option>';
    if (!idLinea) return;
    try {
        const data = await apiFetch('/api/indicadores?id_linea=' + idLinea);
        selInd.innerHTML = '<option value="">-- Seleccione indicador --</option>';
        data.data.forEach(ind => {
            const opt = document.createElement('option');
            opt.value = ind.ID_Indicador;
            opt.textContent = ind.Codigo_Indicador + ' - ' + ind.Descripcion;
            selInd.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar indicadores en modal:', err);
    }
});

async function abrirModalEditar(id) {
    try {
        const data = await apiFetch('/api/actividades/' + id);
        const a    = data.data;

        document.getElementById('editIdActividad').value      = a.ID_Actividad;
        document.getElementById('editTxtOrdenTrabajo').value  = a.Orden_Trabajo || '';
        document.getElementById('editDateFecha').value        = a.Fecha         || '';
        document.getElementById('editTxtNumArea').value       = a.Numero_Area   != null ? a.Numero_Area : '';
        document.getElementById('editTxtColonia').value       = a.Colonia       || '';
        document.getElementById('editTxtCalle').value         = a.Calle         || '';
        document.getElementById('editTxtAcciones').value      = a.Acciones      || '';
        document.getElementById('editTxtCantidad').value      = a.Cantidad      != null ? a.Cantidad : '';
        document.getElementById('editTxtSuperficie').value    = a.Superficie    || '';
        document.getElementById('editChkBarrida').checked     = !!a.Barrida;
        document.getElementById('editChkMetaliqueo').checked  = !!a.Metaliqueo;
        document.getElementById('editChkWireado').checked     = !!a.Wireado;
        document.getElementById('editChkRaspado').checked     = !!a.Raspado;
        document.getElementById('editTxtJefe').value          = a.Jefe          || '';
        document.getElementById('editTxtSupervisor').value    = a.Supervisor    || '';
        document.getElementById('editTxtComentarios').value   = a.Comentarios   || '';

        // Cascade: estrategia -> lineas -> indicadores
        const selEst   = document.getElementById('editSelEstrategia');
        const selLinea = document.getElementById('editSelLineaAccion');
        const selInd   = document.getElementById('editSelIndicador');

        selEst.value = a.ID_Estrategia || '';
        selLinea.innerHTML = '<option value="">-- Seleccione linea de accion --</option>';
        selInd.innerHTML   = '<option value="">-- Seleccione indicador --</option>';

        if (a.ID_Estrategia) {
            const lineasData = await apiFetch('/api/lineas-accion?id_estrategia=' + a.ID_Estrategia);
            lineasData.data.forEach(la => {
                const opt = document.createElement('option');
                opt.value = la.ID_Linea_Accion;
                opt.textContent = la.Clave_Linea + ' - ' + la.Descripcion_Linea;
                selLinea.appendChild(opt);
            });
            selLinea.value = a.ID_Linea_Accion || '';

            if (a.ID_Linea_Accion) {
                const indData = await apiFetch('/api/indicadores?id_linea=' + a.ID_Linea_Accion);
                indData.data.forEach(ind => {
                    const opt = document.createElement('option');
                    opt.value = ind.ID_Indicador;
                    opt.textContent = ind.Codigo_Indicador + ' - ' + ind.Descripcion;
                    selInd.appendChild(opt);
                });
                selInd.value = a.ID_Indicador || '';
            }
        }

        document.getElementById('editSelODS').value = a.ID_ODS || '';
        document.getElementById('editSelOrigenPeticion').value = a.Origen_Peticion || '';

        // Mostrar campos de medicion si hay trabajo seleccionado
        const tieneTrabajo = !!(a.Barrida || a.Metaliqueo || a.Wireado || a.Raspado);
        document.getElementById('editCamposMedicion').style.display = tieneTrabajo ? '' : 'none';

        document.getElementById('alertEditar').style.display = 'none';
        document.getElementById('modalEditar').style.display = 'flex';
    } catch (err) {
        alert('Error al cargar la actividad: ' + err.message);
    }
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').style.display = 'none';
}

document.getElementById('btnCerrarModal').addEventListener('click', cerrarModalEditar);
document.getElementById('btnCancelarEditar').addEventListener('click', cerrarModalEditar);
document.getElementById('modalEditar').addEventListener('click', function(e) {
    if (e.target === this) cerrarModalEditar();
});

document.getElementById('formEditar').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarEditar');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        const id = document.getElementById('editIdActividad').value;
        const payload = {
            id_estrategia:   document.getElementById('editSelEstrategia').value,
            orden_trabajo:   document.getElementById('editTxtOrdenTrabajo').value.trim(),
            fecha:           document.getElementById('editDateFecha').value,
            id_linea_accion: document.getElementById('editSelLineaAccion').value,
            numero_area:     document.getElementById('editTxtNumArea').value     || null,
            id_indicador:    document.getElementById('editSelIndicador').value   || null,
            colonia:         document.getElementById('editTxtColonia').value.trim(),
            calle:           document.getElementById('editTxtCalle').value.trim(),
            acciones:        document.getElementById('editTxtAcciones').value.trim(),
            id_ods:          document.getElementById('editSelODS').value         || null,
            cantidad:        document.getElementById('editTxtCantidad').value    || null,
            superficie:      document.getElementById('editTxtSuperficie').value.trim(),
            barrida:         document.getElementById('editChkBarrida').checked,
            metaliqueo:      document.getElementById('editChkMetaliqueo').checked,
            wireado:         document.getElementById('editChkWireado').checked,
            raspado:         document.getElementById('editChkRaspado').checked,
            jefe:            document.getElementById('editTxtJefe').value.trim(),
            supervisor:      document.getElementById('editTxtSupervisor').value.trim(),
            comentarios:     document.getElementById('editTxtComentarios').value.trim(),
            origen_peticion: document.getElementById('editSelOrigenPeticion').value || null
        };

        if (!payload.id_estrategia || !payload.fecha || !payload.id_linea_accion) {
            showAlert('alertEditar', 'Complete los campos obligatorios: Estrategia, Fecha y Linea de Accion.', 'error');
            return;
        }

        await apiFetch('/api/actividades/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        cerrarModalEditar();
        showAlert('alertConsultas', 'Actividad actualizada exitosamente.', 'success');
        cargarConsultas();
    } catch (err) {
        showAlert('alertEditar', 'Error al guardar: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';
    }
});

async function eliminarActividad(id) {
    showConfirm(
        'Eliminar Actividad',
        'Esta accion eliminara el registro permanentemente. \u00bfDesea continuar?',
        async function() {
            try {
                await apiFetch('/api/actividades/' + id, { method: 'DELETE' });
                showAlert('alertConsultas', 'Actividad eliminada exitosamente.', 'success');
                cargarConsultas();
            } catch (err) {
                showAlert('alertConsultas', 'Error al eliminar: ' + err.message, 'error');
            }
        }
    );
}

// =====================================================
// SEGURIDAD: Escape de HTML para prevenir XSS
// =====================================================
function esc(val) {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =====================================================
// SESION ACTIVA: verificar al cargar
// =====================================================
(function verificarSesion() {
    const usr = sessionStorage.getItem('usuario');
    if (usr) {
        try {
            const u = JSON.parse(usr);
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('headerUserName').textContent = u.Nombre;
            setHeaderDate();
            setDefaultDate();
            cargarCatalogos();
        } catch (_) {
            sessionStorage.removeItem('usuario');
        }
    }
})();

// =====================================================
// ADMIN: PMD (Plan Municipal de Desarrollo)
// =====================================================

async function cargarAdminPMD() {
    const tbody = document.getElementById('pmdBody');
    tbody.innerHTML = '<tr><td colspan="11" class="td-empty">Cargando PMD...</td></tr>';
    try {
        const data = await apiFetch('/api/pmd');
        const rows = data.data;
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="11" class="td-empty">No hay datos en el PMD.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td><strong>' + esc(r.Linea_Accion) + '</strong></td>' +
                '<td>' + esc(r.Programa) + '</td>' +
                '<td>' + esc(r.Estrategia) + '</td>' +
                '<td class="td-desc">' + esc(r.Descripcion_Linea_Accion) + '</td>' +
                '<td>' + esc(r.Meta_Trianual) + '</td>' +
                '<td>' + esc(r.Meta_Anual) + '</td>' +
                '<td>' + esc(r.Unidad_Medida) + '</td>' +
                '<td>' + esc(r.Indicador) + '</td>' +
                '<td>' + esc(r.Alineacion_Plan_Nacional) + '</td>' +
                '<td>' + esc(r.Alineacion_Plan_Estatal) + '</td>' +
                '<td class="td-acciones"><button class="btn-sm btn-edit" onclick="abrirModalPMD(\'' + esc(r.Linea_Accion) + '\')">Editar</button></td>';
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="11" class="td-empty">Error: ' + esc(err.message) + '</td></tr>';
    }
}

async function abrirModalPMD(linea) {
    try {
        const data = await apiFetch('/api/pmd/' + encodeURIComponent(linea));
        const r    = data.data;
        document.getElementById('pmdLinea').value              = r.Linea_Accion;
        document.getElementById('modalPMDLinea').textContent   = r.Linea_Accion;
        document.getElementById('pmdDescripcion').value        = r.Descripcion_Linea_Accion || '';
        document.getElementById('pmdMetaTrianual').value       = r.Meta_Trianual != null ? r.Meta_Trianual : '';
        document.getElementById('pmdMetaAnual').value          = r.Meta_Anual    != null ? r.Meta_Anual    : '';
        document.getElementById('pmdUnidad').value             = r.Unidad_Medida || '';
        document.getElementById('pmdIndicador').value          = r.Indicador || '';
        document.getElementById('pmdDescIndicador').value      = r.Descripcion_Indicador || '';
        document.getElementById('pmdAlinNac').value            = r.Alineacion_Plan_Nacional || '';
        document.getElementById('pmdAlinEst').value            = r.Alineacion_Plan_Estatal  || '';
        document.getElementById('pmdInstitucion').value        = r.Institucion_Responsable  || '';
        const meses = ['Oct','Nov','Dic','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'];
        meses.forEach(m => {
            const el = document.getElementById('pmd' + m);
            if (el) el.value = r['Meta_' + m] != null ? r['Meta_' + m] : '';
        });
        document.getElementById('alertPMDModal').style.display = 'none';
        document.getElementById('modalPMD').style.display = 'flex';
    } catch (err) {
        alert('Error al cargar PMD: ' + err.message);
    }
}

function cerrarModalPMD() {
    document.getElementById('modalPMD').style.display = 'none';
}

document.getElementById('btnCerrarPMD').addEventListener('click', cerrarModalPMD);
document.getElementById('btnCancelarPMD').addEventListener('click', cerrarModalPMD);
document.getElementById('modalPMD').addEventListener('click', function(e) { if (e.target === this) cerrarModalPMD(); });

document.getElementById('formPMD').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn   = document.getElementById('btnGuardarPMD');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        const linea = document.getElementById('pmdLinea').value;
        const meses = ['Oct','Nov','Dic','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'];
        const mesPayload = {};
        meses.forEach(m => {
            const val = document.getElementById('pmd' + m).value;
            mesPayload['meta_' + m.toLowerCase()] = val !== '' ? val : null;
        });
        const payload = {
            descripcion_linea_accion:  document.getElementById('pmdDescripcion').value.trim(),
            meta_trianual:             document.getElementById('pmdMetaTrianual').value || null,
            meta_anual:                document.getElementById('pmdMetaAnual').value    || null,
            unidad_medida:             document.getElementById('pmdUnidad').value.trim(),
            indicador:                 document.getElementById('pmdIndicador').value.trim(),
            descripcion_indicador:     document.getElementById('pmdDescIndicador').value.trim(),
            alineacion_plan_nacional:  document.getElementById('pmdAlinNac').value.trim(),
            alineacion_plan_estatal:   document.getElementById('pmdAlinEst').value.trim(),
            institucion_responsable:   document.getElementById('pmdInstitucion').value.trim(),
            ...mesPayload
        };
        await apiFetch('/api/pmd/' + encodeURIComponent(linea), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        cerrarModalPMD();
        showAlert('alertPMD', 'PMD actualizado exitosamente.', 'success');
        cargarAdminPMD();
    } catch (err) {
        showAlert('alertPMDModal', 'Error al guardar: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';
    }
});

// =====================================================
// ADMIN: POA (Programa Operativo Anual)
// =====================================================

let _pmdLineasCache = [];

async function cargarAdminPOA() {
    const tbody = document.getElementById('poaBody');
    tbody.innerHTML = '<tr><td colspan="9" class="td-empty">Cargando POA...</td></tr>';
    try {
        // Pre-load PMD lines for dropdown
        if (!_pmdLineasCache.length) {
            const pmdData = await apiFetch('/api/pmd');
            _pmdLineasCache = pmdData.data;
        }
        const data = await apiFetch('/api/poa');
        const rows = data.data;
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="9" class="td-empty">No hay registros POA.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        const fmt2 = (v) => v != null ? '$' + parseFloat(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '-';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td><strong>' + esc(r.Linea_Accion) + '</strong></td>' +
                '<td>' + esc(r.Ejercicio) + '</td>' +
                '<td>' + esc(r.Programa) + '</td>' +
                '<td>' + fmt2(r.Presupuesto_Municipal) + '</td>' +
                '<td>' + fmt2(r.Presupuesto_Estatal) + '</td>' +
                '<td>' + fmt2(r.Presupuesto_Federal) + '</td>' +
                '<td>' + fmt2(r.Presupuesto_Total) + '</td>' +
                '<td>' + esc(r.Rubro_Cuenta) + '</td>' +
                '<td class="td-acciones">' +
                    '<button class="btn-sm btn-edit"   onclick="abrirModalPOA(' + r.ID_POA + ')">Editar</button>' +
                    '<button class="btn-sm btn-delete" onclick="eliminarPOA(' + r.ID_POA + ')">Eliminar</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" class="td-empty">Error: ' + esc(err.message) + '</td></tr>';
    }
}

function poblarDropdownLineaAccion(valorActual) {
    const sel = document.getElementById('poaLineaAccion');
    sel.innerHTML = '<option value="">-- Seleccione linea --</option>';
    _pmdLineasCache.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.Linea_Accion;
        opt.textContent = r.Linea_Accion + ' - ' + r.Descripcion_Linea_Accion.substring(0, 50) + (r.Descripcion_Linea_Accion.length > 50 ? '...' : '');
        if (valorActual && r.Linea_Accion === valorActual) opt.selected = true;
        sel.appendChild(opt);
    });
}

async function abrirModalPOA(id) {
    try {
        if (!_pmdLineasCache.length) {
            const pmdData = await apiFetch('/api/pmd');
            _pmdLineasCache = pmdData.data;
        }
        const data = await apiFetch('/api/poa/' + id);
        const r    = data.data;
        document.getElementById('poaId').value             = r.ID_POA;
        document.getElementById('modalPOATitulo').textContent = 'Editar POA #' + r.ID_POA;
        poblarDropdownLineaAccion(r.Linea_Accion);
        document.getElementById('poaEjercicio').value      = r.Ejercicio || '';
        document.getElementById('poaFechaAprobacion').value = r.Fecha_Aprobacion ? r.Fecha_Aprobacion.substring(0,10) : '';
        document.getElementById('poaRubro').value          = r.Rubro_Cuenta || '';
        document.getElementById('poaAlinNac').value        = r.Alineacion_Plan_Nacional || '';
        document.getElementById('poaAlinEst').value        = r.Alineacion_Plan_Estatal  || '';
        document.getElementById('poaDescripcion').value    = r.Descripcion_Compras || '';
        document.getElementById('poaPresMun').value        = r.Presupuesto_Municipal != null ? r.Presupuesto_Municipal : '';
        document.getElementById('poaPresEst').value        = r.Presupuesto_Estatal  != null ? r.Presupuesto_Estatal   : '';
        document.getElementById('poaPresFed').value        = r.Presupuesto_Federal  != null ? r.Presupuesto_Federal   : '';
        document.getElementById('alertPOAModal').style.display = 'none';
        document.getElementById('modalPOA').style.display = 'flex';
    } catch (err) {
        alert('Error al cargar POA: ' + err.message);
    }
}

async function abrirModalPOANuevo() {
    if (!_pmdLineasCache.length) {
        try {
            const pmdData = await apiFetch('/api/pmd');
            _pmdLineasCache = pmdData.data;
        } catch (err) {
            alert('Error al cargar lineas PMD: ' + err.message);
            return;
        }
    }
    document.getElementById('poaId').value             = '';
    document.getElementById('modalPOATitulo').textContent = 'Nuevo Registro POA';
    poblarDropdownLineaAccion(null);
    document.getElementById('poaEjercicio').value      = new Date().getFullYear();
    document.getElementById('poaFechaAprobacion').value = '';
    document.getElementById('poaRubro').value          = '';
    document.getElementById('poaAlinNac').value        = '';
    document.getElementById('poaAlinEst').value        = '';
    document.getElementById('poaDescripcion').value    = '';
    document.getElementById('poaPresMun').value        = '';
    document.getElementById('poaPresEst').value        = '';
    document.getElementById('poaPresFed').value        = '';
    document.getElementById('alertPOAModal').style.display = 'none';
    document.getElementById('modalPOA').style.display = 'flex';
}

function cerrarModalPOA() {
    document.getElementById('modalPOA').style.display = 'none';
}

document.getElementById('btnNuevoPOA').addEventListener('click', abrirModalPOANuevo);
document.getElementById('btnCerrarPOA').addEventListener('click', cerrarModalPOA);
document.getElementById('btnCancelarPOA').addEventListener('click', cerrarModalPOA);
document.getElementById('modalPOA').addEventListener('click', function(e) { if (e.target === this) cerrarModalPOA(); });

document.getElementById('formPOA').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarPOA');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        const id = document.getElementById('poaId').value;
        const payload = {
            linea_accion:             document.getElementById('poaLineaAccion').value,
            ejercicio:                document.getElementById('poaEjercicio').value,
            fecha_aprobacion:         document.getElementById('poaFechaAprobacion').value || null,
            rubro_cuenta:             document.getElementById('poaRubro').value.trim(),
            alineacion_plan_nacional: document.getElementById('poaAlinNac').value.trim(),
            alineacion_plan_estatal:  document.getElementById('poaAlinEst').value.trim(),
            descripcion_compras:      document.getElementById('poaDescripcion').value.trim(),
            presupuesto_municipal:    document.getElementById('poaPresMun').value || 0,
            presupuesto_estatal:      document.getElementById('poaPresEst').value || 0,
            presupuesto_federal:      document.getElementById('poaPresFed').value || 0
        };
        if (!payload.linea_accion || !payload.ejercicio) {
            showAlert('alertPOAModal', 'Linea de Accion y Ejercicio son obligatorios.', 'error');
            return;
        }
        if (id) {
            await apiFetch('/api/poa/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAlert('alertPOA', 'POA actualizado exitosamente.', 'success');
        } else {
            await apiFetch('/api/poa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAlert('alertPOA', 'Registro POA creado exitosamente.', 'success');
        }
        cerrarModalPOA();
        cargarAdminPOA();
    } catch (err) {
        showAlert('alertPOAModal', 'Error al guardar: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar';
    }
});

async function eliminarPOA(id) {
    showConfirm(
        'Eliminar Registro POA',
        'Esta accion eliminara el registro POA y sus detalles permanentemente. \u00bfDesea continuar?',
        async function() {
            try {
                await apiFetch('/api/poa/' + id, { method: 'DELETE' });
                showAlert('alertPOA', 'Registro POA eliminado exitosamente.', 'success');
                cargarAdminPOA();
            } catch (err) {
                showAlert('alertPOA', 'Error al eliminar: ' + err.message, 'error');
            }
        }
    );
}
