export class GridSampleData {
  public readonly title: string;
  constructor(
    public id: number,
    public name: string,
    public isRegistered: boolean,
    public age: number,
    public isActive: boolean
  ) {}
}
