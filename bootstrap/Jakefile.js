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
            + " && touch " + TypingsJson
            + command
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
                exports.tsc(command + " " + data.files.join(" "), callback, false);
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