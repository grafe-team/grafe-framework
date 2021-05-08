import inquirer from 'inquirer';
import yargs, { Options } from 'yargs';
import fs from 'fs';
import mkdirp from 'mkdirp';
import pkgDir from 'pkg-dir';
import * as path from 'path';

export function generateCommand(yargs: yargs.Argv<{}>): yargs.Argv<{}> {
    return yargs;
}

/**
 * Starts the prompt for generating a new component
 */
export async function generateCLI(): Promise<void> {

    let answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'What do you want to generate',
            choices: ['Route', 'Middleware'],
        }
    ]);

    if (answers.type === 'Route') {

        const rootDir = await pkgDir(process.cwd());

        let raw;
        try {
            raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
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
}

/**
 * 
 * @param name The name of the middleware
 * @param short The shortcut of the middleware
 * @param description The description of the middleware
 * @returns if everything correct, creates new file
 */
export async function generateMiddleWare(name: string, short: string, description: string): Promise<void> {
    const rootDir = await pkgDir(process.cwd());

    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, 'grafe.json'));
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


    let _path = path.join('src', 'middlewares', short);

    await mkdirp(path.join(rootDir, _path));

    _path = path.join(_path, name + ".ts");

    const templateMiddleWarePath = path.join(__dirname, '..', '..', 'templates', 'starters', 'express', 'src', 'middlewares', 'pt', 'protected.ts');

    fs.copyFileSync(templateMiddleWarePath, path.join(rootDir, _path));
    console.log("Created new middleware " + path.join(rootDir, _path));
    fs.writeFileSync(path.join(rootDir, 'grafe.json'), JSON.stringify(data, null, 4));
}

/**
 * 
 * @param path The path of the route
 * @param method The HTTP-Method
 * @param mw List of preceding middlewares
 * @returns if everything correct, creates new file
 */
export async function generateRoute(routePath: string, method: string, mw: any[]): Promise<void> {

    const rootDir = await pkgDir(process.cwd());

    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        console.log("The grafe command must be used within a grafe project.");
        return;
    }

    let data = JSON.parse(raw.toString());

    if (routePath.startsWith('/')) {
        routePath = routePath.substring(1);
    }

    if (routePath.endsWith('/')) {
        routePath = routePath.substring(0, routePath.length - 1);
    }

    let paths = routePath.split('/');

    let _path = path.join('src', 'routes');
    for (let i = 0; i < paths.length - 1; i++) {
        _path = path.join(_path, paths[i]);
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
                _path = path.join(_path, middlewares[i] + ".");
            }

            _path = path.join(_path, middlewares[middlewares.length - 1]);
        } else {
            _path = path.join(_path, middlewares[0]);
        }
    }

    await mkdirp(path.join(rootDir, _path));

    // add filename to create file with fs
    _path = path.join(_path, paths[paths.length - 1] + "." + method.toLowerCase() + ".ts");

    if (fs.existsSync(path.join(rootDir, _path))) {
        console.log("This route does already exist");
        return;
    }

    const templateRoutePath = path.join(__dirname, '..', '..', 'templates', 'starters', 'express', 'src', 'routes', 'index.ts');

    fs.copyFileSync(templateRoutePath, path.join(rootDir, _path));
    console.log("Created new route " + path.join(rootDir, _path));
}