# Kanteeno – Modul: Brugerstyring & Roller

## 1. Formål
Dette modul håndterer oprettelse, administration og tildeling af roller og tilladelser til brugere i Kanteeno-systemet. Det sikrer, at brugerne kun har adgang til de funktioner, de har behov for, og understøtter dynamisk adgangsstyring.

## 2. Funktionalitet
### 1. Brugeradministration
- Opret, rediger og slet brugere.
- Tildel roller og adgangsniveauer.
- Se brugeres loginhistorik og aktivitetslog.
- Midlertidig adgangsstyring (fx gæsteadgang).

### 2. Rollehåndtering
- Definer roller (fx Admin, Manager, Leverandør, Kunde).
- Opsæt specifikke tilladelser for hver rolle.
- Overstyring af tilladelser for individuelle brugere.

### 3. Adgangsstyring & Sikkerhed
- Begræns adgang til moduler baseret på rolle.
- Log over ændringer i roller og adgangsrettigheder.
- 2-faktor-autentificering (mulighed for fremtidig implementering).

### 4. Brugeroverblik & Sporing
- Se alle aktive brugere og deres roller.
- Log over seneste login og handlinger.
- Statistik over brugeraktivitet (hvem har adgang til hvad).

## 3. Specifikke Krav
**Database (MongoDB)**

**Collection: users**
- id (ObjectId, Primær nøgle)
- name (String)
- email (String, unik)
- password_hash (String)
- role (String, enum: 'admin', 'manager', 'chef', 'user', 'supplier')
- businessUnitId (ObjectId, reference til businessUnits)
- supplierId (ObjectId, reference til suppliers)
- preferences (Object)
- lastLogin (Date)
- isActive (Boolean)
- resetPasswordToken (String)
- resetPasswordExpire (Date)

**Collection: roles** (Fremtidig udvidelse)
- id (ObjectId, Primær nøgle)
- name (String, fx Admin, Manager, Kunde)
- description (String)

**Collection: permissions** (Fremtidig udvidelse)
- id (ObjectId, Primær nøgle)
- roleId (ObjectId, reference til roles)
- permissionName (String, fx 'can_edit_users')
- status (Boolean)

**Collection: userLogs**
- id (ObjectId, Primær nøgle)
- userId (ObjectId, reference til users)
- action (String, fx 'Changed Role')
- timestamp (Date)

## 4. API Endpoints
**Brugerstyring API:**
- `/api/auth/register` (POST): Registrer en ny bruger
- `/api/auth/login` (POST): Log ind og få token
- `/api/auth/me` (GET): Hent aktuel bruger
- `/api/auth/forgot-password` (POST): Send mail til nulstilling af adgangskode
- `/api/auth/reset-password` (POST): Nulstil adgangskode

**Brugeradministration API:**
- `/api/users` (GET): Hent liste over alle brugere
- `/api/users/:id` (GET): Hent specifik bruger
- `/api/users/:id` (PUT): Opdater en bruger
- `/api/users/:id` (DELETE): Slet en bruger
- `/api/users/profile` (GET): Hent brugers profil
- `/api/users/profile` (PUT): Opdater brugers profil
- `/api/users/preferences` (GET): Hent brugers præferencer
- `/api/users/preferences` (PUT): Opdater brugers præferencer

## 5. Forbindelser til Andre Moduler
- **Menu & Måltider**: Kun godkendte brugere kan administrere menuer og måltider.
- **Leverandørstyring**: Kun godkendte brugere kan administrere leverandører og tilbud.
- **Ordrehåndtering**: Brugere kan kun se og administrere ordrer baseret på deres rolle.
- **Rapportering & Analytics**: Kun administratorer kan få adgang til alle rapporter.
- **Forecasting & AI**: Begrænset adgang til data baseret på brugerens rolle.

## 6. Forventninger
- Brugere skal have en **unik e-mail**.
- Adgangsrettigheder styres primært gennem roller, men kan overstyres individuelt.
- Logning af **alle ændringer** i brugere, roller og tilladelser.
- Mulighed for at aktivere/deaktivere brugere uden at slette dem.

## 7. Fremtidige Udvidelser
- **SSO (Single Sign-On)**: Integration med tredjeparts login (Google, Microsoft).
- **Automatiske roller**: Systemet foreslår roller baseret på brugerens aktivitet.
- **Brugergrupper**: Mulighed for at administrere flere brugere samlet.
- **Avanceret rollestyring**: Implementering af collections for roles og permissions.

## 8. Design Overvejelser
- **UI-Komponenter**:
  - Dashboard til at se og administrere brugere.
  - Modal-vinduer til redigering af roller.
  - Filtre til søgning i brugere og roller.
