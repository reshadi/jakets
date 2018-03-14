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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkV4ZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQThDO0FBQzlDLCtCQUE0QjtBQUU1QixjQUFxQixHQUFzQixFQUFFLFFBQVEsRUFBRSxRQUFrQjtJQUN2RSxJQUFJLFFBQWtCLENBQUM7SUFDdkIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUNqQixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBQ0QsZ0NBQWdDO0lBQ2hDLFNBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakIsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkUsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3JKLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztBQUNILENBQUM7QUFsQkQsb0JBa0JDO0FBSUQsbUJBQWdDLEdBQVc7O1FBQ3pDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNoRCxTQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1osWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMvQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FBQTtBQVhELDhCQVdDO0FBRUQsc0JBQW1DLElBQWMsRUFBRSxXQUFxQjs7UUFDdEUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sc0RBQXNEO1lBQ3RELElBQUksTUFBTSxHQUFnQixFQUFFLENBQUM7WUFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxDQUFDO0lBQ0gsQ0FBQztDQUFBO0FBWEQsb0NBV0MifQ==