/// <reference path="./ExternalTypings.d.ts" />

import * as ShellJs from "shelljs";
export let Shell = ShellJs;//require("shelljs");

let EnableLog: boolean = process.env.enableLog === "true";
console.log("Logging is " + (EnableLog ? "enabled" : "disabled"));

export function Log(msg) {
  if (EnableLog) {
    console.log(msg);
  }
}

interface Task extends jake.Task {
  name?: string;
  prereqs?: string[];
  taskStatus?: string;
}

export function LogTask(t: Task) {
  if (EnableLog) {
    Log(`${t.taskStatus} => ${t.name}: ['${t.prereqs.join("', '")}']`);
  }
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
