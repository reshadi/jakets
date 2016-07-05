import "@types/index";
import * as fs from "fs";
import * as path from "path";

import * as jake from "./Jake";
export let exec = jake.Exec;
export let shell = jake.Shell;
export let Log = jake.Log;
export let LogTask = jake.LogTask;

import * as NodeUtil from "./NodeUtil";

import * as Bower from "./Bower";
export let bower = Bower.Exec;

import * as Tsc from "./Tsc";
export let tsc = Tsc.Exec;

import * as Browserify from "./Browserify";
export let browserify = Browserify.Exec;

import * as Closure from "./Closure";
export let closure = Closure.Exec;

let jakeCmd = NodeUtil.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");

//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils

//We use the following to better clarity what we are using/checking
export var LocalDir = process.cwd();

export function MakeRelativeToWorkingDir(fullpath: string): string {
  if (!fullpath) {
    return fullpath;
  }
  return path.relative(LocalDir, fullpath)
    .replace(/\\/g, "/") //Convert \ to / on windows
    || '.' //in case the answer is empty
    ;
  // return path.relative(LocalDir, fullpath) || '.';
}

//For backward compatibility
export var MakeRelative = MakeRelativeToWorkingDir;

var JaketsDir = MakeRelativeToWorkingDir(__dirname.replace("bootstrap", ""));

export var BuildDir: string = process.env.BUILD__DIR || MakeRelativeToWorkingDir("./build");


//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 

let NodeModulesUpdateIndicator = MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
let TypingsDefs = "typings/main.d.ts";
let TypingsJson = MakeRelativeToWorkingDir("typings.json");
let JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");

desc(`update ${TypingsDefs} from package.json`);
rule(new RegExp(TypingsDefs.replace(".", "[.]")), name => path.join(path.dirname(name), "..", "package.json"), [], function () {
  let typingsDeclarations: string = this.name;
  let packageJson: string = this.source;
  jake.Log(`updating file ${typingsDeclarations} from package file ${packageJson}`, 1);
  jake.Log(`${packageJson}`, 3);

  let typingsDir = path.dirname(typingsDeclarations);
  let currDir = path.dirname(packageJson);

  let pkgNames: string[];

  //Extract package names from pacakge.json for backward compatibility
  var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
  var pkg = JSON.parse(pkgStr);
  var dependencies = pkg["dependencies"] || {};
  jake.Log(dependencies, 2);
  var additionalTypings = pkg["addTypings"] || {};
  pkgNames = Object.keys(dependencies);
  pkgNames = pkgNames.filter(p => p.lastIndexOf("@types", 6) === -1);
  for (let typename in additionalTypings) {
    let typeSelector = additionalTypings[typename];
    let typeIndex = pkgNames.indexOf(typename);
    if (typeSelector === false || typeSelector === "-") {
      if (typeIndex !== -1) {
        //Remove this typing from the list
        pkgNames[typeIndex] = pkgNames[pkgNames.length - 1];
        --pkgNames.length;
      }
    } else {
      if (typeIndex === -1) {
        //add this missing type
        pkgNames.push(typename);
      }
    }
  }
  pkgNames.unshift("node");

  //Extract all package names in the node_modules/@types/
  let typesPkgDir = MakeRelativeToWorkingDir("node_modules/@types");
  pkgNames = pkgNames.concat(
    fs.readdirSync(typesPkgDir).filter(
      f =>
        pkgNames.indexOf(f) === -1
        && fs.statSync(path.join(typesPkgDir, f)).isDirectory())
  );

  jake.Log(pkgNames, 2);

  //We need to look this up the last moment to make sure correct path is picked up
  let typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
  let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) ", "");
  // let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install dt~" + pkgName + " --global --save || true ) ", "");

  shell.mkdir("-p", typingsDir);
  shell.mkdir("-p", typesPkgDir);
  jake.Exec([
    "cd " + currDir
    + " && touch " + TypingsJson
    + command
    + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
  ], () => {
    //For backward compatibility, we make the main.d.ts to point to index.d.ts
    // fs.writeFileSync(TypingsDefs, `/// <reference path='./index.d.ts'/>`);
    fs.writeFileSync(path.join(typesPkgDir, "index.ts"), `import "../../typings/index.ts";`);
    fs.writeFileSync(path.join(typingsDir, "index.ts"), `/// <reference path='./main.d.ts'/>`);
;
    shell.echo(typingsDeclarations);
    this.complete();
    jake.LogTask(this, 2);
  });
}, { async: true });


desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), name => path.join(path.dirname(name), "..", "package.json"), [], function () {
  let indicator: string = this.name;
  let packageJson: string = this.source;
  jake.Log(`updating file ${indicator} from package file ${packageJson}`, 1);

  let packageDir = path.dirname(packageJson);

  var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
  jake.Exec([
    "cd " + packageDir
    + " && npm install"
    + " && npm update"
    + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
  ], () => {
    shell.echo(indicator);
    this.complete();
    jake.LogTask(this, 2);
  });
}, { async: true });


// desc("create empty package.json if missing");
file("package.json", [], function () {
  jake.Log(this.name, 3);
  console.error("Generating package.json")
  var NPM = path.join("npm");
  exec([NPM + " init"], () => { this.complete(); jake.LogTask(this, 2); });
}, { async: true });

// 
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// setup

function CreatePlaceHolderTask(taskName: string, dependencies: string[]): string {
  let t = task(taskName, dependencies, function () {
    jake.LogTask(this, 2);
  });
  jake.LogTask(t, 2);

  if (t["name"] !== taskName) {
    jake.Log(taskName + " != " + t["name"]);
  }

  return taskName;
}

export function UpdatePackages(directories: string[]): string {
  let dependencies = directories
    .filter(targetDir =>
      targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
      && fs.existsSync(path.join(targetDir, "package.json"))
    )
    .map(targetDir =>
      MakeRelativeToWorkingDir(path.join(targetDir, NodeModulesUpdateIndicator))
    )
    .concat(directories
      .map(targetDir => MakeRelativeToWorkingDir(path.join(targetDir, "Makefile")))
      .filter(targetDir => fs.existsSync(targetDir))
    )
    ;
  return CreatePlaceHolderTask("update_packages", dependencies);
}

export function UpdateTypings(directories: string[]): string {
  let taskName = "update_typings";
  let updateTask = task(taskName, [UpdatePackages(directories)], function () {
    //At this point we know that all package.json files are already installed
    //So, we can safely look for folders inside of node_modules folders as well
    let dependencies = directories
      .filter(targetDir => fs.existsSync(path.join(targetDir, "package.json")) || fs.existsSync(path.join(targetDir, "typings.json")))
      .map(targetDir => path.join(targetDir, TypingsDefs).replace(/\\/g, "/"))
      ;
    //Now we need to invoke all these files
    let depTask = task(taskName + "_dependencies", dependencies, function () {
      this.complete();
      jake.LogTask(this, 2);
    }, { async: true });
    depTask.addListener("complete", () => {
      this.complete();
      jake.LogTask(this, 2);
    });
    depTask.invoke();

    jake.LogTask(this, 2);
  }, { async: true });
  jake.LogTask(updateTask, 2);
  return taskName;
}

export function CompileJakefiles(directories: string[]) {
  if (!directories) {
    directories = [];
  }
  directories.push(".");
  if (MakeRelativeToWorkingDir(JaketsDir) !== ".") {
    directories.push(JaketsDir);
    // directories.push(MakeRelativeToWorkingDir("node_modules/jakets"));
  }

  directories = directories.filter((d, index, array) => array.indexOf(d) === index); //Remove repeates in case later we add more

  jake.Log(`LocalDir=${LocalDir}  - JaketsDir=${JaketsDir} - Dirs=[${directories.join(",")}]`, 3);

  let updateTypingsTaskName = UpdateTypings(directories);
  let dependencies = directories
    .filter(targetDir => fs.existsSync(targetDir))
    .map(targetDir => {
      let jakefileTs = path.join(targetDir, "Jakefile.ts");
      let jakefileJs = jakefileTs.replace(".ts", ".js");
      let resultTarget: string;
      let dependencies: string[] = [updateTypingsTaskName];

      let compileJakefileTs = function () {
        tsc(
          // `--module commonjs --inlineSourceMap ${MakeRelativeToWorkingDir(path.join(__dirname, TypingsDefs))} ${jakefileTs}`
          `--module commonjs --inlineSourceMap ${jakefileTs}`
          , () => { this.complete(); jake.LogTask(this, 2); }
        );
      };

      let targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
      let hasDependency = fs.existsSync(targetJakefileDependencies);
      if (!hasDependency) {
        //Compile unconditionally since it seems file was never compiled before and need to be sure
        let compileJakefileTaskName = `compile_Jakefile_in_${path.basename(targetDir)}`;
        task(compileJakefileTaskName, [updateTypingsTaskName], compileJakefileTs, { async: true });

        dependencies.push(compileJakefileTaskName);

        resultTarget = `setup_all_for_${path.basename(targetDir)}`;
        task(resultTarget, dependencies, function () {
          jake.LogTask(this, 2);
        });
      } else {
        //Compile conditionally since it seems file was already compiled before and we know what it depends on
        let depStr: string = fs.readFileSync(targetJakefileDependencies, 'utf8');
        dependencies = dependencies.concat(JSON.parse(depStr));

        resultTarget = jakefileJs;
        file(jakefileJs, dependencies, compileJakefileTs, { async: true });
      }
      return resultTarget;
    })
    ;
  return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}

namespace("jts", function () {
  CreatePlaceHolderTask("setup", [CompileJakefiles([])]);

  task("generate_dependencies", [JakefileDependencies], function () { });
  file(JakefileDependencies, ["Jakefile.js"], function () {
    //We will add all imported Jakefile.js file as well as any local .js files that each one might be referencing.
    //Also we assumt his rule is called from a local directory and it will create the files in that directory.

    var jakefilePattern = /(Jakefile.*)\.js$/;
    var jsJakeFiles =
      Object.keys(require('module')._cache)
        .filter(m => m.search(jakefilePattern) > -1)
        .map(MakeRelativeToWorkingDir)
      ;
    var tsJakeFiles =
      jsJakeFiles
        .map(f => f.replace(jakefilePattern, "$1.ts"))
      ;
    let dependencies = tsJakeFiles; //TODO: add other local modules.
    fs.writeFileSync(JakefileDependencies, JSON.stringify(dependencies));

    var jakeFileMk = "Jakefile.dep.mk";
    let taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
    let taskList = taskListRaw && taskListRaw.match(/^jake ([-\w]*)/gm);
    if (taskList) {
      taskList = taskList.map(t => t.match(/\s.*/)[0]);
      jake.Log(`Found public tasks ${taskList}`, 1);

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
