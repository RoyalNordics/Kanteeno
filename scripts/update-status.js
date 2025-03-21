#!/usr/bin/env node

/**
 * Kanteeno Status Updater
 * 
 * Dette script opdaterer automatisk status-dokumenterne for hvert modul.
 * Det kan køres manuelt eller automatisk ved opstart af systemet.
 * 
 * Brug: node update-status.js [modul-navn]
 * 
 * Hvis modul-navn er angivet, opdateres kun status for det specifikke modul.
 * Hvis intet modul-navn er angivet, opdateres status for alle moduler.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  statusDir: path.join(__dirname, '..', 'docs', 'status'),
  modulesDir: path.join(__dirname, '..', 'docs', 'modules'),
  modules: [
    'user-management',
    'menu-management',
    // Tilføj flere moduler her efterhånden som de oprettes
  ]
};

// Hjælpefunktioner
function getLastCommitDate(modulePath) {
  try {
    // Få dato for seneste commit der ændrede filer i modulet
    const command = `git log -1 --format=%cd --date=short -- ${modulePath}`;
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`Kunne ikke få commit-dato for ${modulePath}: ${error.message}`);
    return new Date().toISOString().split('T')[0]; // Dagens dato som fallback
  }
}

function getImplementedFeatures(moduleName) {
  // Dette er en placeholder. I en rigtig implementering ville denne funktion
  // analysere kodebasen for at bestemme, hvilke funktioner der er implementeret.
  // For nu returnerer vi blot nogle hardcodede værdier baseret på modulnavnet.
  
  if (moduleName === 'user-management') {
    return [
      'Brugeroprettelse og -administration',
      'Grundlæggende rollestyring (admin, manager, chef, user, supplier)',
      'Autentificering med JWT',
      'Password reset funktionalitet',
      'Bruger præferencer'
    ];
  } else if (moduleName === 'menu-management') {
    return [
      'Grundlæggende menu-administration',
      'Måltidshåndtering med ingredienser og allergener',
      'Kategorisering af måltider',
      'Visning af menuer og måltider',
      'Billeder af måltider'
    ];
  }
  
  return ['Grundlæggende funktionalitet'];
}

function getUnimplementedFeatures(moduleName) {
  // Dette er en placeholder. I en rigtig implementering ville denne funktion
  // analysere kodebasen og kravene for at bestemme, hvilke funktioner der mangler.
  
  if (moduleName === 'user-management') {
    return [
      'Avanceret rollestyring med separate collections for roles og permissions',
      '2-faktor autentificering',
      'Single Sign-On (SSO) integration',
      'Brugergrupper',
      'Detaljeret aktivitetslog'
    ];
  } else if (moduleName === 'menu-management') {
    return [
      'Avanceret menuplanering med kalendervisning',
      'Automatisk generering af menuer baseret på popularitet',
      'Interaktive opskrifter',
      'Kalorieberegner',
      'Sæsonbaserede menuer'
    ];
  }
  
  return ['Avancerede funktioner'];
}

function getKnownIssues(moduleName) {
  // Dette er en placeholder. I en rigtig implementering ville denne funktion
  // hente kendte problemer fra et issue tracking system.
  
  if (moduleName === 'user-management') {
    return ['Ingen kendte problemer på nuværende tidspunkt'];
  } else if (moduleName === 'menu-management') {
    return [
      'Billeder af måltider kan tage lang tid at indlæse på langsomme forbindelser',
      'Næringsindhold mangler for nogle måltider'
    ];
  }
  
  return ['Ingen kendte problemer på nuværende tidspunkt'];
}

function updateStatusFile(moduleName) {
  const statusFilePath = path.join(CONFIG.statusDir, `${moduleName}-status.md`);
  const moduleFilePath = path.join(CONFIG.modulesDir, `${moduleName}.md`);
  
  // Tjek om modulet eksisterer
  if (!fs.existsSync(moduleFilePath)) {
    console.error(`Modul ikke fundet: ${moduleFilePath}`);
    return false;
  }
  
  // Få data til opdatering
  const lastUpdateDate = getLastCommitDate(moduleFilePath);
  const implementedFeatures = getImplementedFeatures(moduleName);
  const unimplementedFeatures = getUnimplementedFeatures(moduleName);
  const knownIssues = getKnownIssues(moduleName);
  
  // Opret status-indhold
  const statusContent = `# Status: ${moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Modul

## Aktuel Version
1.0.0

## Seneste Opdatering
${lastUpdateDate}

## Status
Aktiv

## Ansvarlige
- [Indsæt navn på ansvarlig udvikler]

## Afhængigheder
- MongoDB database
${moduleName === 'menu-management' ? '- Brugerstyring & Roller modul\n- Fillagring til billeder' : '- JWT for autentificering'}

## Implementerede Funktioner
${implementedFeatures.map(feature => `- [x] ${feature}`).join('\n')}

## Ikke-implementerede Funktioner
${unimplementedFeatures.map(feature => `- [ ] ${feature}`).join('\n')}

## Kendte Problemer
${knownIssues.join('\n- ')}

## Planlagte Ændringer
- Implementering af nye funktioner i version 1.1.0
- Løsning af kendte problemer i version 1.1.0

## Ændringslog

### Version 1.0.0 (${lastUpdateDate})
- Initial release
- Grundlæggende funktionalitet implementeret
`;

  // Skriv status-fil
  try {
    fs.writeFileSync(statusFilePath, statusContent);
    console.log(`Status opdateret for ${moduleName}`);
    return true;
  } catch (error) {
    console.error(`Kunne ikke opdatere status for ${moduleName}: ${error.message}`);
    return false;
  }
}

// Hovedfunktion
function main() {
  // Opret status-mappe hvis den ikke findes
  if (!fs.existsSync(CONFIG.statusDir)) {
    fs.mkdirSync(CONFIG.statusDir, { recursive: true });
  }
  
  // Få modul-navn fra kommandolinje-argumenter
  const targetModule = process.argv[2];
  
  if (targetModule) {
    // Opdater status for specifikt modul
    if (CONFIG.modules.includes(targetModule)) {
      updateStatusFile(targetModule);
    } else {
      console.error(`Ukendt modul: ${targetModule}`);
      console.log(`Tilgængelige moduler: ${CONFIG.modules.join(', ')}`);
    }
  } else {
    // Opdater status for alle moduler
    let successCount = 0;
    for (const moduleName of CONFIG.modules) {
      if (updateStatusFile(moduleName)) {
        successCount++;
      }
    }
    console.log(`Status opdateret for ${successCount} af ${CONFIG.modules.length} moduler`);
  }
}

// Kør hovedfunktion
main();
