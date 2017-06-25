import "jake";
import * as ShellJs from "shelljs";
export let Shell = ShellJs;
import { Log } from "./lib/Log";

interface Task extends jake.Task {
  name?: string;
  prereqs?: string[];
  taskStatus?: string;
}

export function LogTask(t: Task, level?: number) {
  Log(`${t.taskStatus} => ${t.name}: ['${t.prereqs.join("', '")}']`, level);
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
