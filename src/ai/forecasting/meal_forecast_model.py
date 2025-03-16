#!/usr/bin/env python3
"""
Meal Forecast Model for Kanteeno

This script implements a machine learning model to forecast meal demand
for canteens based on historical data and external factors.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("forecast.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("meal_forecast")

class MealForecastModel:
    """
    Machine learning model for forecasting meal demand in canteens.
    
    This model uses historical meal consumption data along with various
    features like day of week, holidays, weather, and special events to
    predict future meal demand.
    """
    
    def __init__(self, business_unit_id, model_path=None):
        """
        Initialize the forecast model.
        
        Args:
            business_unit_id (str): ID of the business unit (canteen)
            model_path (str, optional): Path to a saved model file
        """
        self.business_unit_id = business_unit_id
        self.model = None
        self.scaler = None
        self.features = [
            'day_of_week', 'is_holiday', 'month', 'temperature', 
            'is_special_event', 'previous_week_avg', 'previous_day',
            'registered_guests'
        ]
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
            logger.info(f"Model loaded from {model_path}")
        else:
            self.model = RandomForestRegressor(
                n_estimators=100, 
                max_depth=10,
                random_state=42
            )
            self.scaler = StandardScaler()
            logger.info("New model initialized")
    
    def preprocess_data(self, data):
        """
        Preprocess the input data for training or prediction.
        
        Args:
            data (pandas.DataFrame): Raw input data
            
        Returns:
            tuple: Processed features (X) and target values (y) if available
        """
        # Create copy to avoid modifying original data
        df = data.copy()
        
        # Extract day of week (0-6, where 0 is Monday)
        df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
        
        # Extract month (1-12)
        df['month'] = pd.to_datetime(df['date']).dt.month
        
        # One-hot encode categorical variables
        df = pd.get_dummies(df, columns=['meal_type'], drop_first=True)
        
        # Fill missing values
        df = df.fillna({
            'temperature': df['temperature'].mean(),
            'is_holiday': 0,
            'is_special_event': 0,
            'previous_week_avg': df['previous_week_avg'].mean(),
            'previous_day': df['previous_day'].mean(),
            'registered_guests': df['registered_guests'].median()
        })
        
        # Select features
        X = df[self.features]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X) if self.scaler else X
        
        # Return features and target if available
        if 'actual_meals' in df.columns:
            y = df['actual_meals']
            return X_scaled, y
        else:
            return X_scaled
    
    def train(self, training_data):
        """
        Train the forecast model on historical data.
        
        Args:
            training_data (pandas.DataFrame): Historical meal data
            
        Returns:
            dict: Training metrics
        """
        logger.info(f"Training model for business unit {self.business_unit_id}")
        
        # Preprocess data
        X, y = self.preprocess_data(training_data)
        
        # Split data into training and validation sets
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate on validation set
        y_pred = self.model.predict(X_val)
        
        # Calculate metrics
        mae = mean_absolute_error(y_val, y_pred)
        mse = mean_squared_error(y_val, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_val, y_pred)
        
        metrics = {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2': r2,
            'feature_importance': dict(zip(self.features, self.model.feature_importances_))
        }
        
        logger.info(f"Model trained successfully. Metrics: MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.2f}")
        
        return metrics
    
    def predict(self, forecast_data):
        """
        Generate meal demand forecasts.
        
        Args:
            forecast_data (pandas.DataFrame): Data for forecast period
            
        Returns:
            pandas.DataFrame: Forecast results with confidence intervals
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        logger.info(f"Generating forecast for business unit {self.business_unit_id}")
        
        # Preprocess data
        X = self.preprocess_data(forecast_data)
        
        # Generate predictions
        predictions = self.model.predict(X)
        
        # Calculate confidence intervals (using prediction intervals from forest)
        predictions_all_trees = np.array([tree.predict(X) for tree in self.model.estimators_])
        lower_bound = np.percentile(predictions_all_trees, 10, axis=0)
        upper_bound = np.percentile(predictions_all_trees, 90, axis=0)
        confidence = 100 - (np.std(predictions_all_trees, axis=0) / np.mean(predictions_all_trees, axis=0) * 100)
        
        # Create results dataframe
        results = forecast_data[['date', 'meal_type']].copy()
        results['predicted_meals'] = np.round(predictions).astype(int)
        results['lower_bound'] = np.round(lower_bound).astype(int)
        results['upper_bound'] = np.round(upper_bound).astype(int)
        results['confidence'] = np.clip(confidence, 0, 100)
        
        logger.info(f"Forecast generated for {len(results)} data points")
        
        return results
    
    def save_model(self, path):
        """
        Save the trained model to a file.
        
        Args:
            path (str): Path to save the model
        """
        if self.model is None:
            raise ValueError("No trained model to save")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'features': self.features,
            'business_unit_id': self.business_unit_id,
            'timestamp': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, path)
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path):
        """
        Load a trained model from a file.
        
        Args:
            path (str): Path to the saved model
        """
        model_data = joblib.load(path)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.features = model_data['features']
        self.business_unit_id = model_data['business_unit_id']
        
        logger.info(f"Model loaded from {path} (saved on {model_data['timestamp']})")
    
    def evaluate_accuracy(self, actual_data):
        """
        Evaluate the accuracy of previous forecasts against actual data.
        
        Args:
            actual_data (pandas.DataFrame): Actual meal consumption data
            
        Returns:
            dict: Accuracy metrics
        """
        if 'predicted_meals' not in actual_data.columns or 'actual_meals' not in actual_data.columns:
            raise ValueError("Data must contain both 'predicted_meals' and 'actual_meals' columns")
        
        # Calculate metrics
        mae = mean_absolute_error(actual_data['actual_meals'], actual_data['predicted_meals'])
        mse = mean_squared_error(actual_data['actual_meals'], actual_data['predicted_meals'])
        rmse = np.sqrt(mse)
        
        # Calculate percentage error
        actual_data['abs_error'] = abs(actual_data['predicted_meals'] - actual_data['actual_meals'])
        actual_data['pct_error'] = (actual_data['abs_error'] / actual_data['actual_meals']) * 100
        
        # Calculate accuracy (100% - average percentage error)
        accuracy = 100 - actual_data['pct_error'].mean()
        
        metrics = {
            'mae': mae,
            'rmse': rmse,
            'accuracy': accuracy,
            'by_day': actual_data.groupby('day_of_week')['pct_error'].mean().to_dict(),
            'by_meal_type': actual_data.groupby('meal_type')['pct_error'].mean().to_dict()
        }
        
        logger.info(f"Forecast accuracy: {accuracy:.2f}%")
        
        return metrics


def main():
    """
    Main function for command-line usage.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Meal Forecast Model')
    parser.add_argument('--train', action='store_true', help='Train the model')
    parser.add_argument('--predict', action='store_true', help='Generate forecasts')
    parser.add_argument('--evaluate', action='store_true', help='Evaluate forecast accuracy')
    parser.add_argument('--business-unit', required=True, help='Business unit ID')
    parser.add_argument('--input', required=True, help='Input data file (CSV)')
    parser.add_argument('--output', help='Output file for predictions (CSV)')
    parser.add_argument('--model', help='Model file path (for saving or loading)')
    
    args = parser.parse_args()
    
    # Initialize model
    model = MealForecastModel(
        business_unit_id=args.business_unit,
        model_path=args.model if not args.train else None
    )
    
    # Load data
    data = pd.read_csv(args.input)
    
    if args.train:
        # Train model
        metrics = model.train(data)
        print(f"Training metrics: {json.dumps(metrics, indent=2)}")
        
        # Save model if path provided
        if args.model:
            model.save_model(args.model)
    
    if args.predict:
        # Generate forecasts
        forecasts = model.predict(data)
        
        # Save forecasts if output path provided
        if args.output:
            forecasts.to_csv(args.output, index=False)
            print(f"Forecasts saved to {args.output}")
        else:
            print(forecasts)
    
    if args.evaluate:
        # Evaluate forecast accuracy
        metrics = model.evaluate_accuracy(data)
        print(f"Accuracy metrics: {json.dumps(metrics, indent=2)}")


if __name__ == "__main__":
    main()
