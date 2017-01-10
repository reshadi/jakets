import * as ChildProcess from "child_process";
import * as Semver from "semver";

import * as Jake from "./Jake";
import * as Util from "./Util";

async function GetRemoteRepoInfo() {
  let result = await Jake.ExecAsync("git remote -v");
  let lines = result.StdOut.split("\n");
  Jake.Log(result.StdOut, 0);

  let remotes: { Name: string; Url: string; }[] = [];
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
}

async function GetVersionChangeInfo() {
  let result = await Jake.ExecAsync("git diff HEAD~1 -- package.json");
  const GetVersion = (pattern: RegExp, str: string) => {
    let match = pattern.exec(str);
    let version = match && match[1];
    if (version && version[0] !== 'v' && Semver.valid("v" + version)) {
      version = "v" + version;
    }
    return version;
  }
  let prevVersion = GetVersion(/\-\s*"version"\s*:\s*"([^"]*)"/, result.StdOut);
  let currVersion = GetVersion(/\+\s*"version"\s*:\s*"([^"]*)"/, result.StdOut);
  //TODO: optionally, if package.json was not changed, we can use `git diff-tree --name-only -r HEAD~0..n to find which commit has package.json change
  return {
    Current: currVersion,
    Previous: prevVersion,
    Hash: "HEAD"
  };
}

interface IVersion {
  Hash: string;
  Version: string;
}
interface IRange extends IVersion {
  MaxVersion?: IVersion;
}

async function UpdateVersionRangeTags(runRemoveCmds?: boolean) {
  Jake.Log(Util.LocalDir, 0);
  // "git tag -l"
  let tagInfo: string[];
  try {
    //Since we always have commits in the repo, the other commands wont fail. But the following can fail
    let rawTagInfo = await Jake.ExecAsync("git show-ref --tags");
    tagInfo = rawTagInfo.StdOut.split("\n");
    Jake.Log(rawTagInfo.StdOut, 0);
  } catch (e) {
    tagInfo = [];
  }
  const GitTagPattern = /^([0-9a-z]*) refs\/tags\/(.*)/;

  let version2hash = new Map<string, string>();
  let versions: string[] = [];
  let ranges: string[] = [];
  let localCmds: string[] = [];
  let remoteCmds: string[] = [];

  for (let tagStr of tagInfo) {
    let match = GitTagPattern.exec(tagStr);
    if (match) {
      let [_, hash, version] = match;
      if (Semver.valid(version)) {
        versions.push(version);
        version2hash.set(version, hash);
      } else if (Semver.validRange(version)) {
        ranges.push(version);
        version2hash.set(version, hash);
      }
    }
  }

  let versionChangeInfo = await GetVersionChangeInfo();
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
    let range: string;
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

  let remotes = await GetRemoteRepoInfo();
  let writableRemote: string; //TODO: can we check each tag in each remote and decide to update or not?
  for (let remote of remotes) {
    if (
      /^ssh:/.test(remote.Url) //ssh has highest priority
      || (!writableRemote && /^git@/.test(remote.Url))
    ) {
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

  await Jake.ExecAsyncAll(localCmds);

  if (localCmds.length || remoteCmds.length) {
    remoteCmds.push(`git push ${writableRemote} --tags`);
    console.log("# Call the following commands");
    console.log("# " + remoteCmds.join("\n# "));
  }

  if (runRemoveCmds && remoteCmds.length) {
    await Jake.ExecAsyncAll(remoteCmds);
  }
  return remoteCmds;
}

desc("update all tags for version and range releases");
task("update_version_range_tags", function (runRemoveCmds?: boolean) {
  UpdateVersionRangeTags(runRemoveCmds)
    .then(() => this.complete());
}, { async: true });