"use strict";
var fs = require("fs");
var path = require("path");
var Crypto = require("crypto");
var jake = require("./Jake");
exports.exec = jake.Exec;
exports.shell = jake.Shell;
exports.Log = jake.Log;
exports.LogTask = jake.LogTask;
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
    jake.Log("updating file " + indicator + " from package file " + packageJson, 1);
    var packageDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    jake.Exec([
        "cd " + packageDir
            + " && npm install"
            + " && npm update"
            + " && touch " + NodeModulesUpdateIndicator //We already CD to this folder, so use the short name
    ], function () {
        exports.shell.echo(indicator);
        _this.complete();
        jake.LogTask(_this, 2);
    });
}, { async: true });
// desc("create empty package.json if missing");
file("package.json", [], function () {
    var _this = this;
    jake.Log(this.name, 3);
    console.error("Generating package.json");
    var NPM = path.join("npm");
    exports.exec([NPM + " init"], function () { _this.complete(); jake.LogTask(_this, 2); });
}, { async: true });
// 
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// setup
function CreatePlaceHolderTask(taskName, dependencies) {
    var t = task(taskName, dependencies, function () {
        jake.LogTask(this, 2);
    });
    jake.LogTask(t, 2);
    if (t["name"] !== taskName) {
        jake.Log(taskName + " != " + t["name"]);
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
            var callback = function () {
                _this.complete();
                exports.LogTask(_this, 2);
            };
            if (!excludeExternal) {
                var seenDirs_1 = {};
                var files = data.files.reverse().filter(function (f) {
                    if (/node_modules/.test(f) && !/[.]d[.]ts$/.test(f)) {
                        var dir = path.dirname(f);
                        var seenCount = seenDirs_1[dir] = ((seenDirs_1[dir] || 0) + 1);
                        return seenCount <= 5;
                    }
                    return false;
                });
                exports.tsc(command + " " + files.join(" "), callback, false);
            }
            else {
                callback();
            }
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
        directories.push(JaketsDir);
    }
    directories = directories.filter(function (d, index, array) { return array.indexOf(d) === index; }); //Remove repeates in case later we add more
    jake.Log("LocalDir=" + exports.LocalDir + "  - JaketsDir=" + JaketsDir + " - Dirs=[" + directories.join(",") + "]", 3);
    // let updateTypingsTaskName = UpdateTypings(directories);
    var dependencies = directories
        .filter(function (targetDir) { return fs.existsSync(targetDir); })
        .map(function (targetDir) {
        var jakefileTs = path.join(targetDir, "Jakefile.ts");
        var jakefileJs = jakefileTs.replace(".ts", ".js");
        var jakefileDepJson = jakefileTs.replace(".ts", ".dep.json");
        var jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");
        var resultTarget;
        var dependencies = []; //[updateTypingsTaskName];
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
            var taskListRaw;
            try {
                taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
            }
            catch (e) { }
            var taskList = taskListRaw && taskListRaw.match(/^jake ([-:\w]*)/gm);
            if (taskList) {
                taskList = taskList.map(function (t) { return t.match(/\s.*/)[0]; });
                jake.Log("Found public tasks " + taskList, 1);
            }
            else {
                taskList = [];
            }
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
task("default");
//
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxFQUFFLFdBQU0sSUFBSSxDQUFDLENBQUE7QUFDekIsSUFBWSxJQUFJLFdBQU0sTUFBTSxDQUFDLENBQUE7QUFDN0IsSUFBWSxNQUFNLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFFakMsSUFBWSxJQUFJLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDcEIsWUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDakIsYUFBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsV0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDZixlQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUVsQyxJQUFZLFFBQVEsV0FBTSxZQUFZLENBQUMsQ0FBQTtBQUV2QyxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUN0QixhQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUU5QixJQUFZLEdBQUcsV0FBTSxPQUFPLENBQUMsQ0FBQTtBQUNsQixXQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztBQUUxQixJQUFZLFVBQVUsV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUNoQyxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFFeEMsSUFBWSxPQUFPLFdBQU0sV0FBVyxDQUFDLENBQUE7QUFDMUIsZUFBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFFbEMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUVuRiwwRkFBMEY7QUFDMUYsa0JBQWtCO0FBRWxCLG1FQUFtRTtBQUN4RCxnQkFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVwQyxrQ0FBeUMsUUFBZ0I7SUFDdkQsRUFB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