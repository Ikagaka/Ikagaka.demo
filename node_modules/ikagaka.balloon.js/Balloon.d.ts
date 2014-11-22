interface Balloons {
  sakura: {descript: Descript; canvas: HTMLCanvasElement; }[];
  kero: {descript: Descript; canvas: HTMLCanvasElement; }[];
  communicate: {descript: Descript; canvas: HTMLCanvasElement; }[];
  online: {descript: Descript; canvas: HTMLCanvasElement; }[];
  arrow: {descript: Descript; canvas: HTMLCanvasElement; }[];
  sstp: {descript: Descript; canvas: HTMLCanvasElement; }[];
  thumbnail: {descript: Descript; canvas: HTMLCanvasElement; }[];
}


declare class Balloon {
  constructor(directory: JSZipDirectory); // stable
  load(callback:(error: any) => void): void; // stable
  attachSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number): BalloonSurface; // unstable
  descript: Descript; // stable
  directory: JSZipDirectory; // stable
  balloons: Balloons; // stable
}

declare module Balloon {
  loadBalloonDescripts(directory: JSZipDirectory, balloons: Balloons, descript: Descript): void
  loadBalloonSurfaces(directory: JSZipDirectory, balloons: Balloons, callback: (error: any) => void): void
}

declare module 'balloon' {
  var foo: typeof Balloon;
  module rsvp {
    export var Balloon: typeof foo;
  }
  export = rsvp;
}
