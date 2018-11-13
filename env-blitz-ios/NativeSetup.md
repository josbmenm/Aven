# Notes from setting up a fresh native dir

Rn init
Run iOS
Open Xcode
Change display name
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

Following along https://docs.connect.squareup.com/payments/readersdk/setup-ios …

cd ios

ruby <(curl https://connect.squareup.com/readersdk-installer) install --app-id sq0idp-OFMJXFmFVSIW80GQjut73w --repo-password txsocx75qgvswyeg7e7srj7j6cpaeddisg5hush2loie33osc44q

copy in swift code and headers, add to target, fix bridging header

add payment setup line in AppDelegate.m

build target to 12.1
