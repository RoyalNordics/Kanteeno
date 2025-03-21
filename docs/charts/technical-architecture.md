# Kanteeno Teknisk Arkitektur

Dette diagram viser den tekniske arkitektur for Kanteeno-systemet, herunder komponenter, teknologier og dataflow.

## Arkitekturdiagram

```mermaid
graph TB
    %% Brugergrænseflader
    User((Bruger))
    Admin((Administrator))
    
    %% Frontend-applikationer
    GuestApp[Guest App\nReact]
    AdminPortal[Admin Portal\nReact]
    
    %% Backend-services
    API[Backend API\nNode.js/Express]
    
    %% Databaser og eksterne tjenester
    MongoDB[(MongoDB)]
    FileStorage[(Fillagring)]
    
    %% AI-tjenester
    ForecastingService[Forecasting Service\nPython/Flask]
    RecommendationService[Recommendation Service\nPython/Flask]
    MenuGenerationService[Menu Generation Service\nPython/Flask]
    
    %% Eksterne integrationer
    SupplierAPIs[Leverandør APIs]
    PaymentGateway[Betalingsgateway]
    
    %% Forbindelser
    User --> GuestApp
    Admin --> AdminPortal
    
    GuestApp --> API
    AdminPortal --> API
    
    API --> MongoDB
    API --> FileStorage
    API --> ForecastingService
    API --> RecommendationService
    API --> MenuGenerationService
    API --> SupplierAPIs
    API --> PaymentGateway
    
    ForecastingService --> MongoDB
    RecommendationService --> MongoDB
    MenuGenerationService --> MongoDB
    
    %% Containerization
    subgraph Docker Compose
        subgraph Frontend
            GuestApp
            AdminPortal
        end
        
        subgraph Backend
            API
        end
        
        subgraph AI Services
            ForecastingService
            RecommendationService
            MenuGenerationService
        end
        
        subgraph Databases
            MongoDB
            FileStorage
        end
    end
    
    %% Styling
    classDef frontend fill:#bbf,stroke:#33f,stroke-width:2px;
    classDef backend fill:#f9f,stroke:#333,stroke-width:2px;
    classDef database fill:#fbb,stroke:#f33,stroke-width:2px;
    classDef ai fill:#bfb,stroke:#3f3,stroke-width:2px;
    classDef external fill:#ddd,stroke:#333,stroke-width:1px;
    classDef user fill:#fff,stroke:#333,stroke-width:1px;
    
    class GuestApp,AdminPortal frontend;
    class API backend;
    class MongoDB,FileStorage database;
    class ForecastingService,RecommendationService,MenuGenerationService ai;
    class SupplierAPIs,PaymentGateway external;
    class User,Admin user;
```

## Komponentbeskrivelser

### Frontend
- **Guest App**: React-baseret webapplikation til slutbrugere, hvor de kan se menuer, bestille måltider og administrere deres profil.
- **Admin Portal**: React-baseret webapplikation til administratorer, hvor de kan administrere systemet, herunder brugere, menuer, ordrer, leverandører, etc.

### Backend
- **Backend API**: Node.js/Express-baseret API, der håndterer alle forretningslogik, autentificering, datavalidering og kommunikation med databaser og eksterne tjenester.

### Databaser
- **MongoDB**: NoSQL-database til lagring af alle data i systemet, herunder brugere, menuer, måltider, ordrer, etc.
- **Fillagring**: Lagring af filer, herunder billeder af måltider, dokumenter, etc.

### AI-tjenester
- **Forecasting Service**: Python/Flask-baseret tjeneste til forudsigelse af efterspørgsel på måltider.
- **Recommendation Service**: Python/Flask-baseret tjeneste til personaliserede anbefalinger af måltider.
- **Menu Generation Service**: Python/Flask-baseret tjeneste til automatisk generering af menuer.

### Eksterne integrationer
- **Leverandør APIs**: Integration med leverandørers API'er til automatisk bestilling af råvarer.
- **Betalingsgateway**: Integration med betalingstjenester til håndtering af betalinger.

## Teknologier

### Frontend
- React
- Redux
- Material-UI
- Axios

### Backend
- Node.js
- Express
- JWT for autentificering
- Mongoose (MongoDB ORM)

### Databaser
- MongoDB
- GridFS (til fillagring i MongoDB)

### AI
- Python
- Flask
- TensorFlow/PyTorch
- Pandas/NumPy

### Containerization
- Docker
- Docker Compose

### CI/CD
- GitHub Actions
- Jest (til testing)
- ESLint (til linting)
