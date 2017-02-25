/// <reference path="./ExternalTypings.d.ts" />

import * as ChildProcess from "child_process";
import "jake";
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
  // isSilent || console.log(cmd);
  Log(cmdArray, 0);
  if (isSilent && cmdArray.length === 1) {
    ChildProcess.exec(cmdArray[0], callback);
  } else {
    jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
  }
}

interface CmdOutput { StdOut: string; StdErr: string; }

export async function ExecAsync(cmd: string): Promise<CmdOutput> {
  return new Promise<CmdOutput>((resolve, reject) => {
    Log(cmd, 0);
    ChildProcess.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ StdOut: stdout, StdErr: stderr });
      }
    });
  });
}

export async function ExecAsyncAll(cmds: string[], runParallel?: boolean): Promise<CmdOutput[]> {
  if (runParallel) {
    return Promise.all(cmds.map(ExecAsync));
  } else {
    // return cmds.map(async cmd => await ExecAsync(cmd));
    let result: CmdOutput[] = [];
    for (let cmd of cmds) {
      result.push(await ExecAsync(cmd));
    }
    return Promise.resolve(result);
  }
}

interface JakeTaskFunc<T extends jake.Task> {
  (name: string, prereqs?: string[], action?: { (...params: any[]): Promise<any> } | Promise<any>, opts?: jake.TaskOptions): T;
};

function ToAsync<T extends jake.Task | jake.FileTask>(taskFunc: (name: string, prereqs?: string[], action?: (...params: any[]) => any, opts?: jake.TaskOptions) => T) {
  return function AsyncTask(name: string, prereqs?: string[], action?: (...params: any[]) => Promise<any>, opts?: jake.TaskOptions): T {
    let options = opts || {};
    options.async = true;
    return taskFunc(name, prereqs, action && function () {
      (typeof action === "function" ? action() : action)
        .then(value => this.complete())
        .catch(reason => {
          Log(reason, 0);
          complete();
        });
    }, options)
  }
}

export const AsyncTask = ToAsync(task);
export const AsyncFile = ToAsync(file);
