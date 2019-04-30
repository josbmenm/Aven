


# Create primary startup program

chromium-browser --kiosk --app=http://192.168.1.200:8830/Kitchen --start-fullscreen --no-default-browser-check --disable-infobars --password-store=basic

# Disable Cursor

Startup program:

unclutter -idle 1
