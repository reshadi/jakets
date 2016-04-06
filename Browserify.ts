import * as Path from "path";
import * as Jake from "./Jake";
import * as NodeUtil from "./NodeUtil";

let RawExec = NodeUtil.CreateNodeExec(
  "browserify",
  "browserify --help",
  "browserify/bin/cmd.js"
);

let Tsify = "tsify";
Tsify = NodeUtil.FindModulePath(Tsify) || Tsify;

let Collapser = "bundle-collapser/plugin.js";
Collapser = NodeUtil.FindModulePath(Collapser) || Collapser;

export function Exec(inputs: string, output: string, callback, isRelease?: boolean, tsargs?: string, options?: string) {
  let args = inputs;
  args += " -p [ " + Tsify + " " + (tsargs || "") + " ]";
  if (isRelease) {
    args += "  -p [ " + Collapser + " ]";
  } else {
    args += " --debug";
  }
  args += " --outfile " + output;
  if (options) {
    args += " " + options;
  }

  Jake.Shell.mkdir("-p", Path.dirname(output));

  RawExec(args, callback);
}