import * as Task from "./Task";

export class FileTask extends Task.Task {
  protected GetTaskCreatorFunc(): Task.TaskCreatorFunc {
    return file;
  }
}