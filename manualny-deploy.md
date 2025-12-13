# Jak wrzucic recznie

1. Lokalnie

   1. Zipujemy folder zespolowka

   ```sh
   rm -rf ./zespolowka/node_modules
   rm -rf ./zespolowka/dist
   tar czf zespolowka.tar.gz zespolowka
   ```

   2. Uploadujemy `zespolowka.tar.gz`

   ```sh
   curl https://bashupload.com -F=@zespolowka.tar.gz
   ```

   3. Kopiujemy link wyświetlony przez poprzednią komendę

2. VPS

   1. Łączymy się ssh do VPS
   2. Pobieramy plik ze skopiowanego linku

   ```sh
       curl -o ~/zespolowka.tar.gz https://bashupload.com/qo2ea5.gz
   ```

   3. Rozpakowujemy

   ```sh
        rm -rf ~/zespolowka # usuwamy poprzedni
        tar -xvzf zespolowka.tar.gz
   ```

   4. Budujemy obraz dockera

   ```sh
       cd ~/zespolowka
       sudo chmod +x ./docker-build.sh
       sudo ./docker-build.sh
   ```

   5. Uruchamiamy kontener dockera

   ```sh
       cd ~/zespolowka
       sudo chmod +x ./docker-run.sh
       sudo ./docker-run.sh
   ```

   6. Czyścimy pobrane pliki

   ```sh
       rm -rf ~/zespolowka
       rm ~/zespolowka.tar.gz
   ```

   7. [Jednorazowo] Skonfigurować firewall

   ```sh
       sudo ufw allow 30109
       sudo ufw reload
   ```
