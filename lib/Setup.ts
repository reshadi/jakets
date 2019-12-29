import * as Fs from "fs";
import * as Path from "path";
import * as ChildProcess from "child_process";

import * as Util from "./Util";
import * as Jakets from "./Jakets";
// import * as Jake from "../Jake";
import * as Command from "./Command";
import * as Tsc from "./TscTask";

let jakeCmd = Util.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");

//////////////////////////////////////////////////////////////////////////////////////////
// setup

let JakefileDependencies = Util.MakeRelativeToWorkingDir("Jakefile.dep.json");

// desc("update node_modules from package.json");
// rule(new RegExp(NodeModulesUpdateIndicator), name => Path.join(Path.dirname(name), "..", "package.json"), [], function () {
//   let indicator: string = this.name;
//   let packageJson: string = this.source;
//   Jakets.Log(`updating file ${indicator} from package file ${packageJson}`, 1);

//   let packageDir = Path.dirname(packageJson);

//   var pkgStr: string = Fs.readFileSync(packageJson, 'utf8');
//   Jakets.Exec([
//     "cd " + packageDir
//     + " && npm install"
//     + " && npm update"
//     + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
//   ], () => {
//     Jake.Shell.echo(indicator);
//     this.complete();
//     Jake.LogTask(this, 2);
//   });
// }, { async: true });

let PackageJsonTask = Jakets.FileTask(Jakets.MakeRelativeToWorkingDir("package.json"), [], async function () {
  this.Log("Missing package.json", 3, true);
  console.error("Generating package.json")
  var NPM = Path.join("npm");
  return Jakets.ExecAsync(NPM + " init");//], () => { this.complete(); Jake.LogTask(this, 2); });
});

let NpmUpdateTask = Jakets.FileTask(
  Util.NodeModulesUpdateIndicator
  , [PackageJsonTask, Jakets.MakeRelativeToWorkingDir("Makefile")]
  , async function () {
    Jakets.Log(`updating file ${this.GetName()} from package file ${PackageJsonTask.GetName()}`, 1);
    return Jakets.ExecAsync(`npm install && touch ${this.GetName()}`);
  }
);

function CompileJakefile(targetDir: string): Jakets.TaskType {
  let jakefileTs = Path.join(targetDir, "Jakefile.ts");
  let jakefileJs = jakefileTs.replace(".ts", ".js");
  let jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");

  let jakefileDepJson = Tsc.TscTask("Jakefile", [jakefileTs], [NpmUpdateTask], {
    module: Tsc.ModuleKind.CommonJS,
    target: Tsc.ScriptTarget.ES2015,
    inlineSourceMap: true,
    noEmitOnError: true,
    importHelpers: true,
    // string: true
    // baseUrl: "./node_module",
    // outDir: Jakets.MakeRelativeToWorkingDir("build")
  });

  Jakets.FileTask(jakefileJs, [jakefileDepJson], async function () {
    this.Log(`Generated: ${this.GetName()}`, 1);
  });

  return Jakets.FileTask(jakefileDepMk, [jakefileJs], async function () {
    let computedDependencies: string[] = [];
    let depStr: string = Fs.readFileSync(jakefileDepJson.GetName(), 'utf8');
    try {
      let dep = <Jakets.CommandData>JSON.parse(depStr);
      computedDependencies = dep.Dependencies.concat(dep.Inputs || []).concat(dep.Outputs || []).concat(dep.Files || []);
    } catch (e) {
      console.error(`Invalid dep file: ${jakefileDepJson}`);
    }

    let publicTasks = await Jakets.ExecAsync(`${jakeCmd} -T -f ${jakefileJs}`);
    let taskList = !publicTasks.StdErr && publicTasks.StdOut.match(/^jake ([-:\w]+)/gm);
    if (taskList) {
      taskList = taskList.map(t => t.replace(/^jake /, "")).filter(t => t.indexOf(":") === -1);
      Jakets.Log(`Public tasks: ${taskList.join(" ")}`, 1);
    } else {
      Jakets.Log(`No public tasks?`, 1);
      Jakets.Log(`StdOut:\n${publicTasks.StdOut}`, 1);
      Jakets.Log(`StdErr:\n${publicTasks.StdErr}`, 1);
      taskList = [];
    }

    var content = `
JAKE_TASKS += ${taskList.join(" ")}

#Jakefile.js: $(wildcard ${computedDependencies.join(" ")})

clean:
\trm -f -r $(wildcard ${
      computedDependencies
        .filter(f => /[.]ts$/.test(f) && !/node_modules|[.]d[.]ts/.test(f))
        .map(f => f.replace(".ts", ".js") /* + " " + f.replace(".ts", ".dep.*") */)
        .concat([jakefileDepMk, Command.DepDir])
        .join(" ")
      })
`;
    Fs.writeFileSync(jakefileDepMk, content);
  });
}

Jakets.GlobalTaskNs("setup", "jts", [CompileJakefile(".")]);

// 
//////////////////////////////////////////////////////////////////////////////////////////
