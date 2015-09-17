/// <reference path="typings/jake/jake.d.ts" />

import fs = require("fs");
import path = require("path");

function MakeRelative(fullpath: string): string {
  return path.relative(process.cwd(), fullpath);
}
var BuildDir = MakeRelative(path.join(__dirname, "../build_new"));
var DebugDir = path.join(BuildDir, "debug");
var ReleaseDir = path.join(BuildDir, "release");

var TSC = path.join(__dirname, "node_modules", ".bin", "tsc");

interface IOutputOptions {
  OutDir?: string;
  OutFile?: string;
}

interface ITscOptions extends IOutputOptions {
  Module?: string;
  SourceMap?: boolean;
  Target?: string; //enum {ES3, ES5, ES6};
}

interface IClosureOptions extends IOutputOptions {
}

//Default values that others can use for convenience
export var ClientTscOptions: ITscOptions = {Target: "ES5"};
export var ServerTscOptions: ITscOptions = {Target: "ES5"};
export var ClientClosureOptions: IClosureOptions = {};

export interface CompileConfig extends IOutputOptions {
  Name: string;
  Files: string[];

  TscOptions?: ITscOptions;
  ClosureOptions?: IClosureOptions;
}

function RunAll(configs: CompileConfig[], processor?: (conf: CompileConfig) => string) {
  var outputs = configs.map(processor || Minify);
  console.log(outputs);
  task("run", outputs, () => { }).invoke();
}

var Configs: CompileConfig[] = [];

export function AddConfig(config: CompileConfig):void {
  Configs.push(config);
}

export function Configure(configs: CompileConfig[]) {
  Configs = configs;
}

desc("publish targets");
task("publish", [], () => RunAll(Configs, Publish));

desc("minify targets");
task("minify", [], () => RunAll(Configs, Minify));

desc("compile targets");
task("compile", [], () => RunAll(Configs, Compile));

//////////////////////////////////////////////////////////////////////////////////////////
// PUblish

function Publish(conf: CompileConfig): string {
  return "";
}

// 
//////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
// Minify

function Minify(conf: CompileConfig): string {
  var compilerOutput = Compile(conf);

  if (!conf.OutFile) {
    return compilerOutput;
  }
  var outputDir = path.join(ReleaseDir, conf.Name);
  var minifiedFile = path.join(outputDir, conf.OutFile);
  var zippedFile = minifiedFile + ".gz";

  directory(outputDir);

  file(minifiedFile, [outputDir, compilerOutput], function() {
    var closureOptions = conf.ClosureOptions || ClientClosureOptions;
    var cmd = "echo optimized it already > " + minifiedFile;
    console.log(cmd);
    jake.exec([cmd], () => this.complete());
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
function Compile(conf: CompileConfig): string {
  var tscOptions = conf.TscOptions || (conf.OutFile ? ClientTscOptions : ServerTscOptions);

  var outputDir = MakeRelative(path.join(tscOptions.OutDir || conf.OutDir || DebugDir, conf.Name));
  var outputFile = path.join(outputDir, tscOptions.OutFile || conf.OutFile || "__compiled");

  var options = "";

  if (tscOptions.Target){
    options += " --target " + tscOptions.Target;
  }

  options += " --outDir " + outputDir;

  if (tscOptions.Module === "commonjs") {
    options += " --module commonjs";
  } else if (conf.OutFile) {
    options += " --outFile " + outputFile;
  }

  if (tscOptions.SourceMap){
    options += " --sourceMap"
  }

  var dependencies =
      [outputDir]
        .concat(conf.Files)
        .concat(GetExtraDependencies())
        .map(MakeRelative);

  directory(outputDir);

  file(outputFile, dependencies, () => {
    console.log("compiling " + outputFile + " : " + dependencies.join(" "));
    var cmd = [
      TSC + " " + options + " " + conf.Files.join(" "),
      "printf '\\n//" + (new Date()) + "\\n' >> " + outputFile
      // "echo //" + (new Date()) + " >> " + outputFile
    ];
    console.log(cmd + "\n");
    jake.exec(cmd, () => this.complete(), { printStdout: true });
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

  var jsJakeFiles =
    Object.keys(require('module')._cache)
      .filter(m => m.search(/Jakefile.js$/) > -1)
      .map(MakeRelative)
      .map(f => f.replace(/\\/g, "/"))
    ;
  var tsJakeFiles =
    jsJakeFiles
      .map(f => f.replace("Jakefile.js", "Jakefile.ts"))
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
  console.log(cmds);
  jake.exec(cmds, complete, { printStdout: true });
  console.log(pkg.dependencies);
}, { async: true });

// desc("create empty package.json if missing");
file("package.json", [], () => {
  console.error("Generating package.json")
  var NPM = path.join("npm");
  jake.exec([NPM + " init"], complete, { printStdout: true });
}, { async: true });

// 
//////////////////////////////////////////////////////////////////////////////////////////
