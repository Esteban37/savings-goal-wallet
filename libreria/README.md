# `rn-savings-notifier`

Librería **TurboModule** (New Architecture) del monorepo Savings Goal Wallet. Expone aviso nativo al completar o registrar una meta y un diálogo de confirmación. El host `mobile/` la consume como **dependencia de workspace**, no copia código nativo.

Detalle de producto e IA: [README raíz](../README.md) · [docs/ia/USO_IA.md](../docs/ia/USO_IA.md).

## Por qué TurboModule

El puente JS ↔ nativo está implementado como **TurboModule** (Codegen), no como NativeModule clásico. Encaja con RN 0.81 + New Architecture y tipa la spec en TypeScript (`NativeRnSavingsNotifier.ts`).

## Instalación (workspace)

En la raíz del monorepo:

```bash
npm install
```

`mobile/package.json` declara `"rn-savings-notifier": "*"`. Autolinking recoge Android (`libreria/android`) e iOS (`RnSavingsNotifier.podspec`). **No copies** `.kt` / `.mm` a `mobile/android` ni `mobile/ios`.

Tras clonar, iOS:

```bash
cd mobile/ios && pod install
```

## API pública

```ts
import {
  notifyGoalCompleted,
  notifyGoalCreated,
  showConfirmDialog,
} from 'rn-savings-notifier';

await notifyGoalCompleted('Vacaciones');
await notifyGoalCreated('Viaje');

const confirmed = await showConfirmDialog({
  title: 'Eliminar meta',
  message: '¿Quieres borrar esta meta?',
});
```

| Función | Nativo |
|---------|--------|
| `notifyGoalCompleted(goalName)` | Android Toast · iOS overlay |
| `notifyGoalCreated(goalName)` | Android Toast · iOS overlay |
| `showConfirmDialog({ title, message })` | Android `AlertDialog` · iOS `UIAlertController` → `Promise<boolean>` |

Nombre vacío: la Promise resuelve **sin** UI. Confirmación de baja: cancelar → `false` (no borrar).

## Cómo testear

Jest mockea el TurboModule; no hace falta emulador:

```bash
npm test -w libreria
npm run test:coverage -w libreria
```

Umbral **≥70%** en wrappers JS (`src/**/*.ts` salvo tests).

## IA gobernada

Skill: `libreria/.cursor/skills/turbomodule-js-wrapper-test/`. Agent: `libreria/.cursor/agents/architecture-boundary-reviewer.md`.
