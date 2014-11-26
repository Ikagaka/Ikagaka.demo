interface JSZipDirectory { [filePath: string]: JSZipObject; };
interface Descript { [key: string]: string; };

declare class Nar {
  constructor(); // stable
  install: Descript; // stable
  directory: JSZipDirectory; // stable
  loadFromBuffer(buffer: ArrayBuffer, callback: (error: any) => void ): void; // stable
  loadFromBlob(file: Blob, callback: (error: any) => void ): void; // stable
  loadFromURL(src: string, callback: (error: any) => void ): void; // stable
  grep(reg: RegExp): string[]; // unstable
  getDirectory(reg: RegExp): JSZipDirectory; // unstable
}

declare module Nar {
  function unzip(buffer: ArrayBuffer): any; // unstable
  function convert(buffer: ArrayBuffer): string; // unstable
  function wget(url: string, responseType: string, callback: (error: any, response: any) => void): void; // unstable
  function parseDescript(text: string): { [key: string]: string; }; // unstable
}

declare module 'nar' {
  var foo: typeof Nar;
  module rsvp {
    export var Nar: typeof foo;
  }
  export = rsvp;
}
