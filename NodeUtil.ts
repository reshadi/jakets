import fs = require("fs");
import * as path  from "path";
import {execSync} from "child_process";
import * as Jake from "./Jake";


var NodeDir = ""; //TODO: try to detect the correct path
var Node = NodeDir + "node";

var LocalDir = process.cwd();
var JaketsDir = path.relative(LocalDir, __dirname.replace("bootstrap", "")).replace(/\\/g, "/");

let DefaultSearchPath = [LocalDir, JaketsDir];
export function FindModulePath(modulePath: string, additionalLocations?: string[]): string {
  let searchDirs = DefaultSearchPath;
  if (additionalLocations) {
    searchDirs = searchDirs.concat(additionalLocations)
  }
  for (let i = 0; i < searchDirs.length; ++i) {
    let dir = searchDirs[i];
    let fullpath = path.join(dir, "node_modules", modulePath);
    if (fs.existsSync(fullpath)) {
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
  let localCli = path.resolve(path.join(LocalDir, "node_modules", nodeCli));
  let jaketsCli = path.resolve(path.join(JaketsDir, "node_modules", nodeCli));
  let cmd = cmdName;
  try {
    if (fs.statSync(localCli)) {
      cmd = Node + " " + localCli;
    } else {
      execSync(testCmd); //Confirms the global one exists
    }
  } catch (e) {
    cmd = Node + " " + jaketsCli;
  }
  Jake.Log("Node command: " + cmd, 3);
  return cmd;
}

export function CreateExec(cmd: string) {
  return function Exec(args: string | string[], callback, isSilent?: boolean) {
    let argsSet: string[];
    if (Array.isArray(args)) {
      argsSet = args;
    } else {
      argsSet = [args];
    }
    argsSet = argsSet.map(function(arg) { return cmd + " " + arg; });
    Jake.Exec(argsSet, callback);
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
