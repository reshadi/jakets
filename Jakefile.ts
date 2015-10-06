/// <reference path="typings/jake/jake.d.ts" />

import fs = require("fs");
import path = require("path");

//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils

declare module jake {
  export interface TaskOptions {
    parallelLimit?: number;
  }
}

function MakeRelative(fullpath: string): string {
  if (!fullpath) {
    return fullpath;
  }
  return path.relative(process.cwd(), fullpath);
}

export var BuildDir = process.env.BUILD__DIR || MakeRelative("./build");

export function exec(cmd: string[], callback, isSilent?: boolean) {
  isSilent || console.log(cmd);
  jake.exec(cmd, callback, { printStdout: true, printStderr: true });
}

// var TSC = path.join(__dirname, "node_modules", ".bin", "tsc");
export var tsc = (function() {
  let localTypescript = path.join(process.cwd(), "node_modules/typescript/lib/tsc.js");
  let jaketsTypescript = path.join(__dirname, "node_modules/typescript/lib/tsc.js");
  let tscCmd = "tsc"; //default is the one in the path
  try {
    if (fs.statSync(localTypescript)) {
      tscCmd = "node " + localTypescript;
    } else {
      let execSync = require('child_process').execSync;
      execSync("tsc --version "); //Confirms the global one exists
    }
  } catch (e) {
    tscCmd = "node " + jaketsTypescript;
  }

  return function(args, callback) {
    //var args = Array.prototype.join(arguments, " ");
    if (!Array.isArray(args)) {
      args = [args];
    }
    var cmd = args.map(function(arg) { return tscCmd + " " + arg; });
    exec(cmd, callback);
  };
})();

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
  return <T> Object.create(base);
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
    console.log(cmd);
    jake.exec(cmd, () => this.complete());
  }, { async: true });

  file(zippedFile, [minifiedFile], function() {
    var cmd = "gzip --best < " + minifiedFile + " > " + zippedFile;
    console.log(cmd);
    jake.exec([cmd], () => this.complete());
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


//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 

task("CreateDependencies", [], () => {
  task("temp", GetExtraDependencies()).invoke();
}, { async: true });

function GetExtraDependencies(): string[] {
  var makefile = MakeRelative(path.join(__dirname, "Makefile")).replace(/\\/g, "/");

  var dependencies: string[] = [];// [makefile];

  if (fs.existsSync("package.json")) {
    dependencies = dependencies.concat("tsd.json");
  }

  var jakefilePattern = /(Jakefile.*)\.js$/;
  var jsJakeFiles =
    Object.keys(require('module')._cache)
      .filter(m => m.search(jakefilePattern) > -1)
      .map(MakeRelative)
      .map(f => f.replace(/\\/g, "/"))
    ;
  var tsJakeFiles =
    jsJakeFiles
      .map(f => f.replace(jakefilePattern, "$1.ts"))
    ;

  var jakeFileMkDependency = tsJakeFiles.concat(makefile);

  var jakeFileMk = "Jakefile.mk";
  file(jakeFileMk, jakeFileMkDependency, () => {
    var content = ""
      + "Jakefile.js: " + jakeFileMkDependency.join(" ") + "\n"
      + "\n"
      + "clean:\n"
      + "\trm -f " + jsJakeFiles.join(" ") + "\n"
      + "\trm -f " + jsJakeFiles.map(f => f + ".map").join(" ") + "\n"
      ;
    fs.writeFile(jakeFileMk, content, complete);
  }, { async: true });
  dependencies = dependencies.concat(jakeFileMk);

  return dependencies;
}

// desc("update the TSD info");
file("tsd.json", ["package.json"], () => {
  var pkgStr: string = fs.readFileSync("package.json", 'utf8');
  var pkg = JSON.parse(pkgStr);
  var dependencies = pkg["dependencies"] || {};
  var pkgNames = Object.keys(dependencies);
  var TSD = path.join(__dirname, "node_modules", ".bin", "tsd");
  var cmds = [
    TSD + " init --overwrite",
    TSD + " install " + pkgNames.join(" ") + " --save --overwrite"
  ];
  exec(cmds, complete);
  console.log(pkg.dependencies);
}, { async: true });

// desc("create empty package.json if missing");
file("package.json", [], () => {
  console.error("Generating package.json")
  var NPM = path.join("npm");
  exec([NPM + " init"], complete);
}, { async: true });

// 
//////////////////////////////////////////////////////////////////////////////////////////
