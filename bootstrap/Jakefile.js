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
var JakefileDependencies = MakeRelativeToWorkingDir("Jakefile.dep.json");
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
var CommandInfo = (function () {
    function CommandInfo(data) {
        this.Data = data;
        var hash = Crypto.createHash("sha1");
        hash.update(JSON.stringify(data));
        var value = hash.digest("hex");
        var depDir = exports.MakeRelative(path.join(exports.BuildDir, "dep"));
        this.DependencyFile = depDir + "/" + data.Name + "_" + value + ".json";
        //In case data.name had some / in it, we need to re-calculate the dir
        depDir = path.dirname(this.DependencyFile);
        directory(depDir);
        this.AllDependencies = [depDir].concat(data.Dependencies);
    }
    CommandInfo.prototype.Read = function () {
        if (fs.existsSync(this.DependencyFile)) {
            var depStr = fs.readFileSync(this.DependencyFile, 'utf8');
            try {
                var dep = JSON.parse(depStr);
                var previousDependencies = dep.Dependencies.concat(dep.Files);
                var existingDependencies = previousDependencies.filter(function (d) { return d && fs.existsSync(d); });
                this.AllDependencies = this.AllDependencies.concat(existingDependencies);
            }
            catch (e) {
                console.error("Regenerating the invalid dep file: " + this.DependencyFile);
                this.AllDependencies = [];
            }
        }
    };
    CommandInfo.prototype.Write = function (files) {
        if (files) {
            this.Data.Files = files;
        }
        fs.writeFileSync(this.DependencyFile, JSON.stringify(this.Data, null, ' '));
    };
    return CommandInfo;
}());
exports.CommandInfo = CommandInfo;
function ExtractFilesAndUpdateDependencyInfo(cmdInfo, error, stdout, stderror) {
    if (error) {
        console.error("\n" + error + "\n" + stdout + "\n" + stderror);
        throw error;
    }
    var files = stdout
        .split("\n")
        .map(function (f) { return f.trim(); })
        .filter(function (f) { return !!f; })
        .map(function (f) { return MakeRelativeToWorkingDir(f); });
    cmdInfo.Write(files);
}
exports.ExtractFilesAndUpdateDependencyInfo = ExtractFilesAndUpdateDependencyInfo;
function TscTask(name, dependencies, command, excludeExternal) {
    command += " --listFiles --noEmitOnError";
    if (!excludeExternal) {
        command += " --baseUrl ./node_modules";
    }
    var depInfo = new CommandInfo({
        Name: name,
        Dir: path.resolve(exports.LocalDir),
        Command: command,
        Dependencies: dependencies,
        Files: []
    });
    file(depInfo.DependencyFile, depInfo.AllDependencies, function () {
        var _this = this;
        exports.tsc(command, function (error, stdout, stderror) {
            ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
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
    return depInfo.DependencyFile;
}
exports.TscTask = TscTask;
function BrowserifyTask(name, dependencies, output, inputs, isRelease, tsargs, options) {
    var depInfo = new CommandInfo({
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
        var _this = this;
        exports.browserify(inputs, output, function (error, stdout, stderror) {
            ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
            _this.complete();
            exports.LogTask(_this, 2);
        }, isRelease, tsargs, (options || "") + " --list", true);
    }, { async: true });
    file(output, [depInfo.DependencyFile], function () {
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
                computedDependencies = dep.Dependencies.concat(dep.Files);
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