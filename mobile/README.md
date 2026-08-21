# Host `mobile/` — Savings Goal Wallet

Host React Native (CLI oficial, **sin Expo**) del producto: listado nativo de metas, WebView inmersivo para alta/abono, y consumo de `rn-savings-notifier` por workspace.

Arquitectura, catálogo `postMessage` y decisiones: [README raíz](../README.md) · [docs/architecture.md](../docs/architecture.md). Uso de IA: [docs/ia/USO_IA.md](../docs/ia/USO_IA.md).

## Requisitos

Node **20+** · JDK **17** · Android SDK · Xcode **16+** (macOS) · emulador Android o iOS Simulator.

Los comandos de abajo se ejecutan desde la **raíz del monorepo** salvo que se indique otra cosa.

## Metro

```bash
npm start
```

## Android

Con Metro en otra terminal:

```bash
npm run android
```

## iOS Simulator

```bash
cd mobile/ios && pod install && cd ../..
npm run ios
```

Tras cambiar Kotlin u Objective-C hay que **rebuild nativo**; recargar Metro no basta.

La primera pantalla es el **listado nativo**, no el WebView. El detalle y el alta cargan `web/` desde un `file://` local (assets Android / bundle iOS).

## Tests y coverage

Sin emulador:

```bash
npm test -w mobile
npm run test:coverage -w mobile
```

Desde la raíz: `npm test` y `npm run test:coverage` (incluye `libreria/`). El umbral del core (dominio + parsers + slices cubiertos por `collectCoverageFrom`) es **≥70%**.

## IA gobernada

Skills en `mobile/.cursor/skills/` (`typed-postmessage-handler`, `rtk-slice-selector-test`). Agent: `mobile/.cursor/agents/architecture-boundary-reviewer.md`.
