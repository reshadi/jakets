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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixnQkFBYztBQUNkLGdDQUE2QjtBQUVoQixRQUFBLGFBQWEsR0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztBQXdCdEksQ0FBQztBQU1GLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixNQUFhLElBQUk7SUFHTCxrQkFBa0I7UUFDMUIsT0FBWSxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVTLFVBQVUsQ0FBQyxRQUFnQixFQUFFLEVBQVc7UUFDaEQsSUFBSSxPQUFlLENBQUM7UUFDcEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDekMsSUFBSSxjQUFjLEdBQW9CO1lBQ3BDLEtBQUssRUFBRSxJQUFJO1lBQ1gsYUFBYSxFQUFFLHFCQUFhO1NBQzdCLENBQUM7UUFFRixJQUFJLEVBQUUsRUFBRTtZQUNOLFNBQVMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFO2dCQUNqQixPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUM5QztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsWUFBWSxXQUFtQixFQUFFLEVBQUUsRUFBVztRQUM1QyxJQUFJLENBQUMsUUFBUSxJQUFJLElB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