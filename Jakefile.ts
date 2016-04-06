import * as fs from "fs";
import * as path from "path";

import * as jake from "./Jake";
export let exec = jake.Exec;
export let shell = jake.Shell;

import * as NodeUtil from "./NodeUtil";

import * as Bower from "./Bower";
export let bower = Bower.Exec;

import * as Tsc from "./Tsc";
export let tsc = Tsc.Exec;

import * as Browserify from "./Browserify";
export let browserify = Browserify.Exec;

import * as Closure from "./Closure";
export let closure = Closure.Exec;

let typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");

let jakeCmd = NodeUtil.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");

//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils

//We use the following to better clarity what we are using/checking
export var LocalDir = process.cwd();
var JaketsDir = __dirname;

export function MakeRelative(fullpath: string): string {
  if (!fullpath) {
    return fullpath;
  }
  return path.relative(LocalDir, fullpath)
    .replace(/\\/g, "/") //Contert \ to / on windows
    || '.' //in case the answer is empty
    ;
  // return path.relative(LocalDir, fullpath) || '.';
}

export var BuildDir: string = process.env.BUILD__DIR || MakeRelative("./build");

  
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 

let NodeModulesUpdateIndicator = "node_modules/.node_modules_updated";
let TypingsDefs = "typings/main.d.ts";
let TypingsJson = "typings.json";
let JakefileDependencies = "Jakefile.dep.json";

desc("update typings/main.d.ts from package.json");
rule(new RegExp(TypingsDefs.replace(".", "[.]")), name => path.join(path.dirname(name), "..", "package.json"), [], function() {
  let typingsDeclarations: string = this.name;
  let packageJson: string = this.source;
  jake.Log(`updating file ${typingsDeclarations} from package file ${packageJson}`);
  jake.Log(`${packageJson}`);

  let typingsDir = path.dirname(typingsDeclarations);
  let currDir = path.dirname(packageJson);

  var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
  var pkg = JSON.parse(pkgStr);
  var dependencies = pkg["dependencies"] || {};
  var additionalTypings = pkg["addTypings"] || {};
  var typingNames = Object.keys(additionalTypings);
  var pkgNames = Object.keys(dependencies);
  pkgNames = pkgNames.concat(typingNames);
  pkgNames.unshift("", "node");
  jake.Log(dependencies);
  var command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) ", "");

  shell.mkdir("-p", typingsDir);
  jake.Exec([
    "cd " + currDir
    + " && touch " + TypingsJson
    + command
    + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
  ], () => {
    shell.echo(typingsDeclarations);
    this.complete()
  });
}, { async: true });


desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), name => path.join(path.dirname(name), "..", "package.json"), [], function() {
  let indicator: string = this.name;
  let packageJson: string = this.source;
  jake.Log(`updating file ${indicator} from package file ${packageJson}`);

  let packageDir = path.dirname(packageJson);

  var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
  jake.Exec([
    "cd " + packageDir
    + " && npm install"
    + " && npm update"
    + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
  ], () => {
    shell.echo(indicator);
    this.complete()
  });
}, { async: true });


// desc("create empty package.json if missing");
file("package.json", [], function() {
  jake.Log(this.name);
  console.error("Generating package.json")
  var NPM = path.join("npm");
  exec([NPM + " init"], () => this.complete());
}, { async: true });

// 
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// setup
namespace("jts", function() {

  /**
   * Calculates all the necessary dependencies for compiling the given Jakefile.js
   * The dependencies are added only if they exists.
   */
  function CompileJakefile(jakefileJs: string): string {
    jakefileJs = MakeRelative(jakefileJs);

    let targetDir = path.dirname(jakefileJs);

    let dependencies: string[] = [];

    if (MakeRelative(targetDir) !== MakeRelative(JaketsDir)) {
      //Let's first make sure the jakets itself is fully done and ready
      dependencies.push(CompileJakefile(path.join(JaketsDir, "Jakefile.js")));
    }

    var makefile = MakeRelative(path.join(targetDir, "Makefile"));
    if (fs.existsSync(makefile)) {
      dependencies.push(makefile);
    }

    let jakefileTs = jakefileJs.replace(".js", ".ts");
    dependencies.push(jakefileTs);

    let hasPackageJson = fs.existsSync(path.join(targetDir, "package.json"));
    if (hasPackageJson
      && targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
    ) {
      dependencies.push(path.join(targetDir, NodeModulesUpdateIndicator));
    }

    if (hasPackageJson || fs.existsSync(path.join(targetDir, "typings.json"))) {
      dependencies.push(path.join(targetDir, TypingsDefs));
    }

    dependencies = dependencies.map(MakeRelative);

    let resultTarget: string;

    let targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
    let hasDependency = fs.existsSync(targetJakefileDependencies);
    if (!hasDependency) {
      //Compile unconditionally since it seems file was never compiled before and need to be sure
     
      let compileJakefileTaskName = `compile_Jakefile_in_${path.basename(targetDir)}`;
      task(compileJakefileTaskName, [], function() {
        tsc(`--module commonjs --sourceMap ${jakefileTs}`, () => this.complete());
      }, { async: true });

      dependencies.push(compileJakefileTaskName);

      resultTarget = `setup_all_for_${path.basename(targetDir)}`;
      task(resultTarget, dependencies, function() {
        jake.Log("Done with setup");
      });
    } else {
      //Compile conditionally since it seems file was already compiled before and we know what it depends on
      let depStr: string = fs.readFileSync(targetJakefileDependencies, 'utf8');
      dependencies = dependencies.concat(JSON.parse(depStr));

      resultTarget = jakefileJs;
      file(jakefileJs, dependencies, function() {
        tsc(`--module commonjs --sourceMap ${jakefileTs}`, () => this.complete());
      }, { async: true });
    }

    jake.Log(dependencies);
    return resultTarget;
  }

  task("setup", [CompileJakefile("Jakefile.js")], function() {
  });

  task("generate_dependencies", [JakefileDependencies], function() { });
  file(JakefileDependencies, ["Jakefile.js"], function() {
    //We will add all imported Jakefile.js file as well as any local .js files that each one might be referencing.
    //Also we assumt his rule is called from a local directory and it will create the files in that directory.

    var jakefilePattern = /(Jakefile.*)\.js$/;
    var jsJakeFiles =
      Object.keys(require('module')._cache)
        .filter(m => m.search(jakefilePattern) > -1)
        .map(MakeRelative)
      ;
    var tsJakeFiles =
      jsJakeFiles
        .map(f => f.replace(jakefilePattern, "$1.ts"))
      ;
    let dependencies = tsJakeFiles; //TODO: add other local modules.
    fs.writeFileSync(JakefileDependencies, JSON.stringify(dependencies));

    var jakeFileMk = "Jakefile.mk";
    let taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
    let taskList = taskListRaw.match(/^jake ([-\w]*)/gm);
    if (taskList) {
      taskList = taskList.map(t => t.match(/\s.*/)[0]);
      jake.Log(`Found public tasks ${taskList}`);

      var content = ""
        + "JAKE_TASKS = " + taskList.join(" ") + "\n"
        + "\n"
        + "Jakefile.js: " + dependencies.join(" ") + "\n"
        + "\n"
        + "clean:\n"
        + "\t#rm -f " + jsJakeFiles.join(" ") + "\n"
        + "\trm -f " + jsJakeFiles.map(f => f + ".map").join(" ") + "\n"
        ;
      fs.writeFileSync(jakeFileMk, content);
    }
  });
});
// 
//////////////////////////////////////////////////////////////////////////////////////////
