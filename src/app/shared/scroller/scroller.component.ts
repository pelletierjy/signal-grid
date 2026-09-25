import { Component } from '@angular/core';

/**
 * This component places a button in the layout which, when clicked, will scroll the page so that the
 * button is near the top of the page, exposing content beneath the fold.
 */
@Component({
  selector: 'app-scroller',
  standalone: false,
  templateUrl: './scroller.component.html',
  styleUrls: ['./scroller.component.scss']
})
export class ScrollerComponent {
  // smooth scroll to element and align it at the bottom
  scroller(event) {
    const element = event.target;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    event.currentTarget.blur();
  }
}
