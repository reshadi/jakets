import * as Fs from "fs";
import * as Path from "path";
import * as ChildProcess from "child_process";

import * as Util from "./Util";
import * as Jakets from "./Jakets";
// import * as Jake from "../Jake";
import * as Command from "./Command";
import * as Tsc from "./TscTask";

let jakeCmd = Util.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");

let NodeModulesUpdateIndicator = Util.MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
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
  NodeModulesUpdateIndicator
  , [PackageJsonTask, Jakets.MakeRelativeToWorkingDir("Makefile")]
  , async function () {
    Jakets.Log(`updating file ${this.GetName()} from package file ${PackageJsonTask.GetName()}`, 1);
    return Jakets.ExecAsync(`npm update --no-save && touch ${this.GetName()}`);
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
    // baseUrl: "./node_module",
    // outDir: Jakets.MakeRelativeToWorkingDir("build")
  });

  return Jakets.FileTask(jakefileDepMk, [jakefileDepJson], async function () {
    let computedDependencies: string[];
    let depStr: string = Fs.readFileSync(jakefileDepJson.GetName(), 'utf8');
    try {
      let dep = <Jakets.CommandData>JSON.parse(depStr);
      computedDependencies = dep.Dependencies.concat(dep.Inputs).concat(dep.Outputs).concat(dep.Files);
    } catch (e) {
      console.error(`Invalid dep file: ${jakefileDepJson}`);
    }

    let publicTasks = await Jakets.ExecAsync(`${jakeCmd} -T -f ${jakefileJs}`);
    Jakets.Log(publicTasks.StdOut);
    let taskList = !publicTasks.StdErr && publicTasks.StdOut.match(/^jake ([-:\w]*)/gm);
    if (taskList) {
      taskList = taskList.map(t => t.match(/\s.*/)[0]).filter(t => t.indexOf(":") === -1);
      Jakets.Log(`Found public tasks ${taskList}`, 1);
    } else {
      taskList = [];
    }

    var content = `
JAKE_TASKS += ${taskList.join(" ")}

Jakefile.js: $(wildcard ${computedDependencies.join(" ")})

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
// 
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// setup

// function CreatePlaceHolderTask(taskName: string, dependencies: string[]): string {
//   let t = task(taskName, dependencies, function () {
//     Jake.LogTask(this, 2);
//   });
//   Jake.LogTask(t, 2);

//   if (t["name"] !== taskName) {
//     Jakets.Log(taskName + " != " + t["name"]);
//   }

//   return taskName;
// }

// export function UpdatePackages(directories: string[]): string {
//   let dependencies = directories
//     .filter(targetDir =>
//       targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
//       && Fs.existsSync(Path.join(targetDir, "package.json"))
//     )
//     .map(targetDir =>
//       Util.MakeRelativeToWorkingDir(Path.join(targetDir, NodeModulesUpdateIndicator))
//     )
//     .concat(directories
//       .map(targetDir => Util.MakeRelativeToWorkingDir(Path.join(targetDir, "Makefile")))
//       .filter(targetDir => Fs.existsSync(targetDir))
//     )
//     ;
//   return CreatePlaceHolderTask("update_packages", dependencies);
// }

// export function CompileJakefiles(directories: string[]) {
//   if (!directories) {
//     directories = [];
//   }
//   directories.push(".");
//   if (Util.MakeRelativeToWorkingDir(Util.JaketsDir) !== ".") {
//     // directories.push(JaketsDir);
//     // directories.push(MakeRelativeToWorkingDir("node_modules/jakets"));
//   }

//   directories = directories.filter((d, index, array) => array.indexOf(d) === index); //Remove repeates in case later we add more

//   Jakets.Log(`LocalDir=${Util.LocalDir}  - JaketsDir=${Util.JaketsDir} - Dirs=[${directories.join(",")}]`, 3);

//   let updateTypingsTaskName = UpdatePackages(directories); // UpdateTypings(directories);
//   let dependencies = directories
//     .filter(targetDir => Fs.existsSync(targetDir))
//     .map(targetDir => {
//       let jakefileTs = Path.join(targetDir, "Jakefile.ts");
//       let jakefileJs = jakefileTs.replace(".ts", ".js");
//       let jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
//       let jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");

//       let resultTarget: string;
//       let dependencies: string[] = [updateTypingsTaskName];

//       jakefileDepJson = Tsc.TscTask(
//         "Jakefile"
//         , dependencies
//         , `--module commonjs --target es6 --inlineSourceMap --noEmitOnError --listFiles ${jakefileTs}`
//       );

//       file(jakefileDepMk, [jakefileDepJson], function () {
//         let computedDependencies: string[];
//         let depStr: string = Fs.readFileSync(jakefileDepJson, 'utf8');
//         try {
//           let dep = <Command.CommandData>JSON.parse(depStr);
//           computedDependencies = dep.Dependencies.concat(dep.Files);
//         } catch (e) {
//           console.error(`Invalid dep file: ${jakefileDepJson}`);
//         }

//         ChildProcess.exec(jakeCmd + " -T", (error, stdout, stderr) => {
//           Jakets.Log(stdout);
//           let taskList = !error && stdout.match(/^jake ([-:\w]*)/gm);
//           if (taskList) {
//             taskList = taskList.map(t => t.match(/\s.*/)[0]).filter(t => t.indexOf(":") === -1);
//             Jakets.Log(`Found public tasks ${taskList}`, 1);
//           } else {
//             taskList = [];
//           }
//           // let tasks = (<any>jake).Task;
//           // let taskList = tasks
//           //   ? Object.keys(tasks).map(key => tasks[key]).filter(t => !!t.description).map(t => t.name)
//           //   : [];

//           var content = `
// JAKE_TASKS += ${taskList.join(" ")}

// Jakefile.js: $(wildcard ${computedDependencies.join(" ")})

// clean:
// \t#rm -f ${
//             computedDependencies
//               .filter(f => !/node_modules|[.]d[.]ts/.test(f))
//               .map(f => f.replace(".ts", ".js") + " " + f.replace(".ts", ".dep.*"))
//               .join(" ")
//             }
// `;
//           Fs.writeFileSync(jakefileDepMk, content);
//           this.complete();
//         });
//       }, { async: true });

//       return jakefileDepMk;
//     })
//     ;
//   return CreatePlaceHolderTask("compile_jakefiles", dependencies);
// }

// namespace("jts", function () {
//   CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
// });

namespace("jts", function () {
  Jakets.GlobalTask("setup", [CompileJakefile(".")]);
});