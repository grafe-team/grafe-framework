import inquirer from 'inquirer';
import yargs, { Options } from 'yargs';
import fs from 'fs';
import mkdirp from 'mkdirp';
import pkgDir from 'pkg-dir';
import * as path from 'path';

export function generateCommand(yargs: yargs.Argv<{}>): yargs.Argv<{}> {
    return yargs.positional('type', {
        description: 'Type of component you want to generate',
        choices: ['route', 'middleware']
    }).option('routePath', {
        alias: 'r',
        type: 'string',
        description: 'Path of the new route'
    }).option('method', {
        alias: 'm',
        type: 'string',
        description: 'HTTP-Method of the route'
    }).option('middlewares', {
        alias: 'w',
        type: 'array',
        description: 'Middlewares for this route'
    }).option('name', {
        alias: 'n',
        type: 'string',
        description: 'Name of the middleware'
    }).option('short', {
        alias: 's',
        type: 'string',
        description: 'Short name of the middleware'
    }).option('description', {
        alias: 'd',
        type: 'string',
        description: 'Description of the middleware'
    });
}

/**
 * Starts the prompt for generating a new component
 */
export async function generateCLI(argv: any): Promise<void> {

    let type: string = argv.type;
    
    let answers;
    if (type == undefined || type.length == 0) {
        answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'What do you want to generate',
                choices: ['Route', 'Middleware'],
            }
        ]);
    } else {
        if (type.toLocaleLowerCase() == 'middleware' || type.toLocaleLowerCase() == 'route') {
            answers = { type: type };
        } else {
            console.log("There is no generation option for " + type);
            return;
        }
    }

    if (answers.type.toLowerCase() === 'route') {

        const rootDir = await pkgDir(process.cwd());

        let raw;
        try {
            raw = fs.readFileSync(path.join(rootDir, 'grafe.json'));
        } catch (err) {
            return console.log("The grafe command must be used within a grafe project.");
        }

        let data = JSON.parse(raw.toString());

        let questions = [];
        if (argv.routePath == undefined) {
            questions.push({
                type: 'input',
                name: 'path',
                message: 'How is the new route called'
            });
        }

        if (argv.method == undefined) {
            questions.push({
                type: 'list',
                name: 'method',
                message: 'Which HTTP-Method should the new route be',
                choices: ['GET', 'POST', 'PUT', 'DELETE'],
            });
        }

        if (argv.middlewares == undefined) {
            questions.push({
                type: 'checkbox',
                message: 'Select the middlewares for this route',
                name: 'middlewares',
                choices: data.middlewares
            });

            let index = questions.findIndex((item, i) => {
                return item.name === 'middlewares'
            });

            if (questions[index].choices == undefined || questions[index]?.choices?.length == 0) {
                questions.splice(index, 1);
            }
        }

        if (questions.length > 0) {
            answers = await inquirer.prompt(questions);
        }

        if (answers.path == undefined) {
            answers.path = argv.routePath;
        }

        if (answers.method == undefined) {
            answers.method = argv.method;
        }

        if (answers.middlewares == undefined) {
            answers.middlewares = argv.middlewares;
        }

        generateRoute(answers.path, answers.method, answers.middlewares);
    } else if (answers.type.toLowerCase() === "middleware") {
        let questions = [];

        if (argv.name == undefined) {
            questions.push({
                type: 'input',
                name: 'name',
                message: 'How is the Middleware called'
            });
        }

        if (argv.short == undefined) {
            questions.push({
                type: 'input',
                name: 'short',
                message: 'What is the shortcut for this Middleware'
            });
        }

        if (argv.description == undefined) {
            questions.push({
                type: 'input',
                name: 'description',
                message: 'What is the description of this Middleware',
                default: ''
            });
        }

        if (questions.length > 0) {
            answers = await inquirer.prompt(questions);
        }

        if (answers.name == undefined) {
            answers.name = argv.name;
        }

        if (answers.short == undefined) {
            answers.short = argv.short;
        }

        if (answers.description == undefined) {
            answers.description = argv.description;
        }

        await generateMiddleWare(answers.name, answers.short, answers.description);
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
        return console.log("The grafe command must be used within a grafe project.");
    }

    let data = JSON.parse(raw.toString());

    if (data.middlewares.some((item: any) => item.name === name) || data.middlewares.some((item: any) => item.value === short)) {
        return console.log("Either the name or the shortcut of this middleware is already in use");
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
        return console.log("The grafe command must be used within a grafe project.");
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

    if (!['get', 'post', 'put', 'delete'].includes(method.toLocaleLowerCase())) {
        return console.log("Please use a valid HTTP-Method [GET, POST, PUT, DELETE]");
    }

    let middlewares = mw;
    if (middlewares != undefined && middlewares.length != 0) {

        for (let mid of middlewares) {
            if (!(data.middlewares.some((item: any) => item.value === mid))) {
                return console.log("There is no Middleware with the shortcut " + mid);
            }
        }

        if (middlewares.length > 1) {
            let middlewareName: string = "";
            for (let i = 0; i < middlewares.length - 1; i++) {
                middlewareName += middlewares[i] + ".";
            }
            middlewareName += middlewares[middlewares.length - 1];

            _path = path.join(_path, middlewareName);
        } else {
            _path = path.join(_path, middlewares[0]);
        }
    }

    await mkdirp(path.join(rootDir, _path));

    // add filename to create file with fs
    _path = path.join(_path, paths[paths.length - 1] + "." + method.toLowerCase() + ".ts");

    if (fs.existsSync(path.join(rootDir, _path))) {
        return console.log("This route does already exist");
    }

    const templateRoutePath = path.join(__dirname, '..', '..', 'templates', 'starters', 'express', 'src', 'routes', 'index.ts');

    fs.copyFileSync(templateRoutePath, path.join(rootDir, _path));
    console.log("Created new route " + path.join(rootDir, _path));
}