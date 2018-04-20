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
            let computedDependencies = [];
            let depStr = Fs.readFileSync(jakefileDepJson.GetName(), 'utf8');
            try {
                let dep = JSON.parse(depStr);
                computedDependencies = dep.Dependencies.concat(dep.Inputs || []).concat(dep.Outputs || []).concat(dep.Files || []);
            }
            catch (e) {
                console.error(`Invalid dep file: ${jakefileDepJson}`);
            }
            let publicTasks = yield Jakets.ExecAsync(`${jakeCmd} -T -f ${jakefileJs}`);
            Jakets.Log(publicTasks.StdOut);
            let taskList = !publicTasks.StdErr && publicTasks.StdOut.match(/^jake ([-:\w]*)/gm);
            if (taskList) {
                taskList = taskList.map(t => { let m = t.match(/\s.*/); return m ? m[0] : ""; }).filter(t => t.indexOf(":") === -1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRzdCLCtCQUErQjtBQUMvQixtQ0FBbUM7QUFDbkMsbUNBQW1DO0FBQ25DLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSxJQUFJLDBCQUEwQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3JHLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFOUUsaURBQWlEO0FBQ2pELDhIQUE4SDtBQUM5SCx1Q0FBdUM7QUFDdkMsMkNBQTJDO0FBQzNDLGtGQUFrRjtBQUVsRixnREFBZ0Q7QUFFaEQsK0RBQStEO0FBQy9ELGtCQUFrQjtBQUNsQix5QkFBeUI7QUFDekIsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6Qix3R0FBd0c7QUFDeEcsZUFBZTtBQUNmLGtDQUFrQztBQUNsQyx1QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLFFBQVE7QUFDUix1QkFBdUI7QUFFdkIsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFOztRQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMs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