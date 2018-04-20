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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyxpQ0FBNEQ7QUFFL0MsUUFBQSxNQUFNLEdBQUcsR0FBRyxlQUFRLE1BQU0sQ0FBQztBQXlCeEM7SUFVRSxZQUFZLElBQWM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxjQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQztRQUU3RCxxRUFBcUU7UUFDckUsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTyxJQUFJO1FBQ1YsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN0QyxJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEUsSUFBSTtnQkFDRixJQUFJLEdB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