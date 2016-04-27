/// <reference path="./ExternalTypings.d.ts" />
"use strict";
var ShellJs = require("shelljs");
exports.Shell = ShellJs; //require("shelljs");
var EnableLog = process.env.enableLog === "true";
console.log("Logging is " + (EnableLog ? "enabled" : "disabled"));
function Log(msg) {
    if (EnableLog) {
        console.log(msg);
    }
}
exports.Log = Log;
function LogTask(t) {
    if (EnableLog) {
        Log(t.taskStatus + " => " + t.name + ": ['" + t.prereqs.join("', '") + "']");
    }
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
    Log("Running " + cmdArray.join(" , "));
    jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
}
exports.Exec = Exec;
//# sourceMappingURL=Jake.js.map