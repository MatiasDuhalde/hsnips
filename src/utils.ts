import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export function lineRange(character: number, position: vscode.Position): vscode.Range {
  return new vscode.Range(position.line, character, position.line, position.character);
}

export function getSnippetDir(): string {
  let hsnipsPath = vscode.workspace.getConfiguration('hsnips').get('hsnipsPath') as string | null;

  if (hsnipsPath) {
    let workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (path.isAbsolute(hsnipsPath)) {
      return hsnipsPath;
    } else if (workspaceFolder) {
      return path.join(workspaceFolder.uri.fsPath, hsnipsPath);
    }
  }

  let platform = os.platform();

  const APPDATA = process.env.APPDATA || '';
  const HOME = process.env.HOME || '';

  console.log(vscode);

  if (platform === 'win32') {
    return path.join(APPDATA, 'Code - Insiders/User/hsnips');
  } else if (platform === 'darwin') {
    return path.join(HOME, 'Library/Application Support/Code - Insiders/User/hsnips');
  } else {
    return path.join(HOME, '.config/Code - Insiders/User/hsnips');
  }
}

export function applyOffset(
  position: vscode.Position,
  text: string,
  indent: number,
): vscode.Position {
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
  return vscode.workspace.workspaceFolders?.[0]?.uri?.toString() ?? '';
}
