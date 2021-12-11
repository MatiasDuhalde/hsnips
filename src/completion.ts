import {
  Range,
  CompletionItem,
  TextDocument,
  Position,
  workspace as Workspace,
  extensions as Extensions,
} from 'vscode';
import { lineRange } from './utils';
import { HSnippet } from './hsnippet';

export class CompletionInfo {
  range: Range;
  completionRange: Range;
  snippet: HSnippet;
  label: string;
  groups: string[];

  constructor(snippet: HSnippet, label: string, range: Range, groups: string[]) {
    this.snippet = snippet;
    this.label = label;
    this.range = range;
    this.completionRange = new Range(range.start, range.start.translate(0, label.length));
    this.groups = groups;
  }

  toCompletionItem() {
    const completionItem = new CompletionItem(this.label);
    completionItem.range = this.range;
    completionItem.detail = this.snippet.description;
    completionItem.insertText = this.label;
    completionItem.command = {
      command: 'hsnips.expand',
      title: 'expand',
      arguments: [this],
    };

    return completionItem;
  }
}

function matchSuffixPrefix(context: string, trigger: string) {
  while (trigger.length) {
    if (context.endsWith(trigger)) {
      return trigger;
    }
    trigger = trigger.substring(0, trigger.length - 1);
  }

  return null;
}

export function getCompletions(
  document: TextDocument,
  position: Position,
  snippets: HSnippet[],
): CompletionInfo[] | CompletionInfo | undefined {
  const line = document.getText(lineRange(0, position));

  // Grab everything until previous whitespace as our matching context.
  const match = line.match(/\S*$/);
  const contextRange = lineRange((match as RegExpMatchArray).index || 0, position);
  const context = document.getText(contextRange);
  const precedingContextRange = new Range(
    position.line,
    0,
    position.line,
    (match as RegExpMatchArray).index || 0,
  );
  const precedingContext = document.getText(precedingContextRange);
  const isPrecedingContextWhitespace = precedingContext.match(/^\s*$/) !== null;

  let wordRange = document.getWordRangeAtPosition(position) || contextRange;
  if (wordRange.end !== position) {
    wordRange = new Range(wordRange.start, position);
  }
  const wordContext = document.getText(wordRange);

  let longContext = null;

  const completions = [];
  let snippetContext = { scopes: [] };

  //FIXME: Plain text scope resolution should be fixed in hscopes.
  if (document.languageId !== 'plaintext') {
    snippetContext = {
      scopes: Extensions.getExtension('draivin.hscopes')!.exports.getScopeAt(document, position)
        .scopes,
    };
  }

  for (const snippet of snippets) {
    if (snippet.contextFilter && !snippet.contextFilter(snippetContext)) {
      continue;
    }

    let snippetMatches = false;
    let snippetRange = contextRange;
    let prefixMatches = false;

    let matchGroups: string[] = [];
    let label = snippet.trigger;

    if (snippet.trigger) {
      let matchingPrefix = null;

      if (snippet.inWord) {
        snippetMatches = context.endsWith(snippet.trigger);
        matchingPrefix = snippetMatches
          ? snippet.trigger
          : matchSuffixPrefix(context, snippet.trigger);
      } else if (snippet.wordBoundary) {
        snippetMatches = wordContext === snippet.trigger;
        matchingPrefix = snippet.trigger.startsWith(wordContext) ? wordContext : null;
      } else if (snippet.beginningOfLine) {
        snippetMatches = context.endsWith(snippet.trigger) && isPrecedingContextWhitespace;
        matchingPrefix =
          snippet.trigger.startsWith(context) && isPrecedingContextWhitespace ? context : null;
      } else {
        snippetMatches = context === snippet.trigger;
        matchingPrefix = snippet.trigger.startsWith(context) ? context : null;
      }

      if (matchingPrefix) {
        snippetRange = new Range(position.translate(0, -matchingPrefix.length), position);
        prefixMatches = true;
      }
    } else if (snippet.regexp) {
      let regexContext = line;

      if (snippet.multiline) {
        if (!longContext) {
          const numberPrevLines = Workspace.getConfiguration('hsnips').get(
            'multiLineContext',
          ) as number;

          longContext = document
            .getText(
              new Range(new Position(Math.max(position.line - numberPrevLines, 0), 0), position),
            )
            .replace(/\r/g, '');
        }

        regexContext = longContext;
      }

      const match = snippet.regexp.exec(regexContext);
      if (match) {
        const charOffset = match.index - regexContext.lastIndexOf('\n', match.index) - 1;
        const lineOffset = match[0].split('\n').length - 1;

        snippetRange = new Range(new Position(position.line - lineOffset, charOffset), position);
        snippetMatches = true;
        matchGroups = Array.from(match);
        label = match[0];
        prefixMatches = true;
      }
    }

    const completion = new CompletionInfo(snippet, label, snippetRange, matchGroups);
    if (snippet.automatic && snippetMatches) {
      return completion;
    } else if (prefixMatches) {
      completions.push(completion);
    }
  }

  return completions;
}
