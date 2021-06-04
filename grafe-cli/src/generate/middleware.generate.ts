import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as pkgDir from 'pkg-dir';
import { MiddlewareComponent, GrafeConfig } from '../grafe.config';
import messages from './generate.messages';

/**
 * Generates the CLI for creating a new middleware
 *
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
export async function generateMiddleWareHandler(
    argv: Record<string, unknown>
): Promise<void> {
    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if in grafe project
    if (!fs.existsSync(path.join(rootDir, 'grafe.json'))) {
        return console.error(messages.not_grafe);
    }

    const questions = [];

    // If the name is not given via args add name question
    if (argv.name == undefined) {
        questions.push({
            type: 'input',
            name: 'name',
            message: messages.questions.middleWareHandler.name,
        });
    }

    // If the shortcut is not given via args add shortcut question
    if (argv.short == undefined) {
        questions.push({
            type: 'input',
            name: 'short',
            message: messages.questions.middleWareHandler.short,
        });
    }

    // If the description is not given via args add description question
    if (argv.description == undefined) {
        questions.push({
            type: 'input',
            name: 'description',
            message: messages.questions.middleWareHandler.description,
            default: '',
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
    await generateMiddleWare(
        answers.name,
        answers.short,
        answers.description,
        Boolean(argv.yes)
    );
}

/**
 * Generates a new folder structor for the new middleware and creates a template file
 *
 * @param name The name of the middleware
 * @param short The shortcut of the middleware
 * @param description The description of the middleware
 * @returns Promise<undefined>
 */
export async function generateMiddleWare(
    name: string,
    short: string,
    description: string,
    confirmation: boolean
): Promise<void> {
    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if the project is a grafe project
    let raw: string;
    try {
        raw = fs.readFileSync(path.join(rootDir, 'grafe.json')).toString();
    } catch (err) {
        return console.error(messages.not_grafe);
    }

    const data: GrafeConfig = JSON.parse(raw);

    // chech if grafe.json has this key
    if (data.middlewares == undefined) {
        return console.error(messages.wrong_config);
    }

    // check if user already confirms via args
    if (!confirmation) {
        const confirm = await inquirer.prompt({
            message: messages.confirm,
            type: 'confirm',
            name: 'confirm',
        });

        if (!confirm.confirm) {
            return;
        }
    }

    // Check if the name of the new middleware already exists
    if (
        data.middlewares.some((item: MiddlewareComponent) => item.name === name)
    ) {
        return console.error(messages.generateMiddleware.middleware_in_use);
    }

    // Check if the shortcut of the new middleware already exists
    if (
        data.middlewares.some(
            (item: MiddlewareComponent) => item.value === short
        )
    ) {
        return console.error(messages.generateMiddleware.shortcut_in_use);
    }

    // create new middleware object
    const toPush: MiddlewareComponent = {
        name: name,
        value: short,
        description: description,
    };

    // add new midddleware to grafe.json list
    data.middlewares.push(toPush);

    // build path to the new middleware
    let _path = path.join(rootDir, 'src', 'middlewares', short);

    // create all non-existing directorys
    await mkdirp.default(_path);

    // add filename to path
    _path = path.join(_path, name + '.ts');

    // build path to template middleware
    const templateMiddleWarePath = path.join(
        __dirname,
        '..',
        '..',
        'templates',
        'middlewares',
        'express',
        'template.middleware.ts'
    );

    // copy the template to the given destination
    fs.copyFileSync(templateMiddleWarePath, _path);
    fs.writeFileSync(
        path.join(rootDir, 'grafe.json'),
        JSON.stringify(data, null, 4)
    );
    console.log(messages.generateMiddleware.success, _path);
}
