# Kanteeno Moduloversigt

Dette diagram viser en oversigt over alle moduler i Kanteeno-systemet og deres indbyrdes afhængigheder.

## Moduldiagram

```mermaid
graph TB
    %% Moduler
    UserManagement[Brugerstyring & Roller]
    MenuManagement[Menu & Måltider]
    OrderManagement[Ordrehåndtering]
    SupplierManagement[Leverandørstyring]
    ReportingAnalytics[Rapportering & Analytics]
    ForecastingAI[Forecasting & AI]
    AdminPortal[Frontend Admin Portal]
    GuestApp[Frontend Guest App]
    
    %% Forbindelser
    UserManagement --> MenuManagement
    UserManagement --> OrderManagement
    UserManagement --> SupplierManagement
    UserManagement --> ReportingAnalytics
    UserManagement --> ForecastingAI
    
    MenuManagement --> OrderManagement
    MenuManagement --> ForecastingAI
    MenuManagement --> ReportingAnalytics
    
    SupplierManagement --> MenuManagement
    
    OrderManagement --> ReportingAnalytics
    OrderManagement --> ForecastingAI
    
    ForecastingAI --> MenuManagement
    ForecastingAI --> ReportingAnalytics
    
    %% Frontend forbindelser
    AdminPortal --> UserManagement
    AdminPortal --> MenuManagement
    AdminPortal --> OrderManagement
    AdminPortal --> SupplierManagement
    AdminPortal --> ReportingAnalytics
    AdminPortal --> ForecastingAI
    
    GuestApp --> UserManagement
    GuestApp --> MenuManagement
    GuestApp --> OrderManagement
    
    %% Styling
    classDef core fill:#f9f,stroke:#333,stroke-width:2px;
    classDef frontend fill:#bbf,stroke:#33f,stroke-width:2px;
    classDef ai fill:#bfb,stroke:#3f3,stroke-width:2px;
    
    class UserManagement,MenuManagement,OrderManagement,SupplierManagement core;
    class AdminPortal,GuestApp frontend;
    class ForecastingAI,ReportingAnalytics ai;
```

## Modulbeskrivelser

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

## Teknologier

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React
- **AI**: Python, TensorFlow/PyTorch
- **Containerization**: Docker, Docker Compose
