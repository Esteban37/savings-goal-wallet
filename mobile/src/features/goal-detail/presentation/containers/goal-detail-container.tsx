import { useCallback, useRef } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { selectGoalById } from '../../../goals/public';
import {
  createHostMessageScript,
  interpretWebToNativeMessage,
  serializeNativeToWeb,
} from '../../infrastructure';
import { requestDeposit } from '../../store';
import { WebViewHostPresenter } from '../presenters/web-view-host-presenter';
import {
  LOCAL_WEB_ASSET_URI,
  type HostWebView,
} from '../templates/immersive-web-view-template';

type GoalDetailContainerProps = {
  goalId: string;
};

function createSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function GoalDetailContainer({ goalId }: GoalDetailContainerProps) {
  const dispatch = useAppDispatch();
  const goal = useAppSelector(state => selectGoalById(state, goalId));
  const webViewRef = useRef<HostWebView | null>(null);
  const sessionIdRef = useRef(createSessionId());

  const injectNativeMessage = useCallback(
    (message: Parameters<typeof serializeNativeToWeb>[0]) => {
      const script = createHostMessageScript(serializeNativeToWeb(message));
      webViewRef.current?.injectJavaScript(script);
    },
    [],
  );

  const onWebViewRef = useCallback((ref: HostWebView | null) => {
    webViewRef.current = ref;
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const decision = interpretWebToNativeMessage(event.nativeEvent.data);
      if (decision.type === 'ignore') {
        return;
      }

      if (decision.type === 'bootstrap') {
        if (!goal) {
          return;
        }
        injectNativeMessage({
          type: 'SESSION_BOOTSTRAP',
          payload: {
            sessionId: sessionIdRef.current,
            goalId,
            userInfo: {},
            goal: {
              id: goal.id,
              name: goal.name,
              targetAmount: goal.targetAmount,
              depositedAmount: goal.depositedAmount,
              progressPercent: goal.progressPercent,
            },
          },
        });
        return;
      }

      void (async () => {
        const result = await dispatch(
          requestDeposit({ goalId, amount: decision.amount }),
        );
        if (requestDeposit.fulfilled.match(result)) {
          injectNativeMessage({
            type: 'DEPOSIT_SUCCEEDED',
            payload: result.payload,
          });
          return;
        }
        injectNativeMessage({
          type: 'DEPOSIT_FAILED',
          payload: result.payload ?? {
            goalId,
            reason: 'invalid-amount',
          },
        });
      })();
    },
    [dispatch, goal, goalId, injectNativeMessage],
  );

  return (
    <WebViewHostPresenter
      sourceUri={LOCAL_WEB_ASSET_URI}
      onMessage={onMessage}
      onWebViewRef={onWebViewRef}
    />
  );
}
