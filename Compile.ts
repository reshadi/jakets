import * as fs from "fs";
import * as path from "path";

import * as jake from "./Jake";
export let exec = jake.Exec;
export let shell = jake.Shell;

import * as Node from "./Node";

import * as Bower from "./Bower";
export let bower = Bower.Exec;

import * as Tsc from "./Tsc";
export let tsc = Tsc.Exec;

import * as Browserify from "./Browserify";
export let browserify = Browserify.Exec;

import * as Closure from "./Closure";
export let closure = Closure.Exec;

//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils

//We use the following to better clarity what we are using/checking
var LocalDir = process.cwd();
var JaketsDir = __dirname;

export function MakeRelative(fullpath: string): string {
  if (!fullpath) {
    return fullpath;
  }
  return path.relative(LocalDir, fullpath);
}

export var BuildDir: string = process.env.BUILD__DIR || MakeRelative("./build");

interface IOutputOptions {
  OutDir?: string;
  OutFile?: string;
  OutDirName?: string;
  OutFileName?: string;
}

interface ITscOptions extends IOutputOptions {
  Module?: string;
  SourceMap?: boolean;
  Target?: string; //enum {ES3, ES5, ES6};
}

interface IClosureOptions extends IOutputOptions {
}

export interface ICompileConfig {
  BuildDir?: string;
  OutFileName?: string;
  Name: string;
  Files: string[];

  TscOptions?: ITscOptions;
  ClosureOptions?: IClosureOptions;
}

function GetOutputOptions(outputOptions: IOutputOptions, conf: ICompileConfig): IOutputOptions {
  outputOptions = outputOptions || {};
  let outDir = outputOptions.OutDir;
  if (!outDir) {
    let buildDir = conf.BuildDir || BuildDir;
    let outDirName = outputOptions.OutDirName || "";
    outDir = path.join(buildDir, outDirName, conf.Name); //TODO: let's fix this
  }

  let outFile = outputOptions.OutFile;
  let outFileName = outputOptions.OutFileName || conf.OutFileName;
  if (!outFile && outFile !== null && outFileName) {
    outFile = path.join(outDir, outFileName);
  }

  return {
    OutDir: MakeRelative(outDir),
    OutFile: MakeRelative(outFile),
    OutFileName: outFileName,
  };
}

//Default values that others can use for convenience
export var DefaultClientTscOptions: ITscOptions = {
  Target: "ES5",
  OutDirName: "debug",
};

export var DefaultServerTscOptions: ITscOptions = {
  Target: "ES5",
  OutDirName: "release",
  Module: "commonjs",
};
export var DefaultClosureOptions: IClosureOptions = {
  OutDirName: "release"
};

export function Extend<T>(base: T): T {
  return <T>Object.create(base);
}


function RunAll(configs: ICompileConfig[], processor?: (conf: ICompileConfig) => string) {
  var outputs = configs.map(processor || Minify);
  console.log(outputs);
  task("run", outputs, () => {
  }, <any>{ async: true, parallelLimit: outputs.length }).invoke();
}

var Configs: ICompileConfig[] = [];

export function AddConfig(config: ICompileConfig): void {
  Configs.push(config);
}

export function Configure(configs: ICompileConfig[]) {
  Configs = configs;
}

// 
//////////////////////////////////////////////////////////////////////////////////////////

desc("publish targets");
task("publish", [], () => RunAll(Configs, Publish));

desc("minify targets");
task("minify", [], () => RunAll(Configs, Minify));

desc("compile targets");
task("compile", [], () => RunAll(Configs, Compile));

//////////////////////////////////////////////////////////////////////////////////////////
// PUblish

function Publish(conf: ICompileConfig): string {
  return "";
}

// 
//////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
// Minify

export var GetMinifyCommands = function(minifiedFile: string, outputDir: string, files: string[]): string[] {
  var cmd = [
    "printf '\\n//" + (new Date()) + " " + files.join(" ") + "\\n' >> " + minifiedFile
  ];
  return cmd;
}

function Minify(conf: ICompileConfig): string {
  var compilerOutput = Compile(conf);

  var clOptions = conf.ClosureOptions || DefaultClosureOptions;

  var outputOptions = GetOutputOptions(clOptions, conf);

  var outputDir = outputOptions.OutDir;
  var minifiedFile = outputOptions.OutFile || path.join(outputDir, compilerOutput + ".min.js");
  var zippedFile = minifiedFile + ".gz";

  var minifyCmds = GetMinifyCommands(minifiedFile, outputDir, [compilerOutput]);

  if (conf.ClosureOptions === null || !minifyCmds) {
    return compilerOutput;
  }

  directory(outputDir);

  file(minifiedFile, [outputDir, compilerOutput], function() {
    var cmd = minifyCmds;
    jake.Exec(cmd, () => this.complete());
  }, { async: true });

  file(zippedFile, [minifiedFile], function() {
    var cmd = "gzip --best < " + minifiedFile + " > " + zippedFile;
    jake.Exec(cmd, () => this.complete());
  }, { async: true });

  return zippedFile;
}

// 
//////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
// Compile 
function Compile(conf: ICompileConfig): string {
  var tscOptions = conf.TscOptions || (conf.OutFileName === null ? DefaultServerTscOptions : DefaultClientTscOptions);
  var outputOptions = GetOutputOptions(tscOptions, conf);

  var outputDir = outputOptions.OutDir;
  var outputFile = outputOptions.OutFile || path.join(outputDir, "__compiled_" + conf.Name);
  console.log("out:" + outputFile);
  var options = "";

  if (tscOptions.Target) {
    options += " --target " + tscOptions.Target;
  }

  options += " --outDir " + outputOptions.OutDir;

  if (tscOptions.Module === "commonjs") {
    options += " --module commonjs";
  } else if (outputOptions.OutFile) {
    options += " --outFile " + outputFile;
  }

  if (tscOptions.SourceMap) {
    options += " --sourceMap"
  }

  var dependencies =
    [outputDir]
      .concat(conf.Files)
      .concat(GetExtraDependencies())
      .map(MakeRelative);

  directory(outputDir);

  file(outputFile, dependencies, function() {
    console.log("compiling " + outputFile + " : " + dependencies.join(" "));
    tsc(options + " " + conf.Files.join(" "), () => exec([
      "printf '\\n//" + (new Date()) + "\\n' >> " + outputFile
      // "echo //" + (new Date()) + " >> " + outputFile
    ], () => this.complete()));
  }, { async: true });

  return outputFile;
}
// 
//////////////////////////////////////////////////////////////////////////////////////////

