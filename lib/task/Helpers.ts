import * as T from "./Task";
import * as G from "./GlobalTask";
import * as F from "./FileTask";
import * as D from "./DirectoryTask";

function Prepare<T extends T.Task>(task: T, dependencies: T.TaskDependencies, action: T.TaskAction): T {
  if (dependencies) {
    task.DependsOn(dependencies);
  }
  if (action) {
    task.Action(action);
  }
  return task;
}

export type TaskType = T.Task;
export type TaskDependencies = T.TaskDependencies;
export type GlobalTaskType = G.GlobalTask;
export type FileTaskType = F.FileTask;
export type DirectoryTaskType = D.DirectoryTask;

export function Task(taskName?: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): T.Task {
  return Prepare(new T.Task(taskName), dependencies, action);
}

export function GlobalTask(globalName: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): G.GlobalTask {
  return Prepare(new G.GlobalTask(globalName), dependencies, action);
}

export function FileTask(filename: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): F.FileTask {
  return Prepare(new F.FileTask(filename), dependencies, action);
}

export function DirectoryTask(dirname: string, dependencies?: T.TaskDependencies): D.DirectoryTask {
  return Prepare(new D.DirectoryTask(dirname), dependencies, null);
}