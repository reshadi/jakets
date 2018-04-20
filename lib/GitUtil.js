"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Semver = require("semver");
const Jakets = require("./Jakets");
const Util = require("./Util");
function GetRemoteRepoInfo() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let result = yield Jakets.ExecAsync("git remote -v");
        let lines = result.StdOut.split("\n");
        Jakets.Log(result.StdOut, 0);
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
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let result = yield Jakets.ExecAsync("git diff HEAD~1 -- package.json");
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
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Jakets.Log(Util.LocalDir, 0);
        // "git tag -l"
        let tagInfo;
        try {
            //Since we always have commits in the repo, the other commands wont fail. But the following can fail
            let rawTagInfo = yield Jakets.ExecAsync("git show-ref --tags");
            tagInfo = rawTagInfo.StdOut.split("\n");
            Jakets.Log(rawTagInfo.StdOut, 0);
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
        if (versionChangeInfo.Current && versionChangeInfo.Previous && versionChangeInfo.Hash) {
            //Current head is a version change
            if (!version2hash.get(versionChangeInfo.Current)) {
                //We don't have a tag for the current version;
                localCmds.push(`git tag -f ${versionChangeInfo.Current} ${versionChangeInfo.Hash}`);
                versions.push(versionChangeInfo.Current);
                version2hash.set(versionChangeInfo.Current, versionChangeInfo.Hash);
            }
        }
        for (let version of versions) {
            let range = "";
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
        let writableRemote = ""; //TODO: can we check each tag in each remote and decide to update or not?
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
            if (maxVer && version2hash.get(range) !== version2hash.get(maxVer)) {
                localCmds.push(`git tag -f ${range} ${maxVer}`);
                remoteCmds.push(`git push ${writableRemote} :refs/tags/${range}`);
            }
        }
        Jakets.Log([versions, ranges, localCmds, remoteCmds], 0);
        yield Jakets.ExecAsyncAll(localCmds);
        if (localCmds.length || remoteCmds.length) {
            remoteCmds.push(`git push ${writableRemote} --tags`);
            console.log("# Call the following commands");
            console.log("# " + remoteCmds.join("\n# "));
        }
        if (runRemoveCmds && remoteCmds.length) {
            yield Jakets.ExecAsyncAll(remoteCmds);
        }
        return remoteCmds;
    });
}
Jakets.GlobalTask("update_version_range_tags")
    .Description("update all tags for version and range releases")
    .Action(UpdateVersionRangeTags);
// desc("update all tags for version and range releases");
// task("update_version_range_tags", function (runRemoveCmds?: boolean) {
//   UpdateVersionRangeTags(runRemoveCmds)
//     .then(() => this.complete());
// }, { async: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdpdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaUNBQWlDO0FBRWpDLG1DQUFtQztBQUNuQywrQkFBK0I7QUFFL0I7O1FBQ0UsSUFBSSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sR0FBcUMsRUFBRSxDQUFDO1FBQ25ELEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLElBQUksS0FBSyxHQUFHLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDWCxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDZCxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDZCxDQUFDLENBQUM7YUFDSjtTQUNGO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQ7O1FBQ0UsSUFBSSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDdkUsTUFBTSxVQUFVLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDbEQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLE9BQU8sR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFD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