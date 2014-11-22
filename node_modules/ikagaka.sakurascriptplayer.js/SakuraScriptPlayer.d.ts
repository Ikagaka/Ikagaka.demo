
declare class SakuraScriptPlayer {
  constructor(named: Named); // stable
  play: (sakuraScript: string, callback?: () => void ): void; // unstable
  break: (): void; // stable
  
  breakTid: number; // unstable
  playing: boolean; // unstable
}

declare module Nar {
}

declare module 'nar' {
  var foo: typeof Nar;
  module rsvp {
    export var Nar: typeof foo;
  }
  export = rsvp;
}
