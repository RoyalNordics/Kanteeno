# Kanteeno Modul Bibel: Simulation & Testing

## 1. Formål og Vision
Simulation & Testing modulet er designet til at give Kanteeno-systemet mulighed for at simulere og teste forskellige aspekter af kantinedriften, herunder brugeradfærd, menuvalg, ingrediensanalyse, leverandørvalg og økonomiske beregninger. Modulet giver mulighed for at køre omfattende simuleringer før implementering af nye funktioner for at sikre, at de nødvendige data indsamles, og at systemet kan håndtere de forventede brugsscenarier.

Visionen for modulet er at skabe et kraftfuldt værktøj, der kan hjælpe kantineoperatører med at træffe informerede beslutninger baseret på data og simuleringer, og dermed optimere driften, reducere omkostninger, minimere madspild og øge kundetilfredsheden.

## 2. Funktionalitet

### 2.1 Brugeradfærdssimulering
- Simulering af brugeres tilstedeværelse i kantinen over tid
- Generering af realistiske mønstre for frokostdeltagelse baseret på historiske data
- Simulering af brugervalg mellem forskellige menumuligheder
- Modellering af brugerens præferencer og allergier
- Analyse af brugeradfærdsmønstre og tendenser

### 2.2 Menuvalgsimulering
- Simulering af brugervalg mellem 3 daglige retter
- Analyse af popularitet af forskellige retter baseret på ingredienser, pris, og ernæringsværdi
- Simulering af effekten af menuskift på brugervalg
- Generering af forventede ordremønstre baseret på menuvalg
- Optimering af menuer baseret på brugervalg og præferencer

### 2.3 Ingrediensanalyse
- Sporing af ingredienser brugt i hver ret
- Beregning af mængder af hver ingrediens baseret på opskrifter og forventet antal portioner
- Analyse af ingrediensomkostninger og deres påvirkning af den samlede måltidspris
- Vurdering af CO2-aftryk for hver ingrediens og det samlede måltid
- Analyse af økologisk procent og andre bæredygtighedsmetrikker

### 2.4 Leverandør- og Indkøbssimulering
- Simulering af indkøbsprocesser baseret på forventede ordrer
- Analyse af leverandørvalg baseret på pris, kvalitet, og bæredygtighed
- Optimering af indkøbsmængder for at minimere madspild
- Beregning af forventede omkostninger og CO2-aftryk for forskellige leverandørscenarier
- Simulering af leverandørrabatter og deres effekt på den samlede økonomi

### 2.5 Kundekontrakt-integration
- Integration med kontraktmodulet for at hente kontraktdetaljer
- Filtrering af måltider baseret på kontraktbetingelser
- Overholdelse af budgetgrænser pr. måltid
- Overholdelse af bæredygtighedskrav (økologisk procent, CO2-reduktion)
- Brug af godkendte leverandører baseret på kontraktbetingelser

### 2.6 Økonomisk Kalkulation
- Beregning af råvarepriser med leverandørrabatter
- Anvendelse af pristrin baseret på volumen
- Beregning af samlet måltidspris med markup
- Sammenligning af forskellige leverandørscenarier
- Langsigtet økonomisk analyse baseret på kontraktlængde og volumenforpligtelser

### 2.7 Rapportering og Visualisering
- Generering af detaljerede rapporter om simuleringsresultater
- Visualisering af data gennem grafer og diagrammer
- Sammenligning af forskellige simuleringsscenarier
- Anbefalinger baseret på simuleringsresultater
- Eksport af rapporter i forskellige formater (PDF, Excel, etc.)

## 3. Datamodel

### 3.1 Simuleringsscenarier
```json
{
  "id": "ObjectId",
  "name": "String",
  "description": "String",
  "type": "String (enum: 'user_behavior', 'menu_choice', 'ingredient_analysis', 'procurement')",
  "parameters": {
    "portion_weight": {
      "min": "Number",
      "max": "Number"
    },
    "price": {
      "min": "Number",
      "max": "Number"
    },
    "organic_percentage": {
      "min": "Number",
      "target": "Number"
    },
    "co2_footprint": {
      "max": "Number"
    },
    "excluded_origins": ["String"],
    "excluded_suppliers": ["Number"],
    "user_count": "Number",
    "vegetarian_percentage": "Number",
    "eco_conscious_percentage": "Number",
    "output_dir": "String",
    "customer_contract": {
      "name": "String",
      "contractNumber": "String",
      "contractType": "String",
      "status": "String",
      "startDate": "Date",
      "endDate": "Date",
      "businessUnits": [
        {
          "businessUnitId": "String",
          "specificRequirements": {
            "organicPercentageTarget": "Number",
            "wasteReductionTarget": "Number",
            "co2ReductionTarget": "Number",
            "budgetPerMeal": "Number",
            "mealTypes": {
              "breakfast": "Boolean",
              "lunch": "Boolean",
              "dinner": "Boolean",
              "snack": "Boolean"
            },
            "operatingDays": {
              "monday": "Boolean",
              "tuesday": "Boolean",
              "wednesday": "Boolean",
              "thursday": "Boolean",
              "friday": "Boolean",
              "saturday": "Boolean",
              "sunday": "Boolean"
            },
            "specialRequirements": "String"
          }
        }
      ],
      "financialRequirements": {
        "basePricePerMeal": {
          "amount": "Number",
          "currency": "String"
        },
        "pricingTiers": [
          {
            "name": "String",
            "threshold": "Number",
            "pricePerMeal": "Number"
          }
        ],
        "invoicingFrequency": "String",
        "paymentTerms": "String",
        "budgetCap": {
          "amount": "Number",
          "currency": "String",
          "period": "String"
        }
      },
      "sustainabilityRequirements": {
        "organicCertificationLevel": "String",
        "organicPercentageTarget": "Number",
        "wasteReductionTarget": "Number",
        "co2ReductionTarget": "Number",
        "reportingRequirements": {
          "frequency": "String",
          "includeMetrics": {
            "foodWaste": "Boolean",
            "co2Footprint": "Boolean",
            "organicPercentage": "Boolean",
            "costEfficiency": "Boolean"
          }
        },
        "compliancePenalties": {
          "applyPenalties": "Boolean",
          "penaltyAmount": "Number",
          "currency": "String"
        }
      },
      "approvedSuppliers": [
        {
          "supplierId": "Number",
          "preferenceLevel": "String"
        }
      ],
      "preferred_origins": ["String"],
      "excluded_origins": ["String"],
      "max_price_per_meal": "Number",
      "min_organic_percentage": "Number",
      "max_co2_per_meal": "Number"
    },
    "supplier_discounts": {
      "apply_volume_discounts": "Boolean",
      "apply_seasonal_discounts": "Boolean",
      "apply_contract_discounts": "Boolean",
      "apply_bonus_programs": "Boolean",
      "contract_length_months": "Number",
      "estimated_monthly_volume": {
        "1": "Number",
        "2": "Number",
        "3": "Number"
      }
    }
  },
  "status": "String (enum: 'pending', 'running', 'completed', 'failed')",
  "createdBy": "ObjectId (reference til users)",
  "startedAt": "Date",
  "completedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 3.2 Simuleringsresultater
```json
{
  "id": "ObjectId",
  "scenarioId": "ObjectId (reference til simulationScenarios)",
  "data": {
    "summary": {
      "total_days": "Number",
      "total_users": "Number",
      "total_possible_visits": "Number",
      "total_actual_visits": "Number",
      "overall_attendance_rate": "Number"
    },
    "category_popularity": {
      "1": {
        "name": "String",
        "count": "Number",
        "percentage": "Number"
      }
    },
    "meal_popularity": {
      "1": {
        "name": "String",
        "category": "Number",
        "count": "Number",
        "percentage": "Number"
      }
    },
    "weekday_attendance": {
      "0": "Number",
      "1": "Number",
      "2": "Number",
      "3": "Number",
      "4": "Number"
    },
    "month_attendance": {
      "1": "Number",
      "2": "Number",
      "3": "Number",
      "4": "Number",
      "5": "Number",
      "6": "Number",
      "7": "Number",
      "8": "Number",
      "9": "Number",
      "10": "Number",
      "11": "Number",
      "12": "Number"
    },
    "profile_attendance": {
      "Standard": {
        "count": "Number",
        "total": "Number",
        "rate": "Number"
      },
      "Vegetarian": {
        "count": "Number",
        "total": "Number",
        "rate": "Number"
      },
      "Eco-conscious": {
        "count": "Number",
        "total": "Number",
        "rate": "Number"
      }
    },
    "ingredient_stats": {
      "organicPercentageAvg": "Number",
      "co2FootprintAvg": "Number",
      "priceAvg": "Number",
      "originCounts": {
        "Danmark": "Number",
        "Italien": "Number",
        "Spanien": "Number"
      },
      "allergenCounts": {
        "gluten": "Number",
        "mælk": "Number",
        "nødder": "Number"
      }
    }
  },
  "metrics": {
    "economic": {
      "total_cost": "Number",
      "average_cost_per_meal": "Number",
      "total_discounts": "Number",
      "discount_percentage": "Number"
    },
    "sustainability": {
      "total_co2": "Number",
      "average_co2_per_meal": "Number",
      "organic_percentage": "Number",
      "local_sourcing_percentage": "Number"
    },
    "user_satisfaction": {
      "overall_satisfaction": "Number",
      "vegetarian_satisfaction": "Number",
      "eco_conscious_satisfaction": "Number"
    }
  },
  "summary": "String",
  "createdAt": "Date"
}
```

### 3.3 Ingrediensdata
```json
{
  "ingredients": [
    {
      "id": "Number",
      "name": "String",
      "category": "String",
      "nutritionalInfo": {
        "calories": "Number",
        "protein": "Number",
        "carbs": "Number",
        "fat": "Number",
        "fiber": "Number"
      },
      "allergens": ["String"],
      "isOrganic": "Boolean",
      "isVegan": "Boolean",
      "isVegetarian": "Boolean",
      "isGlutenFree": "Boolean",
      "isLactoseFree": "Boolean",
      "co2Footprint": "Number",
      "waterFootprint": "Number",
      "origins": [
        {
          "country": "String",
          "region": "String",
          "transportDistance": "Number",
          "transportMethod": "String"
        }
      ],
      "suppliers": [
        {
          "id": "Number",
          "name": "String",
          "pricePerUnit": "Number",
          "unit": "String",
          "minOrderQuantity": "Number",
          "sustainabilityScore": "Number",
          "certifications": ["String"],
          "discounts": [
            {
              "type": "String",
              "threshold": "Number",
              "percentage": "Number",
              "months": ["Number"],
              "description": "String"
            }
          ],
          "bonusPrograms": [
            {
              "type": "String",
              "description": "String",
              "percentage": "Number",
              "conditions": "String"
            }
          ]
        }
      ],
      "seasonality": {
        "isSeasonalProduct": "Boolean",
        "peakMonths": ["Number"]
      }
    }
  ]
}
```

## 4. API Endpoints

### 4.1 Simuleringsscenario API
- `/api/simulations` (GET): Hent alle simuleringsscenarier
- `/api/simulations/:id` (GET): Hent specifikt simuleringsscenario
- `/api/simulations` (POST): Opret et nyt simuleringsscenario
- `/api/simulations/:id` (PUT): Opdater et simuleringsscenario
- `/api/simulations/:id` (DELETE): Slet et simuleringsscenario
- `/api/simulations/:id/run` (POST): Kør et simuleringsscenario
- `/api/simulations/:id/stop` (POST): Stop et kørende simuleringsscenario
- `/api/simulations/:id/results` (GET): Hent resultater for et simuleringsscenario

### 4.2 Brugeradfærdssimulering API
- `/api/simulations/user-behavior` (POST): Opret en ny brugeradfærdssimulering
- `/api/simulations/user-behavior/:id/data` (GET): Hent data for en brugeradfærdssimulering
- `/api/simulations/user-behavior/:id/analyze` (POST): Analyser data fra en brugeradfærdssimulering

### 4.3 Menuvalgsimulering API
- `/api/simulations/menu-choice` (POST): Opret en ny menuvalgsimulering
- `/api/simulations/menu-choice/:id/data` (GET): Hent data for en menuvalgsimulering
- `/api/simulations/menu-choice/:id/analyze` (POST): Analyser data fra en menuvalgsimulering

### 4.4 Ingrediensanalyse API
- `/api/simulations/ingredient-analysis` (POST): Opret en ny ingrediensanalyse
- `/api/simulations/ingredient-analysis/:id/data` (GET): Hent data for en ingrediensanalyse
- `/api/simulations/ingredient-analysis/:id/analyze` (POST): Analyser data fra en ingrediensanalyse

### 4.5 Indkøbssimulering API
- `/api/simulations/procurement` (POST): Opret en ny indkøbssimulering
- `/api/simulations/procurement/:id/data` (GET): Hent data for en indkøbssimulering
- `/api/simulations/procurement/:id/analyze` (POST): Analyser data fra en indkøbssimulering
- `/api/simulations/procurement/:id/optimize` (POST): Optimer indkøb baseret på simuleringsdata

### 4.6 Kundekontrakt-integration API
- `/api/simulations/contracts` (GET): Hent alle kontrakter til brug i simuleringer
- `/api/simulations/contracts/:id` (GET): Hent specifik kontrakt til brug i simuleringer
- `/api/simulations/contracts/:id/simulate` (POST): Simuler effekten af en kontrakt på menuer og indkøb

### 4.7 Leverandørrabat-integration API
- `/api/simulations/supplier-discounts` (GET): Hent alle leverandørrabatter til brug i simuleringer
- `/api/simulations/supplier-discounts/:id` (GET): Hent specifikke leverandørrabatter til brug i simuleringer
- `/api/simulations/supplier-discounts/:id/simulate` (POST): Simuler effekten af leverandørrabatter på indkøb

## 5. Forbindelser til Andre Moduler

### 5.1 Brugerstyring & Roller
- Brugerdata bruges til at simulere brugeradfærd og præferencer
- Brugerroller bruges til at bestemme adgang til simuleringsmodulet
- Brugerdata bruges til at generere realistiske brugerprofiler for simuleringer

### 5.2 Menu & Måltider
- Menudata bruges til at simulere brugervalg og ingrediensanalyse
- Måltidsdata bruges til at beregne ingrediensforbrug og omkostninger
- Simuleringsresultater bruges til at optimere menuer og måltider

### 5.3 Leverandørstyring
- Leverandørdata bruges til at simulere indkøbsprocesser og optimering
- Leverandørrabatter bruges til at beregne faktiske omkostninger
- Simuleringsresultater bruges til at optimere leverandørvalg og indkøb

### 5.4 Kontrakt
- Kontraktdata bruges til at simulere effekten af kontrakter på menuer og indkøb
- Kontraktbetingelser bruges til at filtrere måltider og leverandører
- Simuleringsresultater bruges til at optimere kontrakter og betingelser

### 5.5 Forecasting & AI
- Simuleringsdata bruges som input til forecasting-modeller
- AI-modeller bruges til at forbedre simuleringspræcision
- Forecasting-resultater bruges til at validere simuleringsresultater

### 5.6 Rapportering & Analytics
- Simuleringsresultater integreres i rapporter og dashboards
- Analytics-værktøjer bruges til at analysere simuleringsdata
- Rapporteringsværktøjer bruges til at visualisere simuleringsresultater

## 6. Tekniske Krav

### 6.1 Performance
- Systemet skal kunne håndtere simuleringer med op til 1000 brugere
- Simuleringer skal kunne køres for perioder på op til 1 år
- Systemet skal kunne håndtere op til 10 samtidige simuleringer
- Simuleringsresultater skal kunne genereres inden for 5 minutter for standard simuleringer

### 6.2 Skalerbarhed
- Systemet skal kunne skaleres til at håndtere større simuleringer ved behov
- Systemet skal kunne distribuere simuleringsberegninger på tværs af flere servere
- Systemet skal kunne gemme og hente store mængder simuleringsdata effektivt

### 6.3 Sikkerhed
- Adgang til simuleringsmodulet skal begrænses til autoriserede brugere
- Simuleringsdata skal krypteres ved overførsel og lagring
- Systemet skal logge alle adgange og ændringer til simuleringsdata

### 6.4 Brugervenlighed
- Systemet skal have en intuitiv brugergrænseflade til opsætning af simuleringer
- Systemet skal give klare og forståelige rapporter og visualiseringer
- Systemet skal give vejledning og anbefalinger baseret på simuleringsresultater

## 7. Implementeringsplan

### 7.1 Fase 1: Grundlæggende Simulering
- Implementering af grundlæggende simuleringsscenario-administration
- Implementering af datamodeller for brugeradfærd, menuvalg, ingrediensanalyse og indkøb
- Implementering af API-endpoints for simuleringsadministration
- Implementering af rapportering af simuleringsresultater
- Implementering af integration med andre moduler for dataudveksling

### 7.2 Fase 2: Avanceret Simulering
- Implementering af detaljeret ingrediensdatamodel med leverandørrabatter og bonusprogrammer
- Implementering af kundekontrakt-integration i simuleringsscenarier
- Implementering af parametriserede simuleringer med konfigurerbare indstillinger
- Implementering af økonomisk kalkulation med leverandørrabatter
- Implementering af forbedret rapportering med detaljerede økonomiske og bæredygtighedsanalyser

### 7.3 Fase 3: Optimering og Machine Learning
- Implementering af Monte Carlo-simulering for statistisk analyse
- Implementering af Machine Learning-baseret simulering
- Implementering af real-time simulering baseret på aktuelle data
- Implementering af avanceret scenariesammenligning
- Implementering af Digital Twin af kantinesystemet

## 8. Testplan

### 8.1 Enhedstest
- Test af individuelle simuleringskomponenter
- Test af datamodeller og validering
- Test af API-endpoints og fejlhåndtering

### 8.2 Integrationstest
- Test af integration med andre moduler
- Test af dataudveksling mellem moduler
- Test af end-to-end simuleringsprocesser

### 8.3 Performancetest
- Test af simuleringsperformance med forskellige datamængder
- Test af skalerbarhed og ressourceforbrug
- Test af samtidighed og belastning

### 8.4 Brugertest
- Test af brugergrænseflade og brugervenlighed
- Test af rapportering og visualisering
- Test af anbefalinger og vejledning

## 9. Vedligeholdelse og Support

### 9.1 Vedligeholdelse
- Regelmæssig opdatering af simuleringsmodeller og algoritmer
- Optimering af performance og ressourceforbrug
- Tilføjelse af nye funktioner og forbedringer

### 9.2 Support
- Dokumentation og vejledning til brugere
- Fejlrapportering og -løsning
- Træning og uddannelse af brugere

### 9.3 Monitorering
- Overvågning af simuleringsperformance og ressourceforbrug
- Logning af fejl og problemer
- Analyse af brugsmønstre og tendenser

## 10. Fremtidige Udvidelser

### 10.1 Monte Carlo-simulering
- Implementering af avancerede statistiske simuleringsmetoder
- Simulering af usikkerhed og risiko
- Generering af sandsynlighedsfordelinger for forskellige udfald

### 10.2 Machine Learning-baseret Simulering
- Brug af ML til at forbedre realismen af simuleringer
- Prædiktiv modellering af brugeradfærd og præferencer
- Automatisk optimering af menuer og indkøb

### 10.3 Real-time Simulering
- Mulighed for at køre simuleringer i realtid baseret på aktuelle data
- Integration med IoT-enheder og sensorer
- Dynamisk tilpasning af simuleringer baseret på feedback

### 10.4 Scenario Comparison
- Avancerede værktøjer til at sammenligne forskellige simuleringsscenarier
- Side-by-side visualisering af resultater
- Automatisk identifikation af forskelle og ligheder

### 10.5 Digital Twin
- Udvikling af en digital tvilling af kantinesystemet for mere præcise simuleringer
- Integration med BIM-modeller og 3D-visualisering
- Simulering af fysiske processer og flows
