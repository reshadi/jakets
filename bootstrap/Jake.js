/// <reference path="./ExternalTypings.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChildProcess = require("child_process");
require("jake");
const ShellJs = require("shelljs");
exports.Shell = ShellJs;
let LogLevel = parseInt(process.env.logLevel) || 0;
function Log(msg, level = 1) {
    if (level <= LogLevel) {
        console.log(msg);
    }
}
exports.Log = Log;
Log("Logging level is " + LogLevel, 2);
function LogTask(t, level) {
    Log(`${t.taskStatus} => ${t.name}: ['${t.prereqs.join("', '")}']`, level);
}
exports.LogTask = LogTask;
function Exec(cmd, callback, isSilent) {
    let cmdArray;
    if (Array.isArray(cmd)) {
        cmdArray = cmd;
    }
    else {
        cmdArray = [cmd];
    }
    // isSilent || console.log(cmd);
    Log(cmdArray, 0);
    if (isSilent && cmdArray.length === 1) {
        let command = cmdArray[0].trim().replace(/\s\s+/g, ' ').split(' ');
        let executable = command[0];
        let args = command.slice(1);
        let result = ChildProcess.spawnSync(executable, args);
        callback(result.error || (result.status ? `exit code: ${result.status}` : ""), (result.stdout || "").toString(), (result.stderr || "").toString());
    }
    else {
        jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
    }
}
exports.Exec = Exec;
function ExecAsync(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            Log(cmd, 0);
            ChildProcess.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ StdOut: stdout, StdErr: stderr });
                }
            });
        });
    });
}
exports.ExecAsync = ExecAsync;
function ExecAsyncAll(cmds, runParallel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (runParallel) {
            return Promise.all(cmds.map(ExecAsync));
        }
        else {
            // return cmds.map(async cmd => await ExecAsync(cmd));
            let result = [];
            for (let cmd of cmds) {
                result.push(yield ExecAsync(cmd));
            }
            return Promise.resolve(result);
        }
    });
}
exports.ExecAsyncAll = ExecAsyncAll;
;
function ToAsync(taskFunc) {
    return function AsyncTask(name, prereqs, action, opts) {
        let options = opts || {};
        options.async = true;
        return taskFunc(name, prereqs, action && function () {
            (typeof action === "function" ? action() : action)
                .then(value => this.complete())
                .catch(reason => {
                Log(reason, 0);
                complete();
            });
        }, options);
    };
}
exports.AsyncTask = ToAsync(task);
exports.AsyncFile = ToAsync(file);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkpha2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDOzs7Ozs7Ozs7OztBQUUvQyw4Q0FBOEM7QUFDOUMsZ0JBQWM7QUFDZCxtQ0FBbUM7QUFDeEIsUUFBQSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBRTNCLElBQUksUUFBUSxHQUFXLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUUzRCxhQUFvQixHQUFHLEVBQUUsUUFBZ0IsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDO0FBSkQsa0JBSUM7QUFFRCxHQUFHLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBUXZDLGlCQUF3QixDQUFPLEVBQUUsS0FBYztJQUM3QyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxPQUFPLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBRkQsMEJBRUM7QUFFRCxjQUFxQixHQUFzQixFQUFFLFFBQVEsRUFBRSxRQUFrQjtJQUN2RSxJQUFJLFFBQWtCLENBQUM7SUFDdkIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUNqQixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBQ0QsZ0NBQWdDO0lBQ2hDLEdBQUcsQ0FBQyxR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