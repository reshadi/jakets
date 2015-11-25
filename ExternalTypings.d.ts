/// <reference path="typings/jake/jake.d.ts" />

//The following was missing from jake type defs
declare function rule(pattern: RegExp, srouce: string | { (name: string): string; }, prereqs?: string[], action?: () => void, opts?: jake.TaskOptions): void;