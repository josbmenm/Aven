New ubuntu 18.04 desktop install. minimum install. install 3rd party etc. user ono, pw in confluence
Computer name: restautant0-a (b, c, etc..)
set auto login
apt update and upgrade
sudo apt-get install chromium-browser unclutter -y
power settings, disable dim when inactive, blank screen never
notification settings, turn off both types of notifs
set startup items:

chromium-browser --password-store=basic --no-default-browser-check --kiosk --disable-infobars --app=http://10.10.1.200:8830/Kitchen

unclutter -idle 1 -root
