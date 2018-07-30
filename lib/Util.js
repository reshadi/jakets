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
function LoadJson(jsonFilepath) {
    let packageObj;
    try {
        let content = Fs.readFileSync(jsonFilepath, { encoding: "utf8" });
        packageObj = JSON.parse(content);
    }
    catch (e) {
        console.error(`Could not read package ${jsonFilepath}`);
        packageObj = {};
    }
    return packageObj;
}
exports.LoadJson = LoadJson;
exports.CurrentPackageJson = MakeRelativeToWorkingDir("package.json");
const CurrentPackage = LoadJson(exports.CurrentPackageJson);
exports.CurrentPackageVersion = CurrentPackage.version;
exports.CurrentPackageName = CurrentPackage.name;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlEQUF5QztBQUN6QywrQkFBNEI7QUFDNUIsaUNBQThCO0FBRTlCLG1FQUFtRTtBQUN4RCxRQUFBLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFRLENBQUMsRUFBRTtJQUM3RCxTQUFHLENBQUMsZ0NBQWdDLGdCQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuRCxnQkFBUSxHQUFHLGdCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsU0FBRyxDQUFDLGdDQUFnQyxnQkFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEQ7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxPQUFlLEVBQUUsUUFBZ0I7SUFDckUsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNiLE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7U0FDcEMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQywyQkFBMkI7V0FDN0MsR0FBRyxDQUFDLDZCQUE2QjtLQUNuQztJQUNILG1EQUFtRDtBQUNyRCxDQUFDO0FBVEQsc0RBU0M7QUFFRCxTQUFnQix3QkFBd0IsQ0FBQyxRQUFnQjtJQUN2RCxPQUFPLHFCQUFxQixDQUFDLGdCQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUZELDREQUVDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsT0FBZTtJQUNo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