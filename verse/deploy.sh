rsync -a -e "ssh -p 8848" ./ ono@restaurant0.maui.onofood.co:/home/ono/ono-build/
ssh -p 8848 -t ono@restaurant0.maui.onofood.co pm2 restart all --update-env