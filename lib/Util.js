"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Path = require("path");
const child_process_1 = require("child_process");
const Log_1 = require("./Log");
const Exec_1 = require("./Exec");
//We use the following to better clarity what we are using/checking
exports.LocalDir = process.cwd();
if (/^win/.test(process.platform) && /^[a-z]:/.test(exports.LocalDir)) {
    console.log(`LocalDir: ${exports.LocalDir}`);
    exports.LocalDir = exports.LocalDir[0].toUpperCase() + exports.LocalDir.substr(1);
    console.log(`LocalDir: ${exports.LocalDir}`);
}
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
function CreateMakeRelative(dirname) {
    return (path) => MakeRelativeToWorkingDir(Path.isAbsolute(path) ? path : Path.join(dirname, path));
}
exports.CreateMakeRelative = CreateMakeRelative;
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
    Log_1.Log("Node command: " + cmd, 3);
    return cmd;
}
exports.GetNodeCommand = GetNodeCommand;
function CreateExec(cmd) {
    return function (args, callback, isSilent) {
        let argsSet;
        if (Array.isArray(args)) {
            argsSet = args;
        }
        else {
            argsSet = [args];
        }
        argsSet = argsSet.map(function (arg) { return cmd + " " + arg; });
        Exec_1.Exec(argsSet, callback, isSilent);
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
function GetPackage(packageFilepath) {
    let packageObj;
    try {
        let content = Fs.readFileSync(packageFilepath, { encoding: "utf8" });
        packageObj = JSON.parse(content);
    }
    catch (e) {
        console.error(`Could not read package ${packageFilepath}`);
        packageObj = {};
    }
    return packageObj;
}
exports.GetPackage = GetPackage;
exports.CurrentPackageJson = MakeRelativeToWorkingDir("package.json");
const CurrentPackage = GetPackage(exports.CurrentPackageJson);
exports.CurrentPackageVersion = CurrentPackage.version;
exports.CurrentPackageName = CurrentPackage.name;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlEQUF5QztBQUN6QywrQkFBNEI7QUFDNUIsaUNBQThCO0FBRTlCLG1FQUFtRTtBQUN4RCxRQUFBLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFRLENBQUMsRUFBRTtJQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsZ0JBQVEsRUFBRSxDQUFDLENBQUM7SUFDckMsZ0JBQVEsR0FBRyxnQkFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLGdCQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxnQkFBUSxFQUFFLENBQUMsQ0FBQztDQUN0QztBQUVELGtDQUF5QyxRQUFnQjtJQUN2RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2IsT0FBTyxRQUFRLENBQUM7S0FDakI7SUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQVEsRUFBRSxRQUFRLENBQUM7U0FDckMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQywyQkFBMkI7V0FDN0MsR0FBRyxDQUFDLDZCQUE2QjtLQUNuQztJQUNILG1EQUFtRDtBQUNyRCxDQUFDO0FBVEQsNERBU0M7QUFHRCw0QkFBbUMsT0FBZTtJQUNoRCxPQUFPLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxF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