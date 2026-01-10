# Setup

1.  Tworzymy parę kluczy do połączenia SSH

    1. Generowanie kluczy

    ```
    ssh-keygen -f id_rsa -t rsa -b 4096
    ```

    1.2. Konfiguracja GitHub Actions Secrets

    ```
    ID_RSA - treść pliku id_rsa
    SSH_HOST - hostname serwera
    SSH_PORT - port SSH
    SSH_USER - użytkownik SSH (root)
    ```

    1.3. Konfiguracja klucza publicznego na serwerze

    Dodajemy treść pliku id_rsa.pub do pliku ~/.ssh/authorized_keys, jako nowa linia.

2.  Uprawnienia do Dockera

    Użytkownik używany do połączenia SSH (SSH_USER) musi mieć możliwość
    uruchamiania poleceń docker. W tym celu połączenie SSH odbywa się bezpośrednio na konto `root`, a klucz publiczny (`id_rsa.pub`) został dodany do pliku: /root/.ssh/authorized_keys.

3.  Tworzymy plik opisujący GitHub Action
    Plan:
    1.  Pobierz pliki z repozytorium
    2.  Wykonaj docker build
    3.  Wykonaj docker save celem zapisania obrazu Dockera do pliku
        https://stackoverflow.com/questions/23935141/how-to-copy-docker-images-from-one-host-to-another-without-using-a-repository
    4.  Skopiuj plik obrazu Dockera na serwer (scp)
    5.  Poprzez SSH na serwerze:
        1. Wykonaj docker load celem wczytania obrazu ze skopiowanego pliku
        2. Zatrzymaj istniejący kontener (jeśli istnieje)
        3. Usuń istniejący kontener
        4. Uruchom nowy kontener z nowego obrazu
