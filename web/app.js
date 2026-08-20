const PLACEHOLDER_GOAL_ID = 'goal-scaffold';
const TEST_DEPOSIT_AMOUNT = 10000;

function postToHost(type, payload) {
  const envelope = JSON.stringify({ type: type, payload: payload });
  if (
    window.ReactNativeWebView &&
    typeof window.ReactNativeWebView.postMessage === 'function'
  ) {
    window.ReactNativeWebView.postMessage(envelope);
  }
}

window.addEventListener('load', function onLoad() {
  postToHost('WEB_READY', { goalId: PLACEHOLDER_GOAL_ID });
});

const depositButton = document.getElementById('deposit-button');
if (depositButton) {
  depositButton.addEventListener('click', function onDepositClick() {
    postToHost('DEPOSIT_REQUESTED', {
      goalId: PLACEHOLDER_GOAL_ID,
      amount: TEST_DEPOSIT_AMOUNT,
    });
  });
}
