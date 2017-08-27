import * as Os from "os";
import "jake";
import { Log } from "../Log";

export const ParallelLimit: number = parseInt(process.env.ParallelLevel) || Os.cpus().length;

interface ITask {
  name?: string;
  prereqs?: string[];
  action?: (...params: any[]) => any;
  taskStatus?: string;
  async?: boolean;
  description?: string;

  addListener?(event: string, listener: Function): this;
  removeListener?(event: string, listener: Function): this;
  invoke?(): void;
}

type JakeTasks = jake.Task | jake.FileTask | jake.DirectoryTask;
type JakeTaskOptions = jake.TaskOptions | jake.FileTaskOptions;

export interface TaskCreatorFunc {
  (name: string, prereqs?: string[], action?: (...params: any[]) => any, opts?: JakeTaskOptions): JakeTasks & ITask;
  (name: string, opts?: JakeTaskOptions): JakeTasks & ITask;
};

export type TaskDependencies = (Task | string)[];

export type TaskAction = (this: Task, ...params: any[]) => Promise<any>;

let LocalTaskId = 0;
export class Task {
  private readonly TaskImplementation: ITask;

  protected GetTaskCreatorFunc(): TaskCreatorFunc {
    return task;
  }

  protected CreateTask(taskName: string, ns?: string): ITask {
    let taskImp: ITask;
    let taskFunc = this.GetTaskCreatorFunc();
    let defaultOptions: JakeTaskOptions = {
      async: true,
      parallelLimit: ParallelLimit
    };

    if (ns) {
      namespace(ns, () => {
        taskImp = taskFunc(taskName, defaultOptions);
      });
    } else {
      taskImp = taskFunc(taskName, defaultOptions);
    }
    return taskImp;
  }

  IsGlobal(): boolean {
    return false;
  }

  constructor(taskName: string = "", ns?: string) {
    if (!taskName && this.IsGlobal()) {
      const msg = "Invalid nameless global task";
      Log(msg);
      throw msg;
    }

    let fullTaskName = this.IsGlobal()
      ? taskName
      : `${taskName}_task_${++LocalTaskId}_${Math.floor(100000 * Math.random())}`;

    let taskImp = this.TaskImplementation = this.CreateTask(fullTaskName, ns);
    let defaultAction = taskImp.action;
    if (defaultAction) {
      //This type of task adds default action, so either call it, or make the task non-async
      //Assert this is a directory task!
      this.Action(async () => defaultAction.apply(taskImp, arguments));
    }
  }

  GetName(): string {
    return this.TaskImplementation.name;
  }

  static NormalizeDedpendencies(dependencies: TaskDependencies): string[] {
    return dependencies.map(t => typeof t === "string" ? t : t.GetName());
  }

  DependsOn(dependencies: TaskDependencies): this {
    //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L203
    this.TaskImplementation.prereqs = this.TaskImplementation.prereqs.concat(Task.NormalizeDedpendencies(dependencies));
    return this;
  }

  Action(action: TaskAction): this {
    //Based on https://github.com/jakejs/jake/blob/master/lib/task/task.js#L70
    let thisTask = this;
    this.TaskImplementation.action = function () {
      let result: Promise<any> = action.apply(thisTask, arguments);
      result
        .then(value => this.complete())
        .catch(reason => {
          Log(reason, 0);
          complete();
        });
    };
    return this;
  }

  HasAction(): boolean {
    return typeof this.TaskImplementation.action !== undefined
  }

  async Invoke() {
    return new Promise((resolve, reject) => {
      let complete = () => {
        this.TaskImplementation.removeListener("complete", complete);
        resolve();
      }
      this.TaskImplementation.addListener("complete", complete);
      this.TaskImplementation.invoke();
    });
  }

  Description(description: string): this {
    //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L223
    this.TaskImplementation.description = description;
    return this;
  }

  Log(message?: string, level?: number, showLongForm?: boolean): this {
    let t = this.TaskImplementation;
    Log(
      (message || "")
      + (
        showLongForm
          ? `[${t.taskStatus} => ${this.GetName()}: ['${t.prereqs.join("', '")}']]`
          : `[${this.GetName()}]`
      )
      , level
    );
    return this;
  }
}
