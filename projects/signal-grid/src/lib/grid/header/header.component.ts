import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-header',
  standalone: true,
  template: '<p>header works!</p>',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {}
