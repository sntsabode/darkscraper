<h1>Welcome to darkscraper</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </a>
</p>

Darkscraper, a darkweb web crawler.

<img src="assets/screenshot.gif" />

<h2>Prerequisites</h2>
<em><strong>Use other versions at own risk.</em></strong>

- Node >=16.13.0

- Npm >=8.1.0

- Yarn >=1.22.17

- Mongodb >=5.0.4

- Tor >=----

<h2>Install</h2>

```sh
git clone https://github.com/sntsabode/darkscraper
cd darkscraper
```

```sh
yarn install
yarn build
npm i -g
```

<h2>Run Tests</h2>

```sh
yarn run test
```

<h2>Usage</h2>

```sh
darkscraper <options>
```

<h3>Options:</h3>

- `-c` or `--crawler`: Boot your darkscraper instance.

> Running the `-c` flag will boot your darkscraper instance "picking up where it left off". ***It requires a running mongodb instance.***

- `-s` or `--server`: Boot a darkscraper api server.

> Running the `-s` flag will boot a darkscraper api server with the following endpoints:
>
> > `GET` `/fetch-dark-links`
> >
> > <h4>Query Params:</h4>
> > (`limit`: `number`): The maximum number of dark links to return.
> >
> > <h4>Response:</h4>
> >
> > ```json
> > {
> >   "links": [
> >     {
> >       "domain": "string",
> >       "paths": [
> >         {
> >           "path": "string",
> >           "title": "string",
> >           "blacklisted": "boolean",
> >           "crawled": "boolean"
> >         }
> >       ]
> >     }
> >   ],
> >   "error": "undefined | string"
> > }
> > ```
>
> > `GET` `/search-dark-links`
> >
> > <h4>Query Params:</h4>
> > (`search`: `string`): The search query.
> >
> > (`skip`: `number`): The number of dark links to skip (not search).
> >
> > (`limit`: `number`): The number of dark links to return
> >
> > <h4>Response:</h4>
> >
> > ```json
> > {
> >   "links": [
> >     {
> >       "domain": "string",
> >       "paths": [
> >         {
> >           "path": "string",
> >           "title": "string",
> >           "blacklisted": "boolean",
> >           "crawled": "boolean"
> >         }
> >       ]
> >     }
> >   ],
> >   "error": "undefined | string"
> > }
> > ```

- `-p` or `--purge`: Purge your local dark link database.

> Running the `-p` flag will delete all dark links in your local darkscraper dark link database.

- `-k` or `--configure`: Open a darkcrawler configure prompt menu.

> Running the `-k` flag will open a darkscraper configure prompt menu in which you can configure your darkscraper instance and your darkscraper api server:
>
> <img src="assets/configuremenu-screenshot.gif"/>

- `-l` or `--loglevel`: Set the processes' log level. Applies to both the server and crawler instance.

- `-y` or `--yes`: Run the process without asking any questions. (Will still ask on `--purge`).

<h2>Author</h2>

👤 <strong>Sihle Masebuku</strong>

- Github: [@sntsabode](https://github.com/sntsabode)

<h2>Show your support</h2>

Give a ⭐️ if this project helped you!

***


<em>This README was generated with ❤️ by <a href="https://github.com/kefranabg/readme-md-generator">readme-md-generator</a></em>
