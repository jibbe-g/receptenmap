# Receptfoto’s uitlezen met OpenAI

De eerdere Tesseract-herkenning is vervangen door een OpenAI-model dat afbeeldingen leest en de velden van een recept apart teruggeeft. Je controleert de inhoud vóór opslaan. Ontbrekende porties en tijden blijven leeg; de app vult die niet met een standaardgetal.

Dit gebruikt de **OpenAI API**, niet je ingelogde ChatGPT-account. API-gebruik wordt apart afgerekend, ook als je een ChatGPT-abonnement hebt.

## 1. OpenAI instellen

1. Open https://platform.openai.com en maak of selecteer een project.
2. Stel API-billing/tegoed in en controleer de beschikbare modellen en gebruikslimieten.
3. Maak onder **API keys** een nieuwe geheime API-sleutel voor dit project. Als je de sleutel beperkt, moet hij de Responses API mogen gebruiken.
4. Bewaar de sleutel rechtstreeks in Cloudflare zoals hieronder. **Niet in de chat plakken, niet in GitHub zetten en nooit een `VITE_`-naam geven.**

## 2. Cloudflare Pages instellen

Open jouw Pages-project `receptenmap` → **Settings → Variables and Secrets** (in sommige schermen heet dit Environment variables). Voeg voor **Production** toe:

| Naam | Type | Waarde |
| --- | --- | --- |
| `OPENAI_API_KEY` | Secret / encrypted | Je nieuwe geheime OpenAI API-sleutel |
| `FIREBASE_PROJECT_ID` | Text | `receptenmap-59501` |
| `FIREBASE_LIBRARY_ID` | Text, optioneel | `keuken` |
| `OPENAI_MODEL` | Text, optioneel | `gpt-4.1-mini` |

Het standaardmodel is `gpt-4.1-mini`. Een vervangend model moet afbeeldingen en strikte Structured Outputs via de Responses API ondersteunen. De browser kan het model niet wijzigen.

Start na het opslaan een **nieuwe productie-deployment** via Deployments → Retry deployment / Create deployment. De Pages Function wordt vanuit `functions/api/recipe-from-photo.js` automatisch meegebouwd. Build command blijft `npm run build`, output blijft `dist`. Gebruik Git-integratie; alleen de map `dist` handmatig als statische site uploaden levert de serverfunctie niet op.

De server kan ook de bestaande `VITE_FIREBASE_PROJECT_ID` en `VITE_LIBRARY_ID` als fallback gebruiken, maar de expliciete servervariabelen hierboven hebben de voorkeur. Er is **geen Firebase service-accountbestand of privésleutel** nodig. De functie verifieert het Firebase ID-token en raadpleegt Firestore met de identiteit van het ingelogde lid.

## 3. Firebase-regels opnieuw publiceren

Open Firestore Database → **Rules**, vervang de volledige inhoud door het actuele `firestore.rules` uit deze repository en klik **Publish**. Dit voegt regels toe voor `photoUsage`, met een gebruikslimiet per lid. De bestaande leden- en receptenregels blijven behouden. De collectie verschijnt vanzelf bij het eerste gebruik; je hoeft geen tellers handmatig te maken.

Elke ingelogde, goedgekeurde gebruiker kan maximaal **20 foto-aanvragen in een venster van 24 uur** starten, met **15 seconden tussen aanvragen**. De eerste aanvraag start het venster. Mislukte aanvragen tellen ook mee zodra de aanvraag is gereserveerd. De server controleert de reservering vóór een OpenAI-aanroep. Firestore-regels blokkeren ook het direct terugzetten van een teller door een client. Stel daarnaast passende limieten en waarschuwingen in je eigen OpenAI-project in en controleer het verbruik.

## 4. Probeer een receptfoto

1. Vernieuw https://receptenmap.pages.dev en log in als lid.
2. Kies **Recept uit foto**, selecteer een scherpe JPG/PNG/WebP-foto en klik **Recept uitlezen met AI**.
3. De verkleinde foto wordt naar OpenAI gestuurd. De app bewaart geen originele foto in Firebase of Cloudflare.
4. Controleer waarschuwingen, kies **Controleer en vul aan** en controleer ingrediënten, hoeveelheden, porties, tijd en bereiding.
5. Klik pas daarna op **Recept opslaan**.

De API-aanroep gebruikt `store: false`. OpenAI kan eigen bewaartermijnen voor beveiliging of misbruikcontrole hanteren; raadpleeg het actuele API-gegevensbeleid. Er worden geen foto’s of tokens naar applicatielogs geschreven.

Als je geen foto wilt versturen, kun je onder **Zelf tekst plakken** recepttekst invullen. De oorspronkelijke offline HTML-map blijft een apart oud bestand; deze AI-functie werkt alleen op de online React-site.

## Probleemoplossing

- **Nog niet geactiveerd**: controleer `OPENAI_API_KEY` als serversecret en publiceer opnieuw.
- **Serverconfiguratie ontbreekt**: voeg `FIREBASE_PROJECT_ID` toe aan de runtimevariabelen.
- **Regels publiceren / aanvraag niet gereserveerd**: publiceer het nieuwste `firestore.rules`. Wacht daarna minstens 15 seconden vóór opnieuw proberen.
- **OpenAI-limiet of tegoed bereikt**: controleer API-billing en modeltoegang in het OpenAI-project. ChatGPT-billing is hiervan gescheiden.
- **Serverfunctie niet beschikbaar**: controleer dat Cloudflare de Functions-map heeft meegebouwd. `/api/recipe-from-photo` hoort bij een GET-aanvraag status 405 te geven, en zonder login bij POST status 401.

## Lokaal testen en verifiëren

Voor een lokale demo zonder AI: `npm run dev`. Voor de echte Pages-serverfunctie:

1. Kopieer `.env.example` naar `.env.local` en stel je publieke Firebase-webconfig in voor de Vite-build.
2. Kopieer `.dev.vars.example` naar `.dev.vars` en stel daar de lokale serversecret in.
3. Voer `npm run build` uit en daarna `npm run dev:pages`.
4. Open het door Wrangler getoonde lokale adres. Zorg dat `localhost` in Firebase Authentication bij geautoriseerde domeinen staat.

Controles: `npm test`, `npm run test:rules`, `npm run build`, `npm run check:functions`. De tests gebruiken een gesimuleerde OpenAI-respons; de emulator controleert de echte Firestore-regels en REST-reservering in een fictief project. Werkelijke fotoherkenning en kosten worden pas getest nadat de eigenaar een API-sleutel heeft ingesteld en zelf een foto verwerkt.
