import inquirer from 'inquirer';
import fs from 'fs';
import mkdirp from 'mkdirp';
import pkgDir from 'pkg-dir';
import * as path from 'path';
import messages from './generate.messages';

/**
 * Generates the CLI for creating a new middleware
 * 
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
 export async function generateMiddleWareHandler(argv: any): Promise<void> {
    let questions = [];

    // If the name is not given via args add name question
    if (argv.name == undefined) {
        questions.push({
            type: 'input',
            name: 'name',
            message: messages.questions.middleWareHandler.name
        });
    }

    // If the shortcut is not given via args add shortcut question
    if (argv.short == undefined) {
        questions.push({
            type: 'input',
            name: 'short',
            message: messages.questions.middleWareHandler.short
        });
    }

    // If the description is not given via args add description question
    if (argv.description == undefined) {
        questions.push({
            type: 'input',
            name: 'description',
            message: messages.questions.middleWareHandler.description,
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
        return console.log(messages.not_grafe);
    }

    let data = JSON.parse(raw.toString());

    // Check if the name of the new middleware already exists
    if (data.middlewares.some((item: any) => item.name === name)) {
        return console.log(messages.generateMiddleware.middleware_in_use);
    }

    // Check if the shortcut of the new middleware already exists
    if (data.middlewares.some((item: any) => item.value === short)) {
        return console.log(messages.generateMiddleware.shortcut_in_use);
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
    console.log(messages.generateMiddleware.success, path.join(rootDir, _path));
}
