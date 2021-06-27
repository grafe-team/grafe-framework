import {
    ChildProcess,
    ChildProcessWithoutNullStreams,
    exec,
    spawn,
} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import 'colors';

const rootDir = process.argv[2];
let compiler: ChildProcessWithoutNullStreams;

interface ErrnoException extends Error {
    errno?: number;
    code?: string;
    path?: string;
    syscall?: string;
    stack?: string;
}

// check if the root dir was provided and if the root dir is a path
if (!rootDir || rootDir === path.basename(rootDir)) {
    console.error('Rootdir was not provided or is not a path!');
    process.exit(1);
}

// if the file is not beeing tested
if (!process.argv[1].endsWith('mocha')) {
    process.on('SIGSTOP', () => {
        killTask(compiler);
        process.exit(0);
    });
 
    compile(rootDir);
}

/**
 * Starts the compiling process. It first deletes everything from the build folder. After that it
 * starts the Typescript compiler and compiles. After the compiler finished it starts the backend.
 *
 * This code needs improvemnt and a lot of it...like really a lot
 * @param rootDir The root directory of the project
 */
async function compile(rootDir: string) {
    try {
        const deleteDirectory = path.join(rootDir, 'build');
        console.log('\n-- Cleaning build directory --\n'.green);
        removeEverythingFromDir(deleteDirectory);
    } catch (error) {
        console.error(
            `\nThere was an error in the cleaning stage: ${error}\n`.red
        );
        return;
    }

    try {
        console.log(`\n-- Compiling code --\n`.green);
        const code = await compileCode(rootDir);

        if (code !== 0) {
            console.error(
                `\n-- There was an error during compiling. Additional information should be above! Compiler finished with code ${code} --\n`
                    .red
            );
            return;
        }
    } catch (error) {
        console.error(
            `\nThere was an error in the compiling stage: ${error}\n`.red
        );
        return;
    }

    try {
        console.log(`\n-- Starting project --\n`.green);
        compiler = exec('node build/index.js', {
            cwd: rootDir,
        });

        compiler.stdout.pipe(process.stdout);
        compiler.stderr.pipe(process.stderr);
    } catch (error) {
        console.error(
            `\nThere was an error in the running stage: ${error}\n`.red
        );
        return;
    }
}

function removeEverythingFromDir(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            fs.unlinkSync(filePath);
        } else if (stats.isDirectory()) {
            // node 14.x
            if (typeof fs.rmSync === 'function') {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                // node 12.x
                fs.rmdirSync(filePath, { recursive: true });
            }
        }
    });
}

async function compileCode(rootDir: string) {
    return new Promise<number>((res, rej) => {
        compiler = spawn('tsc', {
            cwd: rootDir,
            shell: true,
        });

        compiler.on('error', async (error: ErrnoException) => {
            if (error.code === 'ENOENT') {
                console.warn(
                    '\n-- Unable to find Typescript globally. Falling back to using `npm run build` --'
                        .yellow
                );

                try {
                    res(await compileCodeUsingNodeModules(rootDir));
                } catch (error) {
                    rej(error);
                }
            }
        });

        compiler.stdout.pipe(process.stdout);

        compiler.stderr.pipe(process.stdout);

        compiler.on('exit', (code) => {
            res(code);
        });
    });
}

async function compileCodeUsingNodeModules(rootDir: string): Promise<number> {
    return new Promise<number>((res) => {
        const child = exec('npm run build', {
            cwd: rootDir,
        });

        res(child.exitCode);
    });
}

/**
 * This function kills all the childs of the pid.
 *
 * This code is from nodemon: https://github.com/remy/nodemon/blob/master/lib/monitor/run.js
 *
 * @param childPid The pid where all childs should be killed
 * @return void
 */
function killTask(child: ChildProcess): void {
    // is windows
    if (process.platform === 'win32') {
        // When using CoffeeScript under Windows, child's process is not node.exe
        // Instead coffee.cmd is launched, which launches cmd.exe, which starts
        // node.exe as a child process child.kill() would only kill cmd.exe, not
        // node.exe
        // Therefore we use the Windows taskkill utility to kill the process and all
        // its children (/T for tree).
        // Force kill (/F) the whole child tree (/T) by PID (/PID 123)
        exec('taskkill /pid ' + child.pid + ' /T /F');
    } else if (process.platform === 'darwin') {
        // Mac OS
        child.kill('SIGTERM');
    } else {
        // Linux
        child.kill('SIGTERM');
    }
}
