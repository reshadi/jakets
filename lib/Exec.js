"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ChildProcess = require("child_process");
const Log_1 = require("./Log");
function Exec(cmd, callback, isSilent) {
    let cmdArray;
    if (Array.isArray(cmd)) {
        cmdArray = cmd;
    }
    else {
        cmdArray = [cmd];
    }
    // isSilent || console.log(cmd);
    Log_1.Log(cmdArray, 0);
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
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            Log_1.Log(cmd, 0);
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
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkV4ZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQThDO0FBQzlDLCtCQUE0QjtBQUU1QixTQUFnQixJQUFJLENBQUMsR0FBc0IsRUFBRSxRQUFrQyxFQUFFLFFBQWtCO0lBQ2pHLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDdEIsUUFBUSxHQUFHLEdBQUcsQ0FBQztLQUNoQjtTQUFNO1FBQ0wsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7SUFDRCxnQ0FBZ0M7SUFDaEMsU0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQixJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkUsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQ3BKO1NBQU07UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3pFO0FBQ0gsQ0FBQztBQWxCRCxvQkFrQkM7QUFJRCxTQUFzQixTQUFTLENBQUMsR0FBVzs7UUFDekMsT0FBTyxJQUFJLE9BQU8sQ0FBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNoRCxTQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1osWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMvQyxJQUFJLEtBQUssRUFBRTtvQkFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ0wsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztpQkFDN0M7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBWEQsOEJBV0M7QUFFRCxTQUFzQixZQUFZLENBQUMsSUFBYyxFQUFFLFdBQXFCOztRQUN0RSxJQUFJLFdBQVcsRUFBRTtZQUNmLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDekM7YUFBTTtZQUNMLHNEQUFzRDtZQUN0RCxJQUFJLE1BQU0sR0FBZ0IsRUFBRSxDQUFDO1lBQzdCLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDbkM7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEM7SUFDSCxDQUFDO0NBQUE7QUFYRCxvQ0FXQyJ9