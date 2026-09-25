import { Component, Input, OnInit } from '@angular/core';

export interface DuoStyle {
  content: object;
  image: object;
}

/**
 * This componenet displays text content, in a bordered box, overlapping an image.
 * Default is image on left, text on right.
 * @input imgSrc - This is used for the image used as a background on a div
 * @input reverse - This mirrors the image and text with text on the left and image on the right
 * @input theme - This chooses the colors of the content background and borders. Acceptable values are
 *                'primary' and 'secondary'
 * @input textSize - This sets the font size of the content. Values are 'large', 'medium', and 'small'.
 *                   Default is 'large'.
 */
@Component({
  selector: 'app-duo',
  standalone: false,
  templateUrl: './duo.component.html',
  styleUrls: ['./duo.component.scss']
})
export class DuoComponent implements OnInit {
  @Input() imgSrc: string;
  @Input() reverse: boolean;
  @Input() theme: string;
  @Input() textSize: string;
  @Input() backgroundSize = 'auto';

  style: DuoStyle;

  constructor() {
    this.style = {
      content: {},
      image: {}
    };
  }

  ngOnInit() {
    const themeType = this.theme || 'primary';
    const size = this.textSize || 'large';

    let fillColor = 'var(--color-primary-light)';
    let borderColor = 'var(--color-primary)';

    if (themeType !== 'primary') {
      fillColor = 'var(--color-surface-alt)';
      borderColor = 'var(--color-border-strong)';
    }

    // 'large' as default
    let newFontSize = '2rem';
    let newLineHeight = '1.3';

    if (size === 'medium') {
      newFontSize = '1.5rem';
      newLineHeight = '1.2';
    } else if (size === 'small') {
      newFontSize = '1rem';
      newLineHeight = '1';
    }

    this.style = {
      image: {
        backgroundImage: `url('${this.imgSrc}')`,
        backgroundSize: `${this.backgroundSize}`
      },
      content: {
        backgroundColor: fillColor,
        border: `1px solid ${borderColor}`,
        fontSize: newFontSize,
        lineHeight: newLineHeight,
        boxShadow: `2px 2px 5px #00000082`
      }
    };
  }
}
