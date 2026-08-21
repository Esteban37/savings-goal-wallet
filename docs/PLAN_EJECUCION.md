# Plan de ejecución — Savings Goal Wallet

**Savings Goal Wallet** es un producto de metas de ahorro en un monorepo npm (`web/`, `libreria/`, `mobile/`) con historial incremental. El host nativo lista las metas; el abono vive en una micro-app web embebida; la confirmación al completar una meta es un TurboModule de primer nivel en `libreria/`.

Este documento congela **alcance, arquitectura y orden de fases**. El objetivo es cubrir HU 1–4 **sin solapar trabajo ni reabrir Metro, contratos o carpetas a mitad de historia**. Las decisiones de ingeniería quedan nombradas en código y en el README.

**Changes OpenSpec archivados:** `fase-1-andamiaje-monorepo`, `fase-2-dominio-puertos-contrato`, `fase-3-redux-hu-1` (listado HU 1), `fase-4-webview-abono` (HU 2–3), `fase-5-hu-4-nativo-real` (Toast nativo HU 4), `fase-6-persistencia` (AsyncStorage), `fase-7-ui-contemporanea` (títulos únicos y apariencia), `fase-8-alta-baja-metas` (FAB + baja), `fase-9-ios-host` (Simulator + TurboModule iOS) y `fase-10-ia-docs-cierre` (IA gobernada + documentación de entrega). Las once fases del plan están aplicadas.

---

## 1. Alcance congelado

### Historias

| HU | Debe | Capas / responsabilidad |
| --- | --- | --- |
| **1** | Listado nativo: nombre, objetivo, acumulado, % progreso | Presentation + Redux + dominio |
| **2** | Detalle/abono en WebView (`web/` local) | Shell nativo + micro-app |
| **3** | Abono en web actualiza Redux; el listado refleja el acumulado **sin recargar** | Bridge + use case + store como fuente de verdad |
| **4** | Confirmación local (módulo nativo) al llegar a 100% | Librería TurboModule consumida, no copiada |

HU 1–3 son el núcleo del producto (listado, detalle/abono en WebView, store actualizada sin recargar). **Este plan incluye HU 4 desde el diseño** (puerto + stub en Fase 1, nativo real en Fase 5) para no reingeniar Application cuando llegue la notificación.

### Decisiones de plataforma (congeladas)

- React Native **0.81.x + React 19**, CLI oficial, **sin Expo**.
- Librería **TurboModule** (New Architecture), no NativeModule clásico.
- Persistencia básica detrás del mismo puerto `GoalsRepository` (Fase 6 = cambiar adapter, no el dominio).
- Arquitectura y patrón **nombrados** en código y README.

### Recorte de alcance

Si hay que recortar, el orden es: dispositivo físico / TestFlight → App Store. **No se recorta** el contrato `postMessage`, el puerto de notificación, el esqueleto de carpetas, ni el host iOS en Simulator. Lo que falte se documenta en el README raíz: qué falta y cómo se haría.

---

## 2. Principios de arquitectura (cerrados)

Ajustados al tamaño del producto y al monorepo. No hay una segunda “Fase 0 de decisión”: lo de abajo es la base que las fases implementan.

### 2.1 Clean Architecture + feature-first

Capas **dentro de cada feature**, no un `domain/` / `presentation/` global que mezcle bounded contexts.

```
  Presentation  →  Application  →  Domain
                         │
                         ▼
                  Infrastructure
```

- **Domain:** entidades y value objects puros (`SavingsGoal`, `Money`, `Progress`). Cero imports de React, RN o Redux.
- **Application:** casos de uso (`GetGoals`, `MakeDeposit`) y **puertos**. Orquesta; no conoce WebView ni Toast.
- **Infrastructure:** repositorio in-memory, adapter `postMessage`, adapter TurboModule, slice RTK (serialización del estado).
- **Presentation:** Container-Presenter + templates. Sin reglas de negocio.

El **kernel compartido** (`core/`) guarda solo lo que dos o más features necesitan: dominio de metas, contratos del bridge, puertos. Las features no se importan entre sí salvo por su `public.ts`.

### 2.2 Desacoplamiento cross-feature (equipos integrales)

Tres features que mapean a HUs, más el kernel. Un equipo podría tomar una feature sin abrir la UI de otra.

```
┌──────────── core (shared kernel) ─────────────┐
│  SavingsGoal, Money, Progress                 │
│  puertos: GoalsRepository, GoalNotifier,      │
│           ConfirmDialog                       │
│  contrato Zod: NativeToWeb / WebToNative      │
└───────────────┬───────────────┬───────────────┘
                │               │
        ┌───────▼──────┐ ┌──────▼───────┐ ┌────────────▼─────────┐
        │    goals     │ │ goal-detail  │ │    notifications     │
        │    HU 1      │ │   HU 2–3     │ │       HU 4           │
        │ list + slice │ │ WebView +    │ │ listener + adapter   │
        │ GetGoals     │ │ MakeDeposit  │ │ de libreria/         │
        └───────┬──────┘ └──────┬───────┘ └────────────┬─────────┘
                │               │                      │
                └───────────────┴──────────┬───────────┘
                                           ▼
                              app/  composition root
                              (store + extraArgument + listeners)
```

Reglas de importación (congeladas):

| Desde | Puede importar | No puede importar |
| --- | --- | --- |
| `core/` | nada de `features/` ni RN/Redux | — |
| `features/X` | `core/`, `shared/ui`, `X/public` de otra feature | internals de otra feature (`presentation/`, `store/` interno) |
| `app/` | todo (único composition root) | — |
| `shared/ui` | RN, tokens | features, core de dominio (salvo tipos de view-model) |

Comunicación entre features: **acciones de Redux + listener middleware**, no llamadas a contenedores ajenos. Ejemplo: `goal-detail` despacha el resultado de `MakeDeposit`; `goals` re-renderiza por selector; `notifications` escucha `depositApplied` y llama al puerto si `isCompleted`.

### 2.3 Container-Presenter

Variante idiomática en React 19 / RN 0.81: el Container es un componente (o hook `useX`) que **solo orquesta**; el Presenter es UI sin I/O.

```
Container                         Presenter
─────────                         ─────────
lee selectors                     recibe props ya listas
dispatch / use cases              sin store, sin fetch, sin bridge
inyecta callbacks                 sin TurboModule
elige template                    sin conocimiento de features
```

- `GoalListContainer` → `GoalListPresenter` dentro de `GoalListTemplate`.
- `GoalDetailContainer` → `WebViewHostPresenter` dentro de `ImmersiveWebViewTemplate`.
- El Presenter se testea con props. El Container se testea con store de prueba + fakes en `extraArgument`.

### 2.4 DI explícita (sin contenedor IoC)

No Inversify / tsyringe: un contenedor IoC suma magia y no aporta frente a una factory explícita en el composition root:

```
createAppDependencies(): AppDependencies
  repository: InMemoryGoalsRepository (Fase 3) | PersistedGoalsRepository (Fase 6)
  getGoals: GetGoals(repository)
  makeDeposit: MakeDeposit(repository)
  goalNotifier: RnSavingsNotifierAdapter   // stub Fase 1, real Fase 5
  confirmDialog: RnConfirmDialogAdapter
```

Los casos de uso reciben puertos por constructor/factory. Presentation **no** instancia adapters. Tests sustituyen `AppDependencies` enteras.

### 2.5 DI con Redux (RTK)

Redux Toolkit es la fuente de verdad **aplicativa** (listado + resultado del abono), no un service locator improvisado.

Patrón cerrado:

1. `configureStore` con `thunk.extraArgument = dependencies`.
2. Thunks tipados (`AppThunk`) obtienen use cases desde `extra`; no importan adapters.
3. Reducers siguen puros y serializables: reciben **resultados de dominio**, no ejecutan I/O.
4. `createListenerMiddleware` registra reacciones cross-feature (HU 4) en `app/`, o el feature `notifications` exporta `registerNotificationsListeners` y `app/` lo llama.
5. `Provider` de `react-redux` envuelve la app. No se duplica el mismo estado en Context.

Esto cumple “DI con Redux” según la práctica actual de RTK: el store es el bus; las dependencias viajan por `extraArgument`; los listeners evitan que `goal-detail` conozca notificaciones.

### 2.6 Templates inmersivos + diseño atómico (pragmático)

El producto no es un design system bancario. Se aplica atomic **solo donde hay reutilización real**; se evitan wrappers 1:1 de `Text` / `View`.

| Nivel | Qué existe | Dónde |
| --- | --- | --- |
| Tokens | color, spacing, type mínimos | `shared/ui/tokens` |
| Atoms | `MoneyText`, `ProgressBar` | `shared/ui/atoms` (listado y, si aplica, chrome nativo) |
| Molecules | `GoalListItem` | `features/goals` (un solo consumidor) |
| Templates | `GoalListTemplate` (lista + header) | `features/goals` |
| Templates inmersivos | `ImmersiveWebViewTemplate` (pantalla completa, back, sin chrome de tabs; el WebView es el flujo) | `features/goal-detail` |

“Inmersivo” aquí significa: el detalle/abono ocupa toda la pantalla, el shell nativo solo aporta SafeArea + back + título, y la micro-app web pinta el formulario. No se inventa un segundo sistema de navegación nativo.

No se crea `Button` / `Spacer` atómico ni carpetas vacías de organisms. Si un segundo consumidor no aparece, el componente se queda en el feature.

---

## 3. Estructura de carpetas (congelada en Fase 1)

Fase 1 **crea este árbol** (barrels `index.ts` / `public.ts` vacíos o con re-export mínimo). No mete entidades ni slices. Las fases siguientes **solo añaden archivos en sitios ya existentes**.

```
savings-goal-wallet/
├── docs/                          # este plan, ia/
├── openspec/
├── package.json                   # workspaces: mobile, libreria, web
├── README.md
├── web/                           # micro-app HTML — sin tests
│   ├── index.html
│   └── app.js
├── libreria/                      # paquete npm rn-savings-notifier
│   ├── src/
│   │   ├── NativeSavingsNotifier.ts   # Codegen spec
│   │   └── index.ts                   # wrappers JS tipados
│   ├── android/                   # Kotlin TurboModule
│   └── ios/                       # ObjC TurboModule (overlay + UIAlertController)
└── mobile/
    ├── src/
    │   ├── app/
    │   │   ├── App.tsx            # composition root UI
    │   │   ├── di/
    │   │   │   └── create-app-dependencies.ts
    │   │   └── store/
    │   │       ├── store.ts
    │   │       └── listener-middleware.ts
    │   ├── core/
    │   │   ├── domain/
    │   │   ├── application/ports/
    │   │   └── contracts/         # Zod postMessage
    │   ├── features/
    │   │   ├── goals/
    │   │   │   ├── application/
    │   │   │   ├── infrastructure/
    │   │   │   ├── presentation/{containers,presenters,templates}/
    │   │   │   ├── store/
    │   │   │   └── public.ts
    │   │   ├── goal-detail/       # misma forma
    │   │   └── notifications/
    │   └── shared/ui/{tokens,atoms}/
    └── android/ … ios/
```

El change `fase-1-andamiaje-monorepo` ya reserva esos slots (`public.ts` y barrels vacíos). Las subcarpetas de capa (`presentation/containers`, `store/` de feature, etc.) se materializan con el primer archivo de Fases 2–5; no se mueve `App.tsx` ni Metro. El cierre de Fase 1 sigue igual: app Android abre, librería linkeada, WebView carga HTML; **sin** entidades ni Redux.

---

## 4. Contrato `postMessage` (catálogo cerrado)

Un solo envelope: `{ type, payload }` JSON string. Validación en nativo con **Zod**. `web/` no se testea; emite/recibe estas formas y nada más. Sin `fetch`, sin módulos nativos.

### Web → Nativo

| `type` | `payload` | Cuándo |
| --- | --- | --- |
| `WEB_READY` | `{ goalId: string }` | Load de la micro-app (ya en scaffold Fase 1) |
| `DEPOSIT_REQUESTED` | `{ goalId: string, amount: number }` | Usuario confirma abono en la web |
| `CREATE_REQUESTED` | `{ name: string, targetAmount: number }` | Usuario confirma el alta en la web (Fase 8) |

Una alternativa sería emitir `DEPOSIT_CONFIRMED` desde la web. Se usa `DEPOSIT_REQUESTED` porque **el dominio vive en nativo**: la web pide, `MakeDeposit` decide. El README documenta el alias y el trade-off.

### Nativo → Web

| `type` | `payload` | Cuándo |
| --- | --- | --- |
| `SESSION_BOOTSTRAP` | `{ sessionId, goalId, userInfo, mode, goal? }` | Tras `WEB_READY`. `mode` es `deposit` o `create`; `goal` solo en `deposit` |
| `DEPOSIT_SUCCEEDED` | `{ goalId, depositedAmount, progressPercent, isCompleted }` | Use case OK; la web actualiza su UI local |
| `DEPOSIT_FAILED` | `{ goalId, reason }` | Monto inválido u otra regla |
| `CREATE_SUCCEEDED` | `{ goal }` | Alta OK; `goal` incluye id, name, targetAmount, depositedAmount, progressPercent |
| `CREATE_FAILED` | `{ reason }` | Nombre o objetivo inválido |

`goal` en bootstrap de abono incluye `id`, `name`, `targetAmount`, `depositedAmount`, `progressPercent` para que la micro-app no invente estado.

Flujo HU 2–3 (sin recargar el listado):

```
  Listado (goals)                    WebView (goal-detail)              web/
       │                                    │                            │
       │ tap meta                           │                            │
       │───────────────────────────────────►│ load file:// HTML          │
       │                                    │───────────────────────────►│
       │                                    │     WEB_READY              │
       │                                    │◄───────────────────────────│
       │                                    │ SESSION_BOOTSTRAP          │
       │                                    │───────────────────────────►│
       │                                    │     DEPOSIT_REQUESTED      │
       │                                    │◄───────────────────────────│
       │                                    │ extra.makeDeposit          │
       │  depositApplied (slice)            │                            │
       │◄───────────────────────────────────│ DEPOSIT_SUCCEEDED          │
       │  re-render selector                │───────────────────────────►│
       │  (misma instancia de store)        │                            │
```

---

## 5. Dominio y puertos (para no reingeniar en HU 4 / persistencia)

### Entidades / value objects (`core/domain`)

- `Money` — monto mayor que 0 para abonos; no floats para COP si se puede evitar (enteros).
- `Progress` — porcentaje derivado; `isCompleted` cuando acumulado ≥ objetivo.
- `SavingsGoal` — `id`, `name`, `target`, `deposited`; métodos puros `applyDeposit(money)` que devuelven nueva meta o error tipado (inmutabilidad).

### Casos de uso

- `GetGoals` → lista para HU 1.
- `MakeDeposit` → aplica regla, persiste vía puerto, retorna meta actualizada. **No** llama al Toast: eso es reacción de `notifications`.

### Puertos (Application)

| Puerto | Implementaciones | Fase en que aparece el contrato | Fase en que se rellena de verdad |
| --- | --- | --- | --- |
| `GoalsRepository` | InMemory (seed) → AsyncStorage | 2 | 3 / 6 |
| `GoalNotifier` | stub JS → TurboModule Toast/notif | 2 | 5 |
| `ConfirmDialog` | stub `true` → `AlertDialog` / `UIAlertController` | 2 | 5 Android / 9 iOS |
| `WebBridge` (adapter, no puerto de dominio) | parser Zod + `injectJavaScript` / `postMessage` | 2 | 4 |

Fase 1 ya deja la **API JS** de librería (`notifyGoalCompleted`, `showConfirmDialog`) con stubs que resuelven. Application en Fase 2 depende del puerto, no de `rn-savings-notifier`. El adapter se escribe en `features/notifications/infrastructure` y se cablea en `app/di`.

---

## 6. Librería `libreria/` (`rn-savings-notifier`)

La librería es un paquete de primer nivel del monorepo: se **crea** y se consume por workspace, no se copia a `mobile/`.

| Decisión | Valor |
| --- | --- |
| Scaffold | `create-react-native-library` + bob, TurboModule, Kotlin + Objective-C |
| Consumo | workspace `*` + Metro `watchFolders` / `extraNodeModules`; **nunca** copiar nativo a `mobile/` |
| API pública | `notifyGoalCompleted(goalName)` y `showConfirmDialog({ title, message })` |
| HU 4 | Opción C (notificación/Toast nativo) |
| Stretch | Opción B (diálogo nativo real, no `Alert` de RN) |
| Tests | API JS con TurboModule mockeado; coverage de wrappers |
| README propio | install, autolinking, API, ejemplo, cómo testear |

Android y iOS Simulator son cierres de demo. El nativo de la librería vive en `libreria/` (Kotlin Toast + ObjC overlay / `UIAlertController`).

---

## 7. Stack y restricciones

- CLI `@react-native-community/cli`, RN **0.81.x** (no 0.82), React 19, TypeScript strict, Hermes, `newArchEnabled=true`.
- Estado global: **Redux Toolkit** obligatorio.
- Zod en fronteras (`postMessage`, snapshots persistidos).
- Jest + RNTL en `mobile/` y `libreria/`. **Cero tests en `web/`**.
- Coverage razonable; meta declarada **≥70% en dominio** (`core/domain` + use cases puros).
- npm workspaces + `.npmrc` `install-strategy=nested` (Metro/autolinking; npm no honra `hoistingLimits`). Yarn 1 + `nohoist` solo si el install anidado falla.
- WebView: HTML local (`file://` en assets Android y bundle iOS), no URL remota.
- Sin backend, secretos, PII, ni Expo.

---

## 8. Fases (sin solapamiento)

Cada fase tiene **entrada** (lo que ya existe), **salida demostrable** y **prohibiciones** para no “aprovechar y meter” la siguiente.

```
F1 andamiaje ──► F2 dominio+contratos ──► F3 HU1 listado
                                              │
                                              ▼
                                         F4 HU2–3 bridge
                                              │
                         ┌────────────────────┼──────────────┐
                         ▼                    ▼              ▼
                    F5 HU4 nativo      F6 persistencia  F7 UI/theme
                         │                    │              │
                         └────────────────────┴──────┬───────┘
                                                     ▼
                                        F8 alta/baja ──► F9 iOS ──► F10 IA ──► F11 docs/cierre
```

F10 (IA) puede avanzar en paralelo desde F2 (skills se usan de verdad). F9 iOS no empieza hasta que el producto Android (F8) esté cerrado. F8 alta/baja no empieza hasta persistencia y UI (F6–F7). F7 UI no empieza hasta que existan listado y detalle (F4). F6 no empieza hasta que el puerto `GoalsRepository` esté ejercido por InMemory.

### Fase 1 — Andamiaje del monorepo

**Vehículo:** change `fase-1-andamiaje-monorepo`.

**Hace**

- Workspaces `mobile`, `libreria`, `web`.
- RN 0.81 CLI + TS + New Architecture + Hermes.
- Librería TurboModule con spec + stubs que resuelven.
- HTML que emite `WEB_READY` y `DEPOSIT_REQUESTED` de prueba.
- Metro, autolinking, WebView `file://`, Gradle copy de `web/`.
- `mobile/src/app/App.tsx` + **árbol de carpetas** de la sección 3.

**No hace:** entidades, Redux, parsers Zod, navegación de features, nativo real de Toast.

**Cierre:** Android abre, WebView muestra el botón de prueba, import de la librería no crashea.

### Fase 2 — Dominio, puertos y contrato (testeable sin UI)

**Hace**

- `SavingsGoal` / `Money` / `Progress` + tests puros.
- Zod: catálogo de la sección 4 + parser `unknown` → unión discriminada o error.
- Puertos y use cases con fakes (incluye `GoalNotifier` no-op).
- Nada de store ni pantallas.

**Cierre:** `npm test` cubre dominio + parser. Coverage de dominio empieza aquí (≥70% es realista en esta fase). **Estado:** aplicada y archivada.

### Fase 3 — Redux + HU 1

**Hace**

- `createAppDependencies` + `configureStore` (`extraArgument`).
- `goals` slice + `GetGoals` + seed in-memory.
- `GoalListContainer` / `Presenter` / `GoalListTemplate`.
- Tests de reducer, selector y un container/hook con RNTL.

**No hace:** WebView de detalle (el host de F1 puede quedar como pantalla auxiliar o sustituirse por el listado como launch screen; el HTML sigue en assets).

**Cierre:** listado nativo con 2–3 metas seed, progreso visible. **Estado:** aplicada y archivada.

### Fase 4 — HU 2 y HU 3 (ciclo completo)

**Hace**

- Navegación mínima listado → detalle (stack; una dependencia, no un framework de navegación inflado).
- `ImmersiveWebViewTemplate` + adapter del bridge (parse → `MakeDeposit` via thunk → `inject` resultado).
- `web/` deja de ser el botón dummy: pinta detalle con datos de `SESSION_BOOTSTRAP` y formulario de abono.
- Al volver atrás, el listado muestra el nuevo acumulado **sin reload** (misma store).

**No hace:** Toast nativo real (el listener puede quedar registrado contra el stub).

**Cierre:** demo del ciclo del diagrama de la sección 4. **Estado:** aplicada y archivada.

### Fase 5 — HU 4 + nativo real

**Hace**

- Kotlin: Toast y/o notificación local (`POST_NOTIFICATIONS` si aplica).
- Adapter real en `notifications`; listener `depositApplied` → `notifyGoalCompleted`.
- Tests JS de la librería (módulo nativo mockeado).
- Stretch: `AlertDialog` / `UIAlertController` en `showConfirmDialog`.

**Cierre:** meta al 100% dispara confirmación **nativa**, no un `Alert` de RN. **Estado:** aplicada y archivada.

### Fase 6 — Persistencia (stretch)

- Adapter `GoalsRepository` con AsyncStorage (o equivalente CLI, no Expo).
- Mismo use case. Test del mapper snapshot ↔ dominio.
- Si no entra: el puerto ya está; el README describe el swap.

**Cierre:** primer launch siembra 3 metas; abono + kill + relaunch conserva el acumulado. **Estado:** aplicada y archivada.

### Fase 7 — UI contemporánea (títulos únicos y apariencia)

**Vehículo:** change `fase-7-ui-contemporanea`.

**Hace**

- Tokens light/dark; primera vez el host sigue el esquema del sistema.
- Control de apariencia (sistema / claro / oscuro) arriba a la derecha del stack header, persistido.
- Un solo título por pantalla (header nativo); el listado y la micro-app no lo repiten.
- La micro-app sigue el esquema resuelto con `data-theme` (sin nuevo tipo `postMessage`).

**No hace:** alta/baja de metas (Fase 8); skills/agent ni `docs/ia/USO_IA.md` (Fase 10); cierre completo de README (Fase 11).

**Cierre:** listado y detalle con chrome contemporáneo; modo oscuro persistido o siguiendo el OS. **Estado:** aplicada y archivada.

### Fase 8 — Alta y baja de metas

**Vehículo:** change `fase-8-alta-baja-metas`.

**Hace**

- FAB en el listado nativo que abre la micro-app en modo `create` (mismo `postMessage` que el abono).
- Formulario web (nombre + objetivo en pesos enteros; acumulado 0); `CREATE_REQUESTED` → `CreateGoal` → listado sin recargar.
- Toast nativo `notifyGoalCreated` al registrar.
- Long-press en la card → `showConfirmDialog` → `DeleteGoal`. Cancelar no borra.
- Lista vacía persistida no se re-siembra.

**No hace:** editar meta; skills/agent ni `docs/ia/USO_IA.md` (Fase 10); cierre completo de README (Fase 11).

**Cierre:** alta desde FAB + web; baja con confirmación nativa; kill/relaunch conserva el conjunto (incluida lista vacía). **Estado:** aplicada y archivada.

### Fase 9 — Entorno iOS

**Vehículo:** change `fase-9-ios-host`.

**Hace**

- CocoaPods + New Architecture + Hermes; `npm run ios` desde la raíz.
- Copia de `web/` al bundle iOS; WebView `file://` de plataforma (no `android_asset` en iOS).
- TurboModule iOS real: overlay `Meta completada` / `Meta registrada` y `UIAlertController` para baja.
- Simulator es el gate; no se copia nativo a `mobile/`.

**No hace:** skills/agent ni `docs/ia/USO_IA.md` (Fase 10); cierre completo de README (Fase 11); App Store / TestFlight / dispositivo físico como criterio de merge.

**Cierre:** la app abre en iOS Simulator con el mismo flujo de producto que Android. **Estado:** aplicada y archivada.

### Fase 10 — IA gobernada

**Vehículo:** change `fase-10-ia-docs-cierre` (junto con Fase 11).

En `libreria/` y `mobile/` (`.cursor/` / `docs/ia/`):

1. Skills de producto: handler `postMessage` + Zod + test; slice RTK + selector + test; wrappers TurboModule + test.
2. Agent: reviewer de boundaries (domain sin RN, coverage, no `any`).
3. `docs/ia/USO_IA.md`: qué generó IA, qué se escribió a mano, prompts, **qué se rechazó o corrigió**.

**Cierre:** skills y agent visibles en las capas evaluadas; documento de uso de IA. **Estado:** aplicada y archivada.

### Fase 11 — Documentación y cierre

**Vehículo:** el mismo change `fase-10-ia-docs-cierre`.

- README raíz: setup iOS/Android, Node/RN 0.81, tests/coverage, diagrama, catálogo `postMessage`, uso de IA, huecos honestos, Vista previa light.
- README de `libreria/` y `mobile/`.
- `docs/architecture.md`, `docs/runtime-design.md`, `docs/testing-strategy.md`.
- Commits convencionales incrementales (`feat`, `fix`, `test`, `docs`, `chore`) en ramas `feat/<change-name>`.
- Checklist del producto (sección 11).

**Cierre:** documentación de entrega alineada al producto. **Estado:** aplicada y archivada.

---

## 9. Estrategia de tests (alineada a la DI)

| Capa | Qué | Cómo |
| --- | --- | --- |
| Domain | abono, %, completado, rechazos | unitario, sin mocks |
| Parser | JSON malo, tipos extra, envelope válido | Zod |
| Use cases | `MakeDeposit` con `InMemory` fake | fakes de puertos |
| Slice | `depositApplied` actualiza acumulado | reducer puro |
| Container | listado muestra % | RNTL + `createTestStore(fakeDeps)` |
| Presenter | callback de tap | props, sin store |
| Librería JS | wrappers llaman spec | TurboModule mock |
| web | — | no |

Nombres de fixtures: `inputX`, `mockX`, `actualX`, `expectedX`.

---

## 10. Recorrido de demo

- **Flujo de producto:** HU 1 → WebView → abono → listado sin reload → (HU 4) Toast/overlay nativo → kill/relaunch conserva acumulado → apariencia sistema/claro/oscuro (header único) → FAB alta de meta → long-press baja con confirmación. Mismo recorrido en Android y en iOS Simulator.
- **Arquitectura a mostrar:** feature-first vs capas globales, TurboModule vs NativeModule, `DEPOSIT_REQUESTED` vs confirmar en web, `extraArgument` vs IoC, atomic mínimo vs design system.
- **IA gobernada:** skill/agent y un rechazo concreto (p. ej. no copiar nativo a `mobile/`, no `any` en el parser, no Alert de RN).
- **Puntos de diseño:** autolinking/Metro, boundaries, listener HU 4, por qué Redux si el WebView ya tiene UI.

---

## 11. Checklist del producto

- [x] Repositorio con historial incremental.
- [x] 3 paquetes workspace: `web/`, `libreria/`, `mobile/` (monorepo).
- [x] Mobile con CLI oficial (sin Expo), RN 0.81.x + React 19.
- [x] `web/`: solo `postMessage` (sin suite de tests en ese workspace).
- [x] Listado nativo (Redux, HU 1).
- [x] WebView de detalle/abono (HU 2–3).
- [x] `postMessage` bidireccional con contrato tipado (Zod).
- [x] Store actualizado desde la web (HU 3).
- [x] `libreria/`: nativo real (Toast Android), tests JS, consumida por `mobile/`.
- [x] Alta y baja de metas (FAB + WebView create; long-press + confirmación nativa).
- [x] Host iOS (Simulator): New Architecture, `web/` en el bundle, overlay y `UIAlertController`.
- [x] `mobile/`: tests y skill/agent.
- [x] Coverage del core en `libreria/` y `mobile/` (≥70% dominio).
- [x] TypeScript sin `any` injustificado.
- [x] Skill + Agent + `docs/ia/USO_IA.md` en las capas del producto.
- [x] README raíz: estructura, setup, arquitectura, catálogo, uso de IA.

---

## 12. Fuera de alcance

- Backend, auth, tokens, PII.
- Expo, Yarn/pnpm (salvo que npm workspaces bloquee el install).
- Editar metas. Crear y borrar son Fase 8 (FAB + formulario web + long-press con confirmación).
- Design system con atoms vacíos, navegación nativa tipo Fragments/SwiftUI app, o bus de eventos aparte de RTK.
- Tests instrumentados de Toast como criterio de cierre (la demo en dispositivo basta; el JS de la librería sí se testea).

---

## 13. Relación con OpenSpec

Arquitectura y orden de fases viven en este plan. Los changes de OpenSpec se crean **al arrancar cada fase**, no todos de antemano.

Los changes `fase-1-andamiaje-monorepo` … `fase-10-ia-docs-cierre` están **archivados** (proposal, specs, design, tasks aplicados). Fases 10 y 11 se cerraron juntas en `fase-10-ia-docs-cierre`.

| Fase | Change | Estado |
| --- | --- | --- |
| 1 | `fase-1-andamiaje-monorepo` | Archivado. Andamiaje + esqueleto en el monorepo. |
| 2 | `fase-2-dominio-puertos-contrato` | Archivado. Dominio, puertos, use cases y parser Zod. |
| 3 | `fase-3-redux-hu-1` | Archivado. Store RTK, seed in-memory y listado nativo HU 1. |
| 4 | `fase-4-webview-abono` | Archivado. WebView inmersivo, bridge y listado sin recargar. |
| 5 | `fase-5-hu-4-nativo-real` | Archivado. Toast nativo Android, adapter y tests JS de la librería. |
| 6 | `fase-6-persistencia` | Archivado. AsyncStorage detrás de `GoalsRepository`, seed-if-empty. |
| 7 | `fase-7-ui-contemporanea` | Archivado. Títulos únicos, chrome contemporáneo, apariencia persistida. |
| 8 | `fase-8-alta-baja-metas` | Archivado. FAB + formulario web de alta; long-press + confirmación de baja. |
| 9 | `fase-9-ios-host` | Archivado. Simulator, bundle `web/`, overlay y `UIAlertController`. |
| 10–11 | `fase-10-ia-docs-cierre` | Archivado. IA gobernada + documentación y cierre (skills, agent, README, coverage). |
