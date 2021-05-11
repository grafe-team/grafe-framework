import inquirer from 'inquirer';
import fs from 'fs';
import mkdirp from 'mkdirp';
import pkgDir from 'pkg-dir';
import * as path from 'path';
import messages from './generate.messages';

/**
 * Generates the CLI for creating a new static folder
 * 
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
 export async function generateStaticHandler(argv: any): Promise<void> {
    // get root directory (where package.json is in)
    const rootDir = await pkgDir(process.cwd());

    // check if the project is a grafe project
    try {
        fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        return console.log(messages.not_grafe);
    }

    let questions = [];

    if (argv.name == undefined) {
        questions.push({
            type: 'input',
            name: 'name',
            message: messages.questions.staticHandler.name
        });
    }

    let answers = [];
    // Check if there is at least one question
    if (questions.length > 0) {
        // prompt the user the questions
        answers = await inquirer.prompt(questions);
    }

    answers.name = answers.name || argv.name;

    generateStatic(answers.name);
}

/**
 * Generate a new static folder
 * 
 * @param name name of the new static folder
 * @returns Promise<undefined>
 */
export async function generateStatic(name: string): Promise<void> {
    // get root directory (where package.json is in)
    const rootDir = await pkgDir(process.cwd());

    const _path = path.join(rootDir, 'src', 'static', name);

    // create all non-existing directorys
    await mkdirp(_path);

    console.log(messages.generateStatic.success, _path);
}

