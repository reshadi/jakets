import * as Fs from "fs";
import * as Os from "os";
import "jake";
import { Log } from "../Log";

export const ParallelLimit: number = (process.env.ParallelLimit !== void 0 && parseInt(process.env.ParallelLimit)) || Os.cpus().length;

interface ITask {
  name?: string;
  fullName?: string;
  prereqs?: string[];
  action?: (this: ITask, ...params: any[]) => any;
  taskStatus?: string;
  async?: boolean;
  description?: string;
  parallelLimit?: number;

  addListener(event: string, listener: Function): this;
  removeListener(event: string, listener: Function): this;
  invoke(): void;
  complete(): void;
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
  protected readonly TaskImplementation: ITask;

  protected GetTaskCreatorFunc(): TaskCreatorFunc {
    return <any>task;
  }

  protected CreateTask(taskName: string, ns?: string): ITask {
    let taskImp!: ITask;
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
    if (taskImp.action) {
      //This type of task adds default action, so either call it, or make the task non-async
      //Assert this is a directory task!
      let defaultAction = taskImp.action;
      this.Action(async () => defaultAction.apply(taskImp, arguments));
    }
  }

  GetName(): string {
    return this.TaskImplementation.name || "";
  }

  static NormalizeDedpendencies(dependencies: TaskDependencies): string[] {
    return dependencies.map(t => typeof t === "string" ? t : t.GetName());
  }

  protected ValidateDependencies(dependencies: TaskDependencies) {
    let currTask = <any>this.TaskImplementation;
    if (currTask instanceof jake.FileTask || currTask instanceof jake.DirectoryTask) {
      dependencies.forEach(d => {
        if (typeof d === "string") {
          let t = (<{ [name: string]: Task }><any>jake.Task)[d];
          if (
            (t && !(t instanceof jake.FileTask))
            || (
              Fs.existsSync(d)
              && Fs.existsSync(this.GetName())
              && Fs.statSync(d).mtime > Fs.statSync(this.GetName()).mtime
            )
          ) {
            console.error(`file ${this.GetName()} depends on non-file or will be recreated based on ${d}`);
          }

        } else {
          let t = d.TaskImplementation;
          if (!(t instanceof jake.FileTask)) {
            console.error(`file ${this.GetName()} depends on non-file ${d}`);
          }
        }
      });
    }
  }

  DependsOn(dependencies: TaskDependencies): this {
    // this.ValidateDependencies(dependencies);

    let normalizedPreReqs = Task.NormalizeDedpendencies(dependencies);
    //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L203
    let currPreReqs = this.TaskImplementation.prereqs;
    this.TaskImplementation.prereqs = currPreReqs ? currPreReqs.concat(normalizedPreReqs) : normalizedPreReqs;
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
          fail(reason, 1);
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

  ParallelLimit(parallelLimit: number): this {
    this.TaskImplementation.parallelLimit = parallelLimit;
    return this;
  }

  Log(message?: string, level?: number, showLongForm?: boolean): this {
    let t = this.TaskImplementation;
    Log(
      (message || "")
      + (
        showLongForm
          ? `[${t.taskStatus} => ${this.GetName()}: ['${t.prereqs && t.prereqs.join("', '")}']]`
          : `[${this.GetName()}]`
      )
      , level
    );
    return this;
  }
}
