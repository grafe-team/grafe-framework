import yargs from 'yargs';
import inquirer from 'inquirer'

export function startCommand(yargs: yargs.Argv<{}>) {
    return yargs;
}

export function startHandler(argv: any) {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Whats the name of your project',
            name: 'projectName'
        }
    ]).then((value: any) =>{
        console.log(value);
    }).catch((error: any) => {
        console.error(error);
    })
}