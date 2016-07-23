/// <reference path="./ExternalTypings.d.ts" />
"use strict";
var ChildProcess = require("child_process");
var ShellJs = require("shelljs");
exports.Shell = ShellJs;
var LogLevel = parseInt(process.env.logLevel) || 0;
function Log(msg, level) {
    if (level === void 0) { level = 1; }
    if (level <= LogLevel) {
        console.log(msg);
    }
}
exports.Log = Log;
Log("Logging level is " + LogLevel, 2);
function LogTask(t, level) {
    Log(t.taskStatus + " => " + t.name + ": ['" + t.prereqs.join("', '") + "']", level);
}
exports.LogTask = LogTask;
function Exec(cmd, callback, isSilent) {
    var cmdArray;
    if (Array.isArray(cmd)) {
        cmdArray = cmd;
    }
    else {
        cmdArray = [cmd];
    }
    isSilent || console.log(cmd);
    Log("Running " + cmdArray.join(" , "), 1);
    if (cmdArray.length === 1) {
        ChildProcess.exec(cmdArray[0], callback);
    }
    else {
        jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
    }
}
exports.Exec = Exec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkpha2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDOztBQUUvQyxJQUFZLFlBQVksV0FBTSxlQUFlLENBQUMsQ0FBQTtBQUM5QyxJQUFZLE9BQU8sV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUN4QixhQUFLLEdBQUcsT0FBTyxDQUFDO0FBRTNCLElBQUksUUFBUSxHQUFXLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUUzRCxhQUFvQixHQUFHLEVBQUUsS0FBaUI7SUFBakIscUJBQWlCLEdBQWpCLFNBQWlCO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztBQUNILENBQUM7QUFKZSxXQUFHLE1BSWxCLENBQUE7QUFFRCxHQUFHLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBUXZDLGlCQUF3QixDQUFPLEVBQUUsS0FBYztJQUM3QyxHQUFHLENBQUksQ0FBQyxDQUFDLFVBQVUsWUFBTyxDQUFDLENBQUMsSUFBSSxZQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQUZlLGVBQU8sVUFFdEIsQ0FBQTtBQUVELGNBQXFCLEdBQXNCLEVBQUUsUUFBUSxFQUFFLFFBQWtCO0lBQ3ZFLElBQUksUUFBa0IsQ0FBQztJQUN2QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFDRCxRQUFRLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixHQUFHLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztBQUNILENBQUM7QUFkZSxZQUFJLE9BY25CLENBQUEifQ==