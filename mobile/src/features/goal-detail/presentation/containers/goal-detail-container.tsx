import { useCallback, useRef } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import type { ColorScheme } from '../../../../shared/ui/tokens';
import { selectGoalById } from '../../../goals/public';
import {
  createHostMessageScript,
  interpretWebToNativeMessage,
  serializeNativeToWeb,
} from '../../infrastructure';
import { requestCreate, requestDeposit } from '../../store';
import { WebViewHostPresenter } from '../presenters/web-view-host-presenter';
import {
  LOCAL_WEB_ASSET_URI,
  type HostWebView,
} from '../templates/immersive-web-view-template';

const CREATE_HANDSHAKE_GOAL_ID = 'pending';

export type GoalDetailContainerProps = {
  mode: 'deposit' | 'create';
  goalId?: string;
  colorScheme: ColorScheme;
  onCreateSuccess?: () => void;
};

function createSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function GoalDetailContainer({
  mode,
  goalId,
  colorScheme,
  onCreateSuccess,
}: GoalDetailContainerProps) {
  const dispatch = useAppDispatch();
  const goal = useAppSelector(state =>
    goalId ? selectGoalById(state, goalId) : undefined,
  );
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
        if (mode === 'create') {
          injectNativeMessage({
            type: 'SESSION_BOOTSTRAP',
            payload: {
              sessionId: sessionIdRef.current,
              goalId: CREATE_HANDSHAKE_GOAL_ID,
              userInfo: {},
              mode: 'create',
            },
          });
          return;
        }
        if (!goal || !goalId) {
          return;
        }
        injectNativeMessage({
          type: 'SESSION_BOOTSTRAP',
          payload: {
            sessionId: sessionIdRef.current,
            goalId,
            userInfo: {},
            mode: 'deposit',
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

      if (decision.type === 'create') {
        if (mode !== 'create') {
          return;
        }
        void (async () => {
          const result = await dispatch(
            requestCreate({
              name: decision.name,
              targetAmount: decision.targetAmount,
            }),
          );
          if (requestCreate.fulfilled.match(result)) {
            injectNativeMessage({
              type: 'CREATE_SUCCEEDED',
              payload: result.payload,
            });
            onCreateSuccess?.();
            return;
          }
          injectNativeMessage({
            type: 'CREATE_FAILED',
            payload: result.payload ?? { reason: 'invalid-target' },
          });
        })();
        return;
      }

      if (mode !== 'deposit' || !goalId) {
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
    [dispatch, goal, goalId, injectNativeMessage, mode, onCreateSuccess],
  );

  return (
    <WebViewHostPresenter
      sourceUri={LOCAL_WEB_ASSET_URI}
      colorScheme={colorScheme}
      onMessage={onMessage}
      onWebViewRef={onWebViewRef}
    />
  );
}
