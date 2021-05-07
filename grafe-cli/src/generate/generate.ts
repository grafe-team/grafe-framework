import inquirer from 'inquirer';
import { choices } from 'yargs';
import fs from 'fs';

function generate() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'What do you want to generate',
            choices: ['Route', 'Middleware'],
        }
    ]).then(answers => {
        if (answers.type === 'Route') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'path',
                    message: 'How is the new route called'
                },
                {
                    type: 'list',
                    name: 'method',
                    message: 'Which HTTP-Method should the new route be',
                    choices: ['GET', 'POST', 'PUT', 'DELETE'],
                },
                {
                    type: 'checkbox',
                    message: 'Select the middlewares for this route',
                    name: 'middlewares',
                    choices: [
                        {
                            name: 'not protected',
                            value: 'np'
                        }, 
                        {
                            name: 'only as user',
                            value: 'user'
                        }
                    ]
                }
            ]).then(answers => {
                console.log(answers);
                let paths = answers.path.split('/');
                console.log(paths);
                
                let path = "./src/";
                for(let pathSplit of paths) {
                    if(!(pathSplit === paths[paths.length - 1])) {
                        path += pathSplit + "/";
                    }
                }

                let middlewares = answers.middlewares;

                if(middlewares.length == 1) {
                    path += middlewares[0] + "/";
                }else {
                    for(let i = 0; i < middlewares.length - 1; i++) {
                        path += middlewares[i] + ".";
                    }
                    path += middlewares[middlewares.legth - 1];
                }

                path += paths[paths.length - 1] + "." + answers.method.toLowerCase() + ".ts";

                console.log(path);
            });
        }
    });
}

export = generate;