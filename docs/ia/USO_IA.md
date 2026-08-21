# Uso de IA

## Resumen

> **Enfoque:** desarrollo **spec-driven** con **OpenSpec** y **SDD**: el autor definió arquitectura, alcance por fase y criterios de aceptación en el plan, las specs y `tasks.md`; la IA aceleró implementación, tests y documentación **dentro de ese contrato**. Cada entrega se revisó antes de integrar (diff alineado a tareas, `npm test`, smoke Android/iOS, decisión de merge). Detalle: herramientas, modelo, esfuerzo por fase, agentes independientes y checklist.

---

## Spec-Driven Development (SDD)

**SDD** es construir software con especificaciones versionadas **antes** de implementar, para que el modelo trabaje contra requisitos acotados y no contra prompts abiertos.

**OpenSpec** es la herramienta SDD de este repositorio: ciclo proponer → aplicar → archivar, con `proposal`, `design`, `tasks` y delta specs. Eso da un contrato fijo por change y permite comparar agentes **con las mismas specs**.

En este producto:

| Concepto | Rol |
|----------|-----|
| **SDD** | Qué se construye y cómo se sabe que está listo |
| **OpenSpec** | Changes, checklist de tareas, specs versionadas, archive |
| **Evaluación de agentes** | Mismo change + misma puerta de verificación; un agente independiente por fase |
| **Guardrails** | `AGENTS.md`, skills de producto, agent de boundaries |

[`docs/architecture.md`](../architecture.md) y [`docs/runtime-design.md`](../runtime-design.md) describen **cómo corre la app**. SDD describe **qué se entregó en cada incremento**. El freeze de alcance y fases es [`docs/PLAN_EJECUCION.md`](../PLAN_EJECUCION.md).

---

## Arquitectura definida por el autor (no delegada)

La dirección de ingeniería se fijó **antes** de aplicar las fases, a partir de un explore del alcance y de estas decisiones (luego congeladas en el plan):

- **Clean Architecture + feature-first** — capas dentro de cada feature (`goals`, `goal-detail`, `notifications`), kernel en `core/`.
- **Desacoplamiento cross-feature** — equipos integrales pueden tomar una feature vía `public.ts`; comunicación por acciones RTK + listener middleware, no por contenedores ajenos.
- **Container-Presenter** — el container orquesta store/use cases; el presenter recibe props.
- **DI explícita** — factory `createAppDependencies()`, sin contenedor IoC.
- **DI con Redux** — `thunk.extraArgument` + reducers puros + listeners.
- **Templates inmersivos y diseño atómico pragmático** — WebView a pantalla completa; atoms solo donde hay reutilización real (`MoneyText`, `ProgressBar`).

La base de carpetas y el catálogo `postMessage` se dejaron en Fase 1–2 para ejecutar HU 1–4 **sin solapar Metro ni reabrir contratos**.

---

## Flujo OpenSpec

```text
/opsx:explore   →  pensar / acotar (opcional)
/opsx:propose   →  proposal + design + tasks + delta specs
/opsx:apply     →  implementar tasks (asistido por IA)
     ↓
Puerta de verificación (checklist abajo)
     ↓
Git: commit(s) en feat/<change-name>/ → PR → main
     ↓
/opsx:archive   →  archivar change + sync de specs
```

Un change ≈ una rama `feat/<change-name>` ≈ un PR hacia `main`.

---

## Herramientas y modelo

OpenSpec hizo comparable el trabajo entre fases: mismos artefactos (`tasks.md`, specs, plan) y la misma puerta; lo que varía es el **agente** (conversación / apply independiente) y el **effort**.

| Aspecto | Valor en este repositorio |
|---------|---------------------------|
| **IDE** | Cursor |
| **Modelo** | Cursor Grok 4.6 |
| **Effort** | Variable por fase: más alto en arquitectura, UI contemporánea y nativo iOS; más contenido en andamiaje, tests y cierre documental |
| **Agentes** | **Un agente independiente por fase** (apply en `feat/<change-name>`, sin un único chat que arrastre todas las HU) |
| **Docs de librerías** | Context7 MCP (React Native, Metro, CLI, librería nativa) |
| **Skills OpenSpec** | propose / apply / archive en `.cursor/skills/openspec-*` |
| **Skills de producto** | `typed-postmessage-handler`, `rtk-slice-selector-test`, `turbomodule-js-wrapper-test` (Fase 10 materializa copias en `mobile/` y `libreria/`; el flujo ya se usó al implementar parser, slice y wrappers) |
| **Agent** | `architecture-boundary-reviewer` (domain sin RN, `public.ts`, sin `any` injustificado, coverage ≥70%) |

Los OpenSpec skills/commands gobernaron el apply desde Fase 1. Fase 10 **deja evidentes** las copias en las capas evaluadas y este registro escrito.

Canonical: `.cursor/skills/` y `.cursor/agents/` en la raíz del monorepo. Espejo (mismo cuerpo de archivo) en `mobile/.cursor/` y `libreria/.cursor/`.

---

## Changes ↔ ramas

| Fase | OpenSpec change | Rama | Notas de effort / agente |
|------|-----------------|------|---------------------------|
| 1 | `fase-1-andamiaje-monorepo` | `feat/fase-1-andamiaje-monorepo` | Andamiaje CLI + librería stub; effort contenido |
| 2 | `fase-2-dominio-puertos-contrato` | `feat/fase-2-dominio-puertos-contrato` | Dominio y Zod; effort contenido |
| 3 | `fase-3-redux-hu-1` | `feat/fase-3-redux-hu-1` | Store + listado |
| 4 | `fase-4-webview-abono` | `feat/fase-4-webview-abono` | Bridge + ciclo HU 2–3 |
| 5 | `fase-5-hu-4-nativo-real` | `feat/fase-5-hu-4-nativo-real` | TurboModule Android; effort alto en nativo |
| 6 | `fase-6-persistencia` | `feat/fase-6-persistencia` | Adapter AsyncStorage |
| 7 | `fase-7-ui-contemporanea` | `feat/fase-7-ui-contemporanea` | Chrome y tema; effort alto en fidelidad UI |
| 8 | `fase-8-alta-baja-metas` | `feat/fase-8-alta-baja-metas` | FAB + `CREATE_*` + baja |
| 9 | `fase-9-ios-host` | `feat/fase-9-ios-host` | Simulator + ObjC; effort alto |
| 10–11 | `fase-10-ia-docs-cierre` | `feat/fase-10-ia-docs-cierre` | Skills, agent, README y docs; effort medio |

Cada fila usó un agente independiente. El merge a `main` lo aprueba el autor.

---

## Quién decide qué

| Responsabilidad | Autor | IA |
|-----------------|-------|-----|
| Arquitectura, patrones, recortes de alcance | ✅ Definición y refinamiento | Sugerencias acotadas |
| Alcance de producto y UX | ✅ | — |
| Aprobación de merge a `main` | ✅ | — |
| Rechazar o corregir output | ✅ | — |
| Propuesta de código/tests/docs desde specs | — | ✅ |
| Ejecutar `tasks.md` | — | ✅ |

---

## Qué se rechazó o corrigió

Criterio crítico: la IA propone; **el rechazo es humano**. Ejemplos reales de este producto:

| Propuesta (típica de un modelo sin el contrato) | Decisión del autor |
|-------------------------------------------------|-------------------|
| Expo (managed o prebuild) para ir más rápido | **Rechazado.** CLI oficial RN 0.81 + React 19. |
| Copiar Kotlin/ObjC a `mobile/` “para que compile” | **Rechazado.** Librería de primer nivel + autolinking. |
| La web emite `DEPOSIT_CONFIRMED` y el nativo solo pinta | **Rechazado.** `DEPOSIT_REQUESTED` + `MakeDeposit` en nativo. |
| Contenedor IoC (Inversify / tsyringe) | **Rechazado.** Factory explícita + `extraArgument`. |
| `Alert` de React Native para HU 4 / baja | **Rechazado.** TurboModule Toast/overlay y `AlertDialog` / `UIAlertController`. |
| Mismo URI `file:///android_asset/...` en iOS | **Rechazado.** Bundle iOS + URI de plataforma. |
| Design system con `Button` / `Spacer` atómicos vacíos | **Rechazado.** Atomic solo con reutilización real. |
| `any` en el parser del bridge | **Rechazado.** `unknown` → Zod → `Result`. |

---

## Para qué se usó la IA

| Área | Asistencia |
|------|------------|
| OpenSpec | Proposals, designs, tasks, delta specs |
| Implementación | Código desde `/opsx-apply` contra `tasks.md` |
| Tests | Fixtures, Jest, RNTL |
| Documentación | Borradores de README y `docs/` — editados por el autor |
| Auditoría | Imports cross-feature, sugerencias de boundaries |

---

## Puerta de verificación (por change)

Antes de mergear `feat/*` a `main`:

1. Diff alineado a `tasks.md`
2. `npm test` (sin emulador)
3. `npm run test:coverage` (gate ≥70% en el core declarado)
4. Agent de boundaries cuando el diff toca `core/` o features
5. Smoke Android y/o iOS Simulator si el change toca nativo o el WebView
6. **Decisión del autor:** merge, corrección, o edición a mano

---

## Relacionado

| Documento | Contenido |
|-----------|-----------|
| [README.md](../../README.md) | Resumen del producto y sección corta de IA |
| [PLAN_EJECUCION.md](../PLAN_EJECUCION.md) | Freeze de alcance y fases |
| [architecture.md](../architecture.md) | Capas y patrones |
| [runtime-design.md](../runtime-design.md) | Bridge, store, persistencia |
| [testing-strategy.md](../testing-strategy.md) | Tests y coverage |
| [AGENTS.md](../../AGENTS.md) | Guardrails de importación |
