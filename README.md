# SignalGrid

[![Angular](https://img.shields.io/badge/Angular-22-red?logo=angular)](https://angular.dev)
[![Nx](https://img.shields.io/badge/Nx-23-143055?logo=nx)](https://nx.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org)

> **A personal experiment** — a side project built for fun to explore what a modern Angular grid looks like when reactivity, editing, and form state are all driven by Angular signals rather than RxJS streams or imperative change detection. Think of it as a playground for signal-based UI patterns, not a battle-tested enterprise component (yet).

A lightweight, signal-powered data grid for Angular. Designed for large datasets, editable cells, and painless customization — with reactivity that just works.

## Why SignalGrid?

Most data grids lean on RxJS or manual change detection to stay in sync. SignalGrid asks a different question: _what if the entire grid — rows, cells, edits, and validation — reacted through Angular signals?_ The result is a grid that updates precisely when its data changes, without the ceremony of subjects or the overhead of Zone.js polling.

Key ideas explored here:

- **Signal-native architecture** — `model` and `columns` are signal inputs; internal state (per-row form groups, cell values, dirty/valid flags, expanded rows) is held in signals and computed values
- **Viewport-scoped forms** — form groups exist only for rows that are rendered; unsaved edits are stored sparsely and keyed by **row object identity**, so filtering/sorting never loses or misplaces edits, and cost doesn't grow with row count
- **Schema-driven cells** — `ColumnSchema` object literals (a Formly-style field config) or `ColumnConfigurationBuilder`; each cell's component is resolved from a type registry and rendered by a single outlet, with optional Formly-style wrappers
- **OnPush by default** — the grid never relies on default change detection; signals handle the rest

## Features

| Capability                  | Description                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------- |
| ⚡ **Signal reactivity**    | Fine-grained updates with Angular signals + `OnPush`                                    |
| 🧮 **Virtual scrolling**    | Smooth large-dataset rendering via CDK virtual scroll                                   |
| 📝 **Editable cells**       | Reactive forms per rendered row with debounced `modelChange` output                      |
| 🧩 **Extensible types**     | Register custom cell components and wrappers; built-ins for `string`, `number`, `boolean`, `actions`, `default` |
| 🎨 **CSS variable theming** | Style entirely through custom properties; dark mode included                            |
| 🏗️ **Fluent API**           | Configure columns with `ColumnConfigurationBuilder` or plain `ColumnSchema` objects      |
| 🌐 **Web component**        | Export as `<signal-grid>` for non-Angular hosts                                         |

## Demo Site & Documentation

The demo site is a living showcase of every feature, with a built-in documentation section.

- **Home** — landing page
- **Demo Grid** (`/demo`) — interactive grid with column definitions and custom cell types
- **Lazy Grid** (`/demo-lazy`) — grid with lazy-loaded cell components
- **Docs** (`/docs`) — getting started, columns, cell types, styling, and web component guides

### Run the demo locally

```bash
nx serve signal-grid-site
```

Navigate to `http://localhost:4200`.

## Quick Start

```bash
npm install @jypsolution/signal-grid
```

```typescript
import { GridModule } from '@jypsolution/signal-grid';

@NgModule({
  imports: [
    // plain import: the built-in cell types only
    GridModule
    // or, to register your own cell types as well:
    // GridModule.forRoot({ types: [{ name: 'status-badge', component: StatusBadgeCellComponent }] })
  ]
})
export class AppModule {}
```

```typescript
import { signal } from '@angular/core';
import { ColumnConfigurationBuilder } from '@jypsolution/signal-grid';

export class MyComponent {
  users = signal<User[]>([
    { name: 'Ada Lovelace', email: 'ada@example.com' },
    { name: 'Grace Hopper', email: 'grace@example.com' }
  ]);

  columns = [
    new ColumnConfigurationBuilder().withField('name').build('Name'),
    new ColumnConfigurationBuilder().withField('email').build('Email')
  ];
}
```

```html
<signal-grid [model]="users()" [columns]="columns" (modelChange)="users.set($event)"> </signal-grid>
```

See the [Getting Started guide](https://github.com/pelletierjy/signal-grid/tree/main/specs/001-dynamic-cell-components) for full usage details.

## Development

This repo is an Nx monorepo with three parts:

| Package                | Path                        | Description              |
| ---------------------- | --------------------------- | ------------------------ |
| `signal-grid`          | `projects/signal-grid`      | The grid library         |
| `signal-grid-site`     | `src/`                      | Demo app & documentation |
| `signal-grid-elements` | `apps/signal-grid-elements` | Web component wrapper    |

### Common tasks

| Task                | Command                         |
| ------------------- | ------------------------------- |
| Serve demo          | `nx serve signal-grid-site`     |
| Build library       | `nx build signal-grid`          |
| Build demo          | `nx build signal-grid-site`     |
| Build web component | `nx build signal-grid-elements` |
| Lint                | `npm run lint`                  |

## Architecture

- **Cell-type registry** — cell components are registered at module init via `GridModule.forRoot({ types: [...] })`. The grid resolves each column's cell by matching the column's `type` to a registered component.
- **Built-in cell types** — `string`, `number`, `boolean`, and `default` are included out of the box.
- **CSS variable theming** — all colors, spacing, and typography are exposed via CSS custom properties, making light/dark mode switching trivial. Variables are documented in `projects/signal-grid/assets/scss/_variables.scss`.
- **ColumnConfigurationBuilder** — a fluent builder for column definitions, supporting field name, type, header text, editability, width, and more.

## License

MIT
