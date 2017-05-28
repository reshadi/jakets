import * as T from "./Task";
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

export function Task(dependencies?: T.TaskDependencies, action?: T.TaskAction): T.Task {
  return Prepare(new T.Task(), dependencies, action);
}

export function GlobalTask(globalName: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): T.Task {
  return Prepare(new T.Task(globalName), dependencies, action);
}

export function FileTask(filename: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): F.FileTask {
  return Prepare(new F.FileTask(filename), dependencies, action);
}

export function DirectoryTask(dirname: string, dependencies?: T.TaskDependencies): D.DirectoryTask {
  return Prepare(new D.DirectoryTask(dirname), dependencies, null);
}