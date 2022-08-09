
# Mod Manager

A package manager-like CLI utility for managing installing, updating and migrating mods on Fabric Minecraft Servers.


## Features

- Installing mods from Modrinth and Curseforge
- Uninstalling mods
- Updating mods with a single command
- Migrating mods to a new Minecraft version


## Demo

![A terminal window showing the usage of mod-manager](https://i.imgur.com/J8zw89M.gif)


## Usage/Examples

```
$ mod-manager
Usage: mod-manager [options] [command]

A package (mod) manager for Fabric Minecraft Servers

Options:
  -v, --version                         Reports the version of the Minecraft server
  -h, --help                            display help for command

Commands:
  init                                  Initialises mod manager
  install [options] <mods...>           Installs the provided mods
  list                                  Lists installed mods
  uninstall <mods...>                   Uninstalls the provided mods
  essential <mods...>                   Toggles the mods essential statuses
  update                                Checks for and updates mods that have a newer available version
  migrate-possible [options] [version]  Reports whether it is possible to upgrade to the provided Minecraft version
  migrate [options] [version]           Migrates all mods to provided Minecraft version
  help [command]                        display help for command
```

Initialising Mod Manager:
```
$ mod-manager init
? What Minecraft version is your server running? 1.19.1
Sucessfully initialised Mod Manager!
```

Installing a mod: 
```
$ mod-manager install lithium
✔ Successfully installed Lithium
```

Listing installed mods:
```
$ mod-manager list
Name    | Id       | File Name                         | Version        | Source   | Essential | Dependencies
-------------------------------------------------------------------------------------------------------------
Lithium | gvQqBUqZ | lithium-fabric-mc1.19.2-0.8.3.jar | mc1.19.2-0.8.3 | Modrinth | false     |
```

## Environment Variables

The following are the required environment variables for running Mod Manager

`CURSEFORGE_API_KEY # Set to your api key for curseforge. Leaving it unset will skip all Curseforge related functionality`


## Installation

### Prerequisites
* A version of Node.js greater than 12 must be installed, along with npm and npx.

Mod Manager can be installed with the following command (watch out for the sudo password prompt, it can be hard to spot)

```bash
curl https://hogwarts.bits.team/git/Bits/mod-manager/raw/branch/master/install.sh | sudo -E env "PATH=$PATH" bash
```
    