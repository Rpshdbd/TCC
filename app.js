// KEY do "banco"
const DB_KEY = 'fitgym_db_v2';

// estrutura padrão
const defaultData = {
  students: [],
  workouts: [],
  payments: [],
  catraca: [],         // registros {id, studentId, datetime}
  equipamentos: [],    // {id, nome, descricao, date}
  adminPin: '123456'
};

// carregar / salvar
function loadDB(){
  const raw = localStorage.getItem(DB_KEY);
  if(!raw){ localStorage.setItem(DB_KEY, JSON.stringify(defaultData)); return structuredClone(defaultData); }
  try { return JSON.parse(raw); }
  catch(e){ localStorage.setItem(DB_KEY, JSON.stringify(defaultData)); return structuredClone(defaultData); }
}
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

let db = loadDB();

/* ===================== NAV ===================== */
const sections = {
  'nav-home':'section-home',
  'nav-register':'section-register',
  'nav-workout':'section-workout',
  'nav-payments':'section-payments',
  'nav-catraca':'section-catraca',
  'nav-equip':'section-equip',
  'nav-admin':'section-admin'
};

document.querySelectorAll('.nav button').forEach(btn=>{
  btn.addEventListener('click', ()=> openSection(btn.id));
});

function openSection(id){
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active', b.id===id));
  Object.values(sections).forEach(s=>document.getElementById(s).style.display='none');
  const target = sections[id];
  document.getElementById(target).style.display='block';
  refreshAll();
}

/* ===================== STUDENTS ===================== */
function registerStudent(){
  const name = document.getElementById('r-name').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const plan = document.getElementById('r-plan').value;
  const pass = document.getElementById('r-pass').value.trim();
  const note = document.getElementById('r-note').value.trim();

  if(!name || !phone){ alert('Preencha nome e telefone'); return; }
  if(pass && (!/^[0-9]+$/.test(pass) || pass.length > 6)){ alert('Senha deve ter até 6 dígitos numéricos'); return; }

  const id = Date.now().toString();
  db.students.push({ id, name, phone, email, plan, pass, note, created: new Date().toISOString() });
  saveDB(db);
  resetForm();
  refreshAll();
  alert('Aluno cadastrado!');
}
function resetForm(){ document.getElementById('form-register').reset(); }

/* populate selects */
function populateStudentSelects(){
  const selects = ['w-student','p-student','catraca-student'];
  selects.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = '<option value="">— selecione —</option>';
    db.students.forEach(s=>{
      const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.name;
      el.appendChild(opt);
    });
  });
}

/* ===================== WORKOUTS ===================== */
/* lista de exercícios padrão */
const DEFAULT_EXERCISES = [
  {name:'Supino Reto'}, {name:'Supino Inclinado'}, {name:'Crossover'},
  {name:'Puxada Frente'}, {name:'Remada Baixa'}, {name:'Remada Unilateral'},
  {name:'Agachamento Livre'}, {name:'Leg Press'}, {name:'Cadeira Extensora'},
  {name:'Rosca Direta'}, {name:'Rosca Alternada'}, {name:'Tríceps Testa'},
  {name:'Tríceps Pulley'}, {name:'Elevação Lateral'}, {name:'Desenvolvimento'},
  {name:'Abdominal'}, {name:'Prancha'}
];

function renderExerciseList(){
  const container = document.getElementById('exercise-list');
  container.innerHTML = '';
  DEFAULT_EXERCISES.forEach(e=>{
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${e.name}"> ${e.name}`;
    container.appendChild(label);
  });
}

function createWorkout(){
  const sid = document.getElementById('w-student').value;
  const name = document.getElementById('w-name').value.trim();
  const checked = Array.from(document.querySelectorAll('#exercise-list input[type=checkbox]:checked')).map(i=>i.value);

  if(!sid || !name){ alert('Selecione aluno e nome do treino'); return; }
  if(checked.length === 0){ if(!confirm('Salvar treino sem exercícios selecionados?')) return; }

  db.workouts.push({
    id: 'w' + Date.now(),
    studentId: sid,
    name,
    exercises: checked,
    created: new Date().toISOString()
  });
  saveDB(db);
  document.getElementById('form-workout').reset();
  renderWorkouts();
  alert('Treino salvo!');
}
function renderWorkouts(){
  const container = document.getElementById('workouts-list');
  container.innerHTML = '';
  if(!db.workouts.length){ container.innerHTML = '<div class="muted">Nenhum treino criado</div>'; return; }
  db.workouts.slice().reverse().forEach(w=>{
    const s = db.students.find(x=>x.id===w.studentId);
    const div = document.createElement('div'); div.className='student-item';
    div.innerHTML = `<div><strong>${w.name}</strong> <small class="muted">(${s? s.name : 'aluno removido'})</small>
      <div class="muted" style="font-size:13px">${w.exercises.join(', ') || '—'}</div></div>
      <div style="display:flex;gap:8px">
        <button class="btn ghost" onclick="removeWorkout('${w.id}')">Remover</button>
      </div>`;
    container.appendChild(div);
  });
}
function removeWorkout(id){ db.workouts = db.workouts.filter(w=>w.id!==id); saveDB(db); renderWorkouts(); }

/* ===================== PAGAMENTOS ===================== */
function addPayment(){
  const sid = document.getElementById('p-student').value;
  const plan = document.getElementById('p-plan').value;
  const date = document.getElementById('p-date').value || new Date().toISOString().slice(0,10);
  if(!sid){ alert('Selecione um aluno'); return; }
  const price = plan==='mensal'?120 : plan==='trimestral'?320 : 1000;
  db.payments.push({ id: 'p'+Date.now(), studentId: sid, plan, price, date });
  saveDB(db);
  renderPayments();
  alert('Pagamento registrado');
}
function renderPayments(){
  const c = document.getElementById('payments-list');
  c.innerHTML = '';
  if(db.payments.length === 0){ c.innerHTML = '<div class="muted">Nenhum pagamento registrado</div>'; return; }
  db.payments.slice().reverse().forEach(p=>{
    const s = db.students.find(x=>x.id===p.studentId);
    const div = document.createElement('div'); div.className='student-item';
    div.innerHTML = `<div><strong>${s ? s.name : 'Aluno removido'}</strong><div class="muted">${p.plan} · R$${p.price} · ${p.date}</div></div>
      <div style="display:flex;gap:8px"><button class="btn ghost" onclick="removePayment('${p.id}')">Remover</button></div>`;
    c.appendChild(div);
  });
}
function removePayment(id){ if(!confirm('Remover pagamento?')) return; db.payments = db.payments.filter(p=>p.id!==id); saveDB(db); renderPayments(); }

/* ===================== CATRACA ===================== */
function registrarCatraca(){
  const sid = document.getElementById('catraca-student').value || null;
  const rec = { id: 'c'+Date.now(), studentId: sid, datetime: new Date().toISOString() };
  db.catraca.push(rec);
  saveDB(db);
  renderCatraca();
}
function renderCatraca(){
  document.getElementById('catracaCount').textContent = db.catraca.length;
  document.getElementById('stat-catraca').textContent = db.catraca.length;
  const c = document.getElementById('catraca-list');
  c.innerHTML = '';
  db.catraca.slice().reverse().slice(0,20).forEach(r=>{
    const s = db.students.find(x=>x.id===r.studentId);
    const li = document.createElement('div'); li.className='student-item';
    li.innerHTML = `<div><strong>${s ? s.name : '—'}</strong><div class="muted">${new Date(r.datetime).toLocaleString()}</div></div>`;
    c.appendChild(li);
  });
}

/* ===================== EQUIPAMENTOS ===================== */
function registrarEquipamento(){
  const nome = document.getElementById('equip-nome').value.trim();
  if(!nome){ alert('Informe o nome do equipamento'); return; }
  db.equipamentos.push({ id: 'e'+Date.now(), nome, descricao:'', date: (new Date()).toISOString().slice(0,10) });
  saveDB(db);
  document.getElementById('equip-nome').value = '';
  renderEquipamentos();
}
function renderEquipamentos(){
  const ul = document.getElementById('listaEquipamentos'); ul.innerHTML = '';
  if(db.equipamentos.length === 0){ ul.innerHTML = '<li class="muted">Nenhum equipamento registrado</li>'; return; }
  db.equipamentos.slice().reverse().forEach(eq=>{
    const li = document.createElement('li'); li.style.marginBottom='8px';
    li.innerHTML = `<strong>${eq.nome}</strong> <span class="muted" style="font-size:13px">(${eq.date})</span>
      <button class="btn ghost" style="margin-left:8px" onclick="removerEquip('${eq.id}')">Remover</button>`;
    ul.appendChild(li);
  });
}
function removerEquip(id){ if(!confirm('Remover equipamento?')) return; db.equipamentos = db.equipamentos.filter(e=>e.id!==id); saveDB(db); renderEquipamentos(); }

/* ===================== RENDER STUDENTS ===================== */
function renderStudentsList(){
  const c = document.getElementById('students-list'); c.innerHTML = '';
  if(db.students.length === 0){ c.innerHTML = '<div class="muted">Nenhum aluno cadastrado</div>'; return; }
  db.students.slice().reverse().forEach(s=>{
    const div = document.createElement('div'); div.className='student-item';
    div.innerHTML = `<div>
        <strong>${s.name}</strong>
        <div class="muted" style="font-size:13px">${s.phone} · Plano: ${s.plan}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn ghost" onclick="viewStudent('${s.id}')">Ver</button>
        <button class="btn" onclick="deleteStudent('${s.id}')">Excluir</button>
      </div>`;
    c.appendChild(div);
  });
  document.getElementById('stat-students').textContent = db.students.length;
}
function viewStudent(id){
  const s = db.students.find(x=>x.id===id); if(!s) return;
  let txt = `Aluno:\n${s.name}\nTel: ${s.phone}\nEmail: ${s.email||'-'}\nPlano: ${s.plan}\nObs: ${s.note||'-'}`;
  alert(txt);
}
function deleteStudent(id){ if(!confirm('Deseja excluir este aluno?')) return; db.students = db.students.filter(x=>x.id!==id); db.workouts = db.workouts.filter(w=>w.studentId!==id); db.payments = db.payments.filter(p=>p.studentId!==id); saveDB(db); refreshAll(); }

/* ===================== ADM ===================== */
let isAdm = false;
function loginAdm(){
  const pin = document.getElementById('adm-pin').value.trim();
  if(pin === db.adminPin){ isAdm = true; renderAdminPanel(); alert('Acesso ADM liberado'); }
  else alert('PIN incorreto');
}
function logoutAdm(){ isAdm = false; document.getElementById('adm-pin').value=''; renderAdminPanel(); }
function renderAdminPanel(){
  const panel = document.getElementById('adm-panel');
  if(!isAdm){ panel.innerHTML = 'Acesse com PIN para ver os dados administrativos.'; return; }
  // resumo administrativo
  const receita = db.payments.reduce((s,p)=>s+p.price,0);
  panel.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div class="stat"><div class="muted">Total alunos</div><strong>${db.students.length}</strong></div>
      <div class="stat"><div class="muted">Pagamentos</div><strong>${db.payments.length}</strong></div>
      <div class="stat"><div class="muted">Receita (R$)</div><strong>${receita.toFixed(2)}</strong></div>
      <div style="width:100%;margin-top:8px"><h4>Alunos (lista)</h4><div id="adm-students-mini"></div></div>
    </div>
  `;
  const admList = document.getElementById('adm-students-mini');
  admList.innerHTML = '';
  db.students.forEach(s=>{
    const div = document.createElement('div'); div.className='student-item';
    div.style.marginBottom='6px';
    div.innerHTML = `<div><strong>${s.name}</strong><div class="muted">${s.email||'-'} · ${s.phone}</div></div>`;
    admList.appendChild(div);
  });
}

/* ===================== SEARCH ===================== */
document.getElementById('search').addEventListener('input', function(){
  const q = this.value.toLowerCase().trim();
  document.querySelectorAll('#students-list .student-item').forEach(item=>{
    item.style.display = item.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
  });
});

/* ===================== REFRESH ALL ===================== */
function refreshAll(){
  db = loadDB();
  populateStudentSelects();
  renderExerciseList();
  renderStudentsList();
  renderWorkouts();
  renderPayments();
  renderCatraca();
  renderEquipamentos();
  renderAdminPanel();
  // planos summary
  const plans = db.students.reduce((acc,s)=>{ acc[s.plan] = (acc[s.plan]||0)+1; return acc; }, {});
  document.getElementById('stat-plans').textContent = `M:${plans.mensal||0} T:${plans.trimestral||0} A:${plans.anual||0}`;
  document.getElementById('stat-payments').textContent = db.payments.length;
}
window.openSection = openSection;
window.registerStudent = registerStudent;
window.resetForm = resetForm;
window.createWorkout = createWorkout;
window.addPayment = addPayment;
window.registrarCatraca = registrarCatraca;
window.registrarEquipamento = registrarEquipamento;
window.viewStudent = viewStudent;
window.deleteStudent = deleteStudent;
window.loginAdm = loginAdm;
window.logoutAdm = logoutAdm;
window.removeWorkout = removeWorkout;
window.removePayment = removePayment;
window.removerEquip = removerEquip;

refreshAll();
