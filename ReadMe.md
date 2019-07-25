# OnoFoodCo Source

## Run Native

```
yarn

# Wait for this server to start, then kill it or go to a new tab
yarn start playground-native

# Get the iOS env up and running:
cd env-portal/ios
pod install --repo-update
open portal.xcworkspace
# build in xcode, run in 12.9-inch iPad simulator
cd ../..

# use this command to start metro, so that it syncs source files into env-portal/src-sync
yarn start playground-native
```

## Run Web Playground

```
yarn
yarn start playground
```
