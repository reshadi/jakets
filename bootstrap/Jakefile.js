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
            fs.writeFileSync(path.join(typesPkgDir, f + ".ts"), "import \"../../typings/" + f + "\";");
            fs.writeFileSync(path.join(typingsDir, f + ".ts"), "/// <reference path='./" + f + ".d.ts'/>");
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
function TscTask(name, dependencies, command) {
    command += " --listFiles --noEmitOnError";
    var hash = Crypto.createHash("sha1");
    hash.update(command + dependencies.join(" "));
    var value = hash.digest("hex");
    var depDir = exports.MakeRelative(path.join(exports.BuildDir, "dep"));
    var depFile = depDir + "/" + name + "_" + value + ".json";
    directory(depDir);
    var allDependencies = [depDir].concat(dependencies);
    if (fs.existsSync(depFile)) {
        var depStr = fs.readFileSync(depFile, 'utf8');
        try {
            var dep = JSON.parse(depStr);
            var previousDependencies = dep.dependencies;
            var existingDependencies = previousDependencies.filter(function (d) { return d && fs.existsSync(d); });
            allDependencies = allDependencies.concat(existingDependencies);
        }
        catch (e) {
            console.error("Regenerating the invalid dep file: " + depFile);
            allDependencies = [];
        }
    }
    file(depFile, allDependencies, function () {
        var _this = this;
        exports.tsc(command, function (error, stdout, stderror) {
            if (error) {
                console.error("\n" + error + "\n" + stdout + "\n" + stderror);
                throw error;
            }
            var localDirFullpath = path.resolve(exports.LocalDir);
            var files = stdout
                .split("\n")
                .map(function (f) { return f.trim(); })
                .filter(function (f) { return !!f; })
                .map(function (f) { return MakeRelativeToWorkingDir(f); });
            fs.writeFileSync(depFile, JSON.stringify({
                dir: localDirFullpath,
                command: command,
                dependencies: files.concat(dependencies)
            }, null, ' '));
            _this.complete();
            exports.LogTask(_this, 2);
        }, true);
    }, { async: true });
    return depFile;
}
exports.TscTask = TscTask;
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
                computedDependencies = dep.dependencies;
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