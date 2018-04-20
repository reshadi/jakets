import * as Task from "./Task";
import { GlobalTask } from "./GlobalTask";

export class GlobalTaskNs extends GlobalTask {
  GetName(): string {
    return this.TaskImplementation.fullName || super.GetName();
  }
}