import fs = require("fs");
import * as path  from "path";
import {execSync} from "child_process";
import * as Jake from "./Jake";


var NodeDir = ""; //TODO: try to detect the correct path
var Node = NodeDir + "node";

export function GetNodeCommand(
  cmdName: string, //default command line
  testCmd: string, //command to test if there is one installed locally
  nodeCli: string //path to node file
) {
  let localCli = path.join(process.cwd(), "node_modules", nodeCli);
  let jaketsCli = path.join(__dirname, "node_modules", nodeCli);
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
