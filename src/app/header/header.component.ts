import { Component, inject } from '@angular/core';
import { ThemeService } from '../shared/theme/theme.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  theme = inject(ThemeService);
}
