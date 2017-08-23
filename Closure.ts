import * as Path from "path";
import * as Fs from "fs";
import * as Zlib from "zlib";

import * as Jakets from "./lib/Jakets";
import * as Jake from "./Jake";
import * as NodeUtil from "./lib/Util";

let ClosureJar = NodeUtil.FindModulePath("google-closure-compiler/compiler.jar", [".."]);

let RawExec = NodeUtil.CreateExec("java -jar " + ClosureJar);

export interface ClosureOptions {
  //https://developers.google.com/closure/compiler/docs/api-ref
  define?: string[];
  summary_detail_level?: number;
  // language?: "ECMASCRIPT3" | "ECMASCRIPT5" | "ECMASCRIPT5_STRICT" | "ECMASCRIPT6" | "ECMASCRIPT6_STRICT";
  language?: "ES3" | "ES5" | "ECMASCRIPT5_STRICT" | "ECMASCRIPT6" | "ECMASCRIPT6_STRICT";
  language_in?: ClosureOptions["language"],
  language_out?: ClosureOptions["language"],
  compilation_level?: "WHITESPACE_ONLY" | "SIMPLE_OPTIMIZATIONS" | "ADVANCED_OPTIMIZATIONS";
  externs?: string[];
  warning_level?: "QUIET" | "DEFAULT" | "VERBOSE";
  output_wrapper?: string;
  js_output_file?: string;
}

/** Default arguments that can be overwritten via options */
export const DefaultClosureOptions: ClosureOptions = {
  compilation_level: "ADVANCED_OPTIMIZATIONS",
  // language: "ECMASCRIPT5",
  language_in: "ES5",
  //" --new_type_inf"; //Looks like crashes the compier sometimes
  summary_detail_level: 3,
  warning_level: "QUIET",
};

export function Exec(inputs: string, output: string, callback, options?: string, enableGzip?: boolean, closureOptions?: ClosureOptions) {
  let allOptions = Object.assign({}, DefaultClosureOptions, { js_output_file: output }, closureOptions || {});

  let args =
    Object.keys(allOptions)
      .map(option => {
        let optionValue = allOptions[option];
        let arg: string;

        if (typeof optionValue === "string" || typeof optionValue === "number") {
          arg = ` --${option} ${optionValue}`;
        } else if (Array.isArray(optionValue)) {
          arg = optionValue.map(v => ` --${option} ${v}`).join(" ");
        } else {
          throw `Does not know what to do with closure option ${option}:${optionValue}`;
        }
        return arg;
      })
      .join(" ");

  if (options) {
    args += " " + options;
  }
  args += " " + inputs;

  jake.mkdirP(Path.dirname(output));

  // RawExec(args, callback);
  RawExec(
    args,
    enableGzip
      ? () => Jakets.Exec("gzip --best < " + output + " > " + output + ".gz", callback)
      : callback
  );
}
