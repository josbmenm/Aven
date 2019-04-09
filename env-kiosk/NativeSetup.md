# Notes from setting up a fresh native dir

Rn init
Run iOS
Open Xcode
Change display name
Change deployment target to 12.2 (or latest)
Change bundle ID to match apple profile
Set up app ID and in-house provisioning profile
Select new provisioning profile in Xcode
Select team+cert for tests target
Devices, select iPad
Disable landscape
Schemes
release scheme, set release, disable debug app
debug scheme, set release
hide others

yarn add react-native-code-push

To see deploy key: appcenter codepush deployment list --app OnoFoodCo/Blitz -k

React-native link, enter iOS key

yarn add -D appcenter-cli

Log in to code push

npx appcenter codepush release-react --app OnoFoodCo/Blitz

<test codepush is working>

yarn add react-native-gesture-handler react-native-screens react-native-reanimated

copy in swift code and headers, add to target, fix bridging header
