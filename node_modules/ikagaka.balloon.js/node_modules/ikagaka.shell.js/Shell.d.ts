interface JSZipDirectory { [filePath: string]: JSZipObject; };
interface Descript { [key: string]: string; };
interface Surfaces {
  charset: string;
  descript: {
    version: string;
    maxwidth: string;
    "collision-sort": string;
    "animation-sort": string;
  };
  surfaces: {
    [key: string]: {
      is: string;
      characters: { sakura: string; };
      points: {
        centerx: string;
        centery: string;
        kinoko: { centerx: string; centery: string; };
        basepos:{ x: string; y: string; };
      };
      balloons: {
        sakura: { offsetx: string; offsety: string;};
        offsetx: string;
        offsety: string;
      };
      elements: {
        [key: string]: {
          is: string;
          type: string;
          file: string;
          x: string;
          y: string;
          canvas: HTMLCanvasElement;
        };
      };
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
      };
      animations: {
        [key: string]: {
          is: string;
          interval: string;
          option : string;
          patterns: { type: string; surface: string; wait: string; x: string; y: string; }[];
        };
      };
      base: string[];
      baseSurface: HTMLCanvasElement;
      canvas: HTMLCanvasElement;
      file: JSZipObject;
    };
  };
  aliases: {
    sakura: {
      [name: string]: string[];
    };
  };
  regions: {
    sakura: {
      bust: {
        tooltip: string;
        cursor: {
          mouseup: string;
          mousedown: string;
        };
      };
    };
  };
}

declare class Shell {
  constructor(directory: JSZipDirectory); // stable
  load(callback: (error: any) => void): void; // stable
  attatchSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, callback?: () => void): Surface; // unstable
  descript: Descript; // stable
  directory: JSZipDirectory; // stable
  surfaces: Surfaces; // stable
}


declare module Shell {
  function createBases(surfaces: Surfaces): Surfaces; // unstable
  function loadSurfaces(surfaces: Surfaces, callback: (error: any, surfaces: Surfaces) => void ): void; // unstable
  function loadElements(surfaces: Surfaces, directory: JSZipDirectory, callback: (error: any, surfaces: Surfaces) => void ): void; // unstable
  function mergeSurfacesAndSurfacesFiles(surfaces: Surfaces, directory: JSZipDirectory): Surfaces; // unstable
  function parseSurfaces(text: string): Surfaces; // stable
}

declare module 'shell' {
  var foo: typeof Shell;
  module rsvp {
    export var Shell: typeof foo;
  }
  export = rsvp;
}
