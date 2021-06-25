
<p align="center">
  <img width="460" src="https://i.ibb.co/mT0TMQG/garfe-logo.png">
</p>



<h1 align="center"> Grafe</h1>
<p align="center">
  <b>The easiest way to create a backend</b>
</p>

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=grafe-team_grafe-framework&metric=alert_status)](https://sonarcloud.io/dashboard?id=grafe-team_grafe-framework)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=grafe-team_grafe-framework&metric=bugs)](https://sonarcloud.io/dashboard?id=grafe-team_grafe-framework)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=grafe-team_grafe-framework&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=grafe-team_grafe-framework)

##### Table of Contents  
- [Installation](#installation)  
- [Getting started](#getting-started)
	- [start a new project](#start-your-project)
	- [generate your first route](#generate-your-first-route)
- [Commands](#Commands)  
	- [grafe start](#grafe-start)
		- [Syntax](#syntax)
		- [Details](#details)
		- [Examples](#examples)
	- [grafe generate](#grafe-generate)
		- [Syntax](#syntax-1)
		- [Details](#details-1)
		- [Examples](#examples-1)
	- [grafe generate route](#grafe-generate-route)
		- [Syntax](#syntax-2)
		- [Details](#details-2)
		- [Examples](#examples-2)
	- [grafe generate middleware](#grafe-generate-middleware)
		- [Syntax](#syntax-3)
		- [Details](#details-3)
		- [Examples](#examples-3)
	- [grafe generate static](#grafe-generate-static)
		- [Syntax](#syntax-3)
		- [Details](#details-3)
		- [Examples](#examples-3)
	- [grafe serve](#grafe-serve)
		- [Syntax](#syntax-4)
		- [Details](#details-4)
		- [Examples](#examples-4)
- [Packages](#packages)
- [License](#license)

## Installation 
Either through cloning with git or by using [npm](http://npmjs.org) (recommended way):
```bash
npm install -g @grafe/grafe-cli
```
## Getting started
>This is a simple tutorial of how to use grafe. It will teach you how to start a new Project, how you can add new components and many other things.

### Start your Project 
Welcome to grafe!
  
If you have already installed the package `@grafe/grafe-cli`, we will start by creating a new Grafe project. For this we use the `grafe start` command with the integrated options, which you can have a look at in the documentation under [syntax](#syntax).

```bash
grafe start HelloWorld -t express --yes
```

As template we use express and as project name we take 'HelloWorld'.
<br/>
To check if everything worked correctly, we run the project with the `grafe serve` command. By the way, this command detects if you have made a change, then re-compiles the project and restarts it.

```bash
grafe serve
```
If you have not changed the port, your back-end is now running on port 3000 with a default route 
`GET localhost:300/index/` which does nothing.
<br/>
### Generate your first route
Let us now create our first route, which should greet us with a `Hello World`.
For this we use the `grafe generate route` command with its integrated options, which you can read again in the documentation under [syntax](#syntax-2).
```bash
grafe generate route -r /helloworld/greet -m get -w --yes
```
Now we have a new file under `src/routes/helloworld/`. The contents of this file look like this:
```javascript
import { Request, Response } from  'express';

export  =  async (req:  Request, res:  Response) => {

};
```
To see a result we now write a response into the function:
```javascript
res.send({ message: 'hello world'});
```
We can test it with our browser, since it is a `GET` method, or with [Postman](https://www.postman.com/).  If you want to test the route with your browser, go to the url `http://localhost:3000/helloworld/greet/`.
## Commands
### grafe start
Creates a new grafe project.
#### Syntax
```bash
grafe start [projectName]
```
#### Details
`grafe start` will start the prompts to create a new grafe project. 
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows list of available options |
| --template | -t | Sets the template of the project |
| --testing | - / - | Enables testing for the grafe project|
| [projectName] | - / - | Sets the project name |
| --yes | - / - | confirms the creation of the new project
#### Examples
```bash
grafe start project_1
grafe start project_2 -t express
grafe start project_3 --testing
```
------
### grafe generate
Creates a new grafe component.
#### Syntax
```bash
grafe generate
```
#### Details
`grafe generate` will start the prompts of which component should be generated. 
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows list of available options |
| [route](#grafe-generate-route) | - / - | Will generate a new route |
| [middleware](#grafe-generate-middleware) | - / - | Will generate a new middleware |
| [static](#grafe-generate-static) | - / - | Will generate a new static-directory |
#### Examples
```bash
grafe generate
grafe generate --help
grafe generate route
```
------
### grafe generate route
Automatically creates a new grafe-route-component,
#### Syntaxt
```bash
grafe generate route
```
#### Details
`grafe generate route` will start the prompts of the route properties and automatically generate a new route component. 
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows list of available options |
| --routePath | -r | Sets the path of the new route |
| --method | -m | Sets the method of the new route. `get | post | put | delete` |
| --middlewares |-w | Sets the preceding middlewares of the route |
| --yes | - / - | confirms the generation of the new component
#### Examples
```bash
grafe generate route 
grafe generate route --help
grafe generate route -r /auth/login -m post 
grafe generate route -r /auth/is-authenticated -m get -w pt --yes
```
------
### grafe generate middleware
Automatically creates a new grafe-middleware-component
#### Syntaxt
```bash
grafe generate middleware
```
#### Details
`grafe generate middleware` will start the prompts of the middleware properties and automatically generate a new middleware component. 
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows list of available options |
| --name | -n | Sets the name of the middleware |
| --short | -s | Sets the short-cut of the middleware |
| --description |-d | Sets the description of the middleware |
| --yes | - / - | confirms the generation of the new component
#### Examples
```bash
grafe generate middleware
grafe generate middleware --help
grafe generate middleware -n protected -s pt 
grafe generate middleware -n admin-only -s adm -d "Only for Admins" --yes
```
------
### grafe generate static
Creates a new folder which can be used for static files. 
#### Syntaxt
```bash
grafe generate static
```
#### Details
`grafe generate static` will start the prompts of the static properties and automatically create a new static directory. 
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows list of available options |
| --name | -n | Sets the name of new folder |
| --prefix | -p | Sets the prefix with which you access the folder |
| --yes | - / - | confirms the generation of the new component
#### Examples
```bash
grafe generate static
grafe generate static --help
grafe generate static -n images 
grafe generate static -n pictures -p public/pictures --yes
```
------
### grafe serve
- insert -
#### Syntax
```bash
grafe start [projectName]
```
#### Details
`grafe serve` - insert -
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows list of available options |
#### Examples
```bash
grafe serve
```
## Packages

| Project| Package | Version |
| --- | --- | --- |
| Garfe CLI | [@garfe/grafe-cli](https://www.npmjs.com/package/@grafe/grafe-cli) | [![npm version](https://badge.fury.io/js/%40grafe%2Fgrafe-cli.svg)](https://badge.fury.io/js/%40grafe%2Fgrafe-cli) |
| Grade Core | [@garfe/grafe-core](https://www.npmjs.com/package/@grafe/grafe-core) | [![npm version](https://badge.fury.io/js/%40grafe%2Fgrafe-core.svg)](https://badge.fury.io/js/%40grafe%2Fgrafe-core) |

## License

MIT
