import * as Fs from "fs";
import * as Path from "path";
import * as ChildProcess from "child_process";

import * as Util from "./Util";
import * as Jake from "./Jake";
import * as Command from "./Command";
import * as Tsc from "./Tsc";

let jakeCmd = Util.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");

let NodeModulesUpdateIndicator = Util.MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
let JakefileDependencies = Util.MakeRelativeToWorkingDir("Jakefile.dep.json");

desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), name => Path.join(Path.dirname(name), "..", "package.json"), [], function () {
  let indicator: string = this.name;
  let packageJson: string = this.source;
  Jake.Log(`updating file ${indicator} from package file ${packageJson}`, 1);

  let packageDir = Path.dirname(packageJson);

  var pkgStr: string = Fs.readFileSync(packageJson, 'utf8');
  Jake.Exec([
    "cd " + packageDir
    + " && npm install"
    + " && npm update"
    + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
  ], () => {
    Jake.Shell.echo(indicator);
    this.complete();
    Jake.LogTask(this, 2);
  });
}, { async: true });


// desc("create empty package.json if missing");
file("package.json", [], function () {
  Jake.Log(this.name, 3);
  console.error("Generating package.json")
  var NPM = Path.join("npm");
  Jake.Exec([NPM + " init"], () => { this.complete(); Jake.LogTask(this, 2); });
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
      && Fs.existsSync(Path.join(targetDir, "package.json"))
    )
    .map(targetDir =>
      Util.MakeRelativeToWorkingDir(Path.join(targetDir, NodeModulesUpdateIndicator))
    )
    .concat(directories
      .map(targetDir => Util.MakeRelativeToWorkingDir(Path.join(targetDir, "Makefile")))
      .filter(targetDir => Fs.existsSync(targetDir))
    )
    ;
  return CreatePlaceHolderTask("update_packages", dependencies);
}

export function CompileJakefiles(directories: string[]) {
  if (!directories) {
    directories = [];
  }
  directories.push(".");
  if (Util.MakeRelativeToWorkingDir(Util.JaketsDir) !== ".") {
    // directories.push(JaketsDir);
    // directories.push(MakeRelativeToWorkingDir("node_modules/jakets"));
  }

  directories = directories.filter((d, index, array) => array.indexOf(d) === index); //Remove repeates in case later we add more

  Jake.Log(`LocalDir=${Util.LocalDir}  - JaketsDir=${Util.JaketsDir} - Dirs=[${directories.join(",")}]`, 3);

  let updateTypingsTaskName = UpdatePackages(directories); // UpdateTypings(directories);
  let dependencies = directories
    .filter(targetDir => Fs.existsSync(targetDir))
    .map(targetDir => {
      let jakefileTs = Path.join(targetDir, "Jakefile.ts");
      let jakefileJs = jakefileTs.replace(".ts", ".js");
      let jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
      let jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");

      let resultTarget: string;
      let dependencies: string[] = [updateTypingsTaskName];

      jakefileDepJson = Tsc.TscTask(
        "Jakefile"
        , dependencies
        , `--module commonjs --target es6 --inlineSourceMap --noEmitOnError --listFiles ${jakefileTs}`
      );

      file(jakefileDepMk, [jakefileDepJson], function () {
        let computedDependencies: string[];
        let depStr: string = Fs.readFileSync(jakefileDepJson, 'utf8');
        try {
          let dep = <Command.CommandData>JSON.parse(depStr);
          computedDependencies = dep.Dependencies.concat(dep.Files);
        } catch (e) {
          console.error(`Invalid dep file: ${jakefileDepJson}`);
        }

        ChildProcess.exec(jakeCmd + " -T", (error, stdout, stderr) => {
          Jake.Log(stdout);
          let taskList = !error && stdout.match(/^jake ([-:\w]*)/gm);
          if (taskList) {
            taskList = taskList.map(t => t.match(/\s.*/)[0]).filter(t => t.indexOf(":") === -1);
            Jake.Log(`Found public tasks ${taskList}`, 1);
          } else {
            taskList = [];
          }
          // let tasks = (<any>jake).Task;
          // let taskList = tasks
          //   ? Object.keys(tasks).map(key => tasks[key]).filter(t => !!t.description).map(t => t.name)
          //   : [];

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
          Fs.writeFileSync(jakefileDepMk, content);
          this.complete();
        });
      }, { async: true });

      return jakefileDepMk;
    })
    ;
  return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}

namespace("jts", function () {
  CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
});