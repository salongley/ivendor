# Node API Server

This sample demonstrates how to get a Node-based application built in Rio and deployed to Compute. It exposes a minimal RESTful API that is common to a collection of sample Compute apps in multiple languages.

The Node implementation uses the Express web framework.

**To play around with this sample**, fork the repository and create a new Compute project at [pie.apple.com/platform](https://pie.apple.com/platform/) using the Git SSH URL of your fork.

## Functionality

In each language, the server exposes a RESTful API over HTTP with GET, PUT, POST, and DELETE operations at the following endpoints:

| Endpoint           | Functionality                     | 
| -------------------|:---------------------------------:| 
| /                  | hello world response              | 
| /api/quotes        | quote list                        |
| /api/quotes/{id}   | an individual quote by id         |
| /api/quotes/random | random quote                      |
| /demo              | demo exercising all operations    |

## CI/CD

### Build

This repository is configured to run builds on Rio. See the  [`rio.yml`](rio.yml) file for more details.

### Deploy

This repository is configured to automatically deploy on Application Orchestrator. See the  [`rio.yml`](rio.yml) and [`apps.yaml`](apps.yaml) file for more details.

## Local operation

You can build the application locally using:

```
npm install
```

You can start the application using:

```
npm start
```
Ivendor
