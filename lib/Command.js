"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Path = require("path");
const Crypto = require("crypto");
const Util_1 = require("./Util");
exports.DepDir = `${Util_1.BuildDir}/dep`;
class CommandInfo {
    constructor(data) {
        this.Data = data;
        let hash = Crypto.createHash("sha1");
        hash.update(JSON.stringify(data));
        let value = hash.digest("hex");
        this.DependencyFile = `${exports.DepDir}/${data.Name}_${value}.json`;
        //In case data.name had some / in it, we need to re-calculate the dir
        let depDir = Path.dirname(this.DependencyFile);
        directory(depDir);
        this.AllDependencies = [depDir].concat(data.Dependencies);
        this.Read();
    }
    Read() {
        if (Fs.existsSync(this.DependencyFile)) {
            let depStr = Fs.readFileSync(this.DependencyFile, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                let previousDependencies = dep.Dependencies;
                if (dep.Inputs) {
                    previousDependencies = previousDependencies.concat(dep.Inputs);
                }
                if (dep.Files) {
                    previousDependencies = previousDependencies.concat(dep.Files);
                }
                let existingDependencies = previousDependencies.filter(d => d && Fs.existsSync(d));
                this.AllDependencies = this.AllDependencies.concat(existingDependencies);
            }
            catch (e) {
                console.error(`Regenerating the invalid dep file: ${this.DependencyFile}`);
                Fs.unlinkSync(this.DependencyFile);
                // this.AllDependencies = [];
            }
        }
    }
    Write(inputs, outputs, files) {
        if (inputs) {
            this.Data.Inputs = inputs;
        }
        if (outputs) {
            this.Data.Outputs = outputs;
        }
        if (files) {
            this.Data.Files = files;
        }
        Fs.writeFileSync(this.DependencyFile, JSON.stringify(this.Data, null, ' '));
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
        .map(f => Util_1.MakeRelativeToWorkingDir(f));
    cmdInfo.Write(files);
}
exports.ExtractFilesAndUpdateDependencyInfo = ExtractFilesAndUpdateDependencyInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyxpQ0FBNEQ7QUFFL0MsUUFBQSxNQUFNLEdBQUcsR0FBRyxlQUFRLE1BQU0sQ0FBQztBQXlCeEMsTUFBYSxXQUFXO0lBVXRCLFlBQVksSUFBYztRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLGNBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDO1FBRTdELHFFQUFxRTtRQUNyRSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMvQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVPLElBQUk7UUFDVixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3RDLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRSxJQUFJO2dC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