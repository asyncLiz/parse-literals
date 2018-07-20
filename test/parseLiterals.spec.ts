import { expect } from 'chai';
import * as sinon from 'sinon';
import { parseLiterals } from '../src/parseLiterals';
import { Strategy } from '../src/models';

describe('parseLiterals()', () => {
  it('should allow overriding strategy', () => {
    const result: any[] = [];
    const strategy = {
      getRootNode: sinon.fake(),
      walkNodes: sinon.fake.returns(result),
      isTaggedTemplate: sinon.fake.returns(false),
      getTagText: sinon.fake(),
      getTaggedTemplateTemplate: sinon.fake(),
      isTemplate: sinon.fake.returns(false),
      getTemplateParts: sinon.fake()
    };

    parseLiterals('true', { strategy });
    expect(strategy.getRootNode.calledWith('true')).to.be.true;
    expect(strategy.walkNodes.called).to.be.true;
  });

  it('should parse no templates', () => {
    expect(parseLiterals('true')).to.deep.equal([]);
  });

  it('should parse simple template', () => {
    expect(parseLiterals('`simple`')).to.deep.equal([
      {
        parts: [
          {
            text: 'simple',
            start: 1,
            end: 7
          }
        ]
      }
    ]);
  });

  it('should parse template with one expression', () => {
    expect(parseLiterals('`first${true}second`')).to.deep.equal([
      {
        parts: [
          {
            text: 'first',
            start: 1,
            end: 6
          },
          {
            text: 'second',
            start: 13,
            end: 19
          }
        ]
      }
    ]);
  });

  it('should parse template with multiple expressions', () => {
    expect(parseLiterals('`first${true}second${false}third`')).to.deep.equal([
      {
        parts: [
          {
            text: 'first',
            start: 1,
            end: 6
          },
          {
            text: 'second',
            start: 13,
            end: 19
          },
          {
            text: 'third',
            start: 27,
            end: 32
          }
        ]
      }
    ]);
  });

  it('should parse identifier-tagged templates', () => {
    expect(parseLiterals('html`simple`')).to.deep.equal([
      {
        tag: 'html',
        parts: [
          {
            text: 'simple',
            start: 5,
            end: 11
          }
        ]
      }
    ]);
  });

  it('should parse function-tagged templates', () => {
    expect(parseLiterals('html()`simple`')).to.deep.equal([
      {
        tag: 'html()',
        parts: [
          {
            text: 'simple',
            start: 7,
            end: 13
          }
        ]
      }
    ]);
  });

  it('should parse tagged template from return statement', () => {
    expect(parseLiterals('return html`simple`')).to.deep.equal([
      {
        tag: 'html',
        parts: [
          {
            text: 'simple',
            start: 12,
            end: 18
          }
        ]
      }
    ]);
  });

  it('should parse multiple templates', () => {
    expect(parseLiterals('html`first${() => `simple`}second`')).to.deep.equal([
      {
        tag: 'html',
        parts: [
          {
            text: 'first',
            start: 5,
            end: 10
          },
          {
            text: 'second',
            start: 27,
            end: 33
          }
        ]
      },
      {
        parts: [
          {
            text: 'simple',
            start: 19,
            end: 25
          }
        ]
      }
    ]);
  });
});
