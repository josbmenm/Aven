# Aven

A full-stack app framework built with Javascript and React Native, supporting web server, client, and React Native on iOS and Android. Aven includes solutions for rendering views (React Native, RNWeb, RNDOM), navigation (React Navigation), and database syncronization (Aven Cloud).

- Open Source, Apache 2
  - Sustainably-grown OSS with a long future ahead of it
- Opinionated and Incrementally-adopted evolution
  - Stay on the latest infrastructure and adopt the evolving best practices at your own pace
- Shared patterns across all platforms
  - Supports ReactNative, Expo, Razzle for Node.js, Create React App
- Escape hatches for use in production today
  - Easily fall back to custom code for existing apps, or to cover any quirk or missing feature

## Framework

The framework consists of a few loosly-coupled components which are meant to work well and support each-other.

### Aven Cloud

The database layer handles realtime data syncronization, user permissions (coming soon), and helps you manage several sources of data.

### Aven Tools

A CLI and modular tooling environment to launch React Native apps on any platform, using a variety of bundlers and deployment mechanisms under the hood.

### React Navigation

Aven apps use React Navigation to share navigation logic and views between the web and react native.
