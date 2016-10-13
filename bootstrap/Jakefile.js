"use strict";
require("@types/main");
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
var TypingsDefs = "typings/main.d.ts";
var TypingsJson = MakeRelativeToWorkingDir("typings.json");
var JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");
desc("update " + TypingsDefs + " from package.json");
rule(new RegExp(TypingsDefs.replace(".", "[.]")), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var typingsDeclarations = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + typingsDeclarations + " from package file " + packageJson, 1);
    jake.Log("" + packageJson, 3);
    var typingsDir = path.dirname(typingsDeclarations);
    var currDir = path.dirname(packageJson);
    var pkgNames;
    //Extract package names from pacakge.json for backward compatibility
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    var pkg = JSON.parse(pkgStr);
    var dependencies = pkg["dependencies"] || {};
    jake.Log(dependencies, 2);
    var additionalTypings = pkg["addTypings"] || {};
    pkgNames = Object.keys(dependencies);
    pkgNames = pkgNames.filter(function (p) { return p.lastIndexOf("@types", 6) === -1; });
    for (var typename in additionalTypings) {
        var typeSelector = additionalTypings[typename];
        var typeIndex = pkgNames.indexOf(typename);
        if (typeSelector === false || typeSelector === "-") {
            if (typeIndex !== -1) {
                //Remove this typing from the list
                pkgNames[typeIndex] = pkgNames[pkgNames.length - 1];
                --pkgNames.length;
            }
        }
        else {
            if (typeIndex === -1) {
                //add this missing type
                pkgNames.push(typename);
            }
        }
    }
    pkgNames.unshift("node");
    //Extract all package names in the node_modules/@types/
    var typesPkgDir = MakeRelativeToWorkingDir("node_modules/@types");
    pkgNames = pkgNames.concat(fs.readdirSync(typesPkgDir).filter(function (f) {
        return pkgNames.indexOf(f) === -1
            && fs.statSync(path.join(typesPkgDir, f)).isDirectory();
    }));
    jake.Log(pkgNames, 2);
    //We need to look this up the last moment to make sure correct path is picked up
    var typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
    var command = pkgNames.reduce(function (fullcmd, pkgName) { return fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) "; }, "");
    // let command = pkgNames.reduce((fullcmd, pkgName) => fullcmd + " && ( " + typingsCmd + " install dt~" + pkgName + " --global --save || true ) ", "");
    exports.shell.mkdir("-p", typingsDir);
    exports.shell.mkdir("-p", typesPkgDir);
    jake.Exec([
        "cd " + currDir
            + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
    ], function () {
        //For backward compatibility, we make the main.d.ts to point to index.d.ts
        // fs.writeFileSync(TypingsDefs, `/// <reference path='./index.d.ts'/>`);
        ["index", "main", "browser"].forEach(function (f) {
            fs.writeFileSync(path.join(typesPkgDir, f + ".ts"), "//import \"../../typings/" + f + "\";");
            fs.writeFileSync(path.join(typingsDir, f + ".ts"), "// / <reference path='./" + f + ".d.ts'/>");
        });
        exports.shell.echo(typingsDeclarations);
        _this.complete();
        jake.LogTask(_this, 2);
    });
}, { async: true });
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
function UpdateTypings(directories) {
    var taskName = "update_typings";
    var updateTask = task(taskName, [UpdatePackages(directories)], function () {
        var _this = this;
        //At this point we know that all package.json files are already installed
        //So, we can safely look for folders inside of node_modules folders as well
        var dependencies = directories
            .filter(function (targetDir) { return fs.existsSync(path.join(targetDir, "package.json")) || fs.existsSync(path.join(targetDir, "typings.json")); })
            .map(function (targetDir) { return path.join(targetDir, TypingsDefs).replace(/\\/g, "/"); });
        //Now we need to invoke all these files
        var depTask = task(taskName + "_dependencies", dependencies, function () {
            this.complete();
            jake.LogTask(this, 2);
        }, { async: true });
        depTask.addListener("complete", function () {
            _this.complete();
            jake.LogTask(_this, 2);
        });
        depTask.invoke();
        jake.LogTask(this, 2);
    }, { async: true });
    jake.LogTask(updateTask, 2);
    return taskName;
}
exports.UpdateTypings = UpdateTypings;
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
    var updateTypingsTaskName = UpdateTypings(directories);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTyxhQUFhLENBQUMsQ0FBQTtBQUNyQixJQUFZLEVBQUUsV0FBTSxJQUFJLENBQUMsQ0FBQTtBQUN6QixJQUFZLElBQUksV0FBTSxNQUFNLENBQUMsQ0FBQTtBQUM3QixJQUFZLE1BQU0sV0FBTSxRQUFRLENBQUMsQ0FBQTtBQUVqQyxJQUFZLElBQUksV0FBTSxRQUFRLENBQUMsQ0FBQTtBQUNwQixZQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqQixhQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixXQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNmLGVBQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBRWxDLElBQVksUUFBUSxXQUFNLFlBQVksQ0FBQyxDQUFBO0FBRXZDLElBQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBQ3RCLGFBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRTlCLElBQVksR0FBRyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLFdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBRTFCLElBQVksVUFBVSxXQUFNLGNBQWMsQ0FBQyxDQUFBO0FBQ2hDLGtCQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztBQUV4QyxJQUFZLE9BQU8sV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUMxQixlQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUVsQyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBRW5GLDBGQUEwRjtBQUMxRixrQkFBa0I7QUFFbEIsbUVBQW1FO0FBQ3hELGdCQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FB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