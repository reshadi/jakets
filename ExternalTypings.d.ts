/// <reference types="@types/node" />

/**
 * Creates a Jake TestTask.
 * @name name The name of the Task
 * @param prereqs Prerequisites to be run before this task
 * @param definitions The function to update/add to TestTask members
 */
declare function testTask(name: string, prereqs?: string[], definitions?: ()=>void): jake.TestTask;


/**
 * Creates a Jake PackageTask.
 * @name name The name of the Task
 * @version project version-string
 * @param prereqs Prerequisites to be run before this task
 * @param definitions The function to update/add to TestTask members
 */
declare function packageTask(name: string, version: string, definitions?: ()=>void): jake.PackageTask;
// declare function packageTask(name: string, version: string, prereqs?: string[], definitions?: ()=>void): jake.PackageTask;
