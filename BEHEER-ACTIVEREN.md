# Toegang aanvragen en ledenbeheer activeren

De app bevat nu een aanvraagknop voor ingelogde Google-gebruikers zonder toegang, en een beheerscherm voor het goedkeuren of afwijzen van aanvragen. Cloudflare publiceert de app via GitHub; **Firestore-regels worden niet door Cloudflare gepubliceerd**.

## Eenmalige wijziging in Firebase

1. Open Firestore Database → Rules. Vervang alle regels door de volledige inhoud van `firestore.rules` uit deze repository en klik **Publish**. Bestaande leden blijven toegang houden, ook zonder rolveld.
2. Open Firestore Database → Data. Ga naar `libraries / keuken / members / JOUW-GOOGLE-E-MAILADRES`.
3. Klik **Add field**. Naam: `role`. Type: `string`. Waarde: `admin`. Sla op. Gebruik alleen voor de beheerder deze rol. De bestaande `name` blijft staan.
4. Vernieuw de live site en log in. De knop **Leden & aanvragen** verschijnt.

Als `VITE_LIBRARY_ID` anders is ingesteld, gebruik je die waarde in plaats van `keuken`. De eerste beheerder wordt bewust door de projecteigenaar in de Firebase Console aangewezen. Een bezoeker kan nooit de eerste beheerder claimen.

## Een collega toevoegen

1. Deel de website-link.
2. De collega logt in met een eigen Google-account en klikt **Toegang aanvragen**.
3. Jij opent **Leden & aanvragen** en kiest **Goedkeuren** of **Afwijzen**.
4. Na goedkeuring verschijnt de receptenmap automatisch bij de collega. Goedkeuring maakt de collega editor; alleen expliciet aangewezen beheerders kunnen andere aanvragen behandelen.

Aanvragen blijven als historie in Firestore. Er wordt geen mail verstuurd. Na afwijzing kan de collega opnieuw aanvragen. Bestaande leden verschijnen in de ledenlijst zonder dat ze opnieuw moeten aanvragen.

Het toekennen van beheerdersrollen en verwijderen van leden gebeurt door de eigenaar in de Firebase Console. Zelfpromotie, het wijzigen van e-mailadressen in aanvragen en het beoordelen door gewone leden worden door de Firestore-regels geweigerd.

## Controleren

- Log als beheerder in en controleer dat de knop zichtbaar is.
- Log op een ander apparaat of in een privévenster in met een Google-account dat geen lid is.
- Vraag toegang aan, keur de aanvraag goed en controleer of de recepten zichtbaar worden zonder opnieuw in te loggen.
- Controleer dat de collega geen beheerscherm heeft.

De beveiligingsregels zijn getest met de lokale Firestore Emulator. Gebruik `npm run test:rules` met Node.js 22+ en Java 21+. De tests gebruiken uitsluitend het fictieve project `demo-receptenmap`, niet de productiegegevens.
