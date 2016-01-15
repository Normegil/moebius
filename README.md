# Moebius
An application to easily download manga from online readers. Supported websites include:

- [MangaEden](http://www.mangaeden.com/en/)

## Requirements
  - Linux
  - Node v5.3

## Installation
To install the library, just use [npm](https://fr.wikipedia.org/wiki/Npm_%28logiciel%29):
```
npm install moebius -g
```

## How to use
There is 3 subcommands available, and you can get help and parameters for each of them (Executing `npm [sub-command] --help`). You can get a full overview with `moebius --help`.

### List of available mangas
Command: `moebius list [options]`

Get a list of all mangas that can be downloaded.

### Download manga(s)

Command: `moebius download [options] <manga ...>`

Download given mangas.

### Show GUI

Command: `moebius gui [options]`

There's also a GUI available, where you will be able to select which manga to download.
