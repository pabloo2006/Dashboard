const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v===null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
let turnos = store.get('dash_turnos', []);
let precio = Number(store.get('dash_precio_hora', 10)) || 0;
let ahorro = Number(store.get('dash_ahorro', 0)) || 0;
let filtro = 'todos';

const $ = id => document.getElementById(id);
const eur = n => n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' €';
const hrs = n => n.toLocaleString('es-ES',{maximumFractionDigits:1});
const parse = f => new Date(f + 'T00:00:00');
const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

function lunes(){
  const d = new Date(); d.setHours(0,0,0,0);
  d.setDate(d.getDate() - ((d.getDay()+6)%7));
  return d;
}

function guardar(){ store.set('dash_turnos', turnos); render(); }

function render(){
  const ini = lunes(), fin = new Date(ini); fin.setDate(fin.getDate()+7);
  let total=0, pagado=0, horasT=0, sem=0, horasS=0;
  turnos.forEach(t=>{
    const imp = t.horas*precio; total+=imp; horasT+=t.horas;
    if(t.pagado) pagado+=imp;
    const d = parse(t.fecha);
    if(d>=ini && d<fin){ sem+=imp; horasS+=t.horas; }
  });
  const pend = total-pagado;

  $('semana').textContent = eur(sem);
  $('semana-horas').textContent = hrs(horasS)+' horas trabajadas';
  $('cobrado').textContent = eur(pagado);
  $('pendiente').textContent = eur(pend);
  $('barPagado').style.width = total ? (pagado/total*100)+'%' : '0';
  $('barPend').style.width = total ? (pend/total*100)+'%' : '0';
  $('horas-total').textContent = hrs(horasT);
  $('n-turnos').textContent = turnos.length;
  $('ahorro-view').textContent = eur(ahorro);
  $('proyeccion').textContent = eur(ahorro+pend);

  // gráfico semanal
  const dias=['L','M','X','J','V','S','D'], porDia=Array(7).fill(0);
  turnos.forEach(t=>{ const d=parse(t.fecha); const i=Math.round((d-ini)/864e5); if(i>=0&&i<7) porDia[i]+=t.horas*precio; });
  const max = Math.max(...porDia,1);
  $('chart').innerHTML = porDia.map((v,i)=>
    `<div><small>${v?Math.round(v):''}</small><i class="${v?'on':''}" style="height:${Math.max(v/max*80,3)}%"></i>${dias[i]}</div>`).join('');

  // lista
  let lista = turnos.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha));
  if(filtro==='pend') lista = lista.filter(t=>!t.pagado);
  if(filtro==='pag') lista = lista.filter(t=>t.pagado);
  $('lista').innerHTML = lista.length ? lista.map(t=>{
    const f = parse(t.fecha).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'});
    return `<div class="item">
      <div><div class="when">${f}</div><div class="meta">${hrs(t.horas)} h × ${eur(precio)}</div></div>
      <div><div class="amount">${eur(t.horas*precio)}</div>
        <div class="acts">
          <button class="pill ${t.pagado?'si':'no'}" onclick="pago(${t.id})">${t.pagado?'Pagado ✓':'Pendiente'}</button>
          <button class="del" onclick="borrar(${t.id})" aria-label="Eliminar turno">✕</button>
        </div></div>
    </div>`;}).join('')
    : `<div class="empty">${turnos.length?'No hay turnos en este filtro.':'Aún no hay turnos. Añade el primero con el formulario.'}</div>`;
}

function pago(id){ const t=turnos.find(x=>x.id===id); if(t){ t.pagado=!t.pagado; guardar(); } }
function borrar(id){ turnos=turnos.filter(x=>x.id!==id); guardar(); }

$('form-turno').addEventListener('submit', e=>{
  e.preventDefault();
  turnos.unshift({id:Date.now(), fecha:$('fecha-turno').value, horas:parseFloat($('horas-turno').value), pagado:false});
  $('horas-turno').value='';
  guardar();
});
$('precio-hora').addEventListener('input', e=>{ precio=parseFloat(e.target.value)||0; store.set('dash_precio_hora',precio); render(); });
$('total-ahorrado').addEventListener('input', e=>{ ahorro=parseFloat(e.target.value)||0; store.set('dash_ahorro',ahorro); render(); });
$('tabs').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  filtro=b.dataset.f;
  [...$('tabs').children].forEach(x=>x.setAttribute('aria-pressed', x===b));
  render();
});
$('tema').addEventListener('click', ()=>{
  const r=document.documentElement;
  const oscuro = r.dataset.theme ? r.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = oscuro ? 'light' : 'dark';
});

$('precio-hora').value = precio;
$('total-ahorrado').value = ahorro;
$('fecha-turno').value = iso(new Date());
render();