"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Fs = require("fs");
const Path = require("path");
const Util = require("./Util");
const Jakets = require("./Jakets");
// import * as Jake from "../Jake";
const Command = require("./Command");
const Tsc = require("./TscTask");
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
let PackageJsonTask = Jakets.FileTask(Jakets.MakeRelativeToWorkingDir("package.json"), [], function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        this.Log("Missing package.json", 3, true);
        console.error("Generating package.json");
        var NPM = Path.join("npm");
        return Jakets.ExecAsync(NPM + " init"); //], () => { this.complete(); Jake.LogTask(this, 2); });
    });
});
let NpmUpdateTask = Jakets.FileTask(NodeModulesUpdateIndicator, [PackageJsonTask, Jakets.MakeRelativeToWorkingDir("Makefile")], function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Jakets.Log(`updating file ${this.GetName()} from package file ${PackageJsonTask.GetName()}`, 1);
        return Jakets.ExecAsync(`npm update --no-save && npm dedup && touch ${this.GetName()}`);
    });
});
function CompileJakefile(targetDir) {
    let jakefileTs = Path.join(targetDir, "Jakefile.ts");
    let jakefileJs = jakefileTs.replace(".ts", ".js");
    let jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");
    let jakefileDepJson = Tsc.TscTask("Jakefile", [jakefileTs], [NpmUpdateTask], {
        module: Tsc.ModuleKind.CommonJS,
        target: Tsc.ScriptTarget.ES2015,
        inlineSourceMap: true,
        noEmitOnError: true,
        importHelpers: true,
    });
    Jakets.FileTask(jakefileJs, [jakefileDepJson], function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.Log(`Generated: ${this.GetName()}`, 1);
        });
    });
    return Jakets.FileTask(jakefileDepMk, [jakefileJs], function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let computedDependencies;
            let depStr = Fs.readFileSync(jakefileDepJson.GetName(), 'utf8');
            try {
                let dep = JSON.parse(depStr);
                computedDependencies = dep.Dependencies.concat(dep.Inputs).concat(dep.Outputs).concat(dep.Files);
            }
            catch (e) {
                console.error(`Invalid dep file: ${jakefileDepJson}`);
            }
            let publicTasks = yield Jakets.ExecAsync(`${jakeCmd} -T -f ${jakefileJs}`);
            Jakets.Log(publicTasks.StdOut);
            let taskList = !publicTasks.StdErr && publicTasks.StdOut.match(/^jake ([-:\w]*)/gm);
            if (taskList) {
                taskList = taskList.map(t => t.match(/\s.*/)[0]).filter(t => t.indexOf(":") === -1);
                Jakets.Log(`Found public tasks ${taskList}`, 1);
            }
            else {
                taskList = [];
            }
            var content = `
JAKE_TASKS += ${taskList.join(" ")}

#Jakefile.js: $(wildcard ${computedDependencies.join(" ")})

clean:
\trm -f -r $(wildcard ${computedDependencies
                .filter(f => /[.]ts$/.test(f) && !/node_modules|[.]d[.]ts/.test(f))
                .map(f => f.replace(".ts", ".js") /* + " " + f.replace(".ts", ".dep.*") */)
                .concat([jakefileDepMk, Command.DepDir])
                .join(" ")})
`;
            Fs.writeFileSync(jakefileDepMk, content);
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRzdCLCtCQUErQjtBQUMvQixtQ0FBbUM7QUFDbkMsbUNBQW1DO0FBQ25DLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSxJQUFJLDBCQUEwQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3JHLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFOUUsaURBQWlEO0FBQ2pELDhIQUE4SDtBQUM5SCx1Q0FBdUM7QUFDdkMsMkNBQTJDO0FBQzNDLGtGQUFrRjtBQUVsRixnREFBZ0Q7QUFFaEQsK0RBQStEO0FBQy9ELGtCQUFrQjtBQUNsQix5QkFBeUI7QUFDekIsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6Qix3R0FBd0c7QUFDeEcsZUFBZTtBQUNmLGtDQUFrQztBQUNsQyx1QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLFFBQVE7QUFDUix1QkFBdUI7QUFFdkIsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFOztRQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMs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