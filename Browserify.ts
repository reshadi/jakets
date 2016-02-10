import * as Path from "path";
import * as Jake from "./Jake";
import * as Node from "./Node";

let RawExec = Node.CreateNodeExec(
  "browserify",
  "browserify --help",
  "browserify/bin/cmd.js"
);

let Tsify = "tsify";// Path.join(__dirname, "node_modules/tsify");
let Collapser = "bundle-collapser/plugin";// Path.join(__dirname, "node_modules/bundle-collapser/plugin");

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