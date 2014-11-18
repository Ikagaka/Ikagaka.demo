
declare class Surface {
  constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceName: string, surfaces: Surfaces); // unstable
  destructor(): void; // stable
  element: HTMLCanvasElement; // stable
  render(): void; // unstable
  play(animationId: number, callback?: () => void): void; // unstable
  stop(animationId: number): void; // unstable
  bind(animationId: number): void; // unstable
  unbind(animationId: number): void; // unstable
}


declare module Surface {
  function random(callback: (callback: () => void) => void, probability: Number): void; // stable
  function periodic(callback: (callback: () => void) => void, sec: Number): void; // stable
  function always(callback: (callback: () => void) => void): void; // stable
  function isHit(cnv: HTMLCanvasElement, x: number, y: number ): boolean; // stable
}

declare module 'surface' {
  var foo: typeof Surface;
  module rsvp {
    export var Surface: typeof foo;
  }
  export = rsvp;
}
