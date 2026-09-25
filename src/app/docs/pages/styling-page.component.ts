import { ChangeDetectionStrategy, Component } from '@angular/core';
import { basicColumns, sampleRows } from '../docs-sample';

@Component({
  selector: 'app-docs-styling',
  standalone: false,
  template: `
    <h1>Styling</h1>
    <p class="lead">
      The grid has no theme of its own to fight. Every color, radius, font and size comes from a CSS
      custom property, so the app that hosts the grid decides how it looks.
    </p>

    <h2>How a value is resolved</h2>
    <p>For each property the grid uses the first one that is set:</p>
    <ol>
      <li>the grid property, <code>--signal-grid-*</code></li>
      <li>the host's generic token, for example <code>--color-primary</code></li>
      <li>a built-in default, so the grid also looks right with no host theme</li>
    </ol>
    <p>
      Set the properties on <code>:root</code>, on a wrapper element, or on
      <code>&lt;signal-grid&gt;</code> itself. They inherit, so a wrapper can theme several grids.
    </p>

    <h2>Properties</h2>
    <table>
      <tr>
        <th>Property</th>
        <th>What it styles</th>
        <th>Falls back to</th>
        <th>Default</th>
      </tr>
      @for (item of properties; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>{{ item.what }}</td>
        <td>
          @if (item.token) {
          <code>{{ item.token }}</code>
          }
        </td>
        <td>
          <code>{{ item.fallback }}</code>
        </td>
      </tr>
      }
    </table>

    <h2>Restyle one grid or all of them</h2>
    <app-code-block [code]="clientSnippet" />

    <h3>Live example</h3>
    <p>
      The first grid follows this site's theme. The second sets only the properties above, from a
      wrapper element.
    </p>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
    <div class="demo theme-custom">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
    <app-code-block [code]="customSnippet" />

    <h2>How this site does it</h2>
    <p>
      This site maps its own design tokens to the grid in one place, <code>_tokens.scss</code>.
      Because the values are references, the grid follows the light and dark theme together with the
      rest of the page: the operating system setting by default, or the choice made with the toggle
      in the header.
    </p>
    <app-code-block [code]="siteSnippet" />

    <h2>Cells, wrappers and your own cell types</h2>
    <ul>
      <li>
        The grid wraps every cell in a container with the class <code>div-cell-container</code> and
        adds the class returned by the column's <code>cellCssClass</code> callback, so conditional
        styling works for every cell type.
      </li>
      <li>
        Component styles are encapsulated. To style grid internals from outside, prefer the
        properties above. Use <code>::ng-deep</code> only for what they do not cover.
      </li>
      <li>
        Cell types you write should not set their own text color. Let it inherit, and take any
        colors from the host's tokens or the grid properties.
      </li>
    </ul>
  `,
  styleUrls: ['../docs-page.scss'],
  styles: [
    `
      .theme-custom {
        --signal-grid-header-bg: #1f2937;
        --signal-grid-header-color: #f9fafb;
        --signal-grid-row-alt-bg: #fef3c7;
        --signal-grid-border-color: #9ca3af;
        --signal-grid-radius: 0;
        --signal-grid-cell-padding: 0.6rem 0.75rem;
        --signal-grid-bg: #ffffff;
        --signal-grid-text-color: #111827;
        --signal-grid-font-family: Georgia, serif;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StylingPageComponent {
  rows = sampleRows();
  columns = basicColumns();

  properties = [
    {
      name: '--signal-grid-header-color',
      what: 'Header text',
      token: '--color-primary',
      fallback: '#1e3a5f'
    },
    {
      name: '--signal-grid-header-bg',
      what: 'Header background',
      token: '--color-primary-light',
      fallback: '#e8edf3'
    },
    {
      name: '--signal-grid-row-alt-bg',
      what: 'Alternate rows and the hatch of the default cell',
      token: '--color-surface-alt',
      fallback: '#f6f7f9'
    },
    {
      name: '--signal-grid-border-color',
      what: 'Cell and table borders and the hatch lines of the default cell',
      token: '--color-border-strong',
      fallback: 'rgba(15, 23, 42, 0.18)'
    },
    {
      name: '--signal-grid-radius',
      what: 'Table corner radius',
      token: '--radius-md',
      fallback: '8px'
    },
    {
      name: '--signal-grid-bg',
      what: 'Table background',
      token: '--color-surface',
      fallback: 'transparent'
    },
    {
      name: '--signal-grid-text-color',
      what: 'Text',
      token: '--color-text',
      fallback: 'inherit'
    },
    {
      name: '--signal-grid-font-family',
      what: 'Font',
      token: '--font-family',
      fallback: 'inherit'
    },
    {
      name: '--signal-grid-changed-color',
      what: 'Pending-change indicator',
      token: '',
      fallback: '#b45309'
    },
    {
      name: '--signal-grid-cell-padding',
      what: 'Padding of the cell content',
      token: '',
      fallback: '0.35rem 0.5rem'
    },
    {
      name: '--signal-grid-viewport-height',
      what: 'Height of the scrolling area',
      token: '',
      fallback: '480px'
    }
  ];

  clientSnippet = `/* every grid in the app */
:root {
  --signal-grid-header-bg: #222;
  --signal-grid-header-color: #fff;
}

/* one grid */
signal-grid.compact {
  --signal-grid-cell-padding: 0.15rem 0.35rem;
  --signal-grid-viewport-height: 300px;
}`;

  customSnippet = `.theme-custom {
  --signal-grid-header-bg: #1f2937;
  --signal-grid-header-color: #f9fafb;
  --signal-grid-row-alt-bg: #fef3c7;
  --signal-grid-border-color: #9ca3af;
  --signal-grid-radius: 0;
  --signal-grid-cell-padding: 0.6rem 0.75rem;
  --signal-grid-bg: #ffffff;
  --signal-grid-text-color: #111827;
  --signal-grid-font-family: Georgia, serif;
}`;

  siteSnippet = `:root {
  --color-primary: #1e3a5f;
  --color-primary-light: #e8edf3;
  /* ... the rest of the site's tokens ... */

  --signal-grid-header-color: var(--color-primary);
  --signal-grid-header-bg: var(--color-primary-light);
  --signal-grid-row-alt-bg: var(--color-surface-alt);
  --signal-grid-border-color: var(--color-border-strong);
  --signal-grid-radius: var(--radius-md);
  --signal-grid-changed-color: var(--color-accent-dark);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-primary: #9db4d3;
    --color-primary-light: #1e2837;
    /* the grid properties above need no change: they point at these tokens */
  }
}

/* the header toggle forces a theme with html[data-theme] */
:root[data-theme='dark'] {
  /* the same dark tokens */
}`;
}
