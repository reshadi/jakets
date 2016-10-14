import * as fs from "fs";
import * as path from "path";
import * as Crypto from "crypto";

import * as Jake from "./Jake";
export let exec = Jake.Exec;
export let shell = Jake.Shell;
export let Log = Jake.Log;
export let LogTask = Jake.LogTask;

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
// let TypingsDefs = "typings/main.d.ts";
// let TypingsJson = MakeRelativeToWorkingDir("typings.json");
let JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");

// desc(`update ${TypingsDefs} from package.json`);
// rule(new RegExp(TypingsDefs.replace(".", "[.]")), name => path.join(path.dirname(name), "..", "package.json"), [], function () {
//   let typingsDeclarations: string = this.name;
//   let packageJson: string = this.source;
//   jake.Log(`updating file ${typingsDeclarations} from package file ${packageJson}`, 1);
//   jake.Log(`${packageJson}`, 3);

//   let typingsDir = path.dirname(typingsDeclarations);
//   let currDir = path.dirname(packageJson);

//   let pkgNames: string[];

//   //Extract package names from pacakge.json for backward compatibility
//   var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
//   var pkg = JSON.parse(pkgStr);
//   var dependencies = pkg["dependencies"] || {};
//   jake.Log(dependencies, 2);
//   var additionalTypings = pkg["addTypings"] || {};
//   pkgNames = Object.keys(dependencies);
//   pkgNames = pkgNames.filter(p => p.lastIndexOf("@types", 6) === -1);
//   for (let typename in additionalTypings) {
//     let typeSelector = additionalTypings[typename];
//     let typeIndex = pkgNames.indexOf(typename);
//     if (typeSelector === false || typeSelector === "-") {
//       if (typeIndex !== -1) {
//         //Remove this typing from the list
//         pkgNames[typeIndex] = pkgNames[pkgNames.length - 1];
//         --pkgNames.length;
//       }
//     } else {
//       if (typeIndex === -1) {
//         //add this missing type
//         pkgNames.push(typename);
//       }
//     }
//   }
//   pkgNames.unshift("node");

//   //Extract all package names in the node_modules/@types/
//   let typesPkgDir = MakeRelativeToWorkingDir("node_modules/@types");
//   pkgNames = pkgNames.concat(
//     fs.readdirSync(typesPkgDir).filter(
//       f =>
//         pkgNames.indexOf(f) === -1
//         && fs.statSync(path.join(typesPkgDir, f)).isDirectory())
//   );

//   jake.Log(pkgNames, 2);

//   //We need to look this up the last moment to make sure correct path is picked up
//   let typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
//   let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) ", "");
//   // let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install dt~" + pkgName + " --global --save || true ) ", "");

//   shell.mkdir("-p", typingsDir);
//   shell.mkdir("-p", typesPkgDir);
//   jake.Exec([
//     "cd " + currDir
//     // + " && touch " + TypingsJson
//     // + command
//     + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
//   ], () => {
//     //For backward compatibility, we make the main.d.ts to point to index.d.ts
//     // fs.writeFileSync(TypingsDefs, `/// <reference path='./index.d.ts'/>`);
//     ["index", "main", "browser"].forEach(f => {
//       fs.writeFileSync(path.join(typesPkgDir, `${f}.ts`), `//import "../../typings/${f}";`);
//       fs.writeFileSync(path.join(typingsDir, `${f}.ts`), `// / <reference path='./${f}.d.ts'/>`);
//     });

//     shell.echo(typingsDeclarations);
//     this.complete();
//     jake.LogTask(this, 2);
//   });
// }, { async: true });


desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), name => path.join(path.dirname(name), "..", "package.json"), [], function () {
  let indicator: string = this.name;
  let packageJson: string = this.source;
  Jake.Log(`updating file ${indicator} from package file ${packageJson}`, 1);

  let packageDir = path.dirname(packageJson);

  var pkgStr: string = fs.readFileSync(packageJson, 'utf8');
  Jake.Exec([
    "cd " + packageDir
    + " && npm install"
    + " && npm update"
    + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
  ], () => {
    shell.echo(indicator);
    this.complete();
    Jake.LogTask(this, 2);
  });
}, { async: true });


// desc("create empty package.json if missing");
file("package.json", [], function () {
  Jake.Log(this.name, 3);
  console.error("Generating package.json")
  var NPM = path.join("npm");
  exec([NPM + " init"], () => { this.complete(); Jake.LogTask(this, 2); });
}, { async: true });

// 
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// setup

function CreatePlaceHolderTask(taskName: string, dependencies: string[]): string {
  let t = task(taskName, dependencies, function () {
    Jake.LogTask(this, 2);
  });
  Jake.LogTask(t, 2);

  if (t["name"] !== taskName) {
    Jake.Log(taskName + " != " + t["name"]);
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

// export function UpdateTypings(directories: string[]): string {
//   let taskName = "update_typings";
//   let updateTask = task(taskName, [UpdatePackages(directories)], function () {
//     //At this point we know that all package.json files are already installed
//     //So, we can safely look for folders inside of node_modules folders as well
//     let dependencies = directories
//       .filter(targetDir => fs.existsSync(path.join(targetDir, "package.json")) || fs.existsSync(path.join(targetDir, "typings.json")))
//       .map(targetDir => path.join(targetDir, TypingsDefs).replace(/\\/g, "/"))
//       ;
//     //Now we need to invoke all these files
//     let depTask = task(taskName + "_dependencies", dependencies, function () {
//       this.complete();
//       jake.LogTask(this, 2);
//     }, { async: true });
//     depTask.addListener("complete", () => {
//       this.complete();
//       jake.LogTask(this, 2);
//     });
//     depTask.invoke();

//     jake.LogTask(this, 2);
//   }, { async: true });
//   jake.LogTask(updateTask, 2);
//   return taskName;
// }

interface CommandData {
  name: string;
  dependencies: string[];
  files?: string[];
}
interface DependencyInfo {
  DepFile: string;
  AllDependencies: string[];
}

function GetDependencyInfo(data: CommandData): DependencyInfo {
  let hash = Crypto.createHash("sha1");
  hash.update(JSON.stringify(data));
  let value = hash.digest("hex");
  let depDir = MakeRelative(path.join(BuildDir, "dep"));
  let depFile = `${depDir}/${data.name}_${value}.json`;
  depDir = path.dirname(depFile);
  directory(depDir);

  let allDependencies = [depDir].concat(data.dependencies);

  if (fs.existsSync(depFile)) {
    let depStr: string = fs.readFileSync(depFile, 'utf8');
    try {
      let dep = <CommandData>JSON.parse(depStr);
      let previousDependencies = dep.dependencies.concat(dep.files);
      let existingDependencies = previousDependencies.filter(d => d && fs.existsSync(d));
      allDependencies = allDependencies.concat(existingDependencies);
    } catch (e) {
      console.error(`Regenerating the invalid dep file: ${depFile}`);
      allDependencies = [];
    }
  }

  let result = {
    DepFile: depFile,
    AllDependencies: allDependencies
  }
  return result;
}

function ExtractFilesAndUpdateDependencyInfo(data: CommandData, depInfo: DependencyInfo, error, stdout: string, stderror) {
  if (error) {
    console.error(`
${error}
${stdout}
${stderror}`);
    throw error;
  }

  data.files =
    stdout
      .split("\n")
      .map(f => f.trim())
      .filter(f => !!f)
      .map(f => MakeRelativeToWorkingDir(f));
  fs.writeFileSync(depInfo.DepFile, JSON.stringify(data, null, ' '));
}

export function TscTask(name: string, dependencies: string[], command: string, excludeExternal?: boolean): string {
  command += " --listFiles --noEmitOnError";
  var data = {
    name: name,
    dir: path.resolve(LocalDir),
    command: command,
    dependencies: dependencies,
    files: []
  };

  let depInfo = GetDependencyInfo(data);

  file(depInfo.DepFile, depInfo.AllDependencies, function () {
    tsc(
      command
      , (error, stdout: string, stderror) => {
        ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror);
        let callback = () => {
          this.complete();
          LogTask(this, 2);
        };
        if (!excludeExternal) {
          let seenDirs: { [index: string]: number; } = {};
          let files = data.files.reverse().filter((f: string) => {
            if (/node_modules/.test(f) && !/[.]d[.]ts$/.test(f)) {
              let dir = path.dirname(f);
              let seenCount = seenDirs[dir] = ((seenDirs[dir] || 0) + 1);
              return seenCount <= 5;
            }
            return false;
          });
          tsc(command + " " + files.join(" "), callback, false);
        } else {
          callback();
        }
      }
      , true
    );
  }, { async: true });
  return depInfo.DepFile;
}

export function BrowserifyTask(
  name: string
  , dependencies: string[]
  , output: string
  , inputs: string
  , isRelease?: boolean
  , tsargs?: string
  , options?: string
): string {
  let data = {
    name: name,
    dir: path.resolve(LocalDir),
    output: output,
    inputs: inputs,
    isRelease: isRelease,
    tsargs: tsargs,
    options: options,
    dependencies: dependencies
  };
  let depInfo = GetDependencyInfo(data);

  file(depInfo.DepFile, depInfo.AllDependencies, function () {
    browserify(
      inputs
      , output
      , (error, stdout: string, stderror) => {
        ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror);
        this.complete();
        LogTask(this, 2);
      }
      , isRelease
      , tsargs
      , (options || "") + " --list"
      , true
    );
  }, { async: true });

  file(output, [depInfo.DepFile], function () {
    browserify(
      inputs
      , output
      , () => {
        this.complete();
        LogTask(this, 2);
      }
      , isRelease
      , tsargs
      , options
    );
  }, { async: true });

  return output;
}

export function CompileJakefiles(directories: string[]) {
  if (!directories) {
    directories = [];
  }
  directories.push(".");
  if (MakeRelativeToWorkingDir(JaketsDir) !== ".") {
    // directories.push(JaketsDir);
    // directories.push(MakeRelativeToWorkingDir("node_modules/jakets"));
  }

  directories = directories.filter((d, index, array) => array.indexOf(d) === index); //Remove repeates in case later we add more

  Jake.Log(`LocalDir=${LocalDir}  - JaketsDir=${JaketsDir} - Dirs=[${directories.join(",")}]`, 3);

  let updateTypingsTaskName = UpdatePackages(directories); // UpdateTypings(directories);
  let dependencies = directories
    .filter(targetDir => fs.existsSync(targetDir))
    .map(targetDir => {
      let jakefileTs = path.join(targetDir, "Jakefile.ts");
      let jakefileJs = jakefileTs.replace(".ts", ".js");
      let jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
      let jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");

      let resultTarget: string;
      let dependencies: string[] = [updateTypingsTaskName];

      jakefileDepJson = TscTask(
        "Jakefile"
        , dependencies
        , `--module commonjs  --inlineSourceMap --noEmitOnError --listFiles ${jakefileTs}`
      );

      file(jakefileDepMk, [jakefileDepJson], function () {
        let computedDependencies: string[];
        let depStr: string = fs.readFileSync(jakefileDepJson, 'utf8');
        try {
          let dep = <CommandData>JSON.parse(depStr);
          computedDependencies = dep.dependencies.concat(dep.files);
        } catch (e) {
          console.error(`Invalid dep file: ${jakefileDepJson}`);
        }

        // let taskListRaw: string;
        // try {
        //   taskListRaw = Jake.Shell.exec("pwd & " + jakeCmd + " -T").output;
        // } catch (e) { }
        // let taskList = taskListRaw && taskListRaw.match(/^jake ([-:\w]*)/gm);
        // if (taskList) {
        //   taskList = taskList.map(t => t.match(/\s.*/)[0]);
        //   Jake.Log(`Found public tasks ${taskList}`, 1);
        // } else {
        //   taskList = [];
        // }
        let tasks = (<any>jake).Task;
        let taskList = tasks
          ? Object.keys(tasks).map(key => tasks[key]).filter(t => !!t.description).map(t => t.name)
          : [];

        var content = `
JAKE_TASKS += ${taskList.join(" ")}

Jakefile.js: $(wildcard ${computedDependencies.join(" ")})

clean:
\t#rm -f ${
          computedDependencies
            .filter(f => !/node_modules|[.]d[.]ts/.test(f))
            .map(f => f.replace(".ts", ".js") + " " + f.replace(".ts", ".dep.*"))
            .join(" ")
          }
`;
        fs.writeFileSync(jakefileDepMk, content);
        this.complete();
      }, { async: true });

      return jakefileDepMk;
    })
    ;
  return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}

namespace("jts", function () {
  CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
});

desc("Default task");
task("default");

//
//////////////////////////////////////////////////////////////////////////////////////////
