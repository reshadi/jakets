"use strict";
var fs = require("fs");
var path = require("path");
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
desc("update typings/main.d.ts from package.json");
rule(new RegExp(TypingsDefs.replace(".", "[.]")), function (name) { return path.join(path.dirname(name), "..", "package.json"); }, [], function () {
    var _this = this;
    var typingsDeclarations = this.name;
    var packageJson = this.source;
    jake.Log("updating file " + typingsDeclarations + " from package file " + packageJson, 1);
    jake.Log("" + packageJson, 3);
    var typingsDir = path.dirname(typingsDeclarations);
    var currDir = path.dirname(packageJson);
    var pkgStr = fs.readFileSync(packageJson, 'utf8');
    var pkg = JSON.parse(pkgStr);
    var dependencies = pkg["dependencies"] || {};
    var additionalTypings = pkg["addTypings"] || {};
    var pkgNames = Object.keys(dependencies);
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
    pkgNames.unshift("", "node");
    jake.Log(dependencies, 3);
    //We need to look this up the last moment to make sure correct path is picked up
    var typingsCmd = NodeUtil.GetNodeCommand("typings", "typings --version ", "typings/dist/bin.js");
    var command = pkgNames.reduce(function (fullcmd, pkgName) { return fullcmd + " && ( " + typingsCmd + " install " + pkgName + " --ambient --save || true ) "; }, "");
    exports.shell.mkdir("-p", typingsDir);
    jake.Exec([
        "cd " + currDir
            + " && touch " + TypingsJson
            + command
            + " && touch " + TypingsDefs //We already CD to this folder, so use the short name
    ], function () {
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
function CompileJakefiles(directories) {
    if (!directories) {
        directories = [];
    }
    directories.push(".");
    if (MakeRelativeToWorkingDir(JaketsDir) !== ".") {
        directories.push(JaketsDir);
        directories.push(MakeRelativeToWorkingDir("node_modules/jakets"));
    }
    directories = directories.filter(function (d, index, array) { return array.indexOf(d) === index; }); //Remove repeates in case later we add more
    jake.Log("LocalDir=" + exports.LocalDir + "  - JaketsDir=" + JaketsDir + " - Dirs=[" + directories.join(",") + "]", 3);
    var updateTypingsTaskName = UpdateTypings(directories);
    var dependencies = directories
        .filter(function (targetDir) { return fs.existsSync(targetDir); })
        .map(function (targetDir) {
        var jakefileTs = path.join(targetDir, "Jakefile.ts");
        var jakefileJs = jakefileTs.replace(".ts", ".js");
        var resultTarget;
        var dependencies = [updateTypingsTaskName];
        var compileJakefileTs = function () {
            var _this = this;
            exports.tsc("--module commonjs --inlineSourceMap " + MakeRelativeToWorkingDir(path.join(__dirname, TypingsDefs)) + " " + jakefileTs, function () { _this.complete(); jake.LogTask(_this, 2); });
        };
        var targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
        var hasDependency = fs.existsSync(targetJakefileDependencies);
        if (!hasDependency) {
            //Compile unconditionally since it seems file was never compiled before and need to be sure
            var compileJakefileTaskName = "compile_Jakefile_in_" + path.basename(targetDir);
            task(compileJakefileTaskName, [updateTypingsTaskName], compileJakefileTs, { async: true });
            dependencies.push(compileJakefileTaskName);
            resultTarget = "setup_all_for_" + path.basename(targetDir);
            task(resultTarget, dependencies, function () {
                jake.LogTask(this, 2);
            });
        }
        else {
            //Compile conditionally since it seems file was already compiled before and we know what it depends on
            var depStr = fs.readFileSync(targetJakefileDependencies, 'utf8');
            dependencies = dependencies.concat(JSON.parse(depStr));
            resultTarget = jakefileJs;
            file(jakefileJs, dependencies, compileJakefileTs, { async: true });
        }
        return resultTarget;
    });
    return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}
exports.CompileJakefiles = CompileJakefiles;
namespace("jts", function () {
    CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
    task("generate_dependencies", [JakefileDependencies], function () { });
    file(JakefileDependencies, ["Jakefile.js"], function () {
        //We will add all imported Jakefile.js file as well as any local .js files that each one might be referencing.
        //Also we assumt his rule is called from a local directory and it will create the files in that directory.
        var jakefilePattern = /(Jakefile.*)\.js$/;
        var jsJakeFiles = Object.keys(require('module')._cache)
            .filter(function (m) { return m.search(jakefilePattern) > -1; })
            .map(MakeRelativeToWorkingDir);
        var tsJakeFiles = jsJakeFiles
            .map(function (f) { return f.replace(jakefilePattern, "$1.ts"); });
        var dependencies = tsJakeFiles; //TODO: add other local modules.
        fs.writeFileSync(JakefileDependencies, JSON.stringify(dependencies));
        var jakeFileMk = "Jakefile.dep.mk";
        var taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
        var taskList = taskListRaw && taskListRaw.match(/^jake ([-\w]*)/gm);
        if (taskList) {
            taskList = taskList.map(function (t) { return t.match(/\s.*/)[0]; });
            jake.Log("Found public tasks " + taskList, 1);
            var content = ""
                + "JAKE_TASKS = " + taskList.join(" ") + "\n"
                + "\n"
                + "Jakefile.js: " + dependencies.join(" ") + "\n"
                + "\n"
                + "clean:\n"
                + "\t#rm -f " + jsJakeFiles.join(" ") + "\n"
                + "\trm -f " + jsJakeFiles.map(function (f) { return f + ".map"; }).join(" ") + "\n";
            fs.writeFileSync(jakeFileMk, content);
        }
    });
});
// 
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxFQUFFLFdBQU0sSUFBSSxDQUFDLENBQUE7QUFDekIsSUFBWSxJQUFJLFdBQU0sTUFBTSxDQUFDLENBQUE7QUFFN0IsSUFBWSxJQUFJLFdBQU0sUUFBUSxDQUFDLENBQUE7QUFDcEIsWUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDakIsYUFBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsV0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDZixlQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUVsQyxJQUFZLFFBQVEsV0FBTSxZQUFZLENBQUMsQ0FBQTtBQUV2QyxJQUFZLEtBQUssV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUN0QixhQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUU5QixJQUFZLEdBQUcsV0FBTSxPQUFPLENBQUMsQ0FBQTtBQUNsQixXQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztBQUUxQixJQUFZLFVBQVUsV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUNoQyxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFFeEMsSUFBWSxPQUFPLFdBQU0sV0FBVyxDQUFDLENBQUE7QUFDMUIsZUFBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFFbEMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUVuRiwwRkFBMEY7QUFDMUYsa0JBQWtCO0FBRWxCLG1FQUFtRTtBQUN4RCxnQkFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVwQyxrQ0FBeUMsUUFBZ0I7SUFDdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFD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