import typescript, { TypescriptStrategy } from './src/strategies/typescript';

export * from './src/models';
export * from './src/parseLiterals';
export const strategies = {
  typescript: <TypescriptStrategy>typescript
};
