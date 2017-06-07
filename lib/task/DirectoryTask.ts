import * as Task from "./Task";
import { GlobalTask } from "./GlobalTask";

export class DirectoryTask extends GlobalTask {
  protected GetTaskCreatorFunc(): Task.TaskCreatorFunc {
    return directory;
  }
}