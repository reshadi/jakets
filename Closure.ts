import * as Path from "path";
import * as Fs from "fs";
import * as Zlib from "zlib";

import * as Jake from "./Jake";
import * as Node from "./Node";

let ClosureJar = Path.join(__dirname, "node_modules/google-closure-compiler/compiler.jar");
if (!Fs.existsSync(ClosureJar)){
  //We might be checked out in someone elses node_modules, so try the parent dir
  ClosureJar = Path.join(__dirname, "../google-closure-compiler/compiler.jar");
  if (!Fs.existsSync(ClosureJar)){
    console.error("Could not find google closure");
  }
}

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
