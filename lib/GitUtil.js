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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdpdFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaUNBQWlDO0FBRWpDLG1DQUFtQztBQUNuQywrQkFBK0I7QUFFL0I7O1FBQ0UsSUFBSSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sR0FBcUMsRUFBRSxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxLQUFLLEdBQUcseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1gsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2QsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ2QsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVEOztRQUNFLElBQUksTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBZSxFQUFFLEdBQVcsRUFBRSxFQUFFO1lBQ2xELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7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