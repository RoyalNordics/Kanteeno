# Kanteeno - Modulært Madservice System

Kanteeno er et omfattende madservice-system designet til at håndtere alle aspekter af madlevering, fra menuadministration og ordrehåndtering til leverandørstyring og forecasting.

## Modulær Struktur

Kanteeno er opbygget med en modulær arkitektur, hvor hvert modul har et specifikt ansvarsområde og kan udvikles, testes og implementeres uafhængigt. Denne struktur gør systemet mere vedligeholdelsesvenligt, skalerbart og fleksibelt.

### Kernekomponenter

- **Brugerstyring & Roller**: Håndterer brugeradministration, autentificering og adgangskontrol.
- **Menu & Måltider**: Håndterer oprettelse og administration af menuer og måltider.
- **Ordrehåndtering**: Håndterer bestilling, betaling og levering af måltider.
- **Leverandørstyring**: Håndterer leverandører, kontrakter og indkøb.
- **Rapportering & Analytics**: Håndterer rapportering, dataanalyse og visualisering.

### AI-komponenter

- **Forecasting & AI**: Håndterer forudsigelse af efterspørgsel, anbefalinger og optimering.

### Frontend-komponenter

- **Frontend Admin Portal**: Administrationsportal til styring af systemet.
- **Frontend Guest App**: Brugervendt app til bestilling af måltider.

## Dokumentation

Hvert modul har sin egen dokumentation, der beskriver modulets formål, funktionalitet, krav, API-endpoints, forbindelser til andre moduler, forventninger, fremtidige udvidelser og design overvejelser.

- **Modulbibler**: Detaljeret dokumentation for hvert modul findes i `docs/modules/`.
- **Status-dokumenter**: Status for hvert modul findes i `docs/status/`.
- **Diagrammer**: Diagrammer og visuelle repræsentationer af systemet findes i `docs/charts/`.

## Teknisk Arkitektur

Kanteeno er bygget med moderne teknologier og følger best practices for softwareudvikling:

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React
- **AI**: Python, TensorFlow/PyTorch
- **Containerization**: Docker, Docker Compose

Se det komplette arkitekturdiagram i `docs/charts/technical-architecture.md`.

## Kom i gang

### Forudsætninger

- Docker og Docker Compose
- Node.js (v14 eller nyere)
- MongoDB (v4.4 eller nyere)
- Python (v3.8 eller nyere) for AI-komponenter

### Installation

1. Klon repositoriet:
   ```
   git clone https://github.com/yourusername/kanteeno.git
   cd kanteeno
   ```

2. Opret en `.env`-fil baseret på `.env.example`:
   ```
   cp .env.example .env
   ```

3. Rediger `.env`-filen med dine egne værdier.

### Kør systemet

#### Kør hele systemet

```
docker-compose up
```

#### Kør med modulær struktur

```
docker-compose -f docker-compose.modular.yml up
```

#### Kør specifikke moduler

```
docker-compose -f docker-compose.modular.yml up mongodb user-management-backend menu-management-backend
```

### Opdater status-dokumenter

Kør følgende kommando for at opdatere status-dokumenterne for alle moduler:

```
node scripts/update-status.js
```

Eller for et specifikt modul:

```
node scripts/update-status.js user-management
```

## Udvikling

### Modulær udvikling

Når du udvikler på et specifikt modul, kan du køre kun det modul og dets afhængigheder:

```
docker-compose -f docker-compose.modular.yml up mongodb user-management-backend
```

### Tilføj et nyt modul

1. Opret en ny mappe i `docs/modules/` med modulets dokumentation.
2. Opret et status-dokument i `docs/status/`.
3. Implementer modulets backend-komponenter i `src/backend/`.
4. Implementer modulets frontend-komponenter i `src/frontend/`.
5. Opdater `docker-compose.modular.yml` med det nye modul.
6. Opdater moduloversigtsdiagrammet i `docs/charts/module-overview.md`.

## Licens

Dette projekt er licenseret under MIT-licensen - se [LICENSE](LICENSE) filen for detaljer.
