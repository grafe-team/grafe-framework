import 'colors';

export = {
    commands: {
        route: {
            routePath: {
                description: 'Path of the new route'
            },
            method: {
                description: 'HTTP-Method of the route'
            },
            middlewares: {
                description: 'Middlewares for this route'
            }
        }, middleware: {
            name: {
                description: 'Name of the middleware'
            },
            short: {
                description: 'Short name of the middleware'
            },
            description: {
                description: 'Description of the middleware'
            }
        },
        static: {
            name: {
                descirption: 'Name of the static folder'
            }
        }
    },
    questions: {
        mainHandler: {
            message: 'What do you want to generate'
        },
        routeHandler: {
            routePath: 'What is the new route called',
            method: 'Which HTTP-Method should the new route be',
            middlewares: 'Select the middlewares for this route'
        },
        middleWareHandler: {
            name: 'How is the new middleware called',
            short: 'What is the shortcut for this Middleware',
            description: 'What is the description of this Middleware'
        },
        staticHandler: {
            name: 'How is the new static folder called'
        }
    },
    generateStatic: {
        success: 'CREATE'.green + ' %s'
    },
    generateMiddleware: {
        middleware_in_use: 'The name of this middleware is already in use',
        shortcut_in_use: 'The shortcut of this middleware is already in use',
        success: 'CREATE'.green + ' %s'
    },
    generateRoute: {
        invalid_method: 'Please use a valid HTTP-Method [GET, POST, PUT, DELETE]',
        invalid_shortcut: 'There is no Middleware with the shortcut %s',
        exists: 'This route does already exist',
        success: 'CREATE'.green + ' %s',
        tests: 'CREATE'.green +  ' %s',
    },
    confirm: 'Is everything correct',
    not_grafe: 'The grafe command must be used within a grafe project.'
}