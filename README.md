<p align="center">
  <img width="460" src="https://i.ibb.co/mT0TMQG/garfe-logo.png">
</p>



<h1 align="center"> Grafe</h1>
<p align="center">
  <b>The easiest way to create a backend</b>
</p>

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

## Installation
Either through cloning with git or by using [npm](http://npmjs.org) (recommended way):
```bash
npm install -g @grafe/grafe-cli
```
## Commands
### grafe
Root command for other grafe commands.
#### Syntax
```bash
grafe
```
#### Details
`grafe`will do nothing. It is the root command of the CLI. To see further details of commands use `grafe --help`.
| Option| Alias| Description|
| :--- | :--- | :--- |
| --help | - / - | Shows all available commands |
| --version | - / - | Shows the current version of grafe |
#### Examples
```bash
grafe --help
```
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
#### Examples
```bash
grafe start project_1
grafe start project_2 -t express
grafe start project_3 --testing
```
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
| [route](#grafe generate route) | - / - | Will generate a new route |
| middleware | - / - | Will generate a new middleware |
| static | - / - | Will generate a new static-directory |
#### Examples
```bash
grafe generate
grafe generate --help
grafe generate route
```
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
## Packages

| Project| Package | Version |
| --- | --- | --- |
| Garfe CLI | [@garfe/grafe-cli](http://npmjs.org) | 0.1.0 |
| Grade Core | [@garfe/grafe-core](https://www.npmjs.com/package/@grafe/grafe-core) | [![npm version](https://badge.fury.io/js/%40grafe%2Fgrafe-core.svg)](https://badge.fury.io/js/%40grafe%2Fgrafe-core) |

## License

MIT
