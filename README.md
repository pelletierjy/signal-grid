# Signal Grid

> **A personal experiment** — this is a side project built for fun to explore what a modern Angular grid looks like when reactivity, editing, and form state are all driven by Angular signals rather than RxJS streams or imperative change detection. Think of it as a playground for signal-based UI patterns, not a battle-tested enterprise component (yet).

[![Angular](https://img.shields.io/badge/Angular-22-red?logo=angular)](https://angular.dev)
[![Nx](https://img.shields.io/badge/Nx-23-143055?logo=nx)](https://nx.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org)

A lightweight, signal-powered data grid for Angular. Designed for large datasets, editable cells, and painless customization — with reactivity that just works.

## Why Signal Grid?

Most data grids lean on RxJS or manual change detection to stay in sync. Signal Grid asks a different question: _what if the entire grid — rows, cells, edits, and validation — reacted through Angular signals?_ The result is a grid that updates precisely when its data changes, without the ceremony of subjects or the overhead of Zone.js polling.

Key ideas explored here:

- **Signal-native architecture** — `model` and `columns` are signal inputs; internal state (form groups, cell values, expanded rows) is held in signals and computed values
- **Signal-driven forms** — each row becomes a `FormGroup` rebuilt reactively via `effect()`, and changes flow back out through a debounced `modelChange` signal
- **OnPush by default** — the grid never relies on default change detection; signals handle the rest

## Features

|                             |                                                                                         |
| :-------------------------- | :-------------------------------------------------------------------------------------- |
| ⚡ **Signal reactivity**    | Fine-grained updates with Angular signals + `OnPush`                                    |
| 🧮 **Virtual scrolling**    | Smooth large-dataset rendering via CDK virtual scroll                                   |
| 📝 **Editable cells**       | Reactive forms per row with debounced `modelChange` output                              |
| 🧩 **Extensible types**     | Register custom cell components; built-ins for `string`, `number`, `boolean`, `default` |
| 🎨 **CSS variable theming** | Style entirely through custom properties; dark mode included                            |
| 🏗️ **Fluent API**           | Configure columns with `ColumnConfigurationBuilder`                                     |
| 🌐 **Web component**        | Export as `<signal-grid>` for non-Angular hosts                                         |

## Quick Start

```bash
npm install @jypsolution/signal-grid
```

```typescript
import { GridModule, ColumnConfigurationBuilder } from '@jypsolution/signal-grid';

@Component({
  imports: [GridModule],
  template: `
    <signal-grid [model]="users()" [columns]="columns" (modelChange)="users.set($event)" />
  `
})
export class MyComponent {
  users = signal<User[]>([
    { name: 'Ada Lovelace', email: 'ada@example.com' },
    { name: 'Grace Hopper', email: 'grace@example.com' }
  ]);

  columns = [
    new ColumnConfigurationBuilder().fieldName('name').header('Name').build(),
    new ColumnConfigurationBuilder().fieldName('email').header('Email').build()
  ];
}
```

## Development

This repo is an Nx monorepo with three parts:

| Package                | Path                        | Description              |
| :--------------------- | :-------------------------- | :----------------------- |
| `signal-grid`          | `projects/signal-grid`      | The grid library         |
| `signal-grid-site`     | `src/`                      | Demo app & documentation |
| `signal-grid-elements` | `apps/signal-grid-elements` | Web component wrapper    |

### Common tasks

| Task                | Command                         |
| :------------------ | :------------------------------ |
| Serve demo          | `nx serve signal-grid-site`     |
| Build library       | `nx build signal-grid`          |
| Build demo          | `nx build signal-grid-site`     |
| Build web component | `nx build signal-grid-elements` |
| Lint                | `npm run lint`                  |

## Documentation

- Run the demo app for interactive examples
- Styling variables are documented in `projects/signal-grid/assets/scss/_variables.scss`

## License

MIT
