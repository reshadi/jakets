"use strict";
const fs = require("fs");
const path = require("path");
const Crypto = require("crypto");
const Jake = require("./Jake");
exports.exec = Jake.Exec;
exports.shell = Jake.Shell;
exports.Log = Jake.Log;
exports.LogTask = Jake.LogTask;
const NodeUtil = require("./NodeUtil");
const Bower = require("./Bower");
exports.bower = Bower.Exec;
const Tsc = require("./Tsc");
exports.tsc = Tsc.Exec;
const Browserify = require("./Browserify");
exports.browserify = Browserify.Exec;
const Closure = require("./Closure");
exports.closure = Closure.Exec;
let jakeCmd = NodeUtil.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");
//////////////////////////////////////////////////////////////////////////////////////////
// Types and utils
//We use the following to better clarity what we are using/checking
exports.LocalDir = process.cwd();
function MakeRelativeToWorkingDir(fullpath) {
    if (!fullpath) {
        return fullpath;
    }
    return path.relative(exports.LocalDir, fullpath)
        .replace(/\\/g, "/") //Convert \ to / on windows
        || '.' //in case the answer is empty
    ;
    // return path.relative(LocalDir, fullpath) || '.';
}
exports.MakeRelativeToWorkingDir = MakeRelativeToWorkingDir;
//For backward compatibility
exports.MakeRelative = MakeRelativeToWorkingDir;
var JaketsDir = MakeRelativeToWorkingDir(__dirname.replace("bootstrap", ""));
exports.BuildDir = process.env.BUILD__DIR || MakeRelativeToWorkingDir("./build");
//////////////////////////////////////////////////////////////////////////////////////////
// Dependencies 
let NodeModulesUpdateIndicator = MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
let JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");
desc("update node_modules from package.json");
rule(new RegExp(NodeModulesUpdateIndicator), name => path.join(path.dirname(name), "..", "package.json"), [], function () {
    let indicator = this.name;
    let packageJson = this.source;
    Jake.Log(`updating file ${indicator} from package file ${packageJson}`, 1);
    let packageDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    Jake.Exec([
        "cd " + packageDir
            + " && npm install"
            + " && npm update"
            + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
    ], () => {
        exports.shell.echo(indicator);
        this.complete();
        Jake.LogTask(this, 2);
    });
}, { async: true });
// desc("create empty package.json if missing");
file("package.json", [], function () {
    Jake.Log(this.name, 3);
    console.error("Generating package.json");
    var NPM = path.join("npm");
    exports.exec([NPM + " init"], () => { this.complete(); Jake.LogTask(this, 2); });
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
        && fs.existsSync(path.join(targetDir, "package.json")))
        .map(targetDir => MakeRelativeToWorkingDir(path.join(targetDir, NodeModulesUpdateIndicator)))
        .concat(directories
        .map(targetDir => MakeRelativeToWorkingDir(path.join(targetDir, "Makefile")))
        .filter(targetDir => fs.existsSync(targetDir)));
    return CreatePlaceHolderTask("update_packages", dependencies);
}
exports.UpdatePackages = UpdatePackages;
class CommandInfo {
    constructor(data) {
        this.Data = data;
        let hash = Crypto.createHash("sha1");
        hash.update(JSON.stringify(data));
        let value = hash.digest("hex");
        let depDir = exports.MakeRelative(path.join(exports.BuildDir, "dep"));
        this.DependencyFile = `${depDir}/${data.Name}_${value}.json`;
        //In case data.name had some / in it, we need to re-calculate the dir
        depDir = path.dirname(this.DependencyFile);
        directory(depDir);
        this.AllDependencies = [depDir].concat(data.Dependencies);
        this.Read();
    }
    Read() {
        if (fs.existsSync(this.DependencyFile)) {
            let depStr = fs.readFileSync(this.DependencyFile, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                let previousDependencies = dep.Dependencies.concat(dep.Files);
                let existingDependencies = previousDependencies.filter(d => d && fs.existsSync(d));
                this.AllDependencies = this.AllDependencies.concat(existingDependencies);
            }
            catch (e) {
                console.error(`Regenerating the invalid dep file: ${this.DependencyFile}`);
                fs.unlinkSync(this.DependencyFile);
            }
        }
    }
    Write(files) {
        if (files) {
            this.Data.Files = files;
        }
        fs.writeFileSync(this.DependencyFile, JSON.stringify(this.Data, null, ' '));
    }
}
exports.CommandInfo = CommandInfo;
function ExtractFilesAndUpdateDependencyInfo(cmdInfo, error, stdout, stderror) {
    if (error) {
        console.error(`
${error}
${stdout}
${stderror}`);
        throw error;
    }
    let files = stdout
        .split("\n")
        .map(f => f.trim())
        .filter(f => !!f)
        .map(f => MakeRelativeToWorkingDir(f));
    cmdInfo.Write(files);
}
exports.ExtractFilesAndUpdateDependencyInfo = ExtractFilesAndUpdateDependencyInfo;
function TscTask(name, dependencies, command, excludeExternal) {
    command += " --listFiles --noEmitOnError";
    if (!excludeExternal) {
        command += " --baseUrl ./node_modules";
    }
    let depInfo = new CommandInfo({
        Name: name,
        Dir: path.resolve(exports.LocalDir),
        Command: command,
        Dependencies: dependencies,
        Files: []
    });
    file(depInfo.DependencyFile, depInfo.AllDependencies, function () {
        exports.tsc(command, (error, stdout, stderror) => {
            ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
            // let callback = () => {
            this.complete();
            exports.LogTask(this, 2);
            // };
            // if (!excludeExternal) {
            //   let seenDirs: { [index: string]: number; } = {};
            //   let files = data.files.reverse().filter((f: string) => {
            //     if (/node_modules/.test(f) && !/[.]d[.]ts$/.test(f)) {
            //       let dir = path.dirname(f);
            //       let seenCount = seenDirs[dir] = ((seenDirs[dir] || 0) + 1);
            //       return seenCount <= 5;
            //     }
            //     return false;
            //   });
            //   tsc(command + " " + files.join(" "), callback, false);
            // } else {
            //   callback();
            // }
        }, true);
    }, { async: true });
    return depInfo.DependencyFile;
}
exports.TscTask = TscTask;
function BrowserifyTask(name, dependencies, output, inputs, isRelease, tsargs, options) {
    let depInfo = new CommandInfo({
        Name: name,
        Dir: path.resolve(exports.LocalDir),
        Output: output,
        Inputs: inputs,
        IsRelease: isRelease,
        Tsargs: tsargs,
        Options: options,
        Dependencies: dependencies
    });
    file(depInfo.DependencyFile, depInfo.AllDependencies, function () {
        exports.browserify(inputs, output, (error, stdout, stderror) => {
            ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
            this.complete();
            exports.LogTask(this, 2);
        }, isRelease, tsargs, (options || "") + " --list", true);
    }, { async: true });
    file(output, [depInfo.DependencyFile], function () {
        exports.browserify(inputs, output, () => {
            this.complete();
            exports.LogTask(this, 2);
        }, isRelease, tsargs, options);
    }, { async: true });
    return output;
}
exports.BrowserifyTask = BrowserifyTask;
function CompileJakefiles(directories) {
    if (!directories) {
        directories = [];
    }
    directories.push(".");
    if (MakeRelativeToWorkingDir(JaketsDir) !== ".") {
    }
    directories = directories.filter((d, index, array) => array.indexOf(d) === index); //Remove repeates in case later we add more
    Jake.Log(`LocalDir=${exports.LocalDir}  - JaketsDir=${JaketsDir} - Dirs=[${directories.join(",")}]`, 3);
    let updateTypingsTaskName = UpdatePackages(directories); // UpdateTypings(directories);
    let dependencies = directories
        .filter(targetDir => fs.existsSync(targetDir))
        .map(targetDir => {
        let jakefileTs = path.join(targetDir, "Jakefile.ts");
        let jakefileJs = jakefileTs.replace(".ts", ".js");
        let jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
        let jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");
        let resultTarget;
        let dependencies = [updateTypingsTaskName];
        jakefileDepJson = TscTask("Jakefile", dependencies, `--module commonjs --target es6 --inlineSourceMap --noEmitOnError --listFiles ${jakefileTs}`);
        file(jakefileDepMk, [jakefileDepJson], function () {
            let computedDependencies;
            let depStr = fs.readFileSync(jakefileDepJson, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                computedDependencies = dep.Dependencies.concat(dep.Files);
            }
            catch (e) {
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
            let tasks = jake.Task;
            let taskList = tasks
                ? Object.keys(tasks).map(key => tasks[key]).filter(t => !!t.description).map(t => t.name)
                : [];
            var content = `
JAKE_TASKS += ${taskList.join(" ")}

Jakefile.js: $(wildcard ${computedDependencies.join(" ")})

clean:
\t#rm -f ${computedDependencies
                .filter(f => !/node_modules|[.]d[.]ts/.test(f))
                .map(f => f.replace(".ts", ".js") + " " + f.replace(".ts", ".dep.*"))
                .join(" ")}
`;
            fs.writeFileSync(jakefileDepMk, content);
            this.complete();
        }, { async: true });
        return jakefileDepMk;
    });
    return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}
exports.CompileJakefiles = CompileJakefiles;
namespace("jts", function () {
    CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
});
desc("Default task");
task("default");
//
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBWSxFQUFFLFdBQU0sSUFBSSxDQUFDLENBQUE7QUFDekIsTUFBWSxJQUFJLFdBQU0sTUFBTSxDQUFDLENBQUE7QUFDN0IsTUFBWSxNQUFNLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFFakMsTUFBWSxJQUFJLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDcEIsWUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDakIsYUFBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsV0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDZixlQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUVsQyxNQUFZLFFBQVEsV0FBTSxZQUFZLENBQUMsQ0FBQTtBQUV2QyxNQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUN0QixhQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUU5QixNQUFZLEdBQUcsV0FBTSxPQUFPLENBQUMsQ0FBQTtBQUNsQixXQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztBQUUxQixNQUFZLFVBQVUsV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUNoQyxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFFeEMsTUFBWSxPQUFPLFdBQU0sV0FBVyxDQUFDLENBQUE7QUFDMUIsZUFBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFFbEMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUVuRiwwRkFBMEY7QUFDMUYsa0JBQWtCO0FBRWxCLG1FQUFtRTtBQUN4RCxnQkFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVwQyxrQ0FBeUMsUUFBZ0I7SUFDdkQsRUFB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