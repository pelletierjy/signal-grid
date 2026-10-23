# Grid

## Cell types

A column's `type` is a plain string that the grid looks up in a registry of `name → component`. The grid ships five built-in types: `'number'`, `'string'`, `'boolean'`, `'actions'` (row action buttons that emit the grid's `cellAction` event) and `'default'` (an empty grey hatched cell, used when a column sets no `type`).

Register your own types when importing the module. A module that calls `forChild` adds to the types registered above it and overrides a name that is already registered, only for the grids below that module.

```ts
@NgModule({
  imports: [
    GridModule.forRoot({ types: [{ name: 'status-badge', component: StatusBadgeCellComponent }] })
  ]
})
export class AppModule {}

// in a lazy-loaded feature module
GridModule.forChild({ types: [{ name: 'lazy-cell', component: LazyCellComponent }] });
```

Use the type, and optional per-column `props`, when defining columns. Both `type` and `props` can be a fixed value or a callback that runs per row.

```ts
new ColumnConfigurationBuilder()
  .withField('status')
  .withType('status-badge') // or cb => (cb.value ? 'status-badge' : 'string')
  .withProps({ colors: { open: 'green' } }) // or cb => ({ ... })
  .build('Status');
```

### Writing a cell type

Extend `BaseCellComponent`. It provides the inputs `columns`, `column`, `rowKey` and `rowIndex`, plus `value()`, `isEditable()`, `props()`, `formControl()`, `rowGroup()`, `callbackParameter()` and `setValue()`.

```ts
@Component({
  selector: 'app-toggle-cell',
  standalone: true,
  template: `<button [disabled]="!isEditable()" (click)="setValue(!value())">
    {{ value() ? 'ON' : 'OFF' }}
  </button>`
})
export class ToggleCellComponent extends BaseCellComponent {}
```

- Write new values with `setValue()`. It ignores the write while the cell is read-only and marks the row as having pending changes.
- Calling `formControl().setValue()` directly bypasses the read-only guard.
- Columns on the same field share one form control, so the grid never disables controls. Render read-only state yourself.
- Avoid binding `[formControl]` in a cell. Each binding revalidates the row's form group on every change. Bind `[value]` and call `setValue()` instead.
- The grid wraps your component in a cell container that already applies the column's `cellCssClass`.

An unregistered type name shows the value as read-only text and logs one warning per name and field. The `<signal-grid>` web component only has the built-in types.

## Styling

The grid reads every look-and-feel value from CSS custom properties, so a client app can restyle it from its own stylesheet: on `:root`, on a wrapper element, or on `<signal-grid>` itself. Each value resolves in this order: the grid property, then the host's generic token (`--color-*`, `--radius-md`, `--font-family`), then a built-in default, so the grid also works with no host theme (for example as a web component).

| Property                        | What it styles                                             |
| ------------------------------- | ---------------------------------------------------------- |
| `--signal-grid-header-color`    | Header text                                                |
| `--signal-grid-header-bg`       | Header background                                          |
| `--signal-grid-row-alt-bg`      | Alternate rows, and the default cell's hatch               |
| `--signal-grid-border-color`    | Cell and table borders, and the default cell's hatch lines |
| `--signal-grid-radius`          | Table corner radius                                        |
| `--signal-grid-bg`              | Table background                                           |
| `--signal-grid-text-color`      | Text                                                       |
| `--signal-grid-font-family`     | Font                                                       |
| `--signal-grid-changed-color`   | Pending-change indicator                                   |
| `--signal-grid-cell-padding`    | Padding of the cell content                                |
| `--signal-grid-viewport-height` | Height of the scrolling area                               |

```css
signal-grid {
  --signal-grid-header-bg: #222;
  --signal-grid-header-color: #fff;
  --signal-grid-radius: 0;
}
```

The demo site sets these in `src/app/scss/_tokens.scss`, mapped to its own tokens, which also switches the grid with the OS light/dark setting.

Custom cell types should take their colors from the host's tokens or from `--signal-grid-*` as well, and should inherit the text color instead of setting their own, so they follow the same theme.

## Code scaffolding

Run `ng generate component component-name --project signal-grid` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project signal-grid`.

> Note: Don't forget to add `--project signal-grid` or else it will be added to the default project in your `angular.json` file.

## Build

Run `ng build signal-grid` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build signal-grid`, go to the dist folder `cd dist/signal-grid` and run `npm publish`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

1.0.0 - Initial release.
