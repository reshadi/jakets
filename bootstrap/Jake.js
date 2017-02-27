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
        let command = cmdArray[0].split(' ');
        let executable = command[0];
        let args = command.slice(1);
        let result = ChildProcess.spawnSync(executable, args);
        if (result.error) {
            callback(result.error, "", result.stderr.toString());
        }
        else {
            callback(result.error, result.stdout.toString(), "");
        }
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