# Status: Simulation & Testing Modul

## Aktuel Version
1.1.0

## Seneste Opdatering
21. marts 2025

## Status
Under udvikling

## Ansvarlige
- [Indsæt navn på ansvarlig udvikler]

## Afhængigheder
- MongoDB database
- Brugerstyring & Roller modul
- Menu & Måltider modul
- Leverandørstyring modul
- Kontrakt modul
- Python/Flask for simuleringsalgoritmer

## Implementerede Funktioner
- [x] Grundlæggende simuleringsscenario-administration
- [x] Datamodeller for brugeradfærd, menuvalg, ingrediensanalyse og indkøb
- [x] API-endpoints for simuleringsadministration
- [x] Rapportering af simuleringsresultater
- [x] Integration med andre moduler for dataudveksling
- [x] Detaljeret ingrediensdatamodel med leverandørrabatter og bonusprogrammer
- [x] Kundekontrakt-integration i simuleringsscenarier
- [x] Parametriserede simuleringer med konfigurerbare indstillinger
- [x] Økonomisk kalkulation med leverandørrabatter

## Ikke-implementerede Funktioner
- [ ] Monte Carlo-simulering for statistisk analyse
- [ ] Machine Learning-baseret simulering
- [ ] Real-time simulering baseret på aktuelle data
- [ ] Avanceret scenariesammenligning
- [ ] Digital Twin af kantinesystemet

## Kendte Problemer
- Simuleringsalgoritmer kræver store mængder data for at være præcise
- Performance kan være langsom ved komplekse simuleringer med mange parametre
- Manglende validering af simuleringsresultater mod virkelige data
- Begrænset brugergrænsefladeintegration for simuleringsopsætning

## Planlagte Ændringer
- Optimering af simuleringsalgoritmer for bedre performance i version 1.2.0
- Implementering af validering mod virkelige data i version 1.2.0
- Forbedring af brugergrænsefladen for simuleringsopsætning i version 1.3.0
- Integration med Machine Learning-modeller for mere præcise simuleringer i version 2.0.0

## Ændringslog

### Version 1.1.0 (21. marts 2025)
- Tilføjet detaljeret ingrediensdatamodel med leverandørrabatter og bonusprogrammer
- Implementeret kundekontrakt-integration i simuleringsscenarier
- Tilføjet parametriserede simuleringer med konfigurerbare indstillinger
- Implementeret økonomisk kalkulation med leverandørrabatter
- Forbedret rapportering med detaljerede økonomiske og bæredygtighedsanalyser
- Optimeret simuleringsalgoritmer for bedre performance

### Version 1.0.0 (15. marts 2025)
- Initial release
- Grundlæggende simuleringsscenario-administration implementeret
- Datamodeller for brugeradfærd, menuvalg, ingrediensanalyse og indkøb implementeret
- API-endpoints for simuleringsadministration implementeret
- Rapportering af simuleringsresultater implementeret
- Integration med andre moduler for dataudveksling implementeret

## Specifikke Fokusområder for Simulering

### Brugervalg af Måltider
Modulet er specifikt designet til at simulere brugernes valg mellem 3 daglige retter og indsamle følgende data:

- **Måltidsvalg**: Hvilken af de 3 tilgængelige retter pr. dag brugeren vælger
- **Ingrediensdata**: Hvilke ingredienser der er brugt i hver ret, mængder, og detaljer
- **Økonomiske data**: Hvad hver ingrediens koster og den samlede måltidspris
- **Bæredygtighedsdata**: CO2-aftryk for hver ingrediens og det samlede måltid
- **Ernæringsdata**: Allergener, næringsindhold og andre ernæringsmæssige faktorer
- **Leverandørdata**: Oprindelsesland, leverandør og økologisk status for hver ingrediens

### Dataindsamling og Analyse
Simuleringen er designet til at indsamle og analysere data for at besvare følgende spørgsmål:

1. Hvilke retter er mest populære og hvorfor?
2. Hvordan påvirker ingredienssammensætningen populariteten af en ret?
3. Hvad er de økonomiske implikationer af forskellige menuvalg?
4. Hvordan kan vi optimere menuer for at balancere popularitet, omkostninger og bæredygtighed?
5. Hvilke leverandører bør vi vælge baseret på pris, kvalitet og bæredygtighed?

Disse indsigter vil hjælpe med at informere beslutninger om, hvilke funktioner der skal bygges i systemet, og hvordan de skal designes for at imødekomme brugernes behov og forretningens mål.

### Leverandørrabatter og Kundekontrakter
Modulet er nu udvidet til at inkludere:

- **Leverandørrabatter**:
  - Mængderabatter baseret på ordrestørrelse
  - Sæsonrabatter for ingredienser i sæson
  - Kontraktrabatter baseret på kontraktlængde
  - Bonusprogrammer som loyalitetsrabatter og årsbonusser

- **Kundekontrakter**:
  - Integration med kontraktmodulet for at hente kontraktdetaljer
  - Filtrering af måltider baseret på kontraktbetingelser
  - Overholdelse af budgetgrænser pr. måltid
  - Overholdelse af bæredygtighedskrav (økologisk procent, CO2-reduktion)
  - Brug af godkendte leverandører

### Økonomisk Kalkulation
Modulet kan nu beregne:

- Rabatterede priser baseret på leverandørrabatter
- Faktiske omkostninger pr. måltid med rabatter
- Sammenligning af forskellige leverandørscenarier
- Optimering af indkøb baseret på kontraktbetingelser og leverandørrabatter
- Langsigtet økonomisk analyse baseret på kontraktlængde og volumenforpligtelser

### Bæredygtighedsanalyse
Modulet kan nu analysere:

- CO2-aftryk for forskellige leverandørscenarier
- Overholdelse af bæredygtighedskrav i kundekontrakter
- Optimering af menuer for at minimere CO2-aftryk
- Balancering af økonomiske og bæredygtighedsmæssige hensyn
