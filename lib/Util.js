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
    Log_1.Log(`LocalDir before windows fix: ${exports.LocalDir}`, 0);
    exports.LocalDir = exports.LocalDir[0].toUpperCase() + exports.LocalDir.substr(1);
    Log_1.Log(`LocalDir  after windows fix: ${exports.LocalDir}`, 0);
}
function MakeRelativeToBaseDir(baseDir, fullpath) {
    if (!fullpath) {
        return fullpath;
    }
    return Path.relative(baseDir, fullpath)
        .replace(/\\/g, "/") //Convert \ to / on windows
        || '.' //in case the answer is empty
    ;
    // return path.relative(LocalDir, fullpath) || '.';
}
exports.MakeRelativeToBaseDir = MakeRelativeToBaseDir;
function MakeRelativeToWorkingDir(fullpath) {
    return MakeRelativeToBaseDir(exports.LocalDir, fullpath);
}
exports.MakeRelativeToWorkingDir = MakeRelativeToWorkingDir;
function CreateMakeRelative(dirname) {
    return (path) => MakeRelativeToWorkingDir(Path.isAbsolute(path) ? path : Path.join(dirname, path));
}
exports.CreateMakeRelative = CreateMakeRelative;
exports.NodeModulesUpdateIndicator = MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
exports.JaketsDir = MakeRelativeToWorkingDir(__dirname.replace("bootstrap", ""));
exports.BuildDir = process.env.BUILD__DIR || MakeRelativeToWorkingDir("./build");
const NodeDir = ""; //TODO: try to detect the correct path
const Node = NodeDir + "node";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlEQUF5QztBQUN6QywrQkFBNEI7QUFDNUIsaUNBQThCO0FBRTlCLG1FQUFtRTtBQUN4RCxRQUFBLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFRLENBQUMsRUFBRTtJQUM3RCxTQUFHLENBQUMsZ0NBQWdDLGdCQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuRCxnQkFBUSxHQUFHLGdCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsU0FBRyxDQUFDLGdDQUFnQyxnQkFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEQ7QUFFRCwrQkFBc0MsT0FBZSxFQUFFLFFBQWdCO0lBQ3JFLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixPQUFPLFFBQVEsQ0FBQztLQUNqQjtJQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO1NBQ3BDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsMkJBQTJCO1dBQzdDLEdBQUcsQ0FBQyw2QkFBNkI7S0FDbkM7SUFDSCxtREFBbUQ7QUFDckQsQ0FBQztBQVRELHNEQVNDO0FBRUQsa0NBQXlDLFFBQWdCO0lBQ3ZELE9BQU8scUJBQXFCLENBQUMsZ0JBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRkQsNERBRUM7QUFFRCw0QkFBbUMsT0FBZTtJQUNoRCxPQUFPLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyx3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