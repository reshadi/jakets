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
export type TaskAction = T.TaskAction;
export type GlobalTaskType = G.GlobalTask;
export type FileTaskType = F.FileTask;
export type DirectoryTaskType = D.DirectoryTask;

/** Creates a local task which randomized task name to avoid conflict */
export function Task(taskName?: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): T.Task {
  return Prepare(new T.Task(taskName), dependencies, action);
}

/** Creates a global task using the exact task name passed */
export function GlobalTask(globalName: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): G.GlobalTask {
  return Prepare(new G.GlobalTask(globalName), dependencies, action);
}

/** Creates a global task with a namespace, i.e. ns:taskName */
export function GlobalTaskNs(globalName: string, namespace: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): G.GlobalTask {
  return Prepare(new G.GlobalTask(globalName, namespace), dependencies, action);
}

/** Creates a task for checking files freshnes */
export function FileTask(filename: string, dependencies?: T.TaskDependencies, action?: T.TaskAction): F.FileTask {
  return Prepare(new F.FileTask(filename), dependencies, action);
}

/** Creates a task for creating missing directory */
export function DirectoryTask(dirname: string, dependencies?: T.TaskDependencies): D.DirectoryTask {
  return Prepare(new D.DirectoryTask(dirname), dependencies, null);
}