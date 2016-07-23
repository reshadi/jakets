"use strict";
require("@types/main");
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
        var resultTarget;
        var dependencies = [updateTypingsTaskName];
        if (fs.existsSync(jakefileDepJson)) {
            var depStr = fs.readFileSync(jakefileDepJson, 'utf8');
            var previousDependencies = JSON.parse(depStr);
            var existingDependencies = previousDependencies.filter(function (d) { return d && fs.existsSync(d); });
            dependencies = dependencies.concat(existingDependencies);
        }
        file(jakefileJs, dependencies, function () {
            var _this = this;
            exports.tsc("--module commonjs  --inlineSourceMap --noEmitOnError --listFiles " + jakefileTs, function (error, stdout, stderror) {
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
                fs.writeFileSync(jakefileDepJson, JSON.stringify(files));
                var jakefileDepMk = jakefileTs.replace(".ts", ".dep.mk");
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
                var content = "\nJAKE_TASKS += " + taskList.join(" ") + "\n\nJakefile.js: $(wildcard " + files.join(" ") + ")\n\nclean:\n\t#rm -f " + files.map(function (f) { return f.replace(".ts", ".js"); }).join(" ") + "\n\t#rm -f " + files.map(function (f) { return f.replace(".ts", ".dep.*"); }).join(" ") + "\n";
                fs.writeFileSync(jakefileDepMk, content);
                _this.complete();
            }, true);
        }, { async: true });
        return jakefileJs;
        // let compileJakefileTs = function () {
        //   tsc(
        //     // `--module commonjs --inlineSourceMap ${MakeRelativeToWorkingDir(path.join(__dirname, TypingsDefs))} ${jakefileTs}`
        //     `--module commonjs --inlineSourceMap ${jakefileTs}`
        //     , () => { this.complete(); jake.LogTask(this, 2); }
        //   );
        // };
        // let targetJakefileDependencies = path.join(targetDir, JakefileDependencies);
        // let hasDependency = fs.existsSync(targetJakefileDependencies);
        // if (!hasDependency) {
        //   //Compile unconditionally since it seems file was never compiled before and need to be sure
        //   let compileJakefileTaskName = `compile_Jakefile_in_${path.basename(targetDir)}`;
        //   task(compileJakefileTaskName, [updateTypingsTaskName], compileJakefileTs, { async: true });
        //   dependencies.push(compileJakefileTaskName);
        //   resultTarget = `setup_all_for_${path.basename(targetDir)}`;
        //   task(resultTarget, dependencies, function () {
        //     jake.LogTask(this, 2);
        //   });
        // } else {
        //   //Compile conditionally since it seems file was already compiled before and we know what it depends on
        //   let depStr: string = fs.readFileSync(targetJakefileDependencies, 'utf8');
        //   dependencies = dependencies.concat(JSON.parse(depStr));
        //   resultTarget = jakefileJs;
        //   file(jakefileJs, dependencies, compileJakefileTs, { async: true });
        // }
        // return resultTarget;
    });
    return CreatePlaceHolderTask("compile_jakefiles", dependencies);
}
exports.CompileJakefiles = CompileJakefiles;
namespace("jts", function () {
    CreatePlaceHolderTask("setup", [CompileJakefiles([])]);
    //   task("generate_dependencies", [JakefileDependencies], function () { });
    //   file(JakefileDependencies, ["Jakefile.js"], function () {
    //     //We will add all imported Jakefile.js file as well as any local .js files that each one might be referencing.
    //     //Also we assumt his rule is called from a local directory and it will create the files in that directory.
    //     var jakefilePattern = /(Jakefile.*)\.js$/;
    //     var jsJakeFiles =
    //       Object.keys(require('module')._cache)
    //         .filter(m => m.search(jakefilePattern) > -1)
    //         .map(MakeRelativeToWorkingDir)
    //       ;
    //     var tsJakeFiles =
    //       jsJakeFiles
    //         .map(f => f.replace(jakefilePattern, "$1.ts"))
    //       ;
    //     let dependencies = tsJakeFiles; //TODO: add other local modules.
    //     fs.writeFileSync(JakefileDependencies, JSON.stringify(dependencies));
    //     var jakeFileMk = "Jakefile.dep.mk";
    //     let taskListRaw = jake.Shell.exec(jakeCmd + " -T").output;
    //     let taskList = taskListRaw && taskListRaw.match(/^jake ([-\w]*)/gm);
    //     if (taskList) {
    //       taskList = taskList.map(t => t.match(/\s.*/)[0]);
    //       jake.Log(`Found public tasks ${taskList}`, 1);
    //       var content = `
    // JAKE_TASKS += ${taskList.join(" ")}
    // Jakefile.js: $(wildcard ${dependencies.join(" ")})
    // clean:
    // \t#rm -f ${jsJakeFiles.join(" ")}
    // \trm -f ${jsJakeFiles.map(f => f + ".map").join(" ")}
    // `;
    //       fs.writeFileSync(jakeFileMk, content);
    //     }
    //   });
});
task("default");
//
//////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsUUFBTyxhQUFhLENBQUMsQ0FBQTtBQUNyQixJQUFZLEVBQUUsV0FBTSxJQUFJLENBQUMsQ0FBQTtBQUN6QixJQUFZLElBQUksV0FBTSxNQUFNLENBQUMsQ0FBQTtBQUU3QixJQUFZLElBQUksV0FBTSxRQUFRLENBQUMsQ0FBQTtBQUNwQixZQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqQixhQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixXQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNmLGVBQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBRWxDLElBQVksUUFBUSxXQUFNLFlBQVksQ0FBQyxDQUFBO0FBRXZDLElBQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBQ3RCLGFBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRTlCLElBQVksR0FBRyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLFdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBRTFCLElBQVksVUFBVSxXQUFNLGNBQWMsQ0FBQyxDQUFBO0FBQ2hDLGtCQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztBQUV4QyxJQUFZLE9BQU8sV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUMxQixlQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUVsQyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBRW5GLDBGQUEwRjtBQUMxRixrQkFBa0I7QUFFbEIsbUVBQW1FO0FBQ3hELGdCQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRXBDLGtDQUF5QyxRQUFnQjtJQUN2RCxFQUFFLENBQUMsQ0FB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