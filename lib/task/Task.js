"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Fs = require("fs");
const Os = require("os");
require("jake");
const Log_1 = require("../Log");
exports.ParallelLimit = parseInt(process.env.ParallelLevel) || Os.cpus().length;
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
        let defaultAction = taskImp.action;
        if (defaultAction) {
            //This type of task adds default action, so either call it, or make the task non-async
            //Assert this is a directory task!
            this.Action(() => tslib_1.__awaiter(this, arguments, void 0, function* () { return defaultAction.apply(taskImp, arguments); }));
        }
    }
    GetName() {
        return this.TaskImplementation.name;
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
        //Based on https://github.com/jakejs/jake/blob/master/lib/jake.js#L203
        this.TaskImplementation.prereqs = this.TaskImplementation.prereqs.concat(Task.NormalizeDedpendencies(dependencies));
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
                ? `[${t.taskStatus} => ${this.GetName()}: ['${t.prereqs.join("', '")}']]`
                : `[${this.GetName()}]`), level);
        return this;
    }
}
exports.Task = Task;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixnQkFBYztBQUNkLGdDQUE2QjtBQUVoQixRQUFBLGFBQWEsR0FBVyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBdUI1RixDQUFDO0FBTUYsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCO0lBR1ksa0JBQWtCO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRVMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsRUFBVztRQUNoRCxJQUFJLE9BQWMsQ0FBQztRQUNuQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN6QyxJQUFJLGNBQWMsR0FBb0I7WUFDcEMsS0FBSyxFQUFFLElBQUk7WUFDWCxhQUFhLEVBQUUscUJBQWE7U0FDN0IsQ0FBQztRQUVGLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxTQUFTLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRTtnQkFDakIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsUUFBUTtRQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsWUFBWSxXQUFtQixFQUFFLEVBQUUsRUFBVztRQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFB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