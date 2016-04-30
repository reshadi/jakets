/// <reference path="./ExternalTypings.d.ts" />

import * as ShellJs from "shelljs";
export let Shell = ShellJs;//require("shelljs");

let LogLevel: number = parseInt(process.env.logLevel) || 0;

export function Log(msg, level: number = 1) {
  if (level <= LogLevel) {
    console.log(msg);
  }
}

Log("Logging level is " + LogLevel, 2);

interface Task extends jake.Task {
  name?: string;
  prereqs?: string[];
  taskStatus?: string;
}

export function LogTask(t: Task, level?: number) {
  Log(`${t.taskStatus} => ${t.name}: ['${t.prereqs.join("', '")}']`, level);
}

export function Exec(cmd: string | string[], callback, isSilent?: boolean) {
  let cmdArray: string[];
  if (Array.isArray(cmd)) {
    cmdArray = cmd;
  } else {
    cmdArray = [cmd];
  }
  isSilent || console.log(cmd);
  Log("Running " + cmdArray.join(" , "), 1);
  jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
}
