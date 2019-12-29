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
let PackageJsonTask = Jakets.FileTask(Jakets.MakeRelativeToWorkingDir("package.json"), [], function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        this.Log("Missing package.json", 3, true);
        console.error("Generating package.json");
        var NPM = Path.join("npm");
        return Jakets.ExecAsync(NPM + " init"); //], () => { this.complete(); Jake.LogTask(this, 2); });
    });
});
let NpmUpdateTask = Jakets.FileTask(Util.NodeModulesUpdateIndicator, [PackageJsonTask, Jakets.MakeRelativeToWorkingDir("Makefile")], function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Jakets.Log(`updating file ${this.GetName()} from package file ${PackageJsonTask.GetName()}`, 1);
        return Jakets.ExecAsync(`npm install && touch ${this.GetName()}`);
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
            let taskList = !publicTasks.StdErr && publicTasks.StdOut.match(/^jake ([-:\w]+)/gm);
            if (taskList) {
                taskList = taskList.map(t => t.replace(/^jake /, "")).filter(t => t.indexOf(":") === -1);
                Jakets.Log(`Public tasks: ${taskList.join(" ")}`, 1);
            }
            else {
                Jakets.Log(`No public tasks?`, 1);
                Jakets.Log(`StdOut:\n${publicTasks.StdOut}`, 1);
                Jakets.Log(`StdErr:\n${publicTasks.StdErr}`, 1);
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
Jakets.GlobalTaskNs("setup", "jts", [CompileJakefile(".")]);
// 
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRzdCLCtCQUErQjtBQUMvQixtQ0FBbUM7QUFDbkMsbUNBQW1DO0FBQ25DLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSwwRkFBMEY7QUFDMUYsUUFBUTtBQUVSLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFOUUsaURBQWlEO0FBQ2pELDhIQUE4SDtBQUM5SCx1Q0FBdUM7QUFDdkMsMkNBQTJDO0FBQzNDLGtGQUFrRjtBQUVsRixnREFBZ0Q7QUFFaEQsK0RBQStEO0FBQy9ELGtCQUFrQjtBQUNsQix5QkFBeUI7QUFDekIsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6Qix3R0FBd0c7QUFDeEcsZUFBZTtBQUNmLGtDQUFrQztBQUNsQyx1QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLFFBQVE7QUFDUix1QkFBdUI7QUFFdkIsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFOztRQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUEsd0RBQXdEO0lB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