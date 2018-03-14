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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlEQUF5QztBQUN6QywrQkFBNEI7QUFDNUIsaUNBQThCO0FBRTlCLG1FQUFtRTtBQUN4RCxRQUFBLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxnQkFBUSxFQUFFLENBQUMsQ0FBQztJQUNyQyxnQkFBUSxHQUFHLGdCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLGdCQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxrQ0FBeUMsUUFBZ0I7SUFDdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQVEsRUFBRSxRQUFRLENBQUM7U0FDckMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQywyQkFBMkI7V0FDN0MsR0FBRyxDQUFDLDZCQUE2QjtLQUNuQztJQUNILG1EQUFtRDtBQUNyRCxDQUFDO0FBVEQsNERBU0M7QUFHRCw0QkFBbUMsT0FBZTtJQUNoRCxNQUFNLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxD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