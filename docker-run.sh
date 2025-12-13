docker rm --force studyup-frontend
docker run --restart always -p 30109:80 --name studyup-frontend studyup-frontend