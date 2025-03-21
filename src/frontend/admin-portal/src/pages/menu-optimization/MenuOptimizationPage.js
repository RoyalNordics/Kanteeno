import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PlayArrow as RunIcon,
  Compare as CompareIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock API service for simulation
import { runSimulation } from '../../services/simulationService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-optimization-tabpanel-${index}`}
      aria-labelledby={`menu-optimization-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MenuOptimizationPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([
    { id: 1, name: 'Current Settings', description: 'Default parameters' },
    { id: 2, name: 'Cost Reduction 5%', description: 'Reduce costs by 5% across all meals' },
    { id: 3, name: 'Eco-Friendly', description: 'Maximize organic ingredients and minimize CO2' }
  ]);
  
  // Parameter state
  const [parameters, setParameters] = useState({
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
      allergenAvoidanceStrength: 3 // Scale 1-5
    }
  });

  // Handle parameter changes
  const handleParameterChange = (category, parameter, value) => {
    setParameters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: value
      }
    }));
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Run simulation with current parameters
  const handleRunSimulation = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the backend API
      const results = await runSimulation(parameters);
      setSimulationResults(results);
    } catch (error) {
      console.error('Simulation failed:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  // Save current parameters as a scenario
  const handleSaveScenario = () => {
    // Modal would open here to name the scenario
    const newScenario = {
      id: savedScenarios.length + 1,
      name: `Scenario ${savedScenarios.length + 1}`,
      description: 'Custom parameters',
      parameters: { ...parameters }
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
  };

  // Load a saved scenario
  const handleLoadScenario = (scenarioId) => {
    const scenario = savedScenarios.find(s => s.id === scenarioId);
    if (scenario && scenario.parameters) {
      setParameters(scenario.parameters);
    }
  };

  // Mock data for impact prediction charts
  const financialImpactData = [
    { name: 'Current', avgCost: 45, totalCost: 135000, rebates: 12000, variance: 8 },
    { name: 'Projected', avgCost: parameters.costControls.targetCostPerPortion * (1 - parameters.costControls.costReductionPercentage / 100), 
      totalCost: 135000 * (1 - parameters.costControls.costReductionPercentage / 100), 
      rebates: 12000 * (1 + parameters.costControls.costReductionPercentage / 200), 
      variance: 8 * (1 + parameters.costControls.costReductionPercentage / 100) }
  ];

  const sustainabilityImpactData = [
    { name: 'Current', co2: 2.8, organic: 65, waste: 15, local: 45 },
    { name: 'Projected', 
      co2: Math.min(parameters.sustainabilityControls.maxCO2Footprint, 2.8), 
      organic: Math.max(parameters.sustainabilityControls.minOrganicPercentage, 65), 
      waste: 15 * (1 - parameters.sustainabilityControls.minOrganicPercentage / 200), 
      local: Math.max(parameters.sustainabilityControls.localSourcingTarget, 45) }
  ];

  const userExperienceImpactData = [
    { name: 'Current', attendance: 60, compliance: 70, satisfaction: 75, variety: 65 },
    { name: 'Projected', 
      attendance: 60 * (1 - parameters.costControls.costReductionPercentage / 200 + parameters.dietaryCompliance.minVegetarianOptions / 20), 
      compliance: 70 * (1 + parameters.dietaryCompliance.allergenAvoidanceStrength / 30), 
      satisfaction: 75 * (1 - parameters.costControls.costReductionPercentage / 300 + parameters.sustainabilityControls.minOrganicPercentage / 200), 
      variety: 65 * (1 - parameters.supplierManagement.excludedSuppliers.length / 30) }
  ];

  // Render the component
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Menu Optimization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Adjust parameters to optimize menus based on cost, sustainability, and dietary preferences.
          The system will predict the impact of your changes on key metrics.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left side - Parameter controls */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="menu optimization tabs">
                <Tab label="Cost Controls" />
                <Tab label="Sustainability" />
                <Tab label="Suppliers" />
                <Tab label="Dietary" />
              </Tabs>
            </Box>

            {/* Cost Controls Tab */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                <Typography variant="h6">Cost Parameters</Typography>
                
                <TextField
                  label="Target Cost Per Portion (DKK)"
                  type="number"
                  value={parameters.costControls.targetCostPerPortion}
                  onChange={(e) => handleParameterChange('costControls', 'targetCostPerPortion', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DKK</InputAdornment>,
                  }}
                />
                
                <Box>
                  <Typography gutterBottom>Cost Reduction Target</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={parameters.costControls.costReductionPercentage}
                        onChange={(e, newValue) => handleParameterChange('costControls', 'costReductionPercentage', newValue)}
                        aria-labelledby="cost-reduction-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={0}
                        max={20}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>{parameters.costControls.costReductionPercentage}%</Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider />
                
                <Typography variant="subtitle1">Maximum Cost by Category</Typography>
                
                <TextField
                  label="Vegetarian Meals (DKK)"
                  type="number"
                  value={parameters.costControls.maxCostVegetarian}
                  onChange={(e) => handleParameterChange('costControls', 'maxCostVegetarian', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DKK</InputAdornment>,
                  }}
                />
                
                <TextField
                  label="Organic with Meat Meals (DKK)"
                  type="number"
                  value={parameters.costControls.maxCostOrganic}
                  onChange={(e) => handleParameterChange('costControls', 'maxCostOrganic', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DKK</InputAdornment>,
                  }}
                />
                
                <TextField
                  label="Quick Meals (DKK)"
                  type="number"
                  value={parameters.costControls.maxCostQuick}
                  onChange={(e) => handleParameterChange('costControls', 'maxCostQuick', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DKK</InputAdornment>,
                  }}
                />
              </Stack>
            </TabPanel>

            {/* Sustainability Tab */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                <Typography variant="h6">Sustainability Parameters</Typography>
                
                <Box>
                  <Typography gutterBottom>Minimum Organic Percentage</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={parameters.sustainabilityControls.minOrganicPercentage}
                        onChange={(e, newValue) => handleParameterChange('sustainabilityControls', 'minOrganicPercentage', newValue)}
                        aria-labelledby="organic-percentage-slider"
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>{parameters.sustainabilityControls.minOrganicPercentage}%</Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <TextField
                  label="Maximum CO2 Footprint"
                  type="number"
                  value={parameters.sustainabilityControls.maxCO2Footprint}
                  onChange={(e) => handleParameterChange('sustainabilityControls', 'maxCO2Footprint', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg CO2</InputAdornment>,
                  }}
                />
                
                <Box>
                  <Typography gutterBottom>Local Sourcing Target</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={parameters.sustainabilityControls.localSourcingTarget}
                        onChange={(e, newValue) => handleParameterChange('sustainabilityControls', 'localSourcingTarget', newValue)}
                        aria-labelledby="local-sourcing-slider"
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>{parameters.sustainabilityControls.localSourcingTarget}%</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </TabPanel>

            {/* Suppliers Tab */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3}>
                <Typography variant="h6">Supplier Management</Typography>
                
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Excluded Suppliers</Typography>
                  <Grid container spacing={1} alignItems="center">
                    {parameters.supplierManagement.excludedSuppliers.map((supplier, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={`Supplier ${supplier}`}
                          onDelete={() => {
                            const newExcluded = [...parameters.supplierManagement.excludedSuppliers];
                            newExcluded.splice(index, 1);
                            handleParameterChange('supplierManagement', 'excludedSuppliers', newExcluded);
                          }}
                        />
                      </Grid>
                    ))}
                    <Grid item>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          // In a real app, this would open a supplier selection dialog
                          const newSupplier = 10; // Example
                          handleParameterChange(
                            'supplierManagement', 
                            'excludedSuppliers', 
                            [...parameters.supplierManagement.excludedSuppliers, newSupplier]
                          );
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Excluded Countries</Typography>
                  <Grid container spacing={1} alignItems="center">
                    {parameters.supplierManagement.excludedCountries.map((country, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={country}
                          onDelete={() => {
                            const newExcluded = [...parameters.supplierManagement.excludedCountries];
                            newExcluded.splice(index, 1);
                            handleParameterChange('supplierManagement', 'excludedCountries', newExcluded);
                          }}
                        />
                      </Grid>
                    ))}
                    <Grid item>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          // In a real app, this would open a country selection dialog
                          const newCountry = "Belarus"; // Example
                          handleParameterChange(
                            'supplierManagement', 
                            'excludedCountries', 
                            [...parameters.supplierManagement.excludedCountries, newCountry]
                          );
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Preferred Suppliers</Typography>
                  <Grid container spacing={1} alignItems="center">
                    {parameters.supplierManagement.preferredSuppliers.map((supplier, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={`Supplier ${supplier}`}
                          onDelete={() => {
                            const newPreferred = [...parameters.supplierManagement.preferredSuppliers];
                            newPreferred.splice(index, 1);
                            handleParameterChange('supplierManagement', 'preferredSuppliers', newPreferred);
                          }}
                        />
                      </Grid>
                    ))}
                    <Grid item>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          // In a real app, this would open a supplier selection dialog
                          const newSupplier = 7; // Example
                          handleParameterChange(
                            'supplierManagement', 
                            'preferredSuppliers', 
                            [...parameters.supplierManagement.preferredSuppliers, newSupplier]
                          );
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </TabPanel>

            {/* Dietary Tab */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3}>
                <Typography variant="h6">Dietary Compliance</Typography>
                
                <TextField
                  label="Minimum Vegetarian Options Per Day"
                  type="number"
                  value={parameters.dietaryCompliance.minVegetarianOptions}
                  onChange={(e) => handleParameterChange('dietaryCompliance', 'minVegetarianOptions', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 5 } }}
                />
                
                <TextField
                  label="Minimum Vegan Options Per Day"
                  type="number"
                  value={parameters.dietaryCompliance.minVeganOptions}
                  onChange={(e) => handleParameterChange('dietaryCompliance', 'minVeganOptions', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 5 } }}
                />
                
                <TextField
                  label="Minimum Gluten-Free Options Per Day"
                  type="number"
                  value={parameters.dietaryCompliance.minGlutenFreeOptions}
                  onChange={(e) => handleParameterChange('dietaryCompliance', 'minGlutenFreeOptions', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 5 } }}
                />
                
                <TextField
                  label="Minimum Dairy-Free Options Per Day"
                  type="number"
                  value={parameters.dietaryCompliance.minDairyFreeOptions}
                  onChange={(e) => handleParameterChange('dietaryCompliance', 'minDairyFreeOptions', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 5 } }}
                />
                
                <Box>
                  <Typography gutterBottom>Allergen Avoidance Priority</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={parameters.dietaryCompliance.allergenAvoidanceStrength}
                        onChange={(e, newValue) => handleParameterChange('dietaryCompliance', 'allergenAvoidanceStrength', newValue)}
                        aria-labelledby="allergen-avoidance-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={5}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>{parameters.dietaryCompliance.allergenAvoidanceStrength}</Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="text.secondary">
                    Higher values prioritize allergen avoidance over other factors like cost and variety.
                  </Typography>
                </Box>
              </Stack>
            </TabPanel>

            {/* Action buttons */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveScenario}
              >
                Save Scenario
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<RunIcon />}
                onClick={handleRunSimulation}
                disabled={isLoading}
              >
                Run Simulation
              </Button>
            </Box>
          </Paper>

          {/* Saved Scenarios */}
          <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Saved Scenarios
            </Typography>
            <Stack spacing={1}>
              {savedScenarios.map((scenario) => (
                <Card key={scenario.id} variant="outlined">
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Grid item xs={8}>
                        <Typography variant="subtitle1">{scenario.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {scenario.description}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Button 
                          size="small" 
                          onClick={() => handleLoadScenario(scenario.id)}
                        >
                          Load
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Right side - Impact prediction */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Predicted Impact
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These charts show the projected impact of your parameter changes on key metrics.
              {!simulationResults && " Run a simulation to see more detailed predictions."}
            </Typography>

            <Grid container spacing={3}>
              {/* Financial Impact */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Financial Impact
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={financialImpactData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgCost" name="Avg. Cost (DKK)" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="variance" name="Cost Variance (%)" fill="#ffc658" />
                    <Bar yAxisId="right" dataKey="totalCost" name="Total Monthly Cost (DKK)" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="rebates" name="Supplier Rebates (DKK)" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>

              {/* Sustainability Impact */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Sustainability Impact
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={sustainabilityImpactData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="co2" name="CO2 Footprint (kg)" fill="#ff8042" />
                    <Bar dataKey="organic" name="Organic (%)" fill="#82ca9d" />
                    <Bar dataKey="waste" name="Food Waste (%)" fill="#8884d8" />
                    <Bar dataKey="local" name="Local Sourcing (%)" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>

              {/* User Experience Impact */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  User Experience Impact
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} width={730} height={300} data={userExperienceImpactData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Current" dataKey="attendance" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Projected" dataKey="compliance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="Satisfaction" dataKey="satisfaction" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Radar name="Variety" dataKey="variety" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>

              {/* Detailed Metrics (shown after simulation) */}
              {simulationResults && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Detailed Simulation Results
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1">Attendance Rate</Typography>
                          <Typography variant="h4">{simulationResults.attendanceRate.toFixed(1)}%</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {simulationResults.attendanceRate > 60 ? 'Good' : 'Needs improvement'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1">Dietary Compliance</Typography>
                          <Typography variant="h4">{simulationResults.dietaryCompliance.toFixed(1)}%</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {simulationResults.dietaryCompliance > 80 ? 'Excellent' : 'Needs improvement'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1">Average Cost</Typography>
                          <Typography variant="h4">{simulationResults.averageCost.toFixed(2)} DKK</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {simulationResults.averageCost < parameters.costControls.targetCostPerPortion ? 'Under budget' : 'Over budget'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1">CO2 Footprint</Typography>
                          <Typography variant="h4">{simulationResults.co2Footprint.toFixed(2)} kg</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {simulationResults.co2Footprint < parameters.sustainabilityControls.maxCO2Footprint ? 'Within limits' : 'Exceeds target'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MenuOptimizationPage;
