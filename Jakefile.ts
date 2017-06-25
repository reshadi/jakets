
//The following is kept for backward compatibility and will be removed later
export * from "./lib/Jakets";
export {Exec as exec} from "./lib/Exec";

import * as Jake from "./Jake";
export let shell = Jake.Shell;
export let LogTask = Jake.LogTask;
export let AsyncTask = Jake.AsyncTask;
export let AsyncFile = Jake.AsyncFile;

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

import "./lib/Setup";
import "./lib/GitUtil";

desc("Default task");
task("default");
