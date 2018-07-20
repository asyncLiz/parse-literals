import { expect } from 'chai';
import * as pl from '../index';
import { parseLiterals } from '../src/parseLiterals';
import typescript from '../src/strategies/typescript';

describe('exports', () => {
  it('should export parseLiterals() function', () => {
    expect(pl.parseLiterals).to.equal(parseLiterals);
  });

  it('should export strategies map', () => {
    expect(pl.strategies).to.deep.equal({
      typescript
    });
  });
});
