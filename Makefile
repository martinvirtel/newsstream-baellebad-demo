

deploy: 
	rsync -av --delete --exclude=Makefile --exclude=.git ./ werkzeugkasten:/home/ubuntu/online-auswertung-newsaktuell
