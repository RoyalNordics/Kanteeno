# Kanteeno – Modul: Menu & Måltider

## 1. Formål
Dette modul håndterer oprettelse, administration og visning af menuer og måltider i Kanteeno-systemet. Det sikrer, at brugere kan se og bestille måltider, og at administratorer kan oprette og administrere menuer.

## 2. Funktionalitet
### 1. Menuadministration
- Opret, rediger og slet menuer.
- Planlæg menuer for specifikke datoer.
- Tilknyt måltider til menuer.
- Kategoriser menuer (fx dagsmenu, ugemenu, specialmenu).

### 2. Måltidshåndtering
- Opret, rediger og slet måltider.
- Definer ingredienser, allergener og næringsindhold.
- Upload billeder af måltider.
- Prissætning af måltider.

### 3. Kategorisering & Filtrering
- Kategoriser måltider (vegetarisk, vegansk, etc.).
- Filtrer måltider baseret på allergener.
- Søg efter måltider baseret på navn, ingredienser eller kategori.

### 4. Visning & Præsentation
- Visning af dagens/ugens menu.
- Detaljeret visning af måltider med billeder og information.
- Fremhævning af populære eller anbefalede måltider.

## 3. Specifikke Krav
**Database (MongoDB)**

**Collection: menus**
- id (ObjectId, Primær nøgle)
- name (String)
- description (String)
- startDate (Date)
- endDate (Date)
- businessUnitId (ObjectId, reference til businessUnits)
- status (String: active/inactive)
- createdAt (Date)
- updatedAt (Date)

**Collection: meals**
- id (ObjectId, Primær nøgle)
- name (String)
- description (String)
- ingredients (Array af Strings)
- allergens (Array af Strings)
- nutritionalInfo (Object)
  - calories (Number)
  - protein (Number)
  - carbs (Number)
  - fat (Number)
  - fiber (Number)
- price (Number)
- imageUrl (String)
- categories (Array af Strings)
- isVegetarian (Boolean)
- isVegan (Boolean)
- isGlutenFree (Boolean)
- isLactoseFree (Boolean)
- createdAt (Date)
- updatedAt (Date)

**Collection: menuItems**
- id (ObjectId, Primær nøgle)
- menuId (ObjectId, reference til menus)
- mealId (ObjectId, reference til meals)
- date (Date)
- quantity (Number)
- specialPrice (Number, optional)

## 4. API Endpoints
**Menu API:**
- `/api/menus` (GET): Hent alle menuer
- `/api/menus/:id` (GET): Hent specifik menu
- `/api/menus` (POST): Opret en ny menu
- `/api/menus/:id` (PUT): Opdater en menu
- `/api/menus/:id` (DELETE): Slet en menu
- `/api/menus/:id/items` (GET): Hent alle måltider i en menu
- `/api/menus/:id/items` (POST): Tilføj et måltid til en menu
- `/api/menus/:id/items/:itemId` (DELETE): Fjern et måltid fra en menu

**Måltid API:**
- `/api/meals` (GET): Hent alle måltider
- `/api/meals/:id` (GET): Hent specifikt måltid
- `/api/meals` (POST): Opret et nyt måltid
- `/api/meals/:id` (PUT): Opdater et måltid
- `/api/meals/:id` (DELETE): Slet et måltid
- `/api/meals/categories` (GET): Hent alle måltidskategorier
- `/api/meals/search` (GET): Søg efter måltider

## 5. Forbindelser til Andre Moduler
- **Brugerstyring & Roller**: Kun godkendte brugere kan administrere menuer og måltider.
- **Ordrehåndtering**: Måltider kan bestilles gennem ordresystemet.
- **Forecasting & AI**: Måltidsdata bruges til at forudsige popularitet og optimere menuer.
- **Leverandørstyring**: Ingredienser til måltider kan knyttes til leverandører.
- **Rapportering & Analytics**: Data om populære måltider bruges i rapporter.

## 6. Forventninger
- Måltider skal have **komplet næringsindhold**.
- Alle allergener skal være **tydeligt markeret**.
- Billeder skal være i **høj kvalitet** og ensartet format.
- Menuer skal kunne planlægges **mindst 2 uger frem**.
- Priser skal være **opdaterede og korrekte**.

## 7. Fremtidige Udvidelser
- **Sæsonbaserede menuer**: Automatisk tilpasning baseret på årstid.
- **Personaliserede anbefalinger**: Integration med AI til personlige forslag.
- **Interaktive opskrifter**: Detaljerede trin-for-trin guides til måltidsforberedelse.
- **Kalorieberegner**: Værktøj til at beregne kalorieindtag baseret på valgte måltider.
- **Måltidskombinationer**: Forslag til kombinationer af måltider.

## 8. Design Overvejelser
- **UI-Komponenter**:
  - Menukort med billeder og kort beskrivelse.
  - Detaljeret måltidsvisning med ingredienser og næringsindhold.
  - Administrativt dashboard til menuplanlægning.
  - Filtreringsværktøjer til at finde måltider baseret på præferencer.
  - Kalenderoversigt for menuplanering.
