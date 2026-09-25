import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  @Input() imgSrc: string;
  @Input() noOverlay: boolean;
  @Input() title: string;
}
