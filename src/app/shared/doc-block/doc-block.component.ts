import { Component, Input } from '@angular/core';

export class Item {
  title: string;
  description: string;
}

export class DocBlock {
  items: Item[];
  headers: string[] = [];
  constructor(headers: string[], items: Item[]) {
    this.headers = headers;
    this.items = items;
  }
}

@Component({
  selector: 'app-doc-block',
  standalone: false,
  templateUrl: './doc-block.component.html',
  styleUrls: ['./doc-block.component.scss']
})
export class DocBlockComponent {
  @Input() docblock: DocBlock;
}
