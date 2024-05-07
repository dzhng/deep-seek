## Installation

1. Clone the `deep-seek` repo.
2. Install package manager and dependencies using one of the following ways
   - `npm`
     1. Install `npm` package manager by downloading installers according to your operating system from [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
     2. Install dependencies for the project using
        ```bash
        cd deep-seek
        npm install
        ```
        if facing dependency conflict, retry using
        ```bash
        npm install --legacy-peer-deps
        ```
   - `yarn`
     1. Install `yarn` package manager using the instructions from [here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable).
     2. Replace [line](https://github.com/dzhng/deep-seek/blob/main/package.json#L5) in [package.json](../package.json) with `"packageManager": "yarn@1.22.22"`
     3. Install dependecies for the project using,
        ```bash
        cd deep-seek
        yarn install
        ```
   - `pnpm`
     1. Install `pnpm` package manager using the instructions [here](https://pnpm.io/installation).
     2. Install dependencies for the project using,
        ```bash
        cd deep-seek
        pnpm install
        ```
   - `bun`
     1. Install `bun` pacakge manager using the instructions [here](https://bun.sh/docs/cli/install).
     2. Install dependencies for the project using,
        ```bash
        cd deep-seek
        bun install
        ```

## Hints

- Remove `package-lock.json` if needed while installing dependencies
