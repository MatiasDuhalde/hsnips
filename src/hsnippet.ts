import { HSnippetUtils } from './hsnippetUtils';

export type GeneratorResult = [(string | { block: number })[], string[]];
export type GeneratorFunction = (
  texts: string[],
  matchGroups: string[],
  workspaceUri: string,
  fileUri: string,
  hsnippetUtils: HSnippetUtils,
) => GeneratorResult;

export interface ContextInfo {
  scopes: string[];
}

export type ContextFilter = (context: ContextInfo) => boolean;

// Represents a snippet template from which new instances can be created.
export class HSnippet {
  trigger: string;
  description: string;
  generator: GeneratorFunction;
  contextFilter?: ContextFilter;
  regexp?: RegExp;
  placeholders: number;
  priority: number;

  // UltiSnips-like options.
  automatic = false;
  multiline = false;
  inWord = false;
  wordBoundary = false;
  beginningOfLine = false;
  math = false;

  constructor(
    header: IHSnippetHeader,
    generator: GeneratorFunction,
    placeholders: number,
    contextFilter?: ContextFilter,
  ) {
    this.description = header.description;
    this.generator = generator;
    this.contextFilter = contextFilter;
    this.placeholders = placeholders;
    this.priority = header.priority || 0;

    if (header.trigger instanceof RegExp) {
      this.regexp = header.trigger;
      this.trigger = '';
    } else {
      this.trigger = header.trigger;
    }

    if (header.flags.includes('A')) {
      this.automatic = true;
    }
    if (header.flags.includes('M')) {
      this.multiline = true;
    }
    if (header.flags.includes('i')) {
      this.inWord = true;
    }
    if (header.flags.includes('w')) {
      this.wordBoundary = true;
    }
    if (header.flags.includes('b')) {
      this.beginningOfLine = true;
    }
    if (header.flags.includes('m')) {
      this.math = true;
    }
  }
}

export interface IHSnippetHeader {
  trigger: string | RegExp;
  description: string;
  flags: string;
  priority?: number;
}
