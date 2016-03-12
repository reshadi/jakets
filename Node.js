"use strict";
var fs = require("fs");
var path = require("path");
var child_process_1 = require("child_process");
var Jake = require("./Jake");
var NodeDir = ""; //TODO: try to detect the correct path
var Node = NodeDir + "node";
var DefaultSearchPath = [process.cwd(), __dirname];
function FindModulePath(modulePath, additionalLocations) {
    var searchDirs = DefaultSearchPath;
    if (additionalLocations) {
        searchDirs = searchDirs.concat(additionalLocations);
    }
    for (var i = 0; i < searchDirs.length; ++i) {
        var dir = searchDirs[i];
        var fullpath = path.join(dir, "node_modules", modulePath);
        if (fs.existsSync(fullpath)) {
            return fullpath;
        }
    }
    return null;
}
exports.FindModulePath = FindModulePath;
function GetNodeCommand(cmdName, //default command line
    testCmd, //command to test if there is one installed locally
    nodeCli //path to node file
    ) {
    var localCli = path.join(process.cwd(), "node_modules", nodeCli);
    var jaketsCli = path.join(__dirname, "node_modules", nodeCli);
    var cmd = cmdName;
    try {
        if (fs.statSync(localCli)) {
            cmd = Node + " " + localCli;
        }
        else {
            child_process_1.execSync(testCmd); //Confirms the global one exists
        }
    }
    catch (e) {
        cmd = Node + " " + jaketsCli;
    }
    Jake.Log("Node command: " + cmd);
    return cmd;
}
exports.GetNodeCommand = GetNodeCommand;
function CreateExec(cmd) {
    return function Exec(args, callback, isSilent) {
        var argsSet;
        if (Array.isArray(args)) {
            argsSet = args;
        }
        else {
            argsSet = [args];
        }
        argsSet = argsSet.map(function (arg) { return cmd + " " + arg; });
        Jake.Exec(argsSet, callback);
    };
}
exports.CreateExec = CreateExec;
function CreateNodeExec(cmdName, //default command line
    testCmd, //command to test if there is one installed locally
    nodeCli //path to node file
    ) {
    var cmdName = GetNodeCommand(cmdName, testCmd, nodeCli);
    return CreateExec(cmdName);
}
exports.CreateNodeExec = CreateNodeExec;
//# sourceMappingURL=Node.js.map