import * as Task from "./Task";
import { GlobalTask } from "./GlobalTask";

export class FileTask extends GlobalTask {
  protected GetTaskCreatorFunc(): Task.TaskCreatorFunc {
    return file;
  }
}