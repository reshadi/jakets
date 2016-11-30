"use strict";
const Fs = require("fs");
const Path = require("path");
const ChildProcess = require("child_process");
const Util = require("./Util");
const Jake = require("./Jake");
const Tsc = require("./Tsc");
let jakeCmd = Util.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");
let NodeModulesUpdateIndicator = Util.MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
let JakefileDependencies = Util.MakeRelativeToWorkingDir("Jakefile.dep.json");
desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), name => Path.join(Path.dirname(name), "..", "package.json"), [], function () {
    let indicator = this.name;
    let packageJson = this.source;
    Jake.Log(`updating file ${indicator} from package file ${packageJson}`, 1);
    let packageDir = Path.dirname(packageJson);
    var pkgStr = Fs.readFileSync(packageJson, 'utf8');
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
    console.error("Generating package.json");
    var NPM = Path.join("npm");
    Jake.Exec([NPM + " init"], () => { this.complete(); Jake.LogTask(this, 2); });
}, { async: true });
// 
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// setup
function CreatePlaceHolderTask(taskName, dependencies) {
    let t = task(taskName, dependencies, function () {
        Jake.LogTask(this, 2);
    });
    Jake.LogTask(t, 2);
    if (t["name"] !== taskName) {
        Jake.Log(taskName + " != " + t["name"]);
    }
    return taskName;
}
function UpdatePackages(directories) {
    let dependencies = directories
        .filter(targetDir => targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
        && Fs.existsSync(Path.join(targetDir, "package.json")))
        .map(targetDir => Util.MakeRelativeToWorkingDir(Path.join(targetDir, NodeModulesUpdateIndicator)))
        .concat(directories
        .map(targetDir => Util.MakeRelativeToWorkingDir(Path.join(targetDir, "Makefile")))
        .filter(targetDir => Fs.existsSync(targetDir)));
    return CreatePlaceHolderTask("update_packages", dependencies);
}
exports.UpdatePackages = UpdatePackages;
function CompileJakefiles(directories) {
    if (!directories) {
        directories = [];
    }
    directories.push(".");
    if (Util.MakeRelativeToWorkingDir(Util.JaketsDir) !== ".") {
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
        let resultTarget;
        let dependencies = [updateTypingsTaskName];
        jakefileDepJson = Tsc.TscTask("Jakefile", dependencies, `--module commonjs --target es6 --inlineSourceMap --noEmitOnError --listFiles ${jakefileTs}`);
        file(jakefileDepMk, [jakefileDepJson], function () {
            let computedDependencies;
            let depStr = Fs.readFileSync(jakefileDepJson, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                computedDependencies = dep.Dependencies.concat(dep.Files);
            }
            catch (e) {
                console.error(`Invalid dep file: ${jakefileDepJson}`);
            }
            ChildProcess.exec(jakeCmd + " -T", (error, stdout, stderr) => {
                Jake.Log(stdout);
                let taskList = !error && stdout.match(/^jake ([-:\w]*)/gm);
                if (taskList) {
                    taskList = taskList.map(t => t.match(/\s.*/)[0]).filter(t => t.indexOf(":") === -1);
                    Jake.Log(`Found public tasks ${taskList}`, 1);
                }
                else {
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
\t#rm -f ${computedDependencies
                    .filter(f => !/node_modules|[.]d[.]ts/.test(f))
                    .map(f => f.replace(".ts", ".js") + " " + f.replace(".ts", ".dep.*"))
                    .join(" ")}
`;
                Fs.writeFileSync(jakefileDepMk, content);
                this.complete();
            });
        }, { async: true });
        return jakefileDepMk;
    });
    return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}
exports.CompileJakefiles = CompileJakefiles;
namespace("jts", function () {
    CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qiw4Q0FBOEM7QUFFOUMsK0JBQStCO0FBQy9CLCtCQUErQjtBQUUvQiw2QkFBNkI7QUFFN0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUUvRSxJQUFJLDBCQUEwQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3JHLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFOUUsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDOUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFO0lBQzVHLElBQUksU0FBUyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbEMsSUFBSSxXQUFXLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixTQUFTLHNCQUFzQixXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUzRSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRTNDLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFELElBQUksQ0FBQyxJQUFJLENBQUM7UUFDUixLQUFLLEdBQUcsVUFBVTtjQUNoQixpQkFBaUI7Y0FDakIs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