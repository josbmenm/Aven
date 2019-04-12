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

yarn add react-native-gesture-handler react-native-screens react-native-reanimated linear-gradient blur

link the above

copy in swift code and headers, add to target, fix bridging header

copy in podfile

pod install

open workspace

copy in src

set build settings > swift compiler > obj c bridging header to "src/kiosk-BridgingHeader.h"

copy the info plist stuffs:

    <key>NSAppTransportSecurity</key>
    <dict>
    	<key>NSAllowsArbitraryLoads</key>
    	<true/>
    	<key>NSExceptionDomains</key>
    	<dict>
    		<key>localhost</key>
    		<dict>
    			<key>NSExceptionAllowsInsecureHTTPLoads</key>
    			<true/>
    		</dict>
    	</dict>
    </dict>
    <key>NSBluetoothPeripheralUsageDescription</key>
    <string>Card reader requires Bluetooth to connect.

</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Payment processor requires access to device location for fraud detection</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>Card reader requires access to the microphone.</string>
	<key>UIAppFonts</key>
	<array>
		<string>fonts/Caput.ttf</string>
		<string>fonts/Lora.ttf</string>
		<string>fonts/Lora-Bold.ttf</string>
		<string>fonts/Lora-BoldItalic.ttf</string>
		<string>fonts/Lora-Italic.ttf</string>
		<string>fonts/Maax.ttf</string>
		<string>fonts/Maax-Bold.ttf</string>
		<string>fonts/Maax-BoldItalic.ttf</string>
		<string>fonts/Maax-Italic.ttf</string>
	</array>
