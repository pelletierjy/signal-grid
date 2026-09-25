import { Component } from '@angular/core';

@Component({
  selector: 'app-docs',
  standalone: false,
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav class="side-nav" mode="side" opened>
        <nav class="nav">
          @for (page of pages; track page.path) {
          <a
            class="menu-link"
            routerLinkActive="active"
            mat-button
            [routerLink]="['/docs', page.path]"
            >{{ page.title }}</a
          >
          }
        </nav>
      </mat-sidenav>
      <mat-sidenav-content class="demo-content">
        <router-outlet></router-outlet>
        <app-footer></app-footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  // The docs use the same shell styling as the demo section.
  styleUrls: ['../demo/demo/demo.component.scss']
})
export class DocsComponent {
  pages = [
    { path: 'getting-started', title: 'Getting started' },
    { path: 'columns', title: 'Columns' },
    { path: 'cell-types', title: 'Cell types' },
    { path: 'styling', title: 'Styling' },
    { path: 'web-component', title: 'Web component' }
  ];
}
