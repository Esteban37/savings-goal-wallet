# Savings Goal Wallet

App React Native para **metas de ahorro**: listado nativo, abono en una micro-app web embebida y confirmación nativa al completar el objetivo. Monorepo npm con **Clean Architecture** feature-first, **Redux Toolkit** y una librería **TurboModule** de primer nivel.

![React Native](https://img.shields.io/badge/React_Native-0.81.6-61DAFB?logo=react&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.4-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Architecture](https://img.shields.io/badge/Clean_Architecture-feature--first-blue)
![New Architecture](https://img.shields.io/badge/New_Architecture-TurboModule-111111)

---

## Qué es

Savings Goal Wallet es un producto de tres paquetes en un solo repositorio. El host nativo es la fuente de verdad de las metas; la web solo pide abonos por `postMessage`; la librería nativa se **crea y se consume** como workspace, no se copia a `mobile/`.

| Workspace | Paquete | Rol |
|-----------|---------|-----|
| `mobile/` | `SavingsGoalWallet` | Host React Native (CLI oficial, sin Expo) |
| `libreria/` | `rn-savings-notifier` | TurboModule: aviso al completar una meta y diálogo de confirmación |
| `web/` | `web` | Micro-app HTML/JS estática cargada en el WebView (`file://`) |

**Fase actual:** Fase 1 — andamiaje del monorepo. Android abre, el WebView carga HTML local y el host importa la librería (stubs). Listado, Redux y Toast nativo real llegan en fases siguientes.

---

## Destacados

- **Monorepo npm** — un `npm install` enlaza `mobile`, `libreria` y `web`
- **Host CLI** — React Native **0.81.6**, React **19**, Hermes, New Architecture; **sin Expo**
- **Micro-app local** — `web/` se copia a assets de Android; sin servidor ni `fetch`
- **Librería de primer nivel** — TurboModule Kotlin + Objective-C, autolinking, nunca vendored en `mobile/`
- **Arquitectura congelada** — Clean Architecture feature-first, DI por factory + `extraArgument` de RTK
- **OpenSpec** — un change por fase, rama `feat/<change-name>`, PR hacia `main`

---

## Funcionalidades

### Implementado (Fase 1)

| Funcionalidad | Estado |
|---------------|--------|
| Workspaces `mobile/`, `libreria/`, `web/` | ✅ |
| Host Android RN 0.81 + New Architecture + Hermes | ✅ |
| WebView `file://` con HTML de `web/` | ✅ |
| Contrato de prueba `WEB_READY` / `DEPOSIT_REQUESTED` | ✅ |
| API JS `notifyGoalCompleted` / `showConfirmDialog` (stubs) | ✅ |
| Esqueleto `mobile/src` (composition root, `core/`, features) | ✅ |

### Por fase

| Fase | Entrega | Estado |
|------|---------|--------|
| **1** Andamiaje del monorepo | Metro, autolinking, WebView, librería stub | ✅ |
| **2** Dominio y contratos | `SavingsGoal`, Zod `postMessage`, puertos | Pendiente |
| **3** HU 1 — listado nativo | RTK + listado nombre / objetivo / acumulado / % | Pendiente |
| **4** HU 2–3 — detalle y abono | WebView inmersivo; listado sin recargar | Pendiente |
| **5** HU 4 — nativo real | Toast / notificación al 100% | Pendiente |
| **6** Persistencia | Adapter `GoalsRepository` (stretch) | Pendiente |
| **7** IA gobernada | Skills, agent, `docs/ia/USO_IA.md` | Pendiente |
| **8** Documentación de cierre | README de paquetes, coverage, huecos honestos | Pendiente |

Historias de producto (HU 1–4), diagramas y recortes de alcance: [`docs/PLAN_EJECUCION.md`](docs/PLAN_EJECUCION.md).

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| **React Native 0.81.6** | Host `mobile/` — no usar 0.82+ |
| **React 19.1.4** | UI del host |
| **Community CLI** | `@react-native-community/cli` 20 — sin Expo |
| **TypeScript** | Strict en `mobile/` y `libreria/` |
| **Redux Toolkit** | Fuente de verdad aplicativa (Fase 3+) |
| **Zod** | Contrato `postMessage` y snapshots (Fase 2+) |
| **react-native-webview** | Host de la micro-app local |
| **TurboModule** | `rn-savings-notifier` (Kotlin + Objective-C) |
| **Jest + RNTL** | Tests en `mobile/` y `libreria/`; **cero tests en `web/`** |
| **npm workspaces** | `install-strategy=nested` para Metro / autolinking |

---

## Arquitectura

Capas **dentro de cada feature** (`goals`, `goal-detail`, `notifications`), más un kernel en `core/`.

```
  Presentation  →  Application  →  Domain
                         │
                         ▼
                  Infrastructure
```

- **Domain:** `SavingsGoal`, `Money`, `Progress` — sin React, RN ni Redux
- **Application:** `GetGoals`, `MakeDeposit` y puertos (`GoalsRepository`, `GoalNotifier`)
- **Infrastructure:** in-memory / persistencia, adapter `postMessage`, adapter TurboModule, slice RTK
- **Presentation:** Container-Presenter; el detalle/abono vive en `web/`
- **DI:** factory en `app/di` inyectada con `thunk.extraArgument`; sin contenedor IoC

El dominio vive en nativo: la web emite `DEPOSIT_REQUESTED`; `MakeDeposit` decide. No se confirma el abono en la micro-app.

Detalle: [`docs/PLAN_EJECUCION.md`](docs/PLAN_EJECUCION.md) · specs en [`openspec/specs/`](openspec/specs/).

---

## Cómo ejecutar

**Requisitos:** Node **20+** · **JDK 17** · Android SDK · emulador o dispositivo.

```bash
git clone <url-del-repositorio>
cd savings-goal-wallet
npm install
npm start
```

En otra terminal:

```bash
npm run android
```

La app abre un WebView local con el botón **Request test deposit**. El host importa `rn-savings-notifier` al arrancar (stub; aún no hay Toast).

```bash
npm test
```

iOS del template existe; el cierre de Fase 1 es **Android**.

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/PLAN_EJECUCION.md`](docs/PLAN_EJECUCION.md) | Alcance HU 1–4, arquitectura, contrato `postMessage`, fases |
| [`openspec/specs/`](openspec/specs/) | Specs vigentes: workspaces, host, micro-app, librería |
| [`openspec/changes/archive/2026-08-20-fase-1-andamiaje-monorepo/`](openspec/changes/archive/2026-08-20-fase-1-andamiaje-monorepo/) | Change archivado de Fase 1 |
| [`mobile/README.md`](mobile/README.md) | Notas del template CLI (Metro, reload) |

---

## Uso de IA

> **Enfoque:** desarrollo **spec-driven** con **OpenSpec**: la arquitectura (Clean Architecture feature-first, TurboModule, bridge `postMessage`), el alcance por fase y los criterios de aceptación viven en el plan y en las specs. La IA **acelera** andamiaje, implementación y documentación **a partir de ese contrato**. Cada entrega se revisa antes de integrar: diff alineado a `tasks.md`, app Android que arranca, y decisión explícita de merge.

### Por qué SDD + OpenSpec

**SDD (Spec-Driven Development)** acota el trabajo de la IA: implementa contra specs y tareas, no contra prompts abiertos. **OpenSpec** materializa el flujo (proponer → aplicar → archivar). **Context7** ancla al modelo a documentación actual de React Native, Metro y la librería nativa.

### Quién decide qué

| Responsabilidad | Autor (criterio humano) | IA (asistente) |
|-----------------|-------------------------|----------------|
| Arquitectura, patrones y recortes de alcance | ✅ Definición y refinamiento | Sugerencias / implementación acotada |
| Alcance de producto y prioridades | ✅ | — |
| Aprobación de merge a `main` | ✅ | — |
| Rechazar o corregir output incorrecto | ✅ | — |
| Propuesta de código/tests/docs desde specs | — | ✅ |
| Ejecutar tareas de `tasks.md` | — | ✅ |

### Cómo se traza en Git

Un change OpenSpec ≈ una rama `feat/<change-name>` ≈ un PR → `main`. El historial refleja **entregas incrementales revisadas**, no un volcado único.

---

## Git workflow

`main` es la rama de integración. Cada change de OpenSpec se implementa en su propia rama y entra con pull request.

1. Actualizar `main` desde `origin/main`.
2. Crear `feat/<change-name>` desde `main` (esta fase: `feat/fase-1-andamiaje-monorepo`).
3. Commits convencionales (`feat`, `fix`, `test`, `docs`, `chore`) y push en esa rama.
4. Abrir un PR hacia `main` y mergearlo ahí.

---

## Autor

**Esteban Serrano** — Senior Mobile Software Engineer
