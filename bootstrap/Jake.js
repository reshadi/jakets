/// <reference path="./ExternalTypings.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
        ChildProcess.exec(cmdArray[0], callback);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkpha2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDOzs7Ozs7Ozs7O0FBRS9DLDhDQUE4QztBQUM5QyxnQkFBYztBQUNkLG1DQUFtQztBQUN4QixRQUFBLEtBQUssR0FBRyxPQUFPLENBQUM7QUFFM0IsSUFBSSxRQUFRLEdBQVcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNELGFBQW9CLEdBQUcsRUFBRSxRQUFnQixDQUFDO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztBQUNILENBQUM7QUFKRCxrQkFJQztBQUVELEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFRdkMsaUJBQXdCLENBQU8sRUFBRSxLQUFjO0lBQzdDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLE9BQU8sQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFGRCwwQkFFQztBQUVELGNBQXFCLEdBQXNCLEVBQUUsUUFBUSxFQUFFLFFBQWtCO0lBQ3ZFLElBQUksUUFBa0IsQ0FBQztJQUN2QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFDRCxnQ0FBZ0M7SUFDaEMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQixFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztBQUNILENBQUM7QUFkRCxvQkFjQztBQUlELG1CQUFnQyxHQUFXOztRQUN6QyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQVksQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUM1QyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1osWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU07Z0JBQzNDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQzlDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBWEQsOEJBV0M7QUFFRCxzQkFBbUMsSUFBYyxFQUFFLFdBQXFCOztRQUN0RSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixzREFBc0Q7WUFDdEQsSUFBSSxNQUFNLEdBQWdCLEVBQUUsQ0FBQztZQUM3QixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDSCxDQUFDO0NBQUE7QUFYRCxvQ0FXQyJ9