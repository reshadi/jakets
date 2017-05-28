import * as Task from "./Task";

export class DirectoryTask extends Task.Task {
  protected GetTaskCreatorFunc(): Task.TaskCreatorFunc {
    return directory;
  }
}