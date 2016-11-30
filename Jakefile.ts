
import * as Jake from "./Jake";
export let exec = Jake.Exec;
export let shell = Jake.Shell;
export let Log = Jake.Log;
export let LogTask = Jake.LogTask;

import * as Util from "./Util";
export let MakeRelativeToWorkingDir = Util.MakeRelativeToWorkingDir;
export let MakeRelative = Util.MakeRelativeToWorkingDir;
export let LocalDir = Util.LocalDir;
export let BuildDir = Util.BuildDir;

import * as Bower from "./Bower";
export let bower = Bower.Exec;

import * as Tsc from "./Tsc";
export let tsc = Tsc.Exec;
export let TscTask = Tsc.TscTask;

import * as Browserify from "./Browserify";
export let browserify = Browserify.Exec;
export let BrowserifyTask = Browserify.BrowserifyTask;

import * as Closure from "./Closure";
export let closure = Closure.Exec;

import "./Setup";

desc("Default task");
task("default");
