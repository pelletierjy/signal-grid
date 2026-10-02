import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../base-cell.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-number-cell',
  standalone: true,
  imports: [MatInputModule, FormsModule],
  template: `
    @if (isEditable()) {
    <input
      class="input-base"
      type="number"
      matInput
      [value]="$any(value() ?? '')"
      (input)="onInput($any($event.target).value)" />
    } @else {
    <div class="input-base">{{ value() }}</div>
    }
  `,
  styleUrls: ['../../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberCellComponent extends BaseCellComponent {
  onInput(text: string): void {
    this.setValue(text === '' ? null : Number(text));
  }
}
