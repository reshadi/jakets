"use strict";
var fs = require("fs");
var path = require("path");
var Crypto = require("crypto");
var Jake = require("./Jake");
exports.exec = Jake.Exec;
exports.shell = Jake.Shell;
exports.Log = Jake.Log;
exports.LogTask = Jake.LogTask;
var NodeUtil = require("./NodeUtil");
var Bower = require("./Bower");
exports.bower = Bower.Exec;
var Tsc = require("./Tsc");
exports.tsc = Tsc.Exec;
var Browserify = require("./Browserify");
exports.browserify = Browserify.Exec;
var Closure = require("./Closure");
exports.closure = Closure.Exec;
var jakeCmd = NodeUtil.GetNodeCommand("jake", "jake --version", "jake/bin/cli.js");
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
var NodeModulesUpdateIndicator = MakeRelativeToWorkingDir("node_modules/.node_modules_updated");
// let TypingsDefs = "typings/main.d.ts";
// let TypingsJson = MakeRelativeToWorkingDir("typings.json");
var JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");
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
rule(new RegExp(NodeModulesUpdateIndicator), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var indicator = this.name;
    var packageJson = this.source;
    Jake.Log("updating file " + indicator + " from package file " + packageJson, 1);
    var packageDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    Jake.Exec([
        "cd " + packageDir
            + " && npm install"
            + " && npm update"
            + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
    ], function () {
        exports.shell.echo(indicator);
        _this.complete();
        Jake.LogTask(_this, 2);
    });
}, { async: true });
// desc("create empty package.json if missing");
file("package.json", [], function () {
    var _this = this;
    Jake.Log(this.name, 3);
    console.error("Generating package.json");
    var NPM = path.join("npm");
    exports.exec([NPM + " init"], function () { _this.complete(); Jake.LogTask(_this, 2); });
}, { async: true });
// 
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// setup
function CreatePlaceHolderTask(taskName, dependencies) {
    var t = task(taskName, dependencies, function () {
        Jake.LogTask(this, 2);
    });
    Jake.LogTask(t, 2);
    if (t["name"] !== taskName) {
        Jake.Log(taskName + " != " + t["name"]);
    }
    return taskName;
}
function UpdatePackages(directories) {
    var dependencies = directories
        .filter(function (targetDir) {
        return targetDir.indexOf("node_modules") === -1 //Don't run npm install if this is checked out as part of another npm install
            && fs.existsSync(path.join(targetDir, "package.json"));
    })
        .map(function (targetDir) {
        return MakeRelativeToWorkingDir(path.join(targetDir, NodeModulesUpdateIndicator));
    })
        .concat(directories
        .map(function (targetDir) { return MakeRelativeToWorkingDir(path.join(targetDir, "Makefile")); })
        .filter(function (targetDir) { return fs.existsSync(targetDir); }));
    return CreatePlaceHolderTask("update_packages", dependencies);
}
exports.UpdatePackages = UpdatePackages;
function GetDependencyInfo(data) {
    var hash = Crypto.createHash("sha1");
    hash.update(JSON.stringify(data));
    var value = hash.digest("hex");
    var depDir = exports.MakeRelative(path.join(exports.BuildDir, "dep"));
    var depFile = depDir + "/" + data.name + "_" + value + ".json";
    depDir = path.dirname(depFile);
    directory(depDir);
    var allDependencies = [depDir].concat(data.dependencies);
    if (fs.existsSync(depFile)) {
        var depStr = fs.readFileSync(depFile, 'utf8');
        try {
            var dep = JSON.parse(depStr);
            var previousDependencies = dep.dependencies.concat(dep.files);
            var existingDependencies = previousDependencies.filter(function (d) { return d && fs.existsSync(d); });
            allDependencies = allDependencies.concat(existingDependencies);
        }
        catch (e) {
            console.error("Regenerating the invalid dep file: " + depFile);
            allDependencies = [];
        }
    }
    var result = {
        DepFile: depFile,
        AllDependencies: allDependencies
    };
    return result;
}
function ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror) {
    if (error) {
        console.error("\n" + error + "\n" + stdout + "\n" + stderror);
        throw error;
    }
    data.files =
        stdout
            .split("\n")
            .map(function (f) { return f.trim(); })
            .filter(function (f) { return !!f; })
            .map(function (f) { return MakeRelativeToWorkingDir(f); });
    fs.writeFileSync(depInfo.DepFile, JSON.stringify(data, null, ' '));
}
function TscTask(name, dependencies, command, excludeExternal) {
    command += " --listFiles --noEmitOnError";
    if (!excludeExternal) {
        command += " --baseUrl ./node_modules";
    }
    var data = {
        name: name,
        dir: path.resolve(exports.LocalDir),
        command: command,
        dependencies: dependencies,
        files: []
    };
    var depInfo = GetDependencyInfo(data);
    file(depInfo.DepFile, depInfo.AllDependencies, function () {
        var _this = this;
        exports.tsc(command, function (error, stdout, stderror) {
            ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror);
            // let callback = () => {
            _this.complete();
            exports.LogTask(_this, 2);
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
    return depInfo.DepFile;
}
exports.TscTask = TscTask;
function BrowserifyTask(name, dependencies, output, inputs, isRelease, tsargs, options) {
    var data = {
        name: name,
        dir: path.resolve(exports.LocalDir),
        output: output,
        inputs: inputs,
        isRelease: isRelease,
        tsargs: tsargs,
        options: options,
        dependencies: dependencies
    };
    var depInfo = GetDependencyInfo(data);
    file(depInfo.DepFile, depInfo.AllDependencies, function () {
        var _this = this;
        exports.browserify(inputs, output, function (error, stdout, stderror) {
            ExtractFilesAndUpdateDependencyInfo(data, depInfo, error, stdout, stderror);
            _this.complete();
            exports.LogTask(_this, 2);
        }, isRelease, tsargs, (options || "") + " --list", true);
    }, { async: true });
    file(output, [depInfo.DepFile], function () {
        var _this = this;
        exports.browserify(inputs, output, function () {
            _this.complete();
            exports.LogTask(_this, 2);
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
    directories = directories.filter(function (d, index, array) { return array.indexOf(d) === index; }); //Remove repeates in case later we add more
    Jake.Log("LocalDir=" + exports.LocalDir + "  - JaketsDir=" + JaketsDir + " - Dirs=[" + directories.join(",") + "]", 3);
    var updateTypingsTaskName = UpdatePackages(directories); // UpdateTypings(directories);
    var dependencies = directories
        .filter(function (targetDir) { return fs.existsSync(targetDir); })
        .map(function (targetDir) {
        var jakefileTs = path.join(targetDir, "Jakefile.ts");
        var jakefileJs = jakefileTs.replace(".ts", ".js");
        var jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
        var jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");
        var resultTarget;
        var dependencies = [updateTypingsTaskName];
        jakefileDepJson = TscTask("Jakefile", dependencies, "--module commonjs  --inlineSourceMap --noEmitOnError --listFiles " + jakefileTs);
        file(jakefileDepMk, [jakefileDepJson], function () {
            var computedDependencies;
            var depStr = fs.readFileSync(jakefileDepJson, 'utf8');
            try {
                var dep = JSON.parse(depStr);
                computedDependencies = dep.dependencies.concat(dep.files);
            }
            catch (e) {
                console.error("Invalid dep file: " + jakefileDepJson);
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
            var tasks = jake.Task;
            var taskList = tasks
                ? Object.keys(tasks).map(function (key) { return tasks[key]; }).filter(function (t) { return !!t.description; }).map(function (t) { return t.name; })
                : [];
            var content = "\nJAKE_TASKS += " + taskList.join(" ") + "\n\nJakefile.js: $(wildcard " + computedDependencies.join(" ") + ")\n\nclean:\n\t#rm -f " + computedDependencies
                .filter(function (f) { return !/node_modules|[.]d[.]ts/.test(f); })
                .map(function (f) { return f.replace(".ts", ".js") + " " + f.replace(".ts", ".dep.*"); })
                .join(" ") + "\n";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxFQUFFLFdBQU0sSUFBSSxDQUFDLENBQUE7QUFDekIsSUFBWSxJQUFJLFdBQU0sTUFBTSxDQUFDLENBQUE7QUFDN0IsSUFBWSxNQUFNLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFFakMsSUFBWSxJQUFJLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDcEIsWUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDakIsYUFBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsV0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDZixlQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUVsQyxJQUFZLFFBQVEsV0FBTSxZQUFZLENBQUMsQ0FBQTtBQUV2QyxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUN0QixhQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUU5QixJQUFZLEdBQUcsV0FBTSxPQUFPLENBQUMsQ0FBQTtBQUNsQixXQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztBQUUxQixJQUFZLFVBQVUsV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUNoQyxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFFeEMsSUFBWSxPQUFPLFdBQU0sV0FBVyxDQUFDLENBQUE7QUFDMUIsZUFBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFFbEMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUVuRiwwRkFBMEY7QUFDMUYsa0JBQWtCO0FBRWxCLG1FQUFtRTtBQUN4RCxnQkFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVwQyxrQ0FBeUMsUUFBZ0I7SUFDdkQsRUFB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