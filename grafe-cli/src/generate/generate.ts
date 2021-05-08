import inquirer from 'inquirer';
import yargs, { Options } from 'yargs';
import fs from 'fs';
import mkdirp from 'mkdirp';
import pkgDir from 'pkg-dir';
import { Z_PARTIAL_FLUSH } from 'zlib';

export function generateCommand(yargs: yargs.Argv<{}>) {
    return yargs;
}

/**
 * Starts the prompt for generating a new component
 */
export function generateCLI() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'What do you want to generate',
            choices: ['Route', 'Middleware'],
        }
    ]).then(async (answers) => {
        if (answers.type === 'Route') {

            const rootDir = await pkgDir(process.cwd());

            let raw;
            try {
                raw = fs.readFileSync(rootDir + "/grafe.json");
            } catch (err) {
                console.log("The grafe command must be used within a grafe project.");
                return;
            }

            let data = JSON.parse(raw.toString());

            let questions = [
                {
                    type: 'input',
                    name: 'path',
                    message: 'How is the new route called'
                },
                {
                    type: 'list',
                    name: 'method',
                    message: 'Which HTTP-Method should the new route be',
                    choices: ['GET', 'POST', 'PUT', 'DELETE'],
                },
                {
                    type: 'checkbox',
                    message: 'Select the middlewares for this route',
                    name: 'middlewares',
                    choices: data.middlewares
                }
            ];

            if (questions[2].choices == undefined || questions[2]?.choices?.length == 0) {
                questions.splice(2, 1);
            }

            inquirer.prompt(questions).then(async (answers) => {
                generateRoute(answers.path, answers.method, answers.middlewares);
            });
        } else if (answers.type === "Middleware") {
            inquirer.prompt([{
                type: 'input',
                name: 'name',
                message: 'How is the Middleware called'
            }, {
                type: 'input',
                name: 'short',
                message: 'What is the shortcut for this Middleware'
            }, {
                type: 'input',
                name: 'description',
                message: 'What is the description of this Middleware',
                default: ''
            },]).then(async (answers) => {
                await generateMiddleWare(answers.name, answers.short, answers.description);
            });
        }
    });
}

/**
 * 
 * @param name The name of the middleware
 * @param short The shortcut of the middleware
 * @param description The description of the middleware
 * @returns if everything correct, creates new file
 */
export async function generateMiddleWare(name: string, short: string, description: string) {
    const rootDir = await pkgDir(process.cwd());

    let raw;
    try {
        raw = fs.readFileSync(rootDir + "/grafe.json");
    } catch (err) {
        console.log("The grafe command must be used within a grafe project.");
        return;
    }

    let data = JSON.parse(raw.toString());

    if (data.middlewares.some((item: any) => item.name === name) || data.middlewares.some((item: any) => item.value === short)) {
        console.log("Either the name or the shortcut of this middleware is already in use");
        return;
    }

    data.middlewares.push({
        name: name,
        description: description,
        value: short,
    });


    let _path = "/src/middlewares/" + short + "/";

    await mkdirp(rootDir + _path);

    _path += name + ".ts";

    fs.writeFile(rootDir + _path, '', err => {
        if (err) return console.log(err);
        console.log("Created new Middleware " + _path);
    });

    fs.writeFileSync(rootDir + "/grafe.json", JSON.stringify(data, null, 4));
}

/**
 * 
 * @param path The path of the route
 * @param method The HTTP-Method
 * @param mw List of preceding middlewares
 * @returns if everything correct, creates new file
 */
export async function generateRoute(path: string, method: string, mw: any[]) {

    const rootDir = await pkgDir(process.cwd());

    let raw;
    try {
        raw = fs.readFileSync(rootDir + "/grafe.json");
    } catch (err) {
        console.log("The grafe command must be used within a grafe project.");
        return;
    }

    let data = JSON.parse(raw.toString());

    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1);
    }

    let paths = path.split('/');

    let _path = "/src/routes/";
    for (let i = 0; i < paths.length - 1; i++) {
        _path += paths[i] + "/";
    }

    let middlewares = mw;
    if (middlewares != undefined && middlewares.length != 0) {

        for (let mid of middlewares) {
            if (!(data.middlewares.some((item: any) => item.value === mid))) {
                console.log("There is no Middleware with the shortcut " + mid);
                return;
            }
        }

        if (middlewares.length > 1) {
            for (let i = 0; i < middlewares.length - 1; i++) {
                _path += middlewares[i] + ".";
            }

            _path += middlewares[middlewares.length - 1] + "/";
        } else {
            _path += middlewares[0] + "/";
        }
    }

    await mkdirp(rootDir + _path);

    // add filename to create file with fs
    _path += paths[paths.length - 1] + "." + method.toLowerCase() + ".ts";

    if (fs.existsSync(rootDir + _path)) {
        console.log("This route does already exist");
        return;
    }

    fs.writeFile(rootDir + _path, '', err => {
        if (err) return console.log(err);
        console.log("Created new file " + _path);
    });
}