// FP: type imported with "import type" and only used in type position
import type { Bar } from 'anywhere'
const x: Bar = {} as Bar
function f(): Bar { return {} as Bar }