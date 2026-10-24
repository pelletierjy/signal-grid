# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 22 / Nx 23 monorepo containing:

- **Application (`signal-grid-site`)**: A demo/documentation site in `src/`.
- **Library (`signal-grid`)**: An Angular grid component library in `projects/signal-grid/` published as `@jypsolution/signal-grid`.

**Versions:** Angular 22.2.0, Nx 23.2.1, TypeScript ~6.0.3, RxJS ~7.8.2, zone.js ~0.16.3.

The library's main export is `GridModule` / `GridComponent`; `public-api.ts` also exports the callback-runner pipe/module, `ObjectValidatorService`, and `SubscriptionManager`. The demo app and the elements app consume the library from source via relative/path imports (e.g. `projects/signal-grid/src/lib/grid/grid.module`), not from `dist/`, so library changes show up without rebuilding the library.

## Common Commands

| Task                     | Command                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Serve demo app           | `nx serve signal-grid-site`                                                         |
| Serve locally on port 80 | `nx serve signal-grid-site --port=80 --host=signalgrid-l.jypsolution.com`           |
| Build demo app           | `nx build signal-grid-site`                                                         |
| Build library            | `nx build signal-grid`                                                              |
| Lint (prettier)          | `npm run lint`                                                                      |
| Lint fix                 | `npm run lint:fix`                                                                  |
| Build web component      | `nx build signal-grid-elements` (build target only, no serve)                       |
| Package library for npm  | `./build-library-with-assets.sh signal-grid` then `./deploy-package.sh signal-grid` |

**Note:** No test targets are configured in any `project.json`, so specs (`projects/signal-grid/src/lib/grid/**/*.spec.ts`) can't be run, individually or otherwise, until one is added.

`nx.json` has `defaultBase: "master"` but the repo's branch is `main`, so `nx affected` compares against the wrong base unless you pass `--base=main`.

## Code Style

Prettier is enforced via husky pre-commit hooks. Key settings (from `.prettierrc`):

- `singleQuote: true`
- `printWidth: 100`
- `tabWidth: 2`
- `trailingComma: none`
- `arrowParens: avoid`
- `bracketSameLine: true`

## Architecture

### Library (`projects/signal-grid`)

`GridComponent`, `RowComponent`, and `CellComponent` use Angular signals rather than the older `SubjectManager`/`@Input()`-setter pattern (the `SubjectManager`/`SubjectItem` classes in `main-lib/` still exist but are no longer used by these components).

**Key architectural patterns:**

- **Signal Inputs**: `GridComponent` uses `input.required<Model[]>()` for `model`; `columns` is a required input with a **transform** that compiles `ColumnSchema | ColumnConfiguration` arrays into `ColumnConfiguration[]` (via `compileColumns`) and applies the field set + validators to the `GridStore` *before* any row renders. `includeRowExpander` is `input(false)`, `modelChange` is `output<Model[]>()`.
- **Viewport-scoped form state (`GridStore`)**: there is **no giant eager `FormGroup`**. The store (provided on `GridComponent`, injected by rows/cells through the element injector) creates one `FormGroup` per *rendered* row (`ensureRow`), keyed by **row object identity** (`keyFor` via `WeakMap`), and releases it when the row scrolls out. Unsaved edits live in a sparse `Map<rowKey, Map<field, value>>`, so filtering/sorting keep edits attached to the right rows and memory is O(visible + edited), not O(rows × fields). The store owns **one `valueChanges`/`statusChanges` subscription per attached row** (never per cell) and exposes cached per-key signals: `group(key)`, `version(key)`, `dirty(key)`, plus `dirtyRowCount`/`invalidCount`/`hasEdits` computeds. `mergedModel(rows)` applies edits on demand (used by the debounced `modelChange` emitter and `save()`); `commit()` clears edits after save, `reset()` reverts.
- **Single-effect grid**: `GridComponent` has exactly one effect — a debounced (250 ms) `modelChange` emitter keyed off `store.changes()`. Do **not** reintroduce an effect that reads a store/form signal and then writes it (self-write = infinite loop = blank page; that mistake caused a real regression once).
- **OnPush Change Detection**: `GridComponent` uses `ChangeDetectionStrategy.OnPush`.
- **Virtualization**: row rendering is wrapped in a `cdk-virtual-scroll-viewport` (`*cdkVirtualFor`) for performance on large datasets; row height is an approximation (`itemSize`), so expanded rows aren't perfectly accounted for in the scroll math.
- **Column Configuration**: Columns are configured via plain **`ColumnSchema` object literals** (the Formly-style schema: `field`, `header`, `type`, `props`, `editable`, `cssClass`, `wrappers`, `validators`, `width`, … in `models/column-schema.ts`) or via `ColumnConfigurationBuilder` producing `ColumnConfiguration` instances — the `columns` input accepts both, mixed freely (`compileColumns`). Per-row callbacks receive a `CallbackParameter` whose `formGroup` is the **row's** group (other fields via `formGroup.get('otherField')`), not a root group.
- **Cell Types**: A column's `type` is a string (or per-row callback) resolved through `CellTypeRegistry`, scoped per injector level (`GridModule.forRoot`/`forChild`, built-ins at the root). `CellOutletDirective` (`[sgCell]`, in `cell/cell-outlet.directive.ts`) is the single renderer: it resolves the type, composes optional `column.wrappers` from `CellWrapperRegistry` (components extending `BaseCellWrapper`, anchored with `[sgWrapperHost]`), creates the component once via `ViewContainerRef.createComponent` and binds four inputs (`columns`, `column`, `rowKey`, `rowIndex`) only when they change. It also applies `cellCssClass` via its host `[class]` binding. Every cell type extends `BaseCellComponent` and reads values through store signals — **no per-cell `valueChanges` subscriptions**; write values with `setValue()` (read-only guard), never disable form controls (columns on the same field share one), and don't bind `[formControl]` in cells (each binding revalidates the row group). A missing `type` renders `'default'`; an unknown name renders a read-only `'string'` plus one warning.
- **Styling**: The grid is styled only through CSS custom properties (`--signal-grid-*`, falling back to the host's `--color-*` tokens, then to built-in defaults). The list is documented in `projects/signal-grid/assets/scss/_variables.scss` and the README. Don't hardcode colors, radii or sizes in grid styles; add a property instead. The demo maps its own tokens to them in `src/app/scss/_tokens.scss`. Light and dark palettes live there too: the dark one follows the OS, and the header toggle (`ThemeService`) forces either one with `html[data-theme]`.
- **Custom Pipes**: Cell values can be formatted via `PipeType` enum (`Percent`, `Currency`, `Date`, `DateTime`, `Decimal`, etc.) using the `DynamicPipe`.

**Important files:**

- `projects/signal-grid/src/public-api.ts` — library exports
- `projects/signal-grid/src/lib/grid/models/models.ts` — `ColumnConfiguration`, `CallbackParameter`, enums
- `projects/signal-grid/src/lib/grid/models/column-schema.ts` — `ColumnSchema` + `compileColumn`/`compileColumns`
- `projects/signal-grid/src/lib/grid/services/grid-store.ts` — `GridStore`: viewport-scoped row forms, identity-keyed sparse edits, per-row signals
- `projects/signal-grid/src/lib/grid/registry/` — cell type registry (`CellTypeRegistry`), wrapper registry (`CellWrapperRegistry`), `SIGNAL_GRID_CELL_TYPES`/`SIGNAL_GRID_CELL_WRAPPERS`, `GridModule.forRoot`/`forChild` config
- `projects/signal-grid/src/lib/grid/cell/cell-outlet.directive.ts` — `CellOutletDirective` (`[sgCell]`): resolves + creates cell/wrapper components
- `projects/signal-grid/src/lib/grid/cell/base-cell.component.ts` — `BaseCellComponent`, the base class for every cell type
- `projects/signal-grid/src/lib/grid/cell/wrappers/` — `BaseCellWrapper` + `WrapperHostDirective` (`[sgWrapperHost]`)
- `projects/signal-grid/src/lib/grid/cell/types/` — built-in cell types (`number`, `string`, `boolean`, `actions`, `default`)
- `projects/signal-grid/src/lib/grid/services/column-configuration-builder.ts` — builder for columns
- `projects/signal-grid/src/lib/grid/main-lib/subject-manager.ts` — legacy reactive state helper (unused by the grid/row/cell components)

### Web Component (`apps/signal-grid-elements`)

Wraps `GridComponent` as a custom element (`@angular/elements`, `createCustomElement`) via `ngDoBootstrap` in `elements.module.ts`, registering the `<signal-grid>` tag globally. Built independently from the demo app (`nx build signal-grid-elements`) for embedding in non-Angular hosts (e.g. React) — arrays/objects (`model`, `columns`) must be set as DOM properties, not HTML attributes.

### Demo Application (`src/app`)

- `src/app/demo/` — Demo pages showcasing the grid. `DemoComponent` is the shell; `DemoGridComponent` extends it and injects `TestDataService` to populate the grid.
- `src/app/docs/` — documentation section (`/docs/...`): getting started, columns, cell types, styling, web component. Pages are plain components with inline templates and live `<signal-grid>` examples; code samples are string fields rendered by `app-code-block`. Update these pages when the library's public behavior changes.
- `src/app/home/` — Landing page.
- `src/app/shared/` — Shared demo UI components (`DocBlock`, `Hero`, `Duo`, `Scroller`) and HTTP utilities.
- The app uses `HashLocationStrategy`.

### Build Notes

- The workspace uses Nx `project.json` files instead of `angular.json`.
- The library is built with `ng-packagr` and outputs to `dist/signal-grid`.
- `tsconfig.json` is a solution-style config referencing `tsconfig.app.json`, `tsconfig.spec.json`, and the library configs.
- Library packaging: `build-library-with-assets.sh <lib>` runs `npm run build <lib>`, then copies the root `.npmrc`/`.npmignore`, `projects/<lib>/styles.scss`, and `projects/<lib>/assets/` into `dist/<lib>`. `deploy-package.sh <lib>` runs `npm publish` from `dist/<lib>`. `pdev-build-and-deploy.sh` builds the library and copies `dist/` into `node_modules/@jypsolution` of sibling repos (`Ramp.Web.Console`, `Ramp.Compliance`) under `$GitRepoRoot` for local testing.
- `Dockerfile` is nginx serving a prebuilt `dist/signal-grid-site` (it doesn't build anything), so run `nx build signal-grid-site` before `docker compose up`.
- **Deprecated builders:** Both projects currently use the deprecated Webpack-based builders (`@angular-devkit/build-angular:browser` for the app and `:ng-packagr` for the library). Angular recommends migrating to `@angular/build:application` and `@angular/build:ng-packagr` respectively.

## Upgrading Angular / Nx

Angular's own docs advise upgrading one major version at a time. Because this is an Nx workspace, use `nx migrate` (not `ng update` directly) so Nx's config and codemods stay in sync.

**Recommended hop-by-hop process:**

1. Make sure the working tree is clean and committed.
2. Run one migration hop: `npx nx migrate latest`
   - This updates `package.json` and writes `migrations.json` with codemods. If the jump is too large, it may only take you partway; that's expected.
3. Install and apply codemods:
   ```bash
   npm install
   npx nx migrate --run-migrations
   ```
4. Build and verify: `nx build signal-grid-site`
5. Commit the hop: `git add -A && git commit -m "Migrate to Nx/Angular <version>"`
6. Repeat steps 2–5 until `nx migrate latest` reports you are already on the latest version.

**Watch across hops:**

- `@angular/material` and `@angular/cdk` must stay version-locked to `@angular/core`.
- Each Angular major raises the minimum required Node.js version — verify your Node version against Angular's requirements before starting.
- For exact breaking changes at each specific hop, use [update.angular.io](https://update.angular.io) (select your from/to versions).

## Security Note

`nx.json` contains an Nx Cloud `nxCloudAccessToken` (read-write) in plaintext. If this repo is ever made public or shared, rotate that token and move it to an environment variable or Nx Cloud's secure token storage.
