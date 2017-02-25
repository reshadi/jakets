"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Semver = require("semver");
const Jake = require("./Jake");
const Util = require("./Util");
function GetRemoteRepoInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield Jake.ExecAsync("git remote -v");
        let lines = result.StdOut.split("\n");
        Jake.Log(result.StdOut, 0);
        let remotes = [];
        for (let line of lines) {
            let items = /^([^\s]+)\s+([^\s]+)\s+/.exec(line);
            if (items && items.length > 2) {
                remotes.push({
                    Name: items[1],
                    Url: items[2],
                });
            }
        }
        return remotes;
    });
}
function GetVersionChangeInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield Jake.ExecAsync("git diff HEAD~1 -- package.json");
        const GetVersion = (pattern, str) => {
            let match = pattern.exec(str);
            let version = match && match[1];
            if (version && version[0] !== 'v' && Semver.valid("v" + version)) {
                version = "v" + version;
            }
            return version;
        };
        let prevVersion = GetVersion(/\-\s*"version"\s*:\s*"([^"]*)"/, result.StdOut);
        let currVersion = GetVersion(/\+\s*"version"\s*:\s*"([^"]*)"/, result.StdOut);
        //TODO: optionally, if package.json was not changed, we can use `git diff-tree --name-only -r HEAD~0..n to find which commit has package.json change
        return {
            Current: currVersion,
            Previous: prevVersion,
            Hash: "HEAD"
        };
    });
}
function UpdateVersionRangeTags(runRemoveCmds) {
    return __awaiter(this, void 0, void 0, function* () {
        Jake.Log(Util.LocalDir, 0);
        // "git tag -l"
        let tagInfo;
        try {
            //Since we always have commits in the repo, the other commands wont fail. But the following can fail
            let rawTagInfo = yield Jake.ExecAsync("git show-ref --tags");
            tagInfo = rawTagInfo.StdOut.split("\n");
            Jake.Log(rawTagInfo.StdOut, 0);
        }
        catch (e) {
            tagInfo = [];
        }
        const GitTagPattern = /^([0-9a-z]*) refs\/tags\/(.*)/;
        let version2hash = new Map();
        let versions = [];
        let ranges = [];
        let localCmds = [];
        let remoteCmds = [];
        for (let tagStr of tagInfo) {
            let match = GitTagPattern.exec(tagStr);
            if (match) {
                let [_, hash, version] = match;
                if (Semver.valid(version)) {
                    versions.push(version);
                    version2hash.set(version, hash);
                }
                else if (Semver.validRange(version)) {
                    ranges.push(version);
                    version2hash.set(version, hash);
                }
            }
        }
        let versionChangeInfo = yield GetVersionChangeInfo();
        if (versionChangeInfo.Current && versionChangeInfo.Previous) {
            //Current head is a version change
            if (!version2hash.get(versionChangeInfo.Current)) {
                //We don't have a tag for the current version;
                localCmds.push(`git tag -f ${versionChangeInfo.Current} ${versionChangeInfo.Hash}`);
                versions.push(versionChangeInfo.Current);
                version2hash.set(versionChangeInfo.Current, versionChangeInfo.Hash);
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
        let remotes = yield GetRemoteRepoInfo();
        let writableRemote; //TODO: can we check each tag in each remote and decide to update or not?
        for (let remote of remotes) {
            if (/^ssh:/.test(remote.Url) //ssh has highest priority
                || (!writableRemote && /^git@/.test(remote.Url))) {
                //SSH has higher priority
                writableRemote = remote.Name;
            }
        }
        writableRemote = writableRemote || "";
        for (let range of ranges) {
            let maxVer = Semver.maxSatisfying(versions, range);
            if (version2hash.get(range) !== version2hash.get(maxVer)) {
                localCmds.push(`git tag -f ${range} ${maxVer}`);
                remoteCmds.push(`git push ${writableRemote} :refs/tags/${range}`);
            }
        }
        Jake.Log([versions, ranges, localCmds, remoteCmds], 0);
        yield Jake.ExecAsyncAll(localCmds);
        if (localCmds.length || remoteCmds.length) {
            remoteCmds.push(`git push ${writableRemote} --tags`);
            console.log("# Call the following commands");
            console.log("# " + remoteCmds.join("\n# "));
        }
        if (runRemoveCmds && remoteCmds.length) {
            yield Jake.ExecAsyncAll(remoteCmds);
        }
        return remoteCmds;
    });
}
desc("update all tags for version and range releases");
task("update_version_range_tags", function (runRemoveCmds) {
    UpdateVersionRangeTags(runRemoveCmds)
        .then(() => this.complete());
}, { async: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdpdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLGlDQUFpQztBQUVqQywrQkFBK0I7QUFDL0IsK0JBQStCO0FBRS9COztRQUNFLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuRCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0IsSUFBSSxPQUFPLEdBQXFDLEVBQUUsQ0FBQztRQUNuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksS0FBSyxHQUFHLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNYLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNkLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNkLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFFRDs7UUFDRSxJQUFJLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUNyRSxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQWUsRUFBRSxHQUFXO1lBQzlDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFD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