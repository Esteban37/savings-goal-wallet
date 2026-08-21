const HANDSHAKE_GOAL_ID = 'pending';

let bootstrappedGoalId = null;

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

function renderGoal(goal) {
  $('waiting').classList.add('hidden');
  $('detail').classList.remove('hidden');
  $('goal-name').textContent = goal.name;
  $('target-amount').textContent = formatPesos(goal.targetAmount);
  $('deposited-amount').textContent = formatPesos(goal.depositedAmount);
  $('progress-percent').textContent = String(goal.progressPercent);
}

function onHostMessage(message) {
  if (!message || typeof message !== 'object') {
    return;
  }
  if (message.type === 'SESSION_BOOTSTRAP' && message.payload && message.payload.goal) {
    bootstrappedGoalId = message.payload.goalId;
    hideError();
    renderGoal(message.payload.goal);
    return;
  }
  if (message.type === 'DEPOSIT_SUCCEEDED' && message.payload) {
    hideError();
    $('deposited-amount').textContent = formatPesos(message.payload.depositedAmount);
    $('progress-percent').textContent = String(message.payload.progressPercent);
    return;
  }
  if (message.type === 'DEPOSIT_FAILED') {
    showError('No se pudo aplicar el abono. Revisa el monto e inténtalo de nuevo.');
  }
}

window.__onHostMessage = onHostMessage;

window.addEventListener('load', function onLoad() {
  postToHost('WEB_READY', { goalId: HANDSHAKE_GOAL_ID });
});

const depositButton = $('deposit-button');
if (depositButton) {
  depositButton.addEventListener('click', function onDepositClick() {
    if (!bootstrappedGoalId) {
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
