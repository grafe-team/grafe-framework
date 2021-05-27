import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as pkgDir from 'pkg-dir';
import * as path from 'path';
import * as ejs from 'ejs';
import messages from './generate.messages';


/**
 * Generates the CLI for creating a new route
 * 
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
export async function generateRouteHandler(argv: any): Promise<void> {

    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        return console.log(messages.not_grafe);
    }

    let data = JSON.parse(raw.toString());

    let questions = [];

    // If the routePath is not given via args add routePath question
    if (argv.routePath == undefined) {
        questions.push({
            type: 'input',
            name: 'path',
            message: messages.questions.routeHandler.routePath
        });
    }

    // If the http-method is not given via args add method question
    if (argv.method == undefined) {
        questions.push({
            type: 'list',
            name: 'method',
            message: messages.questions.routeHandler.method,
            choices: ['GET', 'POST', 'PUT', 'DELETE'],
        });
    }

    // If the middlewares are not given via args add middleware question
    if (argv.middlewares == undefined) {
        questions.push({
            type: 'checkbox',
            message: messages.questions.routeHandler.middlewares,
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
 * Generates a new folder structor for the new route and creates a template file
 * 
 * @param path The path of the route
 * @param method The HTTP-Method
 * @param mw List of preceding middlewares
 * @returns Promise<undefined>
 */
export async function generateRoute(routePath: string, method: string, mw: any[]): Promise<void> {

    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        return console.log(messages.not_grafe);
    }
    
    let data = JSON.parse(raw.toString());

    let confirm = await inquirer.prompt({
        message: messages.confirm,
        type: 'confirm',
        name: 'confirm'
    });

    if(!confirm.confirm) {
        return;
    }

    // remove first slash if it has one
    if (routePath.startsWith('/')) {
        routePath = routePath.substring(1);
    }

    // remove last slash if it has one
    if (routePath.endsWith('/')) {
        routePath = routePath.substring(0, routePath.length - 1);
    }

    routePath = routePath.replace(':', '%');

    let paths = routePath.split('/');

    // starting path is ./src/routes
    let _path = path.join('src', 'routes');
    for (let i = 0; i < paths.length - 1; i++) {
        // add directory to the path
        _path = path.join(_path, paths[i]);
    }

    // check if given method is eiter get post put or delete
    if (!['get', 'post', 'put', 'delete'].includes(method.toLocaleLowerCase())) {
        return console.log(messages.generateRoute.invalid_method);
    }

    let middlewares = mw;

    // check if the user wants a middleware 
    if (middlewares != undefined && middlewares.length != 0) {

        // loop through all middlewares in grafe.json
        for (let mid of middlewares) {
            // check if the middleware exists or not
            if (!(data.middlewares.some((item: any) => item.value === mid))) {
                return console.log(messages.generateRoute.invalid_shortcut, mid);
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

            _path = path.join(_path, "_mw." + middlewareName);
        } else {
            // if the user only wants one then just use it as directory name
            _path = path.join(_path, "_mw." + middlewares[0]);
        }
    }

    // create all non-existing directorys
    await mkdirp.default(path.join(rootDir, _path));

    let _testPath;
    
    // check if tests are enabled
    if (data.tests) {
        _testPath = path.join(rootDir, _path, '_tests');
        await mkdirp.default(_testPath);

        _testPath = path.join(_testPath, paths[paths.length - 1] + "." + method.toLowerCase() + ".ts");

        // check if this file already exitsts or not
        if (fs.existsSync(_testPath)) {
            return console.log(messages.generateRoute.exists);
        }

        // get the path of the template file for tests
        const templateTestPath = path.join(__dirname, '..', '..', 'templates', 'tests', 'mocha', 'template.test.ts');

        // read file content and transform it using template engine
        let contents = fs.readFileSync(templateTestPath, 'utf8');

        // insert dynamic content 
        contents = ejs.render(contents, {
            fileName: paths[paths.length - 1] + "." + method.toLowerCase() + ".ts"
        });

        // write with changed content
        fs.writeFileSync(_testPath, contents, 'utf8');
        
        console.log(messages.generateRoute.tests, _testPath);
    }

    // add filename to create file with fs
    _path = path.join(_path, paths[paths.length - 1] + "." + method.toLowerCase() + ".ts");

    // check if this route already exitsts or not
    if (fs.existsSync(path.join(rootDir, _path))) {
        return console.log(messages.generateRoute.exists);
    }

    // build template file path
    const templateRoutePath = path.join(__dirname, '..', '..', 'templates', 'routes', 'express', 'template.route.ts');

    // copy the template file to the destination
    fs.copyFileSync(templateRoutePath, path.join(rootDir, _path));
    console.log(messages.generateRoute.success, path.join(rootDir, _path));

}