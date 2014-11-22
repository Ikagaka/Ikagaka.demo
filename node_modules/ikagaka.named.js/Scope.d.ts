
declare class Scope {
  constructor(scopeId: number, shell: Shell, balloon: Balloon); // unstable
  surface(scopeId?: number, callback?: () => void)): Surface; // unstable
  blimp(balloonId?: number, callback?: () => void): {
    talk: (text: string) => void;
    clear: () => void;
    br: () => void;
    choice: (text: string, id: string) => void;
  }; // unstable
  element: HTMLElement; // stable
  shell: Shell; // unstable
  balloon: Balloon; // unstable
  $scope: ZeptoCollection; // unstable
  $surfaceCanvas: ZeptoCollection; // unstable
  $surface: ZeptoCollection; // unstable
  $blimpCanvas: ZeptoCollection; // unstable
  $blimpText: ZeptoCollection; // unstable
  $blimp: ZeptoCollection; // unstable
  currentSurface: Surface // unstable
  currentBalloon: BalloonSurface // unstable
  leftFlag: boolean; // unstable
}

declare module Scope {
}

declare module 'balloon' {
  var foo: typeof Balloon;
  module rsvp {
    export var Balloon: typeof foo;
  }
  export = rsvp;
}
