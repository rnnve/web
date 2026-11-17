// The package ships global DOM declarations rather than a module declaration.
declare module "@mixmark-io/domino" {
  export function createWindow(
    html?: string,
    address?: string,
  ): Window & typeof globalThis;
  export function createDocument(html: string): Document;
}
