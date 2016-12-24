"use strict";
const ChildProcess = require("child_process");
const Semver = require("semver");
const Jake = require("./Jake");
const Util = require("./Util");
function GetVersionChangeInfo(callback) {
    ChildProcess.exec("git diff HEAD~1 -- package.json", (error, stdout, stderr) => {
        if (!error) {
            const GetVersion = (pattern, str) => {
                let match = pattern.exec(str);
                return match && match[0];
            };
            let prevVersion = GetVersion(/-\s*"version"\s*:\s*"([^"]*)"/, stdout);
            let currVersion = GetVersion(/+\s*"version"\s*:\s*"([^"]*)"/, stdout);
            callback({ Current: currVersion, Previous: prevVersion });
        }
    });
}
function UpdateVersionRangeTags(callback) {
    Jake.Log(Util.LocalDir, 0);
    // "git tag -l"
    ChildProcess.exec("git show-ref --tags", { cwd: Util.LocalDir }, (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        Jake.Log(stdout, 0);
        const tagInfo = stdout.split("\n");
        const GitTagPattern = /^([0-9a-z]*) refs\/tags\/(.*)/;
        let hashes = new Map();
        let versions = [];
        let ranges = [];
        for (let tagStr of tagInfo) {
            let match = GitTagPattern.exec(tagStr);
            if (match) {
                let [_, hash, version] = match;
                if (Semver.valid(version)) {
                    versions.push(version);
                    hashes.set(version, hash);
                }
                else if (Semver.validRange(version)) {
                    ranges.push(version);
                    hashes.set(version, hash);
                }
            }
        }
        for (let version of versions) {
            let range;
            for (let r of ranges) {
                if (Semver.satisfies(version, r)) {
                    range = r;
                    break;
                }
            }
            if (!range) {
                range = `v${Semver.major(version)}.x.x`;
                ranges.push(range);
            }
        }
        let cmds = [];
        for (let range of ranges) {
            let maxVer = Semver.maxSatisfying(versions, range);
            if (hashes.get(range) !== hashes.get(maxVer)) {
                cmds.push(`git tag -f ${range} ${maxVer}`);
            }
        }
        Jake.Log([versions, ranges, cmds], 0);
        Jake.Exec(cmds, callback);
    });
}
task("update_version_range_tags", function () {
    UpdateVersionRangeTags(() => this.complete());
}, { async: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdpdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDhDQUE4QztBQUM5QyxpQ0FBaUM7QUFFakMsK0JBQStCO0FBQy9CLCtCQUErQjtBQUUvQiw4QkFBOEIsUUFBbUU7SUFDL0YsWUFBWSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTTtRQUN6RSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQWUsRUFBRSxHQUFXO2dCQUM5QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QixNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUE7WUFDRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsK0JBQStCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEUsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLCtCQUErQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3RFLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDNUQsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVVELGdDQUFnQyxRQUFvQjtJQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0IsZUFBZTtJQUNmLFlBQVksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNO1FBQ3JGLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FB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