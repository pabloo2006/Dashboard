let turnos = JSON.parse(localStorage.getItem('dash_turnos')) || [];
let precioHora = parseFloat(localStorage.getItem('dash_precio_hora')) || 10;
let ahorroTotal = parseFloat(localStorage.getItem('dash_ahorro')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('precio-hora').value = precioHora;
    document.getElementById('total-ahorrado').value = ahorroTotal;
    
    // Poner fecha de hoy por defecto en el input
    document.getElementById('fecha-turno').valueAsDate = new Date();
    
    renderizarDashboard();
});

function actualizarCalculos() {
    precioHora = parseFloat(document.getElementById('precio-hora').value) || 0;
    ahorroTotal = parseFloat(document.getElementById('total-ahorrado').value) || 0;

    localStorage.setItem('dash_precio_hora', precioHora);
    localStorage.setItem('dash_ahorro', ahorroTotal);

    renderizarDashboard();
}

function agregarTurno(event) {
    event.preventDefault();
    
    const fecha = document.getElementById('fecha-turno').value;
    const horas = parseFloat(document.getElementById('horas-turno').value);
    
    const nuevoTurno = {
        id: Date.now(),
        fecha: fecha,
        horas: horas,
        pagado: false
    };

    turnos.unshift(nuevoTurno);
    guardarYActualizar();
    
    document.getElementById('horas-turno').value = '';
}

function cambiarEstadoPago(id) {
    const turno = turnos.find(t => t.id === id);
    if (turno) {
        turno.pagado = !turno.pagado;
        guardarYActualizar();
    }
}

function eliminarTurno(id) {
    turnos = turnos.filter(t => t.id !== id);
    guardarYActualizar();
}

function guardarYActualizar() {
    localStorage.setItem('dash_turnos', JSON.stringify(turnos));
    renderizarDashboard();
}

function renderizarDashboard() {
    const listaContainer = document.getElementById('lista-turnos');
    listaContainer.innerHTML = '';

    let gananciaSemanalTotal = 0;

    if (turnos.length === 0) {
        listaContainer.innerHTML = '<p style="text-align: center; color: #94a3b8; font-size: 0.9rem;">No hay turnos registrados aún.</p>';
        document.getElementById('ganancia-semanal').innerText = '0.00 €';
        return;
    }

    turnos.forEach(turno => {
        const importeDia = turno.horas * precioHora;
        gananciaSemanalTotal += importeDia;

        const div = document.createElement('div');
        div.className = 'turno-item';
        div.innerHTML = `
            <div class="turno-info">
                <strong>${turno.fecha}</strong>
                <p>${turno.horas} horas (${importeDia.toFixed(2)} €)</p>
            </div>
            <div class="turno-actions">
                <button class="badge-pagado ${turno.pagado ? 'pagado-si' : 'pagado-no'}" onclick="cambiarEstadoPago(${turno.id})">
                    ${turno.pagado ? 'Pagado ✓' : 'Pendiente ⏳'}
                </button>
                <button class="btn-eliminar" onclick="eliminarTurno(${turno.id})">Eliminar</button>
            </div>
        `;
        listaContainer.appendChild(div);
    });

    document.getElementById('ganancia-semanal').innerText = `${gananciaSemanalTotal.toFixed(2)} €`;
}