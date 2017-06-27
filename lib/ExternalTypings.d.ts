
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



/**
 * Creates a Jake FileTask.
 * @name name The name of the Task
 * @param prereqs Prerequisites to be run before this task
 * @param action The action to perform for this task
 * @param opts Perform this task asynchronously. If you flag a task with this option, you must call the global `complete` method inside the task's action, for execution to proceed to the next task.
 */
declare function file(name:string, prereqs?:string[], action?:()=>void, opts?:jake.FileTaskOptions): jake.FileTask;
declare function file(name:string, action?:()=>void, opts?:jake.FileTaskOptions): jake.FileTask;
declare function file(name:string, opts?:jake.FileTaskOptions, action?:()=>void): jake.FileTask;
