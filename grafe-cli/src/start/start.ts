import yargs from 'yargs';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { StarterTemplateOptions, createDirectoryContents } from '../utils/templating'

export function startCommand(yargs: yargs.Argv<{}>) {
    return yargs;
}

export async function startHandler(argv: any) {

    const templateStartersPath = path.join(__dirname, '..', '..', 'templates', 'starters'); 

    const templateChoises = fs.readdirSync(templateStartersPath);

    const answers = await inquirer.prompt([
        {
            type: 'input',
            message: 'Whats the name of your project?',
            name: 'projectName'
        },
        {
            type: 'list',
            name: 'templateType',
            message: 'What project template would you like to use?',
            choices: templateChoises
        }
    ]);

    const projectOptions: StarterTemplateOptions = {
        projectName: answers.projectName,
        projectPath: path.join(process.cwd(), answers.projectName),
        templateName: answers.templateType,
        templatePath: path.join(templateStartersPath, answers.templateType)
    };
    console.log(projectOptions);

    if (!createProjectFolder(projectOptions)) {
        return;
    }

    createDirectoryContents(projectOptions.templatePath, projectOptions.projectName, projectOptions);

}

function createProjectFolder(options: StarterTemplateOptions): boolean {
    if (fs.existsSync(options.projectPath)) {
        console.error(`Folder ${options.projectPath} already exists. Delete it or use another name!`);
        return false;
    }

    fs.mkdirSync(options.projectPath);

    return true;
}
