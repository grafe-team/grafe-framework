import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as pkgDir from 'pkg-dir';
import * as path from 'path';
import { StaticComponent, GrafeConfig } from '../grafe.config';
import messages from './generate.messages';

/**
 * Generates the CLI for creating a new static folder
 *
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
export async function generateStaticHandler(
    argv: Record<string, unknown>
): Promise<void> {
    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if in grafe project
    if (!fs.existsSync(path.join(rootDir, 'grafe.json'))) {
        return console.error(messages.not_grafe);
    }

    const questions = [];

    // if name is not given then
    if (argv.name == undefined) {
        questions.push({
            type: 'input',
            name: 'name',
            message: messages.questions.staticHandler.name,
        });
    }

    let answers = [];
    // Check if there is at least one question
    if (questions.length > 0) {
        // prompt the user the questions
        answers = await inquirer.prompt(questions);
    }

    if (argv.prefix == undefined) {
        const result = await inquirer.prompt([
            {
                type: 'input',
                name: 'prefix',
                default: answers.name || argv.name,
                messages: messages.questions.staticHandler.prefix,
            },
        ]);

        answers.prefix = result.prefix;
    }

    answers.name = answers.name || argv.name;
    answers.prefix = answers.prefix || argv.prefix;

    generateStatic(answers.name, answers.prefix, Boolean(argv.yes));
}

/**
 * Generate a new static folder
 *
 * @param name name of the new static folder
 * @param prefix prefix of the static folder
 * @returns Promise<undefined>
 */
export async function generateStatic(
    name: string,
    prefix: string,
    confirmation: boolean
): Promise<void> {
    // check if user already confirms via args
    if (!confirmation) {
        // prompt confirmation to user
        const confirm = await inquirer.prompt({
            message: messages.confirm,
            type: 'confirm',
            name: 'confirm',
        });

        // if not confirming abort
        if (!confirm.confirm) {
            return;
        }
    }

    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, 'grafe.json'));
    } catch (err) {
        return console.error(messages.not_grafe);
    }

    const data: GrafeConfig = JSON.parse(raw.toString());

    if (data.statics == undefined) {
        return console.error(messages.wrong_config);
    }

    // check if length is greater then 0
    if (name.length == 0) {
        return console.error(messages.generateStatic.to_small);
    }

    // check if name has a ':' in it
    if (name.indexOf(':') != -1) {
        return console.error(messages.generateStatic.no_colon);
    }

    const _path = path.join(rootDir, 'src', name);

    // check if directory already exists
    if (fs.existsSync(_path)) {
        return console.error(messages.generateStatic.exists);
    }

    const folder: StaticComponent = {
        folder: name,
        prefix: prefix,
    };

    data.statics.push(folder);

    fs.writeFileSync(
        path.join(rootDir, 'grafe.json'),
        JSON.stringify(data, null, 4)
    );

    // create all non-existing directorys
    await mkdirp.default(_path);

    console.log(messages.generateStatic.success, _path);
}
