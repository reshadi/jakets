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
            this.Action(function (...args) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () { return defaultAction.apply(taskImp, args); });
            });
        }
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixnQkFBYztBQUNkLGdDQUE2QjtBQUVoQixRQUFBLGFBQWEsR0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztBQXdCdEksQ0FBQztBQU1GLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixNQUFhLElBQUk7SUE2QmYsWUFBWSxXQUFtQixFQUFFLEVBQUUsRUFBVztRQUM1QyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNoQyxNQUFNLEdBQUcsR0FBRyw4QkFBOEIsQ0FBQztZQUMzQyxTQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVCxNQUFNLEdBQUcsQ0FBQztTQUNYO1FBRUQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoQyxDQUFDLENBQUMsUUFBUTtZQUNWLENBQUMsQ0FBQyxHQUFHLFFBQVEsU0FBUyxFQUFFLFdBQVcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBRTlFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsc0ZBQXNGO1lBQ3RGLGtDQUFrQztZQUNsQyxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ25DLElBQUksQ0FB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