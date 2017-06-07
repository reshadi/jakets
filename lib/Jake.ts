import "jake";
import * as ChildProcess from "child_process";

import { Log } from "./Log";
import * as ShellJs from "shelljs";
export let Shell = ShellJs;

interface Task extends jake.Task {
  name?: string;
  prereqs?: string[];
  taskStatus?: string;
}

export function LogTask(t: Task, level?: number) {
  Log(`${t.taskStatus} => ${t.name}: ['${t.prereqs.join("', '")}']`, level);
}

interface JakeTaskFunc<T extends jake.Task | jake.FileTask> {
  // (name: string, prereqs?: string[], action?: { (...params: any[]): Promise<any> } | Promise<any>, opts?: jake.TaskOptions): T;
  (name: string, prereqs?: string[], action?: (...params: any[]) => any, opts?: jake.TaskOptions): T;
};

function ToAsync<T extends jake.Task | jake.FileTask>(taskFunc: JakeTaskFunc<T>) {
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


setImmediate(() => {
  //First we drop the runner program name (e.g. node)
  let args = process.argv.slice(0);
  if (/node/.test(args[0]) && /Jakefile[.][jt]s/.test(args[1])) {
    args[0] = "-f";

    //TODO: do we need the following to support ts-node?
    args[1] = args[1].replace("Jakefile.ts", "Jakefile.js");
    
    //based on https://github.com/jakejs/jake/blob/master/bin/cli.js#L25
    jake["run"].apply(jake, args);
  }
})