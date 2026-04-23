const API_URL = 'http://localhost:3000';

// ===== ABAS =====
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('section-' + btn.dataset.tab).classList.add('active');
  });
});

// ===== LINHAS =====
const linhaForm  = document.getElementById('linha-form');
const linhaId    = document.getElementById('linha-id');
const formTitle  = document.getElementById('form-title');
const cancelEdit = document.getElementById('cancel-edit');
const message    = document.getElementById('message');
const linhasList = document.getElementById('linhas-list');
const reloadBtn  = document.getElementById('reload-btn');

function showMessage(text) {
  message.textContent = text;
}

function clearLinhaForm() {
  linhaForm.reset();
  linhaId.value = '';
  formTitle.textContent = 'Nova linha';
  cancelEdit.classList.add('hidden');
}

async function loadLinhas() {
  const response = await fetch(API_URL + '/api/linhas');
  const linhas = await response.json();

  if (!linhas.length) {
    linhasList.innerHTML = '<p>Nenhuma linha encontrada.</p>';
    return;
  }

  linhasList.innerHTML = linhas.map((linha) => `
    <div class="entry-item">
      <h3>${linha.numero} — ${linha.nome}</h3>
      <p>🟢 ${linha.origem} → 🔴 ${linha.destino}</p>
      <div class="entry-buttons">
        <button class="btn-edit" onclick="editLinha('${linha._id}')">Editar</button>
        <button class="btn-delete" onclick="deleteLinha('${linha._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

window.editLinha = async function (id) {
  const response = await fetch(API_URL + '/api/linhas/' + id);
  const linha = await response.json();

  linhaId.value = linha._id;
  document.getElementById('numero').value = linha.numero;
  document.getElementById('nome').value = linha.nome;
  document.getElementById('origem').value = linha.origem;
  document.getElementById('destino').value = linha.destino;

  formTitle.textContent = 'Editar linha';
  cancelEdit.classList.remove('hidden');
  showMessage('Editando linha.');
};

window.deleteLinha = async function (id) {
  if (!confirm('Deseja excluir esta linha?')) return;

  await fetch(API_URL + '/api/linhas/' + id, { method: 'DELETE' });
  showMessage('Linha excluída.');
  loadLinhas();
};

linhaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = linhaId.value;
  const data = {
    numero: document.getElementById('numero').value,
    nome: document.getElementById('nome').value,
    origem: document.getElementById('origem').value,
    destino: document.getElementById('destino').value
  };

  await fetch(
    id ? API_URL + '/api/linhas/' + id : API_URL + '/api/linhas',
    {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );

  showMessage(id ? 'Linha atualizada.' : 'Linha criada.');
  clearLinhaForm();
  loadLinhas();
});

cancelEdit.addEventListener('click', () => {
  clearLinhaForm();
  showMessage('Edição cancelada.');
});

reloadBtn.addEventListener('click', loadLinhas);

// ===== PARADAS =====
const paradaForm    = document.getElementById('parada-form');
const paradaId      = document.getElementById('parada-id');
const paradaTitle   = document.getElementById('parada-form-title');
const paradaCancel  = document.getElementById('parada-cancel');
const paradaMessage = document.getElementById('parada-message');
const paradasList   = document.getElementById('paradas-list');

function showParadaMessage(text) {
  paradaMessage.textContent = text;
}

function clearParadaForm() {
  paradaForm.reset();
  paradaId.value = '';
  paradaTitle.textContent = 'Nova parada';
  paradaCancel.classList.add('hidden');
}

async function loadParadas() {
  const response = await fetch(API_URL + '/api/paradas');
  const paradas = await response.json();

  if (!paradas.length) {
    paradasList.innerHTML = '<p>Nenhuma parada encontrada.</p>';
    return;
  }

  paradasList.innerHTML = paradas.map((p) => `
    <div class="entry-item">
      <h3>📍 ${p.nome}</h3>
      <p>${p.endereco}</p>
      ${p.referencia ? `<p>📌 ${p.referencia}</p>` : ''}
      <div class="entry-buttons">
        <button class="btn-edit" onclick="editParada('${p._id}')">Editar</button>
        <button class="btn-delete" onclick="deleteParada('${p._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

window.editParada = async function (id) {
  const response = await fetch(API_URL + '/api/paradas/' + id);
  const p = await response.json();

  paradaId.value = p._id;
  document.getElementById('parada-nome').value = p.nome;
  document.getElementById('parada-endereco').value = p.endereco;
  document.getElementById('parada-referencia').value = p.referencia || '';

  paradaTitle.textContent = 'Editar parada';
  paradaCancel.classList.remove('hidden');
  showParadaMessage('Editando parada.');
};

window.deleteParada = async function (id) {
  if (!confirm('Deseja excluir esta parada?')) return;

  await fetch(API_URL + '/api/paradas/' + id, { method: 'DELETE' });
  showParadaMessage('Parada excluída.');
  loadParadas();
};

paradaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = paradaId.value;
  const data = {
    nome: document.getElementById('parada-nome').value,
    endereco: document.getElementById('parada-endereco').value,
    referencia: document.getElementById('parada-referencia').value
  };

  await fetch(
    id ? API_URL + '/api/paradas/' + id : API_URL + '/api/paradas',
    {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );

  showParadaMessage(id ? 'Parada atualizada.' : 'Parada criada.');
  clearParadaForm();
  loadParadas();
});

paradaCancel.addEventListener('click', () => {
  clearParadaForm();
  showParadaMessage('Edição cancelada.');
});

document.getElementById('parada-reload').addEventListener('click', loadParadas);

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registrado com sucesso.');
    } catch (error) {
      console.log('Erro ao registrar Service Worker:', error);
    }
  });
}

// ===== INIT =====
loadLinhas();
