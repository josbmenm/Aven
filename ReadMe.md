# OnoFoodCo Source

## Run Native

```
yarn
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
