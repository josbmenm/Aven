
echo "Will run: npx appcenter codepush release-react -a $CODE_PUSH_APP -d $CODE_PUSH_CHANNEL --plist-file ios/downpour/Info.plist --output-dir ./codepush-build"

npx appcenter codepush release-react -a $CODE_PUSH_APP -d $CODE_PUSH_CHANNEL --plist-file ios/downpour/Info.plist --output-dir ./codepush-build

export SENTRY_PROPERTIES=./ios/sentry.properties

echo "Will run: sentry-cli react-native appcenter $CODE_PUSH_APP ios ./codepush-build/codePush --deployment $CODE_PUSH_CHANNEL --bundle-id $BUNDLE_ID"

sentry-cli react-native appcenter $CODE_PUSH_APP ios ./codepush-build/codePush --deployment $CODE_PUSH_CHANNEL --bundle-id $BUNDLE_ID --version-name 
