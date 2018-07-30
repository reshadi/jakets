"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T = require("./Task");
const G = require("./GlobalTask");
const GNs = require("./GlobalTaskNs");
const F = require("./FileTask");
const D = require("./DirectoryTask");
function Prepare(task, dependencies, action) {
    if (dependencies) {
        task.DependsOn(dependencies);
    }
    if (action) {
        task.Action(action);
    }
    return task;
}
/** Creates a local task which randomized task name to avoid conflict */
function Task(taskName, dependencies, action) {
    return Prepare(new T.Task(taskName), dependencies, action);
}
exports.Task = Task;
/** Creates a global task using the exact task name passed */
function GlobalTask(globalName, dependencies, action) {
    return Prepare(new G.GlobalTask(globalName), dependencies, action);
}
exports.GlobalTask = GlobalTask;
/** Creates a global task with a namespace, i.e. ns:taskName */
function GlobalTaskNs(globalName, namespace, dependencies, action) {
    return Prepare(new GNs.GlobalTaskNs(globalName, namespace), dependencies, action);
}
exports.GlobalTaskNs = GlobalTaskNs;
/** Creates a task for checking files freshnes */
function FileTask(filename, dependencies, action) {
    return Prepare(new F.FileTask(filename), dependencies, action);
}
exports.FileTask = FileTask;
/** Creates a task for creating missing directory */
function DirectoryTask(dirname, dependencies) {
    return Prepare(new D.DirectoryTask(dirname), dependencies);
}
exports.DirectoryTask = DirectoryTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFDNUIsa0NBQWtDO0FBQ2xDLHNDQUFzQztBQUN0QyxnQ0FBZ0M7QUFDaEMscUNBQXFDO0FBRXJDLFNBQVMsT0FBTyxDQUFtQixJQUFPLEVBQUUsWUFBaUMsRUFBRSxNQUFxQjtJQUNsRyxJQUFJLFlBQVksRUFBRTtRQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsSUFBSSxNQUFNLEVBQUU7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBU0Qsd0VBQXdFO0FBQ3hFLFNBQWdCLElBQUksQ0FBQyxRQUFpQixFQUFFLFlBQWlDLEVBQUUsTUFBcUI7SUFDOUYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRkQsb0JBRUM7QUFFRCw2REFBNkQ7QUFDN0QsU0FBZ0IsVUFBVSxDQUFDLFVBQWtCLEVBQUUsWUFBaUMsRUFBRSxNQUFxQjtJQUNyRyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFGRCxnQ0FFQztBQUVELCtEQUErRDtBQUMvRCxTQUFnQixZQUFZLENBQUMsVUFBa0IsRUFBRSxTQUFpQixFQUFFLFlBQWlDLEVBQUUsTUFBcUI7SUFDMUgsT0FBTyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEYsQ0FBQztBQUZELG9DQUVDO0FBRUQsaURBQWlEO0FBQ2pELFNBQWdCLFFBQVEsQ0FBQyxRQUFnQixFQUFFLFlBQWlDLEVBQUUsTUFBcUI7SUFDakcsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRkQsNEJBRUM7QUFFRCxvREFBb0Q7QUFDcEQsU0FBZ0IsYUFBYSxDQUFDLE9BQWUsRUFBRSxZQUFpQztJQUM5RSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUZELHNDQUVDIn0=