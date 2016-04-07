/// <reference path="./ExternalTypings.d.ts" />

import * as ShellJs from "shelljs";
export let Shell = ShellJs;//require("shelljs");

export function Log(msg) {
  // console.log(msg);
}

export function Exec(cmd: string | string[], callback, isSilent?: boolean) {
  let cmdArray: string[];
  if (Array.isArray(cmd)) {
    cmdArray = cmd;
  } else {
    cmdArray = [cmd];
  }
  isSilent || console.log(cmd);
  Log("Running " + cmdArray.join(" , "));
  jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
}
