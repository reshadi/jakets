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
    return Prepare(new D.DirectoryTask(dirname), dependencies, null);
}
exports.DirectoryTask = DirectoryTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFDNUIsa0NBQWtDO0FBQ2xDLHNDQUFzQztBQUN0QyxnQ0FBZ0M7QUFDaEMscUNBQXFDO0FBRXJDLGlCQUFtQyxJQUFPLEVBQUUsWUFBZ0MsRUFBRSxNQUFvQjtJQUNoRyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQVNELHdFQUF3RTtBQUN4RSxjQUFxQixRQUFpQixFQUFFLFlBQWlDLEVBQUUsTUFBcUI7SUFDOUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFGRCxvQkFFQztBQUVELDZEQUE2RDtBQUM3RCxvQkFBMkIsVUFBa0IsRUFBRSxZQUFpQyxFQUFFLE1BQXFCO0lBQ3JHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBRkQsZ0NBRUM7QUFFRCwrREFBK0Q7QUFDL0Qsc0JBQTZCLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxZQUFpQyxFQUFFLE1BQXFCO0lBQzFILE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEYsQ0FBQztBQUZELG9DQUVDO0FBRUQsaURBQWlEO0FBQ2pELGtCQUF5QixRQUFnQixFQUFFLFlBQWlDLEVBQUUsTUFBcUI7SUFDakcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFGRCw0QkFFQztBQUVELG9EQUFvRDtBQUNwRCx1QkFBOEIsT0FBZSxFQUFFLFlBQWlDO0lBQzlFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRkQsc0NBRUMifQ==