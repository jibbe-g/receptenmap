# De Receptenmap

React **18.3.1** + Vite + Firebase Authentication / Firestore + Recharts. Hosting: **Cloudflare Pages**, standaard `pages.dev`-adres. Fotoherkenning: Tesseract.js op het apparaat. Geen Cloudflare Worker, D1 of R2 nodig.

## 1. Probeer lokaal

Installeer Node.js 22 LTS of nieuwer en Git. Open deze projectmap in een terminal:

```sh
npm ci
npm run dev
```

Open de localhost-link die Vite toont. Zonder Firebase-configuratie draait een **lokale demo** met drie voorbeeldrecepten. Opslaan schrijft alleen in de huidige browser. Een demo online publiceren maakt geen gedeelde database. Exporteer demorecepten voordat je overstapt.

## 2. Maak je GitHub-repository

1. Maak op GitHub een lege repository, bijvoorbeeld `receptenmap`. Een private repository is prima. Voeg daar nog geen README toe.
2. Voer in deze projectmap uit (vervang gebruikersnaam):

```sh
git init
git add .
git commit -m "Maak gedeelde receptenmap met React en Firebase"
git branch -M main
git remote add origin https://github.com/JOUW-GEBRUIKERSNAAM/receptenmap.git
git push -u origin main
```

Meld je bij GitHub aan via je eigen Git-client of GitHub Desktop. Upload geen `node_modules`, `dist`, echte `.env`-bestanden of privésleutels. De `.gitignore` is aanwezig. Je kunt ook deze map met GitHub Desktop publiceren.

## 3. Maak Firebase klaar

1. Open https://console.firebase.google.com en maak een project. Analytics is niet nodig.
2. Voeg via Projectinstellingen een **web-app** toe. Firebase Hosting hoef je niet te activeren; hosting komt op Cloudflare.
3. Kopieer `.env.example` naar `.env.local` en vul de vier publieke webconfigwaarden in: `apiKey`, `authDomain`, `projectId`, `appId`. Laat `VITE_LIBRARY_ID=keuken` staan. Dit zijn browserconfiguratiegegevens, geen service-account-sleutels. **Alles met `VITE_` is zichtbaar in de gepubliceerde app.**
4. Ga naar Authentication → Aan de slag → Inlogmethode → Google. Activeer Google en kies een support-e-mailadres. Controleer bij Authentication → Instellingen → Geautoriseerde domeinen dat `localhost` is toegevoegd voor lokaal testen.
5. Maak een **Cloud Firestore** database in **production mode**, met database-ID `(default)`. Kies zorgvuldig een regio, bijvoorbeeld een Europese regio dicht bij je team; de locatie is achteraf niet eenvoudig te veranderen.
6. Plak de volledige inhoud van `firestore.rules` in Firestore → Regels en klik Publiceren. Gebruik geen openbare testregels. Deze regels vormen de toegangsbeveiliging; een verborgen Firebase API-key vervangt ze niet.
7. Maak in Firestore → Gegevens een document op dit pad:
   `libraries/keuken/members/jouw-google-email@gmail.com`
   Gebruik je **exacte e-mailadres zoals Google het aan de app doorgeeft**, normaal kleine letters. Voeg bijvoorbeeld veld `name` (string) met je naam toe. Het bovenliggende document `libraries/keuken` mag bijvoorbeeld veld `name: Receptenmap` bevatten.
8. Maak voor iedere collega eenzelfde document onder `members`, met diens Google-e-mailadres als document-ID. Leden kunnen alle recepten bekijken, toevoegen, bewerken en verwijderen. Alleen de beheerder voegt via de Firebase Console leden toe. Gebruik voor deze eerste versie Google-accounts.
9. Herstart `npm run dev` na het invullen van `.env.local`. Log in met Google. De gedeelde database begint leeg: voeg een recept toe of importeer een JSON-export uit de oude HTML-map. Voorbeeldrecepten worden nooit automatisch centraal toegevoegd.

Je kunt regels ook met de Firebase CLI publiceren, na aanmelden op jouw account: `npx firebase-tools deploy --only firestore:rules --project JOUW-PROJECT-ID`. Hiervoor is de Console ook voldoende; een extra CLI is niet vereist.

## 4. Publiceer via Cloudflare Pages + GitHub

1. Open Cloudflare Dashboard → Workers & Pages → Create application → **Pages** → Import an existing Git repository. Kies Pages, niet een Worker-project.
2. Verbind je GitHub-account en selecteer alleen de bedoelde repository.
3. Stel in:

| Instelling | Waarde |
| --- | --- |
| Production branch | `main` |
| Framework preset | React / Vite (of None met de waarden hieronder) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | leeg, als `package.json` in de repository-root staat |
| Node.js-versie | `22` (eventueel via `NODE_VERSION=22`) |

4. Voeg bij build environment variables de waarden uit `.env.local` toe: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_LIBRARY_ID`. Voeg ze toe voor **Production**. Preview krijgt alleen toegang als je daar bewust dezelfde configuratie instelt; gebruik bij voorkeur een apart Firebase-project voor previews.
5. Klik Save and Deploy. Cloudflare geeft je een adres zoals `https://receptenmap.pages.dev`. De werkelijke naam hangt af van beschikbaarheid.
6. Voeg **de exacte hostnaam** `receptenmap.pages.dev` toe aan Firebase Authentication → Instellingen → Geautoriseerde domeinen. Geen `https://` en geen pad. Laat `VITE_FIREBASE_AUTH_DOMAIN` op de door Firebase opgegeven waarde staan.
7. Open de live site. Log in met een toegelaten account, voeg een testrecept toe en controleer op een tweede apparaat/account dat het verschijnt. Probeer ook een niet-toegelaten account: dat hoort geen recepten te kunnen lezen.

Elke push naar `main` activeert daarna een nieuwe Pages-build. Wijzig je buildvariabelen? Start een nieuwe deployment; Vite neemt deze waarden tijdens het bouwen op.

## Werking en grenzen

- Recepten staan centraal in Firestore, met realtime updates voor aangemelde leden.
- Opslaan en verwijderen gebruiken transacties. Als een collega hetzelfde recept intussen wijzigde, wordt je invoer niet overschreven: er verschijnt een fout en je kunt de invoer als nieuw recept bewaren.
- **Deze versie vereist internet voor aanmelden en centraal opslaan.** Er is geen offline-wachtrij of service worker. Een al geladen pagina kan tijdelijk zichtbare recepten tonen bij verbindingsverlies. Browserherladen zonder internet wordt niet gegarandeerd.
- De status 'Verbinding controleren' duidt op nog niet door de server bevestigde snapshotgegevens. 'Centraal opgeslagen' verschijnt pas na een bevestigde write.
- Sessie-login blijft binnen de huidige browsersessie. Gedeelde recepten worden niet bewust in een persistente Firestore-browsercache opgeslagen. Favorieten zijn lokaal per browser.
- Verwijder je een lid, dan worden volgende reads/writes geweigerd; eerder bekeken of geëxporteerde inhoud kun je niet terughalen.
- Importeer de JSON-export van de oorspronkelijke HTML-map. Exact dezelfde inhoud wordt overgeslagen; afwijkende inhoud krijgt een nieuw document, zodat bestaande recepten behouden blijven. Maximaal 500 recepten / 10 MB per import. Een onderbroken import kan deels geslaagd zijn; opnieuw importeren slaat al geladen identieke recepten over. Bij gelijktijdige imports kan dubbeling ontstaan.
- De app exporteert JSON-back-ups. Het HTML-bestand zelf doorsturen is in deze React-versie vervangen door een gedeelde website-link.
- Fotoherkenning verwerkt een JPG/PNG/WebP lokaal, maar downloadt software en taaldata via externe distributiepunten. Geen upload van de foto naar een OCR-dienst. Geen opslag van originele foto's. Controleer herkende hoeveelheden, indeling en allergenen altijd zelf.
- Recharts toont aantallen per categorie, aantal vermelde makers en gemiddelde bereidingstijd; er worden geen bezoekgegevens verzameld.
- Firebase en Cloudflare hebben gebruikslimieten en tarieven. Controleer de actuele quota in je eigen accounts.

## Controle

```sh
npm test
npm run build
```

De geautomatiseerde tests controleren importcompatibiliteit, invoervalidatie, tekstindeling en portieomrekening. Zonder eigen Firebase-/Cloudflare-account zijn authenticatie, Firestore-regels en een productie-deployment **nog niet end-to-end geverifieerd**. Test toegestane/geweigerde accounts en gelijktijdig bewerken vóór gebruik met echte recepten.
