/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "@pagefind/default-ui" {
	export const PagefindUI: new (arg: unknown) => unknown;
}

interface ImportMetaEnv {
	readonly WEBMENTION_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
