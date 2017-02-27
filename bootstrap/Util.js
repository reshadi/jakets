"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Path = require("path");
const child_process_1 = require("child_process");
const Jake = require("./Jake");
//We use the following to better clarity what we are using/checking
exports.LocalDir = process.cwd();
function MakeRelativeToWorkingDir(fullpath) {
    if (!fullpath) {
        return fullpath;
    }
    return Path.relative(exports.LocalDir, fullpath)
        .replace(/\\/g, "/") //Convert \ to / on windows
        || '.' //in case the answer is empty
    ;
    // return path.relative(LocalDir, fullpath) || '.';
}
exports.MakeRelativeToWorkingDir = MakeRelativeToWorkingDir;
exports.JaketsDir = MakeRelativeToWorkingDir(__dirname.replace("bootstrap", ""));
exports.BuildDir = process.env.BUILD__DIR || MakeRelativeToWorkingDir("./build");
var NodeDir = ""; //TODO: try to detect the correct path
var Node = NodeDir + "node";
let DefaultSearchPath = [exports.LocalDir, exports.JaketsDir];
function FindModulePath(modulePath, additionalLocations) {
    let searchDirs = DefaultSearchPath;
    if (additionalLocations) {
        searchDirs = searchDirs.concat(additionalLocations);
    }
    for (let i = 0; i < searchDirs.length; ++i) {
        let dir = searchDirs[i];
        let fullpath = Path.join(dir, "node_modules", modulePath);
        if (Fs.existsSync(fullpath)) {
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
    let localCli = Path.resolve(Path.join(exports.LocalDir, "node_modules", nodeCli));
    let jaketsCli = Path.resolve(Path.join(exports.JaketsDir, "node_modules", nodeCli));
    let cmd = cmdName;
    try {
        if (Fs.statSync(localCli)) {
            cmd = Node + " " + localCli;
        }
        else {
            child_process_1.execSync(testCmd); //Confirms the global one exists
        }
    }
    catch (e) {
        cmd = Node + " " + jaketsCli;
    }
    Jake.Log("Node command: " + cmd, 3);
    return cmd;
}
exports.GetNodeCommand = GetNodeCommand;
function CreateExec(cmd) {
    return function Exec(args, callback, isSilent) {
        let argsSet;
        if (Array.isArray(args)) {
            argsSet = args;
        }
        else {
            argsSet = [args];
        }
        argsSet = argsSet.map(function (arg) { return cmd + " " + arg; });
        Jake.Exec(argsSet, callback, isSilent);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQThCO0FBQzlCLGlEQUF1QztBQUN2QywrQkFBK0I7QUFFL0IsbUVBQW1FO0FBQ3hELFFBQUEsUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVwQyxrQ0FBeUMsUUFBZ0I7SUFDdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQVEsRUFBRSxRQUFRLENBQUM7U0FDckMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQywyQkFBMkI7V0FDN0MsR0FBRyxDQUFDLDZCQUE2QjtLQUNuQztJQUNILG1EQUFtRDtBQUNyRCxDQUFDO0FBVEQsNERBU0M7QUFFVSxRQUFBLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXpFLFFBQUEsUUFBUSxHQUFXLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRTVGLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLHNDQUFzQztBQUN4RCxJQUFJLElBQUksR0FBRyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBRTVCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxnQkFBUSxFQUFFLGlCQUFTLENBQUMsQ0FBQztBQUM5Qyx3QkFBK0IsVUFBa0IsRUFBRSxtQkFBOEI7SUFDL0UsSUFBSSxVQUFVLEdBQUcsaUJBQWlCLENBQUM7SUFDbkMsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLFVBQVUsR0FBRyxVQUFVLENB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