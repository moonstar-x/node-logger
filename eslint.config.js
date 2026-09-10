import { base, ignores, node, sorted, stylistic, typescript } from '@moonstar-x/eslint-config';

export default [
  ...ignores,
  ...base,
  ...typescript,
  ...node,
  ...stylistic,
  ...sorted
];
