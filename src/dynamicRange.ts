import { TextDocumentContentChangeEvent, Range, Position } from 'vscode';

type PositionDelta = { characterDelta: number; lineDelta: number };

export enum GrowthType {
  grow,
  fixLeft,
  fixRight,
}

export interface IChangeInfo {
  change: TextDocumentContentChangeEvent;
  growth: GrowthType;
}

function getRangeDelta(
  range: Range,
  change: TextDocumentContentChangeEvent,
  growth: GrowthType,
): [PositionDelta, PositionDelta] {
  const deltaStart = { characterDelta: 0, lineDelta: 0 };
  const deltaEnd = { characterDelta: 0, lineDelta: 0 };

  const textLines = change.text.split('\n');
  const lineDelta =
    change.text.split('\n').length - (change.range.end.line - change.range.start.line + 1);
  let charDelta = textLines[textLines.length - 1].length - change.range.end.character;
  if (lineDelta === 0) {
    charDelta += change.range.start.character;
  }

  if (range.start.isAfterOrEqual(change.range.end)) {
    deltaStart.lineDelta = lineDelta;
  }

  if (range.end.isAfterOrEqual(change.range.end)) {
    deltaEnd.lineDelta = lineDelta;
  }

  if (change.range.end.line === range.start.line) {
    if (
      (growth === GrowthType.fixRight && range.start.isEqual(change.range.end)) ||
      range.start.isAfter(change.range.end)
    ) {
      deltaStart.characterDelta = charDelta;
    }
  }

  if (change.range.end.line === range.end.line) {
    if (
      (growth !== GrowthType.fixLeft && range.end.isEqual(change.range.end)) ||
      range.end.isAfter(change.range.end)
    ) {
      deltaEnd.characterDelta = charDelta;
    }
  }

  return [deltaStart, deltaEnd];
}

export class DynamicRange {
  range: Range;

  constructor(start: Position, end: Position) {
    this.range = new Range(start, end);
  }

  static fromRange(range: Range) {
    return new DynamicRange(range.start, range.end);
  }

  update(changes: IChangeInfo[]) {
    const deltaStart = { characterDelta: 0, lineDelta: 0 };
    const deltaEnd = { characterDelta: 0, lineDelta: 0 };

    for (const { change, growth } of changes) {
      const deltaChange = getRangeDelta(this.range, change, growth);

      deltaStart.characterDelta += deltaChange[0].characterDelta;
      deltaStart.lineDelta += deltaChange[0].lineDelta;
      deltaEnd.characterDelta += deltaChange[1].characterDelta;
      deltaEnd.lineDelta += deltaChange[1].lineDelta;
    }

    let [newStart, newEnd] = [this.range.start, this.range.end];
    newStart = newStart.translate(deltaStart);
    newEnd = newEnd.translate(deltaEnd);
    this.range = this.range.with(newStart, newEnd);
  }

  contains(range: Range): boolean {
    return this.range.contains(range);
  }
}
