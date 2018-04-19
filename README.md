# navigation-universe

This repo is an attempt at full-stack development, with web and mobile packagers running side-by-side, and packages that will eventually be exportable to npm.

### Launch Web Packager 

```
yarn web-start
```

### Mobile

```
yarn ios
#or
yarn android
```


## Building the app

```
yarn web-build
```

## Exporting Packages

Packages are currently located in `/universal/src/`, and they should eventually have their own `package.json` files. Help is needed to build automation for releasing these packages to npm.

