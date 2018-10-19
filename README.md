[![Build Status](https://travis-ci.org/briggySmalls/late-train-mate.svg?branch=feature%2Fnational-rail-tests)](https://travis-ci.org/briggySmalls/late-train-mate)

# Late Mate

A handy web application to review delayed and cancelled trains across the UK.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The project dependencies are managed by npm, which must be installed before the project can run.

### Installing

```bash
git clone https://github.com/briggysmalls/late-mate
cd late-mate

# Install dependencies
npm install

# start server
npm run start

# Client url: http://localhost:4200
# Application ( express ) API: http://localhost:4300
```

## Running the tests

The automated tests are run using the following command:

```
ng test
```

### Linting

Linting is run using the following commands:

```
npm run lint:server  # Server linting
npm run lint:client  # Client linting
```

## Deployment

```bash
npm run build

## Deploy dist folder to app server

Structure of dist folder:

/dist/server <-- expressjs
/dist/client <-- angular2

```

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Built With

- Angular 5+
- ExpressJS ( 4.x - with compression )
- Webpack ( angular-cli )

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Was built from the [angular2-express-starter](https://github.com/vladotesanovic/angular2-express-starter) project by Vlado Tesanovic
