import * as Path from "path";
import * as Fs from "fs";
import * as Zlib from "zlib";

import * as Jakets from "./lib/Jakets";
import * as Jake from "./Jake";
import * as NodeUtil from "./lib/Util";

let ClosureJar = NodeUtil.FindModulePath("google-closure-compiler/compiler.jar", [".."]);

let RawExec = NodeUtil.CreateExec("java -jar " + ClosureJar);

export function Exec(inputs: string, output: string, callback, options?: string) {
  let args = "";
  //Default arguments that can be overwritten via options
  args += " --compilation_level ADVANCED_OPTIMIZATIONS";
  args += " --language_in ECMASCRIPT5";
  // args += " --new_type_inf"; //Looks like crashes the compier sometimes
  args += " --summary_detail_level 3";
  // args += " --warning_level VERBOSE";
  args += " --warning_level QUIET";

  args += " --js_output_file=" + output;
  // args += " --jszip=" + output + ".gz";
  if (options) {
    args += " " + options;
  }
  args += " " + inputs;

  jake.mkdirP(Path.dirname(output));

  // RawExec(args, callback);
  RawExec(args, () => {
    Jakets.Exec("gzip --best < " + output + " > " + output + ".gz", callback);
  });
}
