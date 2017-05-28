import "../Jake";
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

  private readonly TaskImplementation: ITask;

  public readonly GlobalName: string;

  constructor(globalName?: string) {
    let taskName = globalName
      ? (this.GlobalName = globalName)
      : `task_${Math.random()}`;
    let taskFunc = this.GetTaskCreatorFunc();
    this.TaskImplementation = taskFunc(taskName, { async: true });
  }

  GetName(): string {
    return this.TaskImplementation.name;
  }

  DependsOn(dependencies: TaskDependencies): this {
    //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L203
    this.TaskImplementation.prereqs = this.TaskImplementation.prereqs.concat(dependencies.map(t => typeof t === "string" ? t : t.TaskImplementation.name));
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

  Log(level?: number, shortForm?: boolean): this {
    let t = this.TaskImplementation;
    Log(
      shortForm
        ? this.GetName()
        :
        `${t.taskStatus} => ${t.name}: ['${t.prereqs.join("', '")}']`
      , level
    );
    return this;
  }
}
