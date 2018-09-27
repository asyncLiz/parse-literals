import { expect } from 'chai';
import { parseLiterals } from '../src/parseLiterals';

export interface ParseTestsOptions {
  codePrefix?: string;
  codeSuffix?: string;
}

export default function createParseTests(options: ParseTestsOptions = {}) {
  if (!options.codePrefix) {
    options.codePrefix = '';
  }

  if (!options.codeSuffix) {
    options.codeSuffix = '';
  }

  const offset = options.codePrefix.length;
  it('should parse no templates', () => {
    expect(
      parseLiterals(options.codePrefix + 'true' + options.codeSuffix)
    ).to.deep.equal([]);
  });

  it('should parse simple template', () => {
    expect(
      parseLiterals(options.codePrefix + '`simple`' + options.codeSuffix)
    ).to.deep.equal([
      {
        parts: [
          {
            text: 'simple',
            start: 1 + offset,
            end: 7 + offset
          }
        ]
      }
    ]);
  });

  it('should parse template with one expression', () => {
    expect(
      parseLiterals(
        options.codePrefix + '`first${true}second`' + options.codeSuffix
      )
    ).to.deep.equal([
      {
        parts: [
          {
            text: 'first',
            start: 1 + offset,
            end: 6 + offset
          },
          {
            text: 'second',
            start: 13 + offset,
            end: 19 + offset
          }
        ]
      }
    ]);
  });

  it('should parse template with multiple expressions', () => {
    expect(
      parseLiterals(
        options.codePrefix +
          '`first${true}second${false}third`' +
          options.codeSuffix
      )
    ).to.deep.equal([
      {
        parts: [
          {
            text: 'first',
            start: 1 + offset,
            end: 6 + offset
          },
          {
            text: 'second',
            start: 13 + offset,
            end: 19 + offset
          },
          {
            text: 'third',
            start: 27 + offset,
            end: 32 + offset
          }
        ]
      }
    ]);
  });

  it('should parse identifier-tagged templates', () => {
    expect(
      parseLiterals(options.codePrefix + 'html`simple`' + options.codeSuffix)
    ).to.deep.equal([
      {
        tag: 'html',
        parts: [
          {
            text: 'simple',
            start: 5 + offset,
            end: 11 + offset
          }
        ]
      }
    ]);
  });

  it('should parse function-tagged templates', () => {
    expect(
      parseLiterals(options.codePrefix + 'html()`simple`' + options.codeSuffix)
    ).to.deep.equal([
      {
        tag: 'html()',
        parts: [
          {
            text: 'simple',
            start: 7 + offset,
            end: 13 + offset
          }
        ]
      }
    ]);
  });

  it('should parse tagged template from return statement', () => {
    expect(
      parseLiterals(
        options.codePrefix + 'return html`simple`' + options.codeSuffix
      )
    ).to.deep.equal([
      {
        tag: 'html',
        parts: [
          {
            text: 'simple',
            start: 12 + offset,
            end: 18 + offset
          }
        ]
      }
    ]);
  });

  it('should parse multiple templates', () => {
    expect(
      parseLiterals(
        options.codePrefix +
          'html`first${() => `simple`}second`' +
          options.codeSuffix
      )
    ).to.deep.equal([
      {
        tag: 'html',
        parts: [
          {
            text: 'first',
            start: 5 + offset,
            end: 10 + offset
          },
          {
            text: 'second',
            start: 27 + offset,
            end: 33 + offset
          }
        ]
      },
      {
        parts: [
          {
            text: 'simple',
            start: 19 + offset,
            end: 25 + offset
          }
        ]
      }
    ]);
  });

  it('should parse literals with escaped characters', () => {
    expect(
      parseLiterals(
        options.codePrefix + '`content: "\\2003"`' + options.codeSuffix
      )
    ).to.deep.equal([
      {
        parts: [
          {
            text: 'content: "\\2003"',
            start: 1 + offset,
            end: 17 + offset
          }
        ]
      }
    ]);

    expect(
      parseLiterals(
        options.codePrefix +
          '`content: "\\2003"${true}content: "\\2003"${false}content: "\\2003"`' +
          options.codeSuffix
      )
    ).to.deep.equal([
      {
        parts: [
          {
            text: 'content: "\\2003"',
            start: 1 + offset,
            end: 17 + offset
          },
          {
            text: 'content: "\\2003"',
            start: 24 + offset,
            end: 40 + offset
          },
          {
            text: 'content: "\\2003"',
            start: 48 + offset,
            end: 64 + offset
          }
        ]
      }
    ]);
  });
}
