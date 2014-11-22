
declare class Named {
  constructor(shell: Shell, balloon: Balloon); // stable
  scope(scopeId?: number): Scope; // stable
  element: HTMLElement; // stable
  scopes: Scope[]; // unstable
  currentScope: Scope; // unstable
  shell: Shell; // unstable
  balloon: Balloon; // unstable
  $named: ZeptoCollection; // unstable
}

declare module Named {
}

declare module 'named' {
  var foo: typeof Named;
  module rsvp {
    export var Named: typeof foo;
  }
  export = rsvp;
}
