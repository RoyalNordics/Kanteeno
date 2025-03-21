/**
 * Simulation Service
 * 
 * This service provides methods for running menu optimization simulations
 * and retrieving results. In a production environment, these methods would
 * make API calls to the backend simulation system.
 */

import axios from 'axios';

/**
 * Run a simulation with the provided parameters
 * 
 * @param {Object} parameters - The simulation parameters
 * @returns {Promise<Object>} - The simulation results
 */
export const runSimulation = async (parameters) => {
  // In a real implementation, this would make an API call to the backend
  // For now, we'll simulate a delay and return mock data
  
  console.log('Running simulation with parameters:', parameters);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Calculate mock results based on parameters
  const costReduction = parameters.costControls.costReductionPercentage / 100;
  const organicPercentage = parameters.sustainabilityControls.minOrganicPercentage;
  const co2Limit = parameters.sustainabilityControls.maxCO2Footprint;
  const dietaryOptions = parameters.dietaryCompliance.minVegetarianOptions + 
                         parameters.dietaryCompliance.minVeganOptions +
                         parameters.dietaryCompliance.minGlutenFreeOptions +
                         parameters.dietaryCompliance.minDairyFreeOptions;
  
  // Calculate attendance rate (higher with more dietary options, lower with cost reduction)
  const baseAttendanceRate = 60;
  const attendanceRate = baseAttendanceRate * 
                         (1 - costReduction * 0.5) * 
                         (1 + dietaryOptions * 0.02);
  
  // Calculate dietary compliance (higher with more dietary options and allergen avoidance)
  const baseDietaryCompliance = 70;
  const dietaryCompliance = baseDietaryCompliance * 
                           (1 + parameters.dietaryCompliance.allergenAvoidanceStrength * 0.05) *
                           (1 + dietaryOptions * 0.03);
  
  // Calculate average cost (lower with cost reduction)
  const baseAverageCost = 45;
  const averageCost = baseAverageCost * (1 - costReduction);
  
  // Calculate CO2 footprint (lower with lower CO2 limit)
  const baseCO2Footprint = 2.8;
  const co2Footprint = Math.min(baseCO2Footprint, co2Limit);
  
  // Calculate organic percentage (higher with higher organic target)
  const baseOrganicPercentage = 65;
  const actualOrganicPercentage = Math.max(baseOrganicPercentage, organicPercentage);
  
  // Calculate food waste (lower with higher organic percentage)
  const baseFoodWaste = 15;
  const foodWaste = baseFoodWaste * (1 - organicPercentage / 200);
  
  // Calculate supplier rebates (higher with cost reduction)
  const baseSupplierRebates = 12000;
  const supplierRebates = baseSupplierRebates * (1 + costReduction * 0.5);
  
  // Calculate user satisfaction (lower with cost reduction, higher with organic percentage)
  const baseUserSatisfaction = 75;
  const userSatisfaction = baseUserSatisfaction * 
                          (1 - costReduction * 0.3) * 
                          (1 + organicPercentage / 200);
  
  // Calculate menu variety (lower with more excluded suppliers)
  const baseMenuVariety = 65;
  const menuVariety = baseMenuVariety * 
                     (1 - parameters.supplierManagement.excludedSuppliers.length / 30);
  
  // Return mock simulation results
  return {
    attendanceRate,
    dietaryCompliance,
    averageCost,
    co2Footprint,
    organicPercentage: actualOrganicPercentage,
    foodWaste,
    supplierRebates,
    userSatisfaction,
    menuVariety,
    
    // Additional detailed metrics
    mealCategoryDistribution: {
      vegetarian: 55 + (parameters.dietaryCompliance.minVegetarianOptions * 2),
      organicWithMeat: 30 - (parameters.dietaryCompliance.minVegetarianOptions * 1.5),
      quick: 15 - (parameters.dietaryCompliance.minVegetarianOptions * 0.5)
    },
    
    allergenCompliance: {
      gluten: 85 + (parameters.dietaryCompliance.minGlutenFreeOptions * 3),
      dairy: 80 + (parameters.dietaryCompliance.minDairyFreeOptions * 3),
      nuts: 90 + (parameters.dietaryCompliance.allergenAvoidanceStrength * 2),
      eggs: 85 + (parameters.dietaryCompliance.allergenAvoidanceStrength * 2)
    },
    
    supplierDistribution: {
      // Generate mock supplier distribution
      suppliers: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => i + 1)
          .filter(id => !parameters.supplierManagement.excludedSuppliers.includes(id))
          .map(id => [
            `Supplier ${id}`, 
            parameters.supplierManagement.preferredSuppliers.includes(id) ? 
              Math.floor(Math.random() * 20) + 15 : 
              Math.floor(Math.random() * 10) + 5
          ])
      )
    },
    
    originDistribution: {
      // Generate mock origin distribution
      origins: {
        'Danmark': 45 + (parameters.sustainabilityControls.localSourcingTarget / 5),
        'Sverige': 15 + (parameters.sustainabilityControls.localSourcingTarget / 10),
        'Norge': 10 + (parameters.sustainabilityControls.localSourcingTarget / 20),
        'Italien': 10 - (parameters.sustainabilityControls.localSourcingTarget / 20),
        'Spanien': 8 - (parameters.sustainabilityControls.localSourcingTarget / 25),
        'Tyskland': 7 - (parameters.sustainabilityControls.localSourcingTarget / 30),
        'Frankrig': 5 - (parameters.sustainabilityControls.localSourcingTarget / 40)
      }
    },
    
    // Financial metrics
    financialMetrics: {
      averageCostPerMeal: averageCost,
      totalMonthlyCost: averageCost * 3000, // Assuming 3000 meals per month
      supplierRebates,
      costVariance: 8 * (1 + costReduction)
    }
  };
};

/**
 * Get a list of saved simulation scenarios
 * 
 * @returns {Promise<Array>} - List of saved scenarios
 */
export const getSavedScenarios = async () => {
  // In a real implementation, this would make an API call to the backend
  // For now, we'll return mock data
  
  return [
    { 
      id: 1, 
      name: 'Current Settings', 
      description: 'Default parameters',
      createdAt: '2025-03-15T10:30:00Z',
      parameters: {
        costControls: {
          targetCostPerPortion: 45,
          costReductionPercentage: 0,
          maxCostVegetarian: 40,
          maxCostOrganic: 55,
          maxCostQuick: 35
        },
        sustainabilityControls: {
          minOrganicPercentage: 60,
          maxCO2Footprint: 3.5,
          localSourcingTarget: 50
        },
        supplierManagement: {
          excludedSuppliers: [13],
          excludedCountries: ['Kina', 'Rusland'],
          preferredSuppliers: [2, 5, 9]
        },
        dietaryCompliance: {
          minVegetarianOptions: 2,
          minVeganOptions: 1,
          minGlutenFreeOptions: 1,
          minDairyFreeOptions: 1,
          allergenAvoidanceStrength: 3
        }
      }
    },
    { 
      id: 2, 
      name: 'Cost Reduction 5%', 
      description: 'Reduce costs by 5% across all meals',
      createdAt: '2025-03-18T14:15:00Z',
      parameters: {
        costControls: {
          targetCostPerPortion: 42.75,
          costReductionPercentage: 5,
          maxCostVegetarian: 38,
          maxCostOrganic: 52,
          maxCostQuick: 33
        },
        sustainabilityControls: {
          minOrganicPercentage: 55,
          maxCO2Footprint: 3.8,
          localSourcingTarget: 45
        },
        supplierManagement: {
          excludedSuppliers: [13],
          excludedCountries: ['Kina', 'Rusland'],
          preferredSuppliers: [2, 5, 9]
        },
        dietaryCompliance: {
          minVegetarianOptions: 1,
          minVeganOptions: 1,
          minGlutenFreeOptions: 1,
          minDairyFreeOptions: 1,
          allergenAvoidanceStrength: 2
        }
      }
    },
    { 
      id: 3, 
      name: 'Eco-Friendly', 
      description: 'Maximize organic ingredients and minimize CO2',
      createdAt: '2025-03-20T09:45:00Z',
      parameters: {
        costControls: {
          targetCostPerPortion: 48,
          costReductionPercentage: 0,
          maxCostVegetarian: 42,
          maxCostOrganic: 58,
          maxCostQuick: 38
        },
        sustainabilityControls: {
          minOrganicPercentage: 75,
          maxCO2Footprint: 2.5,
          localSourcingTarget: 70
        },
        supplierManagement: {
          excludedSuppliers: [13, 4, 8],
          excludedCountries: ['Kina', 'Rusland', 'USA'],
          preferredSuppliers: [2, 5, 9]
        },
        dietaryCompliance: {
          minVegetarianOptions: 3,
          minVeganOptions: 2,
          minGlutenFreeOptions: 1,
          minDairyFreeOptions: 2,
          allergenAvoidanceStrength: 4
        }
      }
    }
  ];
};

/**
 * Save a simulation scenario
 * 
 * @param {Object} scenario - The scenario to save
 * @returns {Promise<Object>} - The saved scenario with ID
 */
export const saveScenario = async (scenario) => {
  // In a real implementation, this would make an API call to the backend
  // For now, we'll simulate a delay and return the scenario with an ID
  
  console.log('Saving scenario:', scenario);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return the scenario with an ID
  return {
    ...scenario,
    id: Math.floor(Math.random() * 1000) + 4, // Generate a random ID
    createdAt: new Date().toISOString()
  };
};

/**
 * Compare two simulation scenarios
 * 
 * @param {number} scenarioId1 - The ID of the first scenario
 * @param {number} scenarioId2 - The ID of the second scenario
 * @returns {Promise<Object>} - The comparison results
 */
export const compareScenarios = async (scenarioId1, scenarioId2) => {
  // In a real implementation, this would make an API call to the backend
  // For now, we'll simulate a delay and return mock comparison data
  
  console.log(`Comparing scenarios ${scenarioId1} and ${scenarioId2}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get the scenarios
  const scenarios = await getSavedScenarios();
  const scenario1 = scenarios.find(s => s.id === scenarioId1);
  const scenario2 = scenarios.find(s => s.id === scenarioId2);
  
  if (!scenario1 || !scenario2) {
    throw new Error('Scenario not found');
  }
  
  // Run simulations for both scenarios
  const results1 = await runSimulation(scenario1.parameters);
  const results2 = await runSimulation(scenario2.parameters);
  
  // Return comparison results
  return {
    scenario1: {
      name: scenario1.name,
      results: results1
    },
    scenario2: {
      name: scenario2.name,
      results: results2
    },
    differences: {
      attendanceRate: results2.attendanceRate - results1.attendanceRate,
      dietaryCompliance: results2.dietaryCompliance - results1.dietaryCompliance,
      averageCost: results2.averageCost - results1.averageCost,
      co2Footprint: results2.co2Footprint - results1.co2Footprint,
      organicPercentage: results2.organicPercentage - results1.organicPercentage,
      foodWaste: results2.foodWaste - results1.foodWaste,
      supplierRebates: results2.supplierRebates - results1.supplierRebates,
      userSatisfaction: results2.userSatisfaction - results1.userSatisfaction,
      menuVariety: results2.menuVariety - results1.menuVariety
    }
  };
};
