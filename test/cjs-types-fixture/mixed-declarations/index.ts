export interface A {
  name: string;
}
export interface B {
  name: string;
}
export interface C {
  name: string;
}
export interface Options {
  a?: A;
  b?: B;
  c?: C;
}

export default function plugin(options: Options = {}): Options {
  return options;
}
