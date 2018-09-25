import * as Fs from "fs";
import * as Path from "path";
import { execSync } from "child_process";
import { Log } from "./Log";
import { Exec } from "./Exec";

//We use the following to better clarity what we are using/checking
export let LocalDir = process.cwd();
if (/^win/.test(process.platform) && /^[a-z]:/.test(LocalDir)) {
  Log(`LocalDir before windows fix: ${LocalDir}`, 0);
  LocalDir = LocalDir[0].toUpperCase() + LocalDir.substr(1);
  Log(`LocalDir  after windows fix: ${LocalDir}`, 0);
}

export function MakeRelativeToBaseDir(baseDir: string, fullpath: string): string {
  if (!fullpath) {
    return fullpath;
  }
  return Path.relative(baseDir, fullpath)
    .replace(/\\/g, "/") //Convert \ to / on windows
    || '.' //in case the answer is empty
    ;
  // return path.relative(LocalDir, fullpath) || '.';
}

export function MakeRelativeToWorkingDir(fullpath: string): string {
  return MakeRelativeToBaseDir(LocalDir, fullpath);
}

export function CreateMakeRelative(dirname: string) {
  return (path: string) => MakeRelativeToWorkingDir(Path.isAbsolute(path) ? path : Path.join(dirname, path));
}

export const NodeModulesUpdateIndicator = MakeRelativeToWorkingDir("node_modules/.node_modules_updated");

export const JaketsDir = MakeRelativeToWorkingDir(Path.resolve(__dirname, ".."));

export const BuildDir: string = process.env.BUILD__DIR || MakeRelativeToWorkingDir("./build");

const NodeDir = ""; //TODO: try to detect the correct path
const Node = NodeDir + "node";

let DefaultSearchPath = [LocalDir, JaketsDir];
export function FindModulePath(modulePath: string, additionalLocations?: string[]): string | null {
  let searchDirs = DefaultSearchPath;
  if (additionalLocations) {
    searchDirs = searchDirs.concat(additionalLocations)
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

export function GetNodeCommand(
  cmdName: string, //default command line
  testCmd: string, //command to test if there is one installed locally
  nodeCli: string //path to node file
) {
  let localCli = Path.resolve(Path.join(LocalDir, "node_modules", nodeCli));
  let jaketsCli = Path.resolve(Path.join(JaketsDir, "node_modules", nodeCli));
  let cmd = cmdName;
  try {
    if (Fs.statSync(localCli)) {
      cmd = Node + " " + localCli;
    } else {
      execSync(testCmd); //Confirms the global one exists
    }
  } catch (e) {
    cmd = Node + " " + jaketsCli;
  }
  Log("Node command: " + cmd, 3);
  return cmd;
}

export function CreateExec(cmd: string) {
  return function (args: string | string[], callback: (...args: any[]) => void, isSilent?: boolean) {
    let argsSet: string[];
    if (Array.isArray(args)) {
      argsSet = args;
    } else {
      argsSet = [args];
    }
    argsSet = argsSet.map(function (arg) { return cmd + " " + arg; });
    Exec(argsSet, callback, isSilent);
  }
}

export function CreateNodeExec(
  cmdName: string, //default command line
  testCmd: string, //command to test if there is one installed locally
  nodeCli: string //path to node file
) {
  var cmdName = GetNodeCommand(cmdName, testCmd, nodeCli);
  return CreateExec(cmdName);
}

export function LoadJson<T extends object = { name: string; version: string; }>(jsonFilepath: string): T {
  let packageObj: T;
  try {
    let content = Fs.readFileSync(jsonFilepath, { encoding: "utf8" });
    packageObj = JSON.parse(content);
  } catch (e) {
    console.error(`Could not read package ${jsonFilepath}`);
    packageObj = <T>{};
  }
  return packageObj;
}

export const CurrentPackageJson = MakeRelativeToWorkingDir("package.json");

const CurrentPackage = LoadJson(CurrentPackageJson);
export const CurrentPackageVersion = CurrentPackage.version;
export const CurrentPackageName = CurrentPackage.name;
