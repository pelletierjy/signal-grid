import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../base-cell.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-string-cell',
  standalone: true,
  imports: [MatInputModule, FormsModule],
  template: `
    @if (isEditable()) {
    <input
      class="input-base"
      type="text"
      matInput
      [value]="$any(value() ?? '')"
      (input)="setValue($any($event.target).value)" />
    } @else {
    <div class="input-base">{{ value() }}</div>
    }
  `,
  styleUrls: ['../../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StringCellComponent extends BaseCellComponent {}
