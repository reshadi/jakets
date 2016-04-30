/// <reference path="./ExternalTypings.d.ts" />
"use strict";
var ShellJs = require("shelljs");
exports.Shell = ShellJs; //require("shelljs");
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
    jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
}
exports.Exec = Exec;
//# sourceMappingURL=Jake.js.map