/// <reference path="typings/jake/jake.d.ts" />

/// <reference path="typings/shelljs/shelljs.d.ts" />
export let Shell = require("shelljs");

declare module jake {
  export interface TaskOptions {
    parallelLimit?: number;
  }
}

export function Exec(cmd: string|string[], callback, isSilent?: boolean) {
  let cmdArray: string[];
  if (Array.isArray(cmd)) {
    cmdArray = cmd;
  } else {
    cmdArray = [cmd];
  }
  isSilent || console.log(cmd);
  jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
}
