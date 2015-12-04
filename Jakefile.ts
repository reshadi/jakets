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

let tsdCmd = Node.GetNodeCommand("tsd", "tsd --version ", "tsd/build/cli.js");

let jakeCmd = Node.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");

//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils

//We use the following to better clarity what we are using/checking
var LocalDir = process.cwd();
var JaketsDir = __dirname;

export function MakeRelative(fullpath: string): string {
  if (!fullpath) {
    return fullpath;
  }
  return path.relative(LocalDir, fullpath) || '.';
}

export var BuildDir: string = process.env.BUILD__DIR || MakeRelative("./build");

  
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 

desc("Creates all dependencies");
task("CreateDependencies", [], function() {
  jake.Log(this.name);
  task("temp", GetExtraDependencies()).invoke();
}, { async: true });

let NodeModulesUpdateIndicator = "node_modules/.node_modules_updated";
function GetExtraDependencies(): string[] {
  jake.Log("CreateDependencies");
  var makefile = MakeRelative(path.join(__dirname, "Makefile")).replace(/\\/g, "/");

  var dependencies: string[] = [];// [makefile];

  if (fs.existsSync("bower.json")) {
    dependencies.push("bower");
  }

  let HasPackageJson = fs.existsSync("package.json");
  if (HasPackageJson) {
    // dependencies.push(NodeModulesUpdateIndicator);
  }

  if (HasPackageJson || fs.existsSync("tsd.json")) {
    dependencies.push("typings/tsd.d.ts");
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
  file(jakeFileMk, jakeFileMkDependency, function() {
    let taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
    let taskList = taskListRaw.match(/^jake (\w*)/gm).map(t => t.match(/\s.*/)[0]);

    var content = ""
      + "JAKE_TASKS = " + taskList.join(" ") + "\n"
      + "\n"
      + "Jakefile.js: " + jakeFileMkDependency.join(" ") + "\n"
      + "\n"
      + "clean:\n"
      + "\trm -f " + jsJakeFiles.join(" ") + "\n"
      + "\trm -f " + jsJakeFiles.map(f => f + ".map").join(" ") + "\n"
      ;
    fs.writeFile(jakeFileMk, content, () => this.complete());
  }, { async: true });
  dependencies.push(jakeFileMk);

  return dependencies;
}

task("bower", [], function() {
  jake.Log(this.name);
  bower("update --force-latest", () => this.complete());
}, { async: true })

rule(/typings\/tsd[.]d[.]ts/, name=> path.join(path.dirname(name), "..", "package.json"), [], function() {
  jake.Log(this.name);
  jake.Log(this.source);

  let packageJson = this.source;
  let dir = path.dirname(packageJson);
  var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
  var pkg = JSON.parse(pkgStr);
  var dependencies = pkg["dependencies"] || {};
  var pkgNames = Object.keys(dependencies);
  console.log(pkg.dependencies);

  jake.Exec([
    "cd " + dir
    + " && npm install"
    + " && " + tsdCmd + " install " + pkgNames.join(" ") + " --save"
    + " && " + tsdCmd + " reinstall --clean"
    + " && " + tsdCmd + " rebundle"
  ], () => {
    shell.echo("typings/tsd.d.ts");
    this.complete()
  });
}, { async: true });

// file("typings/tsd.d.ts", ["tsd.json"], function() {
//   jake.Log(this.name);
//   var pkgStr: string = fs.readFileSync("package.json", 'utf8');
//   var pkg = JSON.parse(pkgStr);
//   var dependencies = pkg["dependencies"] || {};
//   var pkgNames = Object.keys(dependencies);
//   tsd([
//     "install --save " + pkgNames.join(" "),
//     "reinstall --clean",
//     "rebundle"
//   ], () => {
//     shell.echo("typings/tsd.d.ts");
//     this.complete()
//   });
//   console.log(pkg.dependencies);
// }, { async: true });
// 
// file("tsd.json", ["package.json"], function() {
//   jake.Log(this.name);
//   if (!shell.test("-f", "tsd.json")) {
//     tsd("init", () => jake.Exec("touch tsd.json", () => this.complete()));
//   }
// }, { async: true });
// 
// file(NodeModulesUpdateIndicator, ["package.json"], function() {
//   jake.Log(this.name);
//   jake.Exec([
//     "npm install",
//     "touch " + NodeModulesUpdateIndicator
//   ], () => this.complete());
// }, { async: true });

// desc("create empty package.json if missing");
file("package.json", [], function() {
  jake.Log(this.name);
  console.error("Generating package.json")
  var NPM = path.join("npm");
  exec([NPM + " init"], () => this.complete());
}, { async: true });

// 
//////////////////////////////////////////////////////////////////////////////////////////
