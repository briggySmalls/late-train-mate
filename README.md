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

Install Redux DevTools chrome extenstion:

https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

<!--## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```-->

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

- Angular 2 ( 2.x )
- ExpressJS ( 4.x - with compression )
- Webpack ( angular-cli )

<!--## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.-->

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Was built from the [angular2-express-starter](https://github.com/vladotesanovic/angular2-express-starter) project by Vlado Tesanovic
