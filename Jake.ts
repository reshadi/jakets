/// <reference path="./ExternalTypings.d.ts" />

import * as ChildProcess from "child_process";
import * as ShellJs from "shelljs";
export let Shell = ShellJs;

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
  if (cmdArray.length === 1) {
    ChildProcess.exec(cmdArray[0], callback);
  } else {
    jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
  }
}
