
import * as Jake from "./Jake";
export let exec = Jake.Exec;
export let shell = Jake.Shell;
export let Log = Jake.Log;
export let LogTask = Jake.LogTask;

import * as Util from "./Util";
export let MakeRelativeToWorkingDir = Util.MakeRelativeToWorkingDir;
export let MakeRelative = Util.MakeRelativeToWorkingDir;

import * as Bower from "./Bower";
export let bower = Bower.Exec;

import * as Tsc from "./Tsc";
export let tsc = Tsc.Exec;

import * as Browserify from "./Browserify";
export let browserify = Browserify.Exec;

import * as Closure from "./Closure";
export let closure = Closure.Exec;

import "./Setup";

desc("Default task");
task("default");
