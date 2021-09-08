import { Request, Response } from 'express';

@route({
    // set the description of the route 
    description: 'This is a description of the route',
    // overwrite the path made by the folder based router
    path: '/api/v4/hello-world', 
    // if set to false no middlewares will be added 
    use-middlewares: true,

})
export class HelloWorldRoute {

    /**
     * uses the method provided by the folder based router
     * other usbale http methods include:
     * - get / GET
     * - post / POST
     * - head / HEAD
     * - put / PUT
     * - delete / DELETE
     * - connect / CONNECT
     * - options / OPTIONS
     * - trace / TRACE
     * - patch / PATCH
     * 
     * There are also functional values that can be used:
     * - error: This function will be called if an error was thrown during an request
     * - timeout: will be called if your code takes to long to execute
     * - destroy: will be called when the application stopps. Your code has 15 seconds before it will be forcefully stopped
    */
    @on('request')
    function() {

    }

}