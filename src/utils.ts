import { workspace as Workspace, Range, Position } from 'vscode';
import * as os from 'os';

export function lineRange(character: number, position: Position): Range {
  return new Range(position.line, character, position.line, position.character);
}

export function getSnippetDir(): string {
  let platform = os.platform();

  let APPDATA = process.env.APPDATA || '';
  let HOME = process.env.HOME || '';

  function parsePath(path: string) {
    return path.replace(/\%APPDATA\%/g, APPDATA).replace(/\$HOME/g, HOME);
  }

  if (platform === 'win32') {
    const path: string | undefined = Workspace.getConfiguration('hsnips').get('windows');
    return parsePath(path ? path : parsePath('%APPDATA%/Code/User/hsnips'));
  } else if (platform === 'darwin') {
    const path: string | undefined = Workspace.getConfiguration('hsnips').get('mac');
    return parsePath(path ? path : parsePath('$HOME/Library/Application Support/Code/User/hsnips'));
  } else {
    const path: string | undefined = Workspace.getConfiguration('hsnips').get('linux');
    return parsePath(path ? path : parsePath('$HOME/.config/Code/User/hsnips'));
  }
}

export function applyOffset(position: Position, text: string, indent: number): Position {
  text = text.replace('\\$', '$');
  const lines = text.split('\n');
  const newLine = position.line + lines.length - 1;
  const charOffset = lines[lines.length - 1].length;

  let newChar = position.character + charOffset;
  if (lines.length > 1) {
    newChar = indent + charOffset;
  }

  return position.with(newLine, newChar);
}

export function getWorkspaceUri(): string {
  return Workspace.workspaceFolders?.[0]?.uri?.toString() ?? '';
}
