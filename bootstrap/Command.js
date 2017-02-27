"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Path = require("path");
const Crypto = require("crypto");
const Util_1 = require("./Util");
class CommandInfo {
    constructor(data) {
        this.Data = data;
        let hash = Crypto.createHash("sha1");
        hash.update(JSON.stringify(data));
        let value = hash.digest("hex");
        let depDir = Path.join(Util_1.BuildDir, "dep");
        this.DependencyFile = `${depDir}/${data.Name}_${value}.json`;
        //In case data.name had some / in it, we need to re-calculate the dir
        depDir = Path.dirname(this.DependencyFile);
        directory(depDir);
        this.AllDependencies = [depDir].concat(data.Dependencies);
        this.Read();
    }
    Read() {
        if (Fs.existsSync(this.DependencyFile)) {
            let depStr = Fs.readFileSync(this.DependencyFile, 'utf8');
            try {
                let dep = JSON.parse(depStr);
                let previousDependencies = dep.Dependencies.concat(dep.Files);
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
    Write(files) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyxpQ0FBNEQ7QUFtQjVEO0lBVUUsWUFBWSxJQUFjO1FBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxPQUFPLENBQUM7UUFFN0QscUVBQXFFO1FBQ3JFLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVPLElBQUk7UUFDVixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxNQUFNLEdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQztnQkFDSCxJQUFJLEdBQUcsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxvQkFBb0IsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlELElBQUksb0JBQW9CLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDM0UsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQzNFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNuQyw2QkFBNkI7WUFDL0IsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQWdCO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUNELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztDQUNGO0FBakRELGtDQWlEQztBQUVELDZDQUEyRSxPQUF1QixFQUFFLEtBQUssRUFBRSxNQUFjLEVBQUUsUUFBUTtJQUNqSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQztFQUNoQixLQUFLO0VBQ0wsTUFBTTtFQUNOLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDVixNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxJQUFJLEtBQUssR0FDUCxNQUFNO1NBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQztTQUNYLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2xCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQixHQUFHLENBQUMsQ0FBQyxJQUFJLCtCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBaEJELGtGQWdCQyJ9