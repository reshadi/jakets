"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Fs = require("fs");
const Os = require("os");
require("jake");
const Log_1 = require("../Log");
exports.ParallelLimit = (process.env.ParallelLimit !== void 0 && parseInt(process.env.ParallelLimit)) || Os.cpus().length;
;
let LocalTaskId = 0;
class Task {
    GetTaskCreatorFunc() {
        return task;
    }
    CreateTask(taskName, ns) {
        let taskImp;
        let taskFunc = this.GetTaskCreatorFunc();
        let defaultOptions = {
            async: true,
            parallelLimit: exports.ParallelLimit
        };
        if (ns) {
            namespace(ns, () => {
                taskImp = taskFunc(taskName, defaultOptions);
            });
        }
        else {
            taskImp = taskFunc(taskName, defaultOptions);
        }
        return taskImp;
    }
    IsGlobal() {
        return false;
    }
    constructor(taskName = "", ns) {
        if (!taskName && this.IsGlobal()) {
            const msg = "Invalid nameless global task";
            Log_1.Log(msg);
            throw msg;
        }
        let fullTaskName = this.IsGlobal()
            ? taskName
            : `${taskName}_task_${++LocalTaskId}_${Math.floor(100000 * Math.random())}`;
        let taskImp = this.TaskImplementation = this.CreateTask(fullTaskName, ns);
        if (taskImp.action) {
            //This type of task adds default action, so either call it, or make the task non-async
            //Assert this is a directory task!
            let defaultAction = taskImp.action;
            this.Action(() => tslib_1.__awaiter(this, arguments, void 0, function* () { return defaultAction.apply(taskImp, arguments); }));
        }
    }
    GetName() {
        return this.TaskImplementation.name || "";
    }
    static NormalizeDedpendencies(dependencies) {
        return dependencies.map(t => typeof t === "string" ? t : t.GetName());
    }
    ValidateDependencies(dependencies) {
        let currTask = this.TaskImplementation;
        if (currTask instanceof jake.FileTask || currTask instanceof jake.DirectoryTask) {
            dependencies.forEach(d => {
                if (typeof d === "string") {
                    let t = jake.Task[d];
                    if ((t && !(t instanceof jake.FileTask))
                        || (Fs.existsSync(d)
                            && Fs.existsSync(this.GetName())
                            && Fs.statSync(d).mtime > Fs.statSync(this.GetName()).mtime)) {
                        console.error(`file ${this.GetName()} depends on non-file or will be recreated based on ${d}`);
                    }
                }
                else {
                    let t = d.TaskImplementation;
                    if (!(t instanceof jake.FileTask)) {
                        console.error(`file ${this.GetName()} depends on non-file ${d}`);
                    }
                }
            });
        }
    }
    DependsOn(dependencies) {
        // this.ValidateDependencies(dependencies);
        let normalizedPreReqs = Task.NormalizeDedpendencies(dependencies);
        //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L203
        let currPreReqs = this.TaskImplementation.prereqs;
        this.TaskImplementation.prereqs = currPreReqs ? currPreReqs.concat(normalizedPreReqs) : normalizedPreReqs;
        return this;
    }
    Action(action) {
        //Based on https://github.com/jakejs/jake/blob/master/lib/task/task.js#L70
        let thisTask = this;
        this.TaskImplementation.action = function () {
            let result = action.apply(thisTask, arguments);
            result
                .then(value => this.complete())
                .catch(reason => {
                Log_1.Log(reason, 0);
                fail(reason, 1);
            });
        };
        return this;
    }
    HasAction() {
        return typeof this.TaskImplementation.action !== undefined;
    }
    Invoke() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let complete = () => {
                    this.TaskImplementation.removeListener("complete", complete);
                    resolve();
                };
                this.TaskImplementation.addListener("complete", complete);
                this.TaskImplementation.invoke();
            });
        });
    }
    Description(description) {
        //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L223
        this.TaskImplementation.description = description;
        return this;
    }
    ParallelLimit(parallelLimit) {
        this.TaskImplementation.parallelLimit = parallelLimit;
        return this;
    }
    Log(message, level, showLongForm) {
        let t = this.TaskImplementation;
        Log_1.Log((message || "")
            + (showLongForm
                ? `[${t.taskStatus} => ${this.GetName()}: ['${t.prereqs && t.prereqs.join("', '")}']]`
                : `[${this.GetName()}]`), level);
        return this;
    }
}
exports.Task = Task;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixnQkFBYztBQUNkLGdDQUE2QjtBQUVoQixRQUFBLGFBQWEsR0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztBQXdCdEksQ0FBQztBQU1GLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQjtJQUdZLGtCQUFrQjtRQUMxQixPQUFZLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRVMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsRUFBVztRQUNoRCxJQUFJLE9BQWUsQ0FBQztRQUNwQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN6QyxJQUFJLGNBQWMsR0FBb0I7WUFDcEMsS0FBSyxFQUFFLElBQUk7WUFDWCxhQUFhLEVBQUUscUJBQWE7U0FDN0IsQ0FBQztRQUVGLElBQUksRUFBRSxFQUFFO1lBQ04sU0FBUyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pCLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELFFBQVE7UUFDTixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxZQUFZLFdBQW1CLEVBQUUsRUFBRSxFQUFXO1FBQzVDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFB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