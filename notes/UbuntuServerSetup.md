New ubuntu 18.04 desktop install user ono, pw..
Computer name: ono-status
set auto login
apt update and upgrade
sudo apt-get install chromium-browser unclutter -y
power settings, disable dim when inactive, blank screen never
set startup items:

chromium-browser --password-store=basic --no-default-browser-check --kiosk --disable-infobars --app=http://10.10.1.200:8830/Kitchen

unclutter -idle 1 -root
