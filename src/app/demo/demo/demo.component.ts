import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: false,
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {
  selectedDemo: string;

  constructor(private router: Router) {
    this.selectedDemo = this.router.url.replace('/demo/', '');
  }

  navigateTo(value) {
    this.selectedDemo = value || 'demo-grid';
    this.router.navigate(['/demo/', this.selectedDemo]);
  }
}
