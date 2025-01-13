export interface A {
  name: string;
}
export interface B {
  name: string;
}
export interface C {
  name: string;
}
export type { C as CC };
export interface Options {
  a?: A;
  b?: B;
  c?: C;
}
