import * as Path from "path";
import * as Fs from "fs";
import * as Zlib from "zlib";

import * as Jake from "./Jake";
import * as Node from "./Node";

let ClosureJar = Node.FindModulePath("google-closure-compiler/compiler.jar", [".."]);

let RawExec = Node.CreateExec("java -jar " + ClosureJar);

export function Exec(inputs: string, output: string, callback, options?: string) {
  let args = "";
  //Default arguments that can be overwritten via options
  args += " --compilation_level ADVANCED_OPTIMIZATIONS";
  args += " --language_in ECMASCRIPT5";
  args += " --new_type_inf";
  args += " --summary_detail_level 3";
  args += " --warning_level VERBOSE";

  args += " --js_output_file=" + output;
  // args += " --jszip=" + output + ".gz";
  if (options) {
    args += " " + options;
  }
  args += " " + inputs;

  Jake.Shell.mkdir("-p", Path.dirname(output));

  // RawExec(args, callback);
  RawExec(args, () => {
    Jake.Exec("gzip --best < " + output + " > " + output + ".gz", callback);
  });
}
