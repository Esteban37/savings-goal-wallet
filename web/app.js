const HANDSHAKE_GOAL_ID = 'pending';

let bootstrappedGoalId = null;
let sessionMode = null;

function postToHost(type, payload) {
  const envelope = JSON.stringify({ type: type, payload: payload });
  if (
    window.ReactNativeWebView &&
    typeof window.ReactNativeWebView.postMessage === 'function'
  ) {
    window.ReactNativeWebView.postMessage(envelope);
  }
}

function $(id) {
  return document.getElementById(id);
}

function formatPesos(amount) {
  return String(Math.trunc(amount));
}

function showError(message) {
  const errorEl = $('error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function hideError() {
  const errorEl = $('error');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

function showCreateError(message) {
  const errorEl = $('create-error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function hideCreateError() {
  const errorEl = $('create-error');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

function renderGoal(goal) {
  $('waiting').classList.add('hidden');
  $('create').classList.add('hidden');
  $('detail').classList.remove('hidden');
  $('target-amount').textContent = formatPesos(goal.targetAmount);
  $('deposited-amount').textContent = formatPesos(goal.depositedAmount);
  $('progress-percent').textContent = String(goal.progressPercent);
}

function renderCreateForm() {
  $('waiting').classList.add('hidden');
  $('detail').classList.add('hidden');
  $('create').classList.remove('hidden');
  hideCreateError();
  $('create-success').classList.add('hidden');
  $('create-success').textContent = '';
}

function onHostMessage(message) {
  if (!message || typeof message !== 'object') {
    return;
  }
  if (message.type === 'SESSION_BOOTSTRAP' && message.payload) {
    sessionMode = message.payload.mode;
    if (sessionMode === 'create') {
      bootstrappedGoalId = null;
      renderCreateForm();
      return;
    }
    if (sessionMode === 'deposit' && message.payload.goal) {
      bootstrappedGoalId = message.payload.goalId;
      hideError();
      renderGoal(message.payload.goal);
    }
    return;
  }
  if (sessionMode === 'deposit' && message.type === 'DEPOSIT_SUCCEEDED' && message.payload) {
    hideError();
    $('deposited-amount').textContent = formatPesos(message.payload.depositedAmount);
    $('progress-percent').textContent = String(message.payload.progressPercent);
    $('amount-input').value = '';
    return;
  }
  if (sessionMode === 'deposit' && message.type === 'DEPOSIT_FAILED') {
    showError('No se pudo aplicar el abono. Revisa el monto e inténtalo de nuevo.');
    return;
  }
  if (sessionMode === 'create' && message.type === 'CREATE_SUCCEEDED' && message.payload && message.payload.goal) {
    hideCreateError();
    const successEl = $('create-success');
    successEl.textContent = 'Meta registrada: ' + message.payload.goal.name;
    successEl.classList.remove('hidden');
    return;
  }
  if (sessionMode === 'create' && message.type === 'CREATE_FAILED') {
    showCreateError('No se pudo crear la meta. Revisa el nombre y el objetivo.');
  }
}

window.__onHostMessage = onHostMessage;

window.addEventListener('load', function onLoad() {
  postToHost('WEB_READY', { goalId: HANDSHAKE_GOAL_ID });
});

const depositButton = $('deposit-button');
if (depositButton) {
  depositButton.addEventListener('click', function onDepositClick() {
    if (sessionMode !== 'deposit' || !bootstrappedGoalId) {
      return;
    }
    const rawAmount = $('amount-input').value;
    const amount = Number(rawAmount);
    postToHost('DEPOSIT_REQUESTED', {
      goalId: bootstrappedGoalId,
      amount: amount,
    });
  });
}

const createButton = $('create-button');
if (createButton) {
  createButton.addEventListener('click', function onCreateClick() {
    if (sessionMode !== 'create') {
      return;
    }
    const name = $('name-input').value;
    const targetAmount = Number($('target-input').value);
    postToHost('CREATE_REQUESTED', {
      name: name,
      targetAmount: targetAmount,
    });
  });
}
