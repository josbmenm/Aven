# Aven Framework, Aven Cloud

[![CircleCI badge](https://circleci.com/gh/AvenCloud/Aven/tree/master.svg?style=shield)](https://circleci.com/gh/AvenCloud/Aven/tree/master)

Caution: Aven is under heavy development. Brave early adopters are welcome, but everything here is highly unstable, and the API may change at any time.

Aven is a full-stack app framework built with Javascript and React Native, supporting web server, client, and React Native on iOS and Android. Aven includes solutions for rendering views (React Native, RNWeb, RNDOM), navigation (React Navigation), and database syncronization (Aven Cloud).

- Open Source, Apache 2
  - Sustainably-grown OSS with a long future ahead of it
- Opinionated and Incrementally-adopted evolution
  - Stay on the latest infrastructure and adopt the evolving best practices at your own pace
- Shared patterns across all platforms
  - Supports ReactNative, Expo, Razzle for Node.js, Create React App
- Escape hatches for use in production today
  - Easily fall back to custom code for existing apps, or to cover any quirk or missing feature

Learn more on the [Aven website](https://aven.io/about).

## Framework

The framework consists of a few loosly-coupled components which are meant to work well together.

### Aven Views

A component toolkit for React Native and React Native Web. The UI building blocks of an Aven app.

### Aven Cloud

The database abstraction is a set of loosly-coupled modules to connect to databases, perform authentication and validation, and compute derived data from source documents.

### Aven Navigation

Aven apps use React Navigation to share navigation logic and views between the web and react native. Aven Navigation is (will be) a set of navigators that are designed to be idiomatic on every platform, yet still customizable for many occasions.

### Aven Tools

A CLI and modular tooling environment to launch React Native apps on any platform, using a variety of bundlers and deployment mechanisms under the hood. This exists right now as our development environment, but is very rough.
