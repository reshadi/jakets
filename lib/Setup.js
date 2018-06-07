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
Jakets.GlobalTaskNs("setup", "jts", [CompileJakefile(".")]);
// 
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRzdCLCtCQUErQjtBQUMvQixtQ0FBbUM7QUFDbkMsbUNBQW1DO0FBQ25DLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSwwRkFBMEY7QUFDMUYsUUFBUTtBQUVSLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFOUUsaURBQWlEO0FBQ2pELDhIQUE4SDtBQUM5SCx1Q0FBdUM7QUFDdkMsMkNBQTJDO0FBQzNDLGtGQUFrRjtBQUVsRixnREFBZ0Q7QUFFaEQsK0RBQStEO0FBQy9ELGtCQUFrQjtBQUNsQix5QkFBeUI7QUFDekIsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6Qix3R0FBd0c7QUFDeEcsZUFBZTtBQUNmLGtDQUFrQztBQUNsQyx1QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLFFBQVE7QUFDUix1QkFBdUI7QUFFdkIsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFOztRQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUEsd0RBQXdEO0lB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