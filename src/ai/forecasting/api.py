#!/usr/bin/env python3
"""
API for Meal Forecast Model

This script provides a Flask API for the meal forecasting model,
allowing integration with the main backend service.
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests
from dotenv import load_dotenv
from meal_forecast_model import MealForecastModel

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("forecast_api")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Environment variables
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/kanteeno')
API_URL = os.getenv('API_URL', 'http://localhost:5000')
PORT = int(os.getenv('PORT', 5001))
MODEL_DIR = os.getenv('MODEL_DIR', './models')

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Connect to MongoDB
try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client.kanteeno
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    mongo_client = None
    db = None

# Helper functions
def get_model_path(business_unit_id):
    """Get path to model file for a business unit"""
    return os.path.join(MODEL_DIR, f"model_{business_unit_id}.joblib")

def fetch_historical_data(business_unit_id, start_date=None, end_date=None):
    """Fetch historical meal data from MongoDB"""
    if not db:
        raise Exception("Database connection not available")
    
    # Default to last 90 days if dates not provided
    if not end_date:
        end_date = datetime.now()
    if not start_date:
        start_date = end_date - timedelta(days=90)
    
    # Query MongoDB for historical data
    pipeline = [
        {
            "$match": {
                "businessUnitId": business_unit_id,
                "date": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$lookup": {
                "from": "menus",
                "localField": "menuId",
                "foreignField": "_id",
                "as": "menu"
            }
        },
        {
            "$unwind": "$menu"
        },
        {
            "$project": {
                "date": 1,
                "mealType": 1,
                "actualMeals": "$guestCount",
                "temperature": "$weather.temperature",
                "is_holiday": "$isHoliday",
                "is_special_event": "$isSpecialEvent",
                "previous_week_avg": 1,
                "previous_day": 1,
                "registered_guests": "$registeredGuests"
            }
        }
    ]
    
    results = list(db.meals.aggregate(pipeline))
    
    # Convert to DataFrame
    if results:
        df = pd.DataFrame(results)
        return df
    else:
        # If no data, return empty DataFrame with expected columns
        return pd.DataFrame(columns=[
            'date', 'mealType', 'actualMeals', 'temperature',
            'is_holiday', 'is_special_event', 'previous_week_avg',
            'previous_day', 'registered_guests'
        ])

def prepare_forecast_data(business_unit_id, start_date, end_date):
    """Prepare data for forecasting"""
    # Get dates for the forecast period
    dates = pd.date_range(start=start_date, end=end_date)
    meal_types = ['breakfast', 'lunch', 'dinner']
    
    # Create DataFrame with all combinations of dates and meal types
    forecast_data = []
    for date in dates:
        for meal_type in meal_types:
            forecast_data.append({
                'date': date,
                'meal_type': meal_type,
                'temperature': None,  # Will be filled with weather API data
                'is_holiday': False,  # Will be determined
                'is_special_event': False,  # Will be determined
                'previous_week_avg': None,  # Will be calculated
                'previous_day': None,  # Will be calculated
                'registered_guests': None  # Will be fetched from reservations
            })
    
    df = pd.DataFrame(forecast_data)
    
    # Fetch historical data to calculate previous averages
    historical_data = fetch_historical_data(business_unit_id, 
                                           start_date - timedelta(days=30), 
                                           start_date - timedelta(days=1))
    
    # TODO: Enhance with actual calculations based on historical data
    # For now, use simple placeholders
    df['temperature'] = 20.0  # Placeholder
    df['previous_week_avg'] = 100  # Placeholder
    df['previous_day'] = 100  # Placeholder
    df['registered_guests'] = 0  # Placeholder
    
    # Check for holidays (simplified)
    # TODO: Integrate with actual holiday API
    holidays = []  # Placeholder for holiday dates
    df['is_holiday'] = df['date'].dt.date.isin(holidays)
    
    # Check for special events (simplified)
    # TODO: Fetch from events collection
    special_events = []  # Placeholder for special event dates
    df['is_special_event'] = df['date'].dt.date.isin(special_events)
    
    return df

# API routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'service': 'forecast-api',
        'mongodb': 'connected' if db else 'disconnected'
    })

@app.route('/api/forecasts/generate', methods=['POST'])
def generate_forecast():
    """Generate a forecast for a business unit"""
    try:
        data = request.json
        business_unit_id = data.get('businessUnitId')
        start_date = datetime.fromisoformat(data.get('startDate').replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data.get('endDate').replace('Z', '+00:00'))
        
        if not business_unit_id:
            return jsonify({'error': 'Business unit ID is required'}), 400
        
        # Check if model exists, otherwise train a new one
        model_path = get_model_path(business_unit_id)
        if os.path.exists(model_path):
            model = MealForecastModel(business_unit_id, model_path)
            logger.info(f"Loaded existing model for business unit {business_unit_id}")
        else:
            # Fetch historical data for training
            historical_data = fetch_historical_data(business_unit_id)
            if historical_data.empty:
                return jsonify({'error': 'Not enough historical data for training'}), 400
            
            # Train new model
            model = MealForecastModel(business_unit_id)
            metrics = model.train(historical_data)
            model.save_model(model_path)
            logger.info(f"Trained new model for business unit {business_unit_id}")
        
        # Prepare forecast data
        forecast_data = prepare_forecast_data(business_unit_id, start_date, end_date)
        
        # Generate forecast
        forecast_results = model.predict(forecast_data)
        
        # Convert to JSON-serializable format
        forecast_json = forecast_results.to_dict(orient='records')
        
        # Save forecast to database
        if db:
            forecast_doc = {
                'businessUnitId': business_unit_id,
                'startDate': start_date,
                'endDate': end_date,
                'createdAt': datetime.now(),
                'items': forecast_json,
                'modelVersion': getattr(model, 'model_version', '1.0.0')
            }
            db.forecasts.insert_one(forecast_doc)
        
        return jsonify({
            'success': True,
            'forecast': forecast_json
        })
    
    except Exception as e:
        logger.error(f"Error generating forecast: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecasts/train', methods=['POST'])
def train_model():
    """Train a new forecast model"""
    try:
        data = request.json
        business_unit_id = data.get('businessUnitId')
        start_date = datetime.fromisoformat(data.get('startDate').replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data.get('endDate').replace('Z', '+00:00'))
        
        if not business_unit_id:
            return jsonify({'error': 'Business unit ID is required'}), 400
        
        # Fetch historical data
        historical_data = fetch_historical_data(business_unit_id, start_date, end_date)
        if historical_data.empty:
            return jsonify({'error': 'Not enough historical data for training'}), 400
        
        # Train model
        model = MealForecastModel(business_unit_id)
        metrics = model.train(historical_data)
        
        # Save model
        model_path = get_model_path(business_unit_id)
        model.save_model(model_path)
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecasts/accuracy', methods=['GET'])
def get_accuracy():
    """Get forecast accuracy metrics"""
    try:
        business_unit_id = request.args.get('businessUnitId')
        
        if not business_unit_id:
            return jsonify({'error': 'Business unit ID is required'}), 400
        
        # Check if model exists
        model_path = get_model_path(business_unit_id)
        if not os.path.exists(model_path):
            return jsonify({'error': 'No model found for this business unit'}), 404
        
        # Load model
        model = MealForecastModel(business_unit_id, model_path)
        
        # Fetch historical data with actual and predicted values
        # In a real implementation, this would come from the database
        # For now, we'll return placeholder data
        accuracy_data = {
            'accuracy': 92.5,
            'mae': 3.2,
            'rmse': 4.1,
            'by_day': {
                'monday': 94.2,
                'tuesday': 93.1,
                'wednesday': 91.8,
                'thursday': 92.5,
                'friday': 90.9,
                'saturday': 95.0,
                'sunday': 94.8
            },
            'by_meal_type': {
                'breakfast': 93.5,
                'lunch': 91.2,
                'dinner': 94.1
            }
        }
        
        return jsonify(accuracy_data)
    
    except Exception as e:
        logger.error(f"Error getting accuracy: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecasts/factors', methods=['GET'])
def get_factors():
    """Get external factors affecting forecasts"""
    try:
        business_unit_id = request.args.get('businessUnitId')
        
        if not business_unit_id:
            return jsonify({'error': 'Business unit ID is required'}), 400
        
        # In a real implementation, fetch from database
        # For now, return placeholder data
        factors = [
            {
                'name': 'Summer Holiday',
                'date': '2025-07-15',
                'impact': 30,
                'description': 'Reduced attendance due to summer holidays'
            },
            {
                'name': 'Company Event',
                'date': '2025-04-10',
                'impact': 50,
                'description': 'Increased attendance due to company-wide event'
            },
            {
                'name': 'Public Holiday',
                'date': '2025-05-01',
                'impact': -80,
                'description': 'Closed for public holiday'
            }
        ]
        
        return jsonify(factors)
    
    except Exception as e:
        logger.error(f"Error getting factors: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecasts/factors', methods=['POST'])
def add_factor():
    """Add external factor"""
    try:
        data = request.json
        business_unit_id = data.get('businessUnitId')
        
        if not business_unit_id:
            return jsonify({'error': 'Business unit ID is required'}), 400
        
        required_fields = ['name', 'date', 'impact', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # In a real implementation, save to database
        # For now, just return success
        
        return jsonify({
            'success': True,
            'message': 'Factor added successfully'
        })
    
    except Exception as e:
        logger.error(f"Error adding factor: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False)
