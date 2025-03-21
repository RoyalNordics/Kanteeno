# Monte Carlo-simulering i Kanteeno

## Hvad er Monte Carlo-simulering?

Monte Carlo-simulering er en matematisk teknik, der bruges til at estimere mulige udfald af en usikker proces. Metoden er opkaldt efter kasinoområdet Monte Carlo i Monaco, der er kendt for sine kasinoer og spil baseret på tilfældighed. Teknikken blev udviklet under Manhattan-projektet i 1940'erne af videnskabsmænd, der arbejdede på udviklingen af atombomben.

I sin kerne involverer Monte Carlo-simulering følgende trin:
1. Definer en domænemodel af mulige inputs
2. Generer tilfældige inputs fra denne domænemodel
3. Udfør en deterministisk beregning på disse inputs
4. Aggreger resultaterne af beregningerne

Ved at gentage denne proces mange gange (ofte tusindvis eller millioner af gange) kan man opnå en statistisk fordeling af mulige udfald og deres sandsynligheder.

## Anvendelse i Kanteeno

I Kanteeno-systemet kan Monte Carlo-simulering bruges til at håndtere usikkerhed og variabilitet i forskellige aspekter af kantinedriften:

### 1. Brugeradfærdssimulering
- **Fremmødevariabilitet**: Simulering af variationer i dagligt fremmøde baseret på historiske data og sandsynlighedsfordelinger
- **Menuvalgsusikkerhed**: Modellering af usikkerhed i brugervalg mellem forskellige menumuligheder
- **Sæsonvariationer**: Simulering af sæsonmæssige ændringer i præferencer og fremmøde

### 2. Økonomisk Simulering
- **Prisusikkerhed**: Modellering af usikkerhed i ingredienspriser over tid
- **Rabateffektivitet**: Simulering af forskellige rabatscenarier og deres sandsynlige økonomiske effekt
- **Budgetrisiko**: Vurdering af risikoen for budgetoverskridelser under forskellige scenarier

### 3. Leverandørsimulering
- **Leveringstidsusikkerhed**: Modellering af variabilitet i leveringstider
- **Kvalitetsvariationer**: Simulering af variationer i ingredienskvalitet
- **Leverandørpålidelighed**: Vurdering af risikoen for leverandørsvigt

### 4. Madspildssimulering
- **Efterspørgselsvariabilitet**: Simulering af variationer i efterspørgsel og deres effekt på madspild
- **Holdbarhedsusikkerhed**: Modellering af usikkerhed i ingrediensers holdbarhed
- **Produktionsplanlægning**: Optimering af produktionsmængder for at minimere madspild under usikkerhed

## Implementering i Kanteeno

For at implementere Monte Carlo-simulering i Kanteeno-systemet, skal følgende komponenter udvikles:

### 1. Sandsynlighedsfordelingsmodeller
- **Normalfordeling**: For variabler som fremmøde, der typisk følger en klokkeformet kurve
- **Binomialfordeling**: For ja/nej-beslutninger som f.eks. om en bruger vælger en bestemt ret
- **Poissonfordeling**: For begivenheder som antal klager eller særlige anmodninger
- **Triangulærfordeling**: For variabler med kendt minimum, maksimum og mest sandsynlig værdi

### 2. Simuleringsmotor
- **Tilfældig prøveudtagning**: Algoritmer til at generere tilfældige værdier fra forskellige fordelinger
- **Iterationsmekanisme**: System til at gentage simuleringer mange gange
- **Parallelle beregninger**: Optimering for at køre mange simuleringer samtidigt

### 3. Resultatanalyse
- **Statistisk analyse**: Beregning af gennemsnit, median, standardafvigelse, etc.
- **Konfidensintervaller**: Bestemmelse af intervaller for forventede udfald
- **Sensitivitetsanalyse**: Identifikation af de mest indflydelsesrige variabler
- **Ekstremværdianalyse**: Analyse af worst-case og best-case scenarier

### 4. Visualisering
- **Histogrammer**: Visning af fordelinger af mulige udfald
- **Kumulative fordelingsfunktioner**: Visning af sandsynligheden for at opnå et bestemt resultat eller bedre
- **Tornado-diagrammer**: Visning af sensitivitetsanalyseresultater
- **Heatmaps**: Visning af korrelationer mellem forskellige variabler

## Eksempel: Monte Carlo-simulering af måltidsefterspørgsel

Her er et eksempel på, hvordan Monte Carlo-simulering kan bruges til at estimere efterspørgslen efter en bestemt ret:

1. **Definer inputvariabler og deres fordelinger**:
   - Dagligt fremmøde: Normalfordeling (μ=300, σ=30)
   - Andel der vælger retten: Triangulærfordeling (min=10%, mest sandsynlig=20%, max=35%)
   - Portionsstørrelse: Normalfordeling (μ=350g, σ=50g)

2. **Generer tilfældige scenarier**:
   - For hver simulering, træk tilfældige værdier fra hver fordeling
   - F.eks. Fremmøde=285, Andel=18%, Portionsstørrelse=365g

3. **Beregn resultater for hvert scenario**:
   - Antal portioner = Fremmøde × Andel = 285 × 18% = 51 portioner
   - Total mængde = Antal portioner × Portionsstørrelse = 51 × 365g = 18.6kg

4. **Gentag mange gange og aggreger resultater**:
   - Kør 10.000 simuleringer
   - Beregn gennemsnit, median, 10. og 90. percentil for antal portioner og total mængde
   - Generer histogrammer og kumulative fordelingsfunktioner

5. **Fortolk resultater**:
   - "Der er 90% sandsynlighed for, at vi skal bruge mellem 42 og 68 portioner"
   - "Der er kun 5% sandsynlighed for, at vi skal bruge mere end 22kg ingredienser"
   - "Den mest sandsynlige efterspørgsel er omkring 54 portioner"

## Fordele ved Monte Carlo-simulering i Kanteeno

1. **Håndtering af usikkerhed**: I stedet for at basere beslutninger på enkelte punktestimater, giver Monte Carlo-simulering en fordeling af mulige udfald.

2. **Risikovurdering**: Metoden giver mulighed for at kvantificere risikoen for forskellige udfald, såsom risikoen for at løbe tør for en populær ret.

3. **Scenarieanalyse**: Forskellige scenarier kan sammenlignes baseret på deres sandsynlighedsfordelinger, ikke kun deres gennemsnit.

4. **Beslutningsstøtte**: Ledere kan træffe mere informerede beslutninger baseret på sandsynligheder og risikovurderinger.

5. **Optimering under usikkerhed**: Systemet kan optimere beslutninger som indkøbsmængder under hensyntagen til usikkerhed.

## Tekniske krav til implementering

1. **Beregningskraft**: Monte Carlo-simuleringer kræver betydelig beregningskraft, især når mange variabler og iterationer er involveret.

2. **Statistisk ekspertise**: Udvikling af korrekte sandsynlighedsmodeller kræver statistisk ekspertise.

3. **Dataindsamling**: Nøjagtige simuleringer kræver gode historiske data til at estimere sandsynlighedsfordelinger.

4. **Brugervenlig grænseflade**: Komplekse statistiske resultater skal præsenteres på en måde, der er forståelig for ikke-statistikere.

5. **Integrationsmuligheder**: Monte Carlo-modulet skal integreres med andre dele af Kanteeno-systemet for at bruge realtidsdata.

## Implementeringsplan

### Fase 1: Grundlæggende Monte Carlo-funktionalitet
- Implementering af grundlæggende sandsynlighedsfordelinger
- Udvikling af simuleringsmotor med simpel iterationsmekanisme
- Implementering af grundlæggende statistisk analyse
- Udvikling af simple visualiseringer (histogrammer, CDF'er)

### Fase 2: Avanceret Monte Carlo-funktionalitet
- Implementering af mere avancerede fordelinger og korrelationsmodeller
- Optimering af simuleringsmotor for parallelle beregninger
- Implementering af sensitivitetsanalyse og ekstremværdianalyse
- Udvikling af avancerede visualiseringer (tornado-diagrammer, heatmaps)

### Fase 3: Integration og anvendelse
- Integration med andre Kanteeno-moduler
- Udvikling af domænespecifikke Monte Carlo-modeller for forskellige aspekter af kantinedriften
- Implementering af brugervenlig grænseflade for opsætning og fortolkning af simuleringer
- Træning af brugere i anvendelse og fortolkning af Monte Carlo-resultater

## Konklusion

Monte Carlo-simulering er en kraftfuld teknik, der kan hjælpe Kanteeno-systemet med at håndtere usikkerhed og variabilitet i kantinedriften. Ved at implementere denne teknik kan systemet give mere realistiske og nuancerede forudsigelser og anbefalinger, der tager højde for den iboende usikkerhed i mange aspekter af kantinedriften. Dette vil føre til bedre beslutninger, reduceret madspild, optimerede omkostninger og forbedret kundetilfredshed.
