import "jake";
import { Log } from "../Log";

interface ITask {
  name?: string;
  prereqs?: string[];
  action?: (...params: any[]) => any;
  taskStatus?: string;
  async?: boolean;
  description?: string;
}

export interface TaskCreatorFunc {
  (name: string, prereqs?: string[], action?: (...params: any[]) => any, opts?: jake.TaskOptions): jake.Task | jake.FileTask | jake.DirectoryTask;
  (name: string, opts?: jake.TaskOptions): jake.Task | jake.FileTask | jake.DirectoryTask;
};

export type TaskDependencies = (Task | string)[];

export type TaskAction = (this: Task, ...params: any[]) => Promise<any>;

export class Task {
  protected GetTaskCreatorFunc(): TaskCreatorFunc {
    return task;
  }

  IsGlobal(): boolean {
    return false;
  }

  private readonly TaskImplementation: ITask;

  constructor(taskName?: string) {
    //For now, only global tasks supported:
    if (!taskName || !this.IsGlobal()) {
      Log("Invalid local task");
      throw "Invalid local task";
    }

    let fullTaskName = this.IsGlobal()
      ? taskName
      : `${taskName}_task_${Math.random()}`;
    let taskFunc = this.GetTaskCreatorFunc();
    //TODO: remove <any> whe upstream types are updated
    this.TaskImplementation = <any>taskFunc(taskName, { async: true });
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
