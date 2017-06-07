import * as Task from "./Task";

export class GlobalTask extends Task.Task {
  IsGlobal(): boolean {
    return true;
  }
}