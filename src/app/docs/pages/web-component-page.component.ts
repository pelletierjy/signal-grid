import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-docs-web-component',
  standalone: false,
  template: `
    <h1>Web component</h1>
    <p class="lead">
      The grid is also built as a custom element, <code>&lt;signal-grid&gt;</code>, for pages that
      are not Angular apps, such as React.
    </p>

    <h2>Build</h2>
    <app-code-block [code]="buildSnippet" />
    <p>
      The output is in <code>dist/signal-grid-elements</code>: <code>runtime.js</code>,
      <code>polyfills.js</code> and <code>main.js</code>. Load them as modules.
    </p>

    <h2>Use it</h2>
    <app-code-block [code]="useSnippet" />
    <ul>
      <li>
        <code>model</code> and <code>columns</code> are objects, so set them as DOM properties, not
        HTML attributes.
      </li>
      <li>
        Set both before you add the element to the page. They are required inputs, and setting them
        after the element is attached logs an Angular error (NG0950) first.
      </li>
      <li>
        A column is a plain object with <code>fieldName</code>, <code>columnHeaderText</code>,
        <code>type</code> and, for editable columns, an <code>isEditable</code> function. It works
        like the builder's result, see <a routerLink="/docs/columns">Columns</a>.
      </li>
      <li>
        <code>modelChange</code> is a DOM event. It is a <code>CustomEvent</code> and the rows are
        in <code>event.detail</code>.
      </li>
    </ul>

    <h2>Cell types</h2>
    <p>
      The element has only the built-in types: <code>number</code>, <code>string</code>,
      <code>boolean</code> and <code>default</code>. Custom types are Angular components and cannot
      be registered from outside Angular, so a column that names another type shows its value as
      read-only text and logs a warning.
    </p>

    <h2>Styling</h2>
    <p>
      The element is styled with the same <a routerLink="/docs/styling">custom properties</a>. Set
      them on the element or on any parent in the page's own CSS.
    </p>
  `,
  styleUrls: ['../docs-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebComponentPageComponent {
  buildSnippet = `nx build signal-grid-elements`;

  useSnippet = `<script src="runtime.js" type="module"></script>
<script src="polyfills.js" type="module"></script>
<script src="main.js" type="module"></script>

<script>
  const grid = document.createElement('signal-grid');

  const column = (fieldName, columnHeaderText, type, editable) => ({
    fieldName, columnHeaderText, type, isEditable: () => editable
  });

  grid.columns = [
    column('name', 'Name', 'string', true),
    column('isActive', 'Active', 'boolean', true)
  ];
  grid.model = [{ name: 'Ada', isActive: true }];

  grid.addEventListener('modelChange', event => console.log(event.detail));

  document.body.appendChild(grid);
</script>`;
}
