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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFDNUIsa0NBQWtDO0FBQ2xDLHNDQUFzQztBQUN0QyxnQ0FBZ0M7QUFDaEMscUNBQXFDO0FBRXJDLGlCQUFtQyxJQUFPLEVBQUUsWUFBaUMsRUFBRSxNQUFxQjtJQUNsRyxJQUFJLFlBQVksRUFBRTtRQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsSUFBSSxNQUFNLEVBQUU7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBU0Qsd0VBQXdFO0FBQ3hFLGNBQXFCLFFBQWlCLEVBQUUsWUFBaUMsRUFBRSxNQUFxQjtJQUM5RixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFGRCxvQkFFQztBQUVELDZEQUE2RDtBQUM3RCxvQkFBMkIsVUFBa0IsRUFBRSxZQUFpQyxFQUFFLE1BQXFCO0lBQ3JHLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUZELGdDQUVDO0FBRUQsK0RBQStEO0FBQy9ELHNCQUE2QixVQUFrQixFQUFFLFNBQWlCLEVBQUUsWUFBaUMsRUFBRSxNQUFxQjtJQUMxSCxPQUFPLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBRkQsb0NBRUM7QUFFRCxpREFBaUQ7QUFDakQsa0JBQXlCLFFBQWdCLEVBQUUsWUFBaUMsRUFBRSxNQUFxQjtJQUNqRyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFGRCw0QkFFQztBQUVELG9EQUFvRDtBQUNwRCx1QkFBOEIsT0FBZSxFQUFFLFlBQWlDO0lBQzlFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRkQsc0NBRUMifQ==