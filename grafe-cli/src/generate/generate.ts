import inquirer from 'inquirer';
import yargs from 'yargs';
import fs from 'fs';
import mkdirp from 'mkdirp';
import pkgDir from 'pkg-dir';
import * as path from 'path';

/**
 * Describes the syntax of the generate command 
 * 
 * @param yargs Yargs object to add information to  
 * @returns The same Yargs object
 */
export function generateCommand(yargs: yargs.Argv<{}>): yargs.Argv<{}> {
    // returns two subcommands with the arguments
    return yargs.command('route', 'generate ', y => {
        return y.option('routePath', {
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
        });
    }, generateRouteHandler).command('middleware', '', y => {
        return y.option('name', {
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
    }, generateMiddleWareHandler);
}

/**
 * Starts the prompt for generating a new component
 * 
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
export async function generateHandler(argv: any): Promise<void> {

    // prompt the user with new question (what he wants to generate)
    let answers = [];
    answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'What do you want to generate',
            choices: ['Route', 'Middleware'],
        }
    ]);

    // set the choice to lower case
    answers.type = answers.type.toLowerCase();

    // check if choice is route
    if (answers.type === 'route') {
        // generate new route
        generateRouteHandler(argv);
    } else if (answers.type === "middleware") {
        // if choice is middleware generate middleware
        generateMiddleWareHandler(argv);
    }
}

/**
 * Generates the CLI for creating a new route
 * 
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
async function generateRouteHandler(argv: any): Promise<void> {
    
    // get root directory (where package.json is in)
    const rootDir = await pkgDir(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        return console.log("The grafe command must be used within a grafe project.");
    }

    let data = JSON.parse(raw.toString());

    let questions = [];

    // If the routePath is not given via args add routePath question
    if (argv.routePath == undefined) {
        questions.push({
            type: 'input',
            name: 'path',
            message: 'What is the new route called'
        });
    }

    // If the http-method is not given via args add method question
    if (argv.method == undefined) {
        questions.push({
            type: 'list',
            name: 'method',
            message: 'Which HTTP-Method should the new route be',
            choices: ['GET', 'POST', 'PUT', 'DELETE'],
        });
    }

    // If the middlewares are not given via args add middleware question
    if (argv.middlewares == undefined) {
        questions.push({
            type: 'checkbox',
            message: 'Select the middlewares for this route',
            name: 'middlewares',
            choices: data.middlewares
        });

        // get the index of the middleware json-object
        let index = questions.findIndex((item, i) => {
            return item.name === 'middlewares'
        });

        // If choices dont exists or the length is 0 (which means there are no middleares) delete question
        if (questions[index].choices == undefined || questions[index]?.choices?.length == 0) {
            questions.splice(index, 1);
        }
    }

    let answers = [];
    // Check if there is at least one question
    if (questions.length > 0) {
        // prompt the user the questions
        answers = await inquirer.prompt(questions);
    }

    // use either the path of the answers or the args (depends on which is undefined)
    answers.path = answers.path || argv.routePath;
    answers.method = answers.method || argv.method;
    answers.middlewares = answers.middlewares || argv.middlewares;

     // generate the new route
    await generateRoute(answers.path, answers.method, answers.middlewares);
}

/**
 * Generates the CLI for creating a new middleware
 * 
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
async function generateMiddleWareHandler(argv: any): Promise<void> {
    let questions = [];

    // If the name is not given via args add name question
    if (argv.name == undefined) {
        questions.push({
            type: 'input',
            name: 'name',
            message: 'How is the new middleware called'
        });
    }

    // If the shortcut is not given via args add shortcut question
    if (argv.short == undefined) {
        questions.push({
            type: 'input',
            name: 'short',
            message: 'What is the shortcut for this Middleware'
        });
    }

    // If the description is not given via args add description question
    if (argv.description == undefined) {
        questions.push({
            type: 'input',
            name: 'description',
            message: 'What is the description of this Middleware',
            default: ''
        });
    }
    
    let answers = [];
    // Check if there is at least one question
    if (questions.length > 0) {
        // prompt the user the questions
        answers = await inquirer.prompt(questions);
    }

    // use either the name of the answers or the args (depends on which is undefined)
    answers.name = answers.name || argv.name;
    answers.short = answers.short || argv.short;
    answers.description = answers.description || argv.description;

    // generate the new middleware
    await generateMiddleWare(answers.name, answers.short, answers.description);
}
/**
 * Generates a new folder structor for the new middleware and creates a template file
 * 
 * @param name The name of the middleware
 * @param short The shortcut of the middleware
 * @param description The description of the middleware
 * @returns Promise<undefined>
 */
export async function generateMiddleWare(name: string, short: string, description: string): Promise<void> {

    // get root directory (where package.json is in)
    const rootDir = await pkgDir(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, 'grafe.json'));
    } catch (err) {
        return console.log("The grafe command must be used within a grafe project.");
    }

    let data = JSON.parse(raw.toString());

    // Check if the name of the new middleware already exists
    if (data.middlewares.some((item: any) => item.name === name)) {
        return console.log("The name of this middleware is already in use");
    }

    // Check if the shortcut of the new middleware already exists
    if (data.middlewares.some((item: any) => item.value === short)) {
        return console.log("The shortcut of this middleware is already in use");
    }

    // add new midddleware to grafe.json list
    data.middlewares.push({
        name: name,
        description: description,
        value: short,
    });
    
    // build path to the new middleware
    let _path = path.join('src', 'middlewares', short);

    // create all non-existing directorys
    await mkdirp(path.join(rootDir, _path));

    // add filename to path
    _path = path.join(_path, name + ".ts");

    // build path to template middleware
    const templateMiddleWarePath = path.join(__dirname, '..', '..', 'templates', 'middlewares', 'express', 'template.middleware.ts');

    // copy the template to the given destination
    fs.copyFileSync(templateMiddleWarePath, path.join(rootDir, _path));
    fs.writeFileSync(path.join(rootDir, 'grafe.json'), JSON.stringify(data, null, 4));
    console.log("Created new middleware " + path.join(rootDir, _path));
}

/**
 * Generates a new folder structor for the new route and creates a template file
 * 
 * @param path The path of the route
 * @param method The HTTP-Method
 * @param mw List of preceding middlewares
 * @returns Promise<undefined>
 */
export async function generateRoute(routePath: string, method: string, mw: any[]): Promise<void> {

    // get root directory (where package.json is in)
    const rootDir = await pkgDir(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        return console.log("The grafe command must be used within a grafe project.");
    }

    let data = JSON.parse(raw.toString());

    // remove first slash if it has one
    if (routePath.startsWith('/')) {
        routePath = routePath.substring(1);
    }

    // remove last slash if it has one
    if (routePath.endsWith('/')) {
        routePath = routePath.substring(0, routePath.length - 1);
    }

    let paths = routePath.split('/');

    // starting path is ./src/routes
    let _path = path.join('src', 'routes');
    for (let i = 0; i < paths.length - 1; i++) {
        // add directory to the path
        _path = path.join(_path, paths[i]);
    }

    // check if given method is eiter get post put or delete
    if (!['get', 'post', 'put', 'delete'].includes(method.toLocaleLowerCase())) {
        return console.log("Please use a valid HTTP-Method [GET, POST, PUT, DELETE]");
    }

    let middlewares = mw;

    // check if the user wants a middleware 
    if (middlewares != undefined && middlewares.length != 0) {

        // loop through all middlewares in grafe.json
        for (let mid of middlewares) {
            // check if the middleware exists or not
            if (!(data.middlewares.some((item: any) => item.value === mid))) {
                return console.log("There is no Middleware with the shortcut " + mid);
            }
        }

        // check if the user wants more then one middleware
        if (middlewares.length > 1) {
            let middlewareName: string = "";

            // loop through the wanted middlewares and link them together
            for (let i = 0; i < middlewares.length - 1; i++) {
                middlewareName += middlewares[i] + ".";
            }
            middlewareName += middlewares[middlewares.length - 1];

            _path = path.join(_path, middlewareName);
        } else {
            // if the user only wants one then just use it as directory name
            _path = path.join(_path, middlewares[0]);
        }
    }

    // create all non-existing directorys
    await mkdirp(path.join(rootDir, _path));

    // add filename to create file with fs
    _path = path.join(_path, paths[paths.length - 1] + "." + method.toLowerCase() + ".ts");

    // check if this route already exitsts or not
    if (fs.existsSync(path.join(rootDir, _path))) {
        return console.log("This route does already exist");
    }

    // build template file path
    const templateRoutePath = path.join(__dirname, '..', '..', 'templates', 'routes', 'express', 'template.route.ts');

    // copy the template file to the destination
    fs.copyFileSync(templateRoutePath, path.join(rootDir, _path));
    console.log("Created new route " + path.join(rootDir, _path));
}