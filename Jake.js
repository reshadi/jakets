/// <reference path="./ExternalTypings.d.ts" />
"use strict";
var ShellJs = require("shelljs");
exports.Shell = ShellJs; //require("shelljs");
function Log(msg) {
    console.log(msg);
}
exports.Log = Log;
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