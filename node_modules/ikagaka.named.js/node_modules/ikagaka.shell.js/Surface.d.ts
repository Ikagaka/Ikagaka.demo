
declare class Surface {
  constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceName: string, surfaces: Surfaces, callback?: () => void); // unstable
  destructor(): void; // stable
  render(): void; // unstable
  talk(): void; // unstable
  YenE(): void; // unstable
  play(animationId: number, callback?: () => void): void; // unstable
  stop(animationId: number): void; // unstable
  bind(animationId: number): void; // unstable
  unbind(animationId: number): void; // unstable

  element: HTMLCanvasElement; // stable
  baseSurface: HTMLCanvasElement; // unstable
  bufferCanvas: HTMLCanvasElement; // unstable
  stopFlags: { [is: number]: boolean; }; // unstable
  talkCount: number; // unstable
  layers: { [is: number]: {
    type: string;
    surface: string;
    wait: string;
    x: string;
    y: string;
  }; }; // unstable
  destructed: boolean; // unstable
  regions: {
    [key: string]: {
      is: string;
      name: string;
      type: string;
      left: string;
      top: string;
      right: string;
      bottom: string;
      coordinates: {x: string; y: string;}[];
    };
  }; // unstable
  animations: {
    [key: string]: {
      is: string;
      interval: string;
      option : string;
      patterns: { type: string; surface: string; wait: string; x: string; y: string; }[];
    };
  }; // unstable
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
