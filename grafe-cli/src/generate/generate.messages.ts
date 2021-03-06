import 'colors';

export = {
    commands: {
        route: {
            routePath: {
                description: 'Path of the new route',
            },
            method: {
                description: 'HTTP-Method of the route',
            },
            middlewares: {
                description: 'Middlewares for this route',
            },
        },
        middleware: {
            name: {
                description: 'Name of the middleware',
            },
            short: {
                description: 'Short name of the middleware',
            },
            description: {
                description: 'Description of the middleware',
            },
        },
        static: {
            name: {
                descirption: 'Name of the static folder',
            },
            prefix: {
                descirption: 'Prefix of the static folder',
            },
        },
        confirm: {
            description: 'To automaticly confirm the new component',
        },
    },
    questions: {
        mainHandler: {
            message: 'What do you want to generate',
        },
        routeHandler: {
            routePath: 'What is the new route called',
            method: 'Which HTTP-Method should the new route be',
            middlewares: 'Select the middlewares for this route',
        },
        middleWareHandler: {
            name: 'How is the new middleware called',
            short: 'What is the shortcut for this Middleware',
            description: 'What is the description of this Middleware',
        },
        staticHandler: {
            name: 'How is the new static folder called',
            prefix: 'What is the prefix of the static-folder',
        },
        utilsHandler: {
            type: 'What do you want to generate',
        },
    },
    generateStatic: {
        success: 'CREATE'.green + ' %s',
        to_small: 'The directory has to be at least 1 character long',
        no_colon: 'Colons are not allowed as directory names',
        exists: 'This directory already exist',
    },
    generateMiddleware: {
        middleware_in_use: 'The name of this middleware is already in use',
        shortcut_in_use: 'The shortcut of this middleware is already in use',
        success: 'CREATE'.green + ' %s',
    },
    generateRoute: {
        invalid_method:
            'Please use a valid HTTP-Method [GET, POST, PUT, DELETE]',
        invalid_shortcut: 'There is no Middleware with the shortcut %s',
        exists: 'This route does already exist',
        success: 'CREATE'.green + ' %s',
        tests: 'CREATE'.green + ' %s',
    },
    confirm: 'Is everything correct',
    not_grafe: 'The grafe command must be used within a grafe project.',
    wrong_config: 'Grafe.json is not correct, please use grafe upgrade',
};
