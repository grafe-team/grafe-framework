import inquirer from 'inquirer';
import yargs from 'yargs';
import messages from './generate.messages';
import { generateRouteHandler } from './route.generate';
import { generateMiddleWareHandler } from './middleware.generate';
import { generateStaticHandler } from './static.generate';

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
            description: messages.commands.route.routePath.description
        }).option('method', {
            alias: 'm',
            type: 'string',
            description: messages.commands.route.method.description
        }).option('middlewares', {
            alias: 'w',
            type: 'array',
            description: messages.commands.route.middlewares.description
        });
    }, generateRouteHandler).command('middleware', '', y => {
        return y.option('name', {
            alias: 'n',
            type: 'string',
            description: messages.commands.middleware.name.description
        }).option('short', {
            alias: 's',
            type: 'string',
            description: messages.commands.middleware.short.description
        }).option('description', {
            alias: 'd',
            type: 'string',
            description: messages.commands.middleware.description.description
        });
    }, generateMiddleWareHandler).command('static', '', y => {
        return y.option('name', {
            alias: 'n',
            type: 'string',
            description: messages.commands.static.name.descirption
        })
    }, generateStaticHandler);;
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
            message: messages.questions.mainHandler.message,
            choices: ['Route', 'Middleware', 'Static Folder'],
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
    } else if (answers.type === "static folder") {
        // if choice is satic folder generate static
        generateStaticHandler(argv);
    }
}