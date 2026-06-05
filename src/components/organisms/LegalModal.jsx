import styled from "styled-components";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Box = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 24px;
  padding: 40px 48px;
  width: min(860px, 92vw);
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    padding: 28px 20px;
  }
`;

const Title = styled.h2`
  text-align: center;
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
`;

const Updated = styled.p`
  text-align: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 28px 0;
`;

const Section = styled.section`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
`;

const P = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 6px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const List = styled.ol`
  margin: 0 0 6px 0;
  padding-left: 20px;
`;

const UList = styled.ul`
  margin: 0 0 6px 0;
  padding-left: 20px;
`;

const Li = styled.li`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
`;

const CloseButton = styled.button`
  display: block;
  margin: 24px auto 0;
  padding: 10px 32px;
  background: ${({ theme }) => theme.colors.veryDarkPrimary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
`;

const TermsContent = () => (
  <>
    <Title>Regulamin</Title>
    <Updated>Ostatnia aktualizacja: 18.05.2026</Updated>

    <Section>
      <SectionTitle>Postanowienia ogólne</SectionTitle>
      <List>
        <Li>Niniejszy Regulamin określa zasady korzystania z aplikacji internetowej UniON (dalej: Serwis), prowadzonej przez UniON Team (dalej: Administrator).</Li>
        <Li>Serwis jest aplikacją webową (PWA) służącą do zarządzania notatkami, fiszkami i materiałami edukacyjnymi, z funkcją kalendarza, systemu znajomych i społeczności, z możliwością opcjonalnej integracji z systemem USOS.</Li>
        <Li>Korzystanie z Serwisu jest równoznaczne z akceptacją niniejszego Regulaminu.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Konto użytkownika i rejestracja</SectionTitle>
      <List>
        <Li>Korzystanie z pełnej funkcjonalności Serwisu wymaga założenia konta.</Li>
        <Li>Rejestracja polega na podaniu nazwy użytkownika (username), adresu e-mail oraz hasła.</Li>
        <Li>Po rejestracji wymagane jest potwierdzenie adresu e-mail poprzez wpisanie 6-cyfrowego kodu weryfikacyjnego wysłanego na podany adres e-mail. Do czasu weryfikacji dostęp do Serwisu jest ograniczony.</Li>
        <Li>Użytkownik jest odpowiedzialny za podanie prawdziwych danych oraz za unikalność wybranej nazwy użytkownika.</Li>
        <Li>Hasła są przechowywane wyłącznie w formie zaszyfrowanej (bcrypt) i nie są widoczne dla Administratora.</Li>
        <Li>Jeden adres e-mail i jedna nazwa użytkownika mogą być przypisane tylko do jednego konta.</Li>
        <Li>Użytkownik zobowiązuje się do nieudostępniania danych logowania osobom trzecim oraz do niezwłocznego powiadomienia Administratora o podejrzeniu nieautoryzowanego dostępu.</Li>
        <Li>Administrator zastrzega sobie prawo do zawieszenia lub usunięcia konta naruszającego Regulamin.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Weryfikacja i resetowanie hasła</SectionTitle>
      <List>
        <Li>Na skrzynkę pocztową jest wysyłany kod weryfikacyjny e-mail – jest 6-cyfrowy, ważny przez określony czas i pozwala na maksymalnie 5 prób wpisania. Po przekroczeniu limitu lub wygaśnięciu możliwe jest nadanie nowego kodu.</Li>
        <Li>W przypadku utraty hasła użytkownik może skorzystać z opcji resetowania hasła dostępnej na stronie logowania. Na podany adres e-mail zostanie wysłany 6-cyfrowy kod do resetu hasła.</Li>
        <Li>Kod resetu hasła jest ważny przez 10 minut i pozwala na maksymalnie 5 prób wpisania. Po przekroczeniu limitu lub wygaśnięciu należy zażądać nowy kod.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Integracja z systemem USOS</SectionTitle>
      <List>
        <Li>Serwis oferuje opcjonalną integrację z systemem USOS, umożliwiającą zsynchronizowanie planu zajęć z kontem użytkownika.</Li>
        <Li>Przed synchronizacją użytkownik wybiera swoją uczelnię.</Li>
        <Li>Synchronizacja planu wymaga zalogowania się przez system USOS. Tokeny dostępu są używane wyłącznie jednorazowo do pobrania planu zajęć i nie są trwale przechowywane przez Serwis. Administrator nie przechowuje hasła do systemu USOS.</Li>
        <Li>Po synchronizacji plan zajęć jest zapisywany w Serwisie i dostępny w kalendarzu użytkownika.</Li>
        <Li>Korzystanie z integracji podlega również regulaminowi systemu USOS właściwej uczelni.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Treści użytkownika</SectionTitle>
      <List>
        <Li>Użytkownik może tworzyć, edytować i usuwać własne materiały edukacyjne: fiszki, zestawy fiszek, foldery, notatki, tagi oraz wydarzenia kalendarzowe.</Li>
        <Li>Użytkownik zachowuje prawa do tworzonych przez siebie treści.</Li>
        <Li>Użytkownik udziela Administratorowi nieodpłatnej licencji na przechowywanie i wyświetlanie treści, wyłącznie w celu świadczenia usług Serwisu.</Li>
        <Li>Zabronione jest zamieszczanie treści: naruszających prawa autorskie, zawierających bezprawne, obraźliwe lub pornograficzne materiały, lub służących do nielegalnych działań.</Li>
        <Li>Administrator zastrzega sobie prawo do usunięcia treści naruszających powyższe zasady.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Kalendarz i wydarzenia</SectionTitle>
      <List>
        <Li>Serwis udostępnia funkcję kalendarza, w którym użytkownik może tworzyć własne wydarzenia, ich kategorie i tagi wydarzeń.</Li>
        <Li>Po zsynchronizowaniu planu z USOS zajęcia są automatycznie widoczne w kalendarzu.</Li>
        <Li>Dane kalendarza są widoczne dla Administratora i użytkownika konta.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>System znajomych</SectionTitle>
      <List>
        <Li>Serwis umożliwia wysyłanie i odbieranie zaproszeń do znajomych pomiędzy użytkownikami.</Li>
        <Li>Dodanie do znajomych wymaga akceptacji przez odbiorcę zaproszenia.</Li>
        <Li>Użytkownik może w dowolnym momencie usunąć osobę ze znajomych lub odrzucić zaproszenie.</Li>
        <Li>Adresy e-mail użytkowników nie są widoczne dla innych użytkowników.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Społeczności i role użytkowników</SectionTitle>
      <List>
        <Li>Serwis umożliwia tworzenie Społeczności – przestrzeni współpracy, w których użytkownicy mogą dzielić się materiałami edukacyjnymi (notatki i zestawy fiszek).</Li>
        <Li>Dołączenie do społeczności jest możliwe poprzez link zapraszający lub bezpośrednie zaproszenie od Administratora społeczności (o ile jest się z nim dodanym jako znajomi).</Li>
        <Li>
          W ramach społeczności obowiązują następujące role:
          <UList>
            <Li><strong>Admin</strong> – może dodawać i usuwać członków, przydzielać role, dodawać, edytować i wyświetlać treści.</Li>
            <Li><strong>Editor</strong> – może dodawać, edytować i wyświetlać treści.</Li>
            <Li><strong>Przeglądający (Viewer)</strong> – może wyłącznie wyświetlać treści dostępne w Społeczności.</Li>
          </UList>
        </Li>
        <Li>Twórca Społeczności automatycznie otrzymuje rolę Admina.</Li>
        <Li>Adresy e-mail nie są widoczne dla innych użytkowników.</Li>
        <Li>Użytkownik może opuścić społeczność w dowolnym momencie. Jedynie Administrator przed opuszczeniem musi wyznaczyć następcę lub usunąć społeczność.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Powiadomienia</SectionTitle>
      <List>
        <Li>Serwis wyświetla powiadomienia w aplikacji m.in. o zaproszeniach do znajomych, zaproszeniach do społeczności i innych zdarzeniach.</Li>
        <Li>Powiadomienia są widoczne wyłącznie dla zalogowanego użytkownika, którego dotyczą.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Prawa i obowiązki użytkownika</SectionTitle>
      <P>Użytkownik zobowiązuje się do:</P>
      <UList>
        <Li>Korzystania z Serwisu zgodnie z obowiązującym prawem i niniejszym Regulaminem;</Li>
        <Li>Niepodejmowania działań mogących zakłócić działanie Serwisu;</Li>
        <Li>Niepodbierania danych innych użytkowników;</Li>
        <Li>Niepodszywania się pod inne osoby.</Li>
      </UList>
    </Section>

    <Section>
      <SectionTitle>Prawa i obowiązki Administratora</SectionTitle>
      <List>
        <Li>Administrator zobowiązuje się do utrzymania dostępności Serwisu na jak najwyższym poziomie, z zastrzeżeniem przerw technicznych.</Li>
        <Li>Administrator może wprowadzać zmiany w funkcjonalności serwisu.</Li>
        <Li>Administrator nie ponosi odpowiedzialności za treści publikowane przez użytkowników.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Usunięcie konta</SectionTitle>
      <List>
        <Li>Użytkownik może usunąć swoje konto w dowolnym momencie, z poziomu ustawień profilu.</Li>
        <Li>Usunięcie konta jest nieodwracalne i skutkuje trwałym usunięciem wszystkich danych powiązanych z kontem, w tym treści, wydarzeń, znajomych i członkostw w Społecznościach.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Zmiany Regulaminu</SectionTitle>
      <List>
        <Li>O zmianach użytkownicy zostaną poinformowani e-mailem lub powiadomieniem w Serwisie z co najmniej 14-dniowym wyprzedzeniem.</Li>
        <Li>Dalsze korzystanie z Serwisu po wejściu zmian w życie oznacza ich akceptację.</Li>
      </List>
    </Section>

    <Section>
      <SectionTitle>Postanowienia końcowe</SectionTitle>
      <List>
        <Li>Regulamin podlega prawu polskiemu.</Li>
        <Li>Spory rozstrzygane będą przez właściwy sąd powszechny.</Li>
        <Li>W sprawach nieuregulowanych stosuje się przepisy Kodeksu cywilnego.</Li>
        <Li>Kontakt z administratorem: <StyledLink href="mailto:unionteamproject@gmail.com">unionteamproject@gmail.com</StyledLink></Li>
      </List>
    </Section>
  </>
);

const PrivacyContent = () => (
  <>
    <Title>Polityka prywatności</Title>
    <Updated>Ostatnia aktualizacja: 18.05.2026</Updated>

    <Section>
      <P>Niniejszy dokument opisuje jakie dane osobowe zbiera i przetwarza UniON (dalej: Serwis), prowadzony przez UniON Team (dalej: Administrator), jak je chronimy i jakie prawa przysługują użytkownikowi.</P>
    </Section>

    <Section>
      <SectionTitle>Administrator danych osobowych</SectionTitle>
      <P>Administratorem danych jest: UniON Team, e-mail: <StyledLink href="mailto:unionteamproject@gmail.com">unionteamproject@gmail.com</StyledLink></P>
    </Section>

    <Section>
      <SectionTitle>Jakie dane zbieramy i w jakim celu</SectionTitle>

      <P><strong>Dane konta użytkownika:</strong></P>
      <UList>
        <Li>Nazwa użytkownika – publiczny identyfikator w Serwisie.</Li>
        <Li>Adres e-mail – rejestracja, weryfikacja konta, resetowanie hasła, komunikacja z Administratorem.</Li>
        <Li>6-cyfrowy kod weryfikacyjny e-mail i 6-cyfrowy kod resetu hasła wysyłane na email użytkownika – krótkożyciowe, przechowywane jako hash; usuwane natychmiast po poprawnym użyciu lub po wygaśnięciu/przekroczeniu limitu 5 prób.</Li>
        <Li>Hasło – przechowywane wyłącznie jako hash; niewidoczne dla Administratora ani nikogo innego.</Li>
        <Li>Powiązana uczelnia – jeżeli użytkownik powiąże konto z uczelnią w ramach integracji USOS.</Li>
      </UList>

      <P><strong>Uwierzytelnianie i sesja:</strong></P>
      <UList>
        <Li>Token JWT (Bearer token) – generowany po zalogowaniu, przesyłany w nagłówku HTTP Authorization. Sekret podpisujący token przechowywany jest wyłącznie w konfiguracji serwera. Token jest przechowywany w pamięci przeglądarki użytkownika (Web Storage).</Li>
      </UList>

      <P><strong>Treści tworzone przez użytkownika:</strong></P>
      <UList>
        <Li>Fiszki, zestawy fiszek, notatki, foldery, tagi – przechowywane w celu świadczenia usługi.</Li>
        <Li>Treści udostępnione w społecznościach – widoczne dla członków zgodnie z ich rolami.</Li>
      </UList>

      <P><strong>Kalendarz i wydarzenia:</strong></P>
      <UList>
        <Li>Własne wydarzenia i tagi/kategorie wydarzeń – prywatne dane kalendarza użytkownika.</Li>
        <Li>Zajęcia z USOS mogą być wyświetlane w kalendarzu po zsynchronizowaniu planu.</Li>
      </UList>

      <P><strong>System znajomych i społeczności:</strong></P>
      <UList>
        <Li>Zaproszenia do znajomych (wysłane i odebrane) – przechowywane do czasu przyjęcia, odrzucenia lub usunięcia konta.</Li>
        <Li>Członkostwo w Społecznościach wraz z przypisaną rolą.</Li>
        <Li>Zaproszenia do Społeczności (link i zaproszenie bezpośrednie) – przechowywane do czasu realizacji lub wygaśnięcia.</Li>
      </UList>

      <P><strong>Powiadomienia:</strong></P>
      <UList>
        <Li>Powiadomienia systemowe (np. o zaproszeniach) – widoczne wyłącznie dla danego użytkownika i Administratora.</Li>
      </UList>

      <P><strong>Integracja z USOS (opcjonalna, za zgodą użytkownika):</strong></P>
      <UList>
        <Li>Wybrana uczelnia jest zapisywana w profilu użytkownika po wyborze w ustawieniach.</Li>
        <Li>Plan zajęć – pobierany jednorazowo z API USOS po zalogowaniu przez USOS i zapisywany lokalnie w Serwisie jako dane kalendarza użytkownika.</Li>
        <Li>Tokeny dostępu OAuth do USOS – używane wyłącznie jednorazowo podczas synchronizacji planu, nie są trwale przechowywane w bazie danych.</Li>
      </UList>

      <P><strong>Logi techniczne:</strong></P>
      <UList>
        <Li>Serwis nie zbiera logów aktywności użytkowników. Na serwerze mogą pojawiać się systemowe logi zapytań do bazy danych generowane przez środowisko uruchomieniowe – nie są archiwizowane ani przetwarzane przez Administratora.</Li>
      </UList>
    </Section>

    <Section>
      <SectionTitle>Podstawy prawne przetwarzania (RODO)</SectionTitle>
      <P>Administrator przetwarza dane na podstawie:</P>
      <UList>
        <Li>Art. 6 ust. 1 lit. b RODO – wykonanie umowy (świadczenie usługi Serwisu);</Li>
        <Li>Art. 6 ust. 1 lit. a RODO – zgoda użytkownika (integracja z USOS, opcjonalne funkcje);</Li>
        <Li>Art. 6 ust. 1 lit. f RODO – uzasadniony interes Administratora (bezpieczeństwo konta, zapobieganie nadużyciom).</Li>
      </UList>
    </Section>

    <Section>
      <SectionTitle>Jak długo są przechowywane dane</SectionTitle>
      <UList>
        <Li>Dane konta przechowywane są do momentu usunięcia konta przez użytkownika.</Li>
        <Li>Kody weryfikacyjne i kody resetu hasła są krótkożyciowe (kod resetu ważny 10 minut, maks. 5 prób) – przechowywane jako hash i usuwane automatycznie po użyciu, wygaśnięciu lub przekroczeniu limitu prób.</Li>
        <Li>Tokeny USOS nie są trwale przechowywane – są używane jednorazowo podczas synchronizacji planu i nie pozostają w systemie po jej zakończeniu.</Li>
      </UList>
    </Section>

    <Section>
      <SectionTitle>Udostępnianie danych</SectionTitle>
      <P>Dane nie są sprzedawane ani udostępniane osobom trzecim w celach marketingowych. Dane mogą być przekazywane:</P>
      <UList>
        <Li>Dostawcy hostingu: mikr.us – serwer, na którym działa Serwis i przechowywana jest baza danych.</Li>
        <Li>Organom państwowym – wyłącznie gdy wymagają tego przepisy prawa.</Li>
      </UList>
      <P>Adres e-mail użytkownika nie jest widoczny dla innych użytkowników Serwisu. Publicznie widocznym identyfikatorem jest nazwa użytkownika (username).</P>
    </Section>

    <Section>
      <SectionTitle>Bezpieczeństwo danych</SectionTitle>
      <P>Stosowane środki ochrony:</P>
      <UList>
        <Li>Szyfrowanie haseł algorytmem bcrypt;</Li>
        <Li>Uwierzytelnianie oparte na tokenach JWT podpisanych sekretem przechowywanym wyłącznie po stronie serwera;</Li>
        <Li>Połączenia szyfrowane HTTPS (certyfikat SSL od mikr.us);</Li>
        <Li>Tokeny jednorazowe (weryfikacja e-mail, reset hasła) z ograniczonym czasem ważności i limitem prób;</Li>
        <Li>Tokeny USOS używane jednorazowo do synchronizacji planu – nie przechowywane w bazie danych;</Li>
        <Li>Ograniczony dostęp do danych produkcyjnych – tylko uprawnieni członkowie zespołu;</Li>
        <Li>Serwer zlokalizowany w Finlandii (mikr.us).</Li>
      </UList>
    </Section>

    <Section>
      <SectionTitle>Cookies i lokalna pamięć przeglądarki</SectionTitle>
      <P>Serwis nie używa plików cookies. Token uwierzytelniający JWT jest przechowywany w pamięci przeglądarki użytkownika (Web Storage). Dane te są dostępne wyłącznie dla aplikacji Serwisu działającego w przeglądarce użytkownika i nie są przesyłane do żadnych podmiotów trzecich.</P>
    </Section>

    <Section>
      <SectionTitle>Prawa użytkownika</SectionTitle>
      <P>Na podstawie RODO przysługują Ci prawa:</P>
      <UList>
        <Li>Prawo dostępu – możesz zażądać informacji o przetwarzanych danych;</Li>
        <Li>Prawo do sprostowania – możesz poprawić nieprawidłowe dane (np. zmienić e-mail w ustawieniach);</Li>
        <Li>Prawo do usunięcia – możesz usunąć konto i wszystkie dane z poziomu ustawień Serwisu;</Li>
        <Li>Prawo do ograniczenia przetwarzania;</Li>
        <Li>Prawo do przenośności danych;</Li>
        <Li>Prawo do sprzeciwu wobec przetwarzania;</Li>
        <Li>Prawo do cofnięcia zgody.</Li>
      </UList>
      <P>Kontakt w sprawach praw: <StyledLink href="mailto:unionteamproject@gmail.com">unionteamproject@gmail.com</StyledLink></P>
      <P>Masz również prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych.</P>
    </Section>

    <Section>
      <SectionTitle>Zmiany Polityki</SectionTitle>
      <P>O istotnych zmianach poinformujemy Cię e-mailem lub powiadomieniem w Serwisie z co najmniej 14-dniowym wyprzedzeniem.</P>
    </Section>

    <Section>
      <SectionTitle>Kontakt</SectionTitle>
      <P>W ramach ochrony danych skontaktuj się: <StyledLink href="mailto:unionteamproject@gmail.com">unionteamproject@gmail.com</StyledLink></P>
    </Section>
  </>
);

const LegalModal = ({ type, onClose }) => (
  <Backdrop onClick={onClose}>
    <Box onClick={(e) => e.stopPropagation()}>
      {type === "terms" ? <TermsContent /> : <PrivacyContent />}
      <CloseButton onClick={onClose}>Zamknij</CloseButton>
    </Box>
  </Backdrop>
);

export default LegalModal;
