#!/usr/bin/env python3
"""
Run Parametrized Simulation Script

This script allows running simulations with different parameters to test various scenarios:
- Portion weight limits
- Price limits
- Organic percentage requirements
- CO2 emission limits
- Ingredient origin restrictions
- Supplier restrictions

Usage:
python run_parametrized_simulation.py --config=config.json

Where config.json contains the simulation parameters.
"""

import json
import random
import datetime
import os
import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict, Any, Tuple
from generate_yearly_menu import update_meal_data_file
from simulate_user_choices import generate_users, simulate_user_choices, analyze_results

# Default simulation parameters
DEFAULT_PARAMS = {
    "portion_weight": {
        "min": 300,  # grams
        "max": 600   # grams
    },
    "price": {
        "min": 30,   # DKK
        "max": 70    # DKK
    },
    "organic_percentage": {
        "min": 30,   # %
        "target": 60 # %
    },
    "co2_footprint": {
        "max": 5.0   # kg CO2
    },
    "excluded_origins": [],  # e.g., ["Kina", "USA"]
    "excluded_suppliers": [], # e.g., [12, 13]
    "user_count": 300,
    "vegetarian_percentage": 15, # % of users who are vegetarian
    "eco_conscious_percentage": 30, # % of users who are eco-conscious
    "output_dir": "simulation_results",
    "customer_contract": {
        "name": "Standard",
        "max_price_per_meal": 65,  # DKK
        "min_organic_percentage": 40,  # %
        "max_co2_per_meal": 4.5,  # kg CO2
        "preferred_origins": ["Danmark"],  # List of preferred countries of origin
        "excluded_origins": [],  # List of excluded countries of origin
        "preferred_suppliers": [],  # List of preferred supplier IDs
        "excluded_suppliers": []  # List of excluded supplier IDs
    },
    "supplier_discounts": {
        "apply_volume_discounts": true,
        "apply_seasonal_discounts": true,
        "apply_contract_discounts": true,
        "apply_bonus_programs": true,
        "contract_length_months": 12,  # For contract-based discounts
        "estimated_monthly_volume": {  # Estimated monthly order volume per supplier
            "1": 30,  # Supplier ID: kg
            "2": 100,
            "3": 50,
            "4": 20,
            "5": 80,
            "6": 40,
            "7": 25,
            "8": 10,
            "9": 60
        }
    }
}

def load_config(config_path: str = None) -> Dict[str, Any]:
    """Load simulation configuration from a JSON file or use defaults."""
    params = DEFAULT_PARAMS.copy()
    
    if config_path and os.path.exists(config_path):
        with open(config_path, 'r') as f:
            user_params = json.load(f)
            # Update default params with user-provided ones
            for key, value in user_params.items():
                if key in params:
                    if isinstance(value, dict) and isinstance(params[key], dict):
                        params[key].update(value)
                    else:
                        params[key] = value
                else:
                    params[key] = value
    
    return params

def calculate_discounted_price(ingredient: Dict[str, Any], params: Dict[str, Any], 
                               ingredient_data: Dict[str, Any]) -> float:
    """Calculate the discounted price for an ingredient based on supplier discounts."""
    # Get base price
    quantity = ingredient.get("quantity", 0)
    supplier_id = ingredient.get("supplierId", 0)
    
    # Find the supplier in ingredient_data
    supplier = None
    for ing in ingredient_data["ingredients"]:
        for sup in ing.get("suppliers", []):
            if sup.get("id") == supplier_id:
                supplier = sup
                break
        if supplier:
            break
    
    if not supplier:
        return ingredient.get("price", 0)
    
    # Get base price per unit
    price_per_unit = supplier.get("pricePerUnit", 0)
    unit = supplier.get("unit", "kg")
    
    # Convert to price per gram
    if unit == "kg":
        price_per_gram = price_per_unit / 1000
    elif unit == "liter":
        price_per_gram = price_per_unit / 1000
    else:
        price_per_gram = price_per_unit / 1000
    
    # Calculate base price
    base_price = price_per_gram * quantity
    
    # Apply discounts if enabled
    discount_percentage = 0
    
    if params["supplier_discounts"]["apply_volume_discounts"]:
        # Check volume discounts
        estimated_volume = params["supplier_discounts"]["estimated_monthly_volume"].get(str(supplier_id), 0)
        
        for discount in supplier.get("discounts", []):
            if discount.get("type") == "volume" and estimated_volume >= discount.get("threshold", 0):
                discount_percentage = max(discount_percentage, discount.get("percentage", 0))
    
    if params["supplier_discounts"]["apply_seasonal_discounts"]:
        # Check seasonal discounts
        current_month = datetime.datetime.now().month
        
        for discount in supplier.get("discounts", []):
            if discount.get("type") == "seasonal" and current_month in discount.get("months", []):
                discount_percentage = max(discount_percentage, discount.get("percentage", 0))
    
    if params["supplier_discounts"]["apply_contract_discounts"]:
        # Check contract discounts
        for discount in supplier.get("discounts", []):
            if discount.get("type") == "contract" and params["supplier_discounts"]["contract_length_months"] >= 12:
                discount_percentage = max(discount_percentage, discount.get("percentage", 0))
    
    if params["supplier_discounts"]["apply_bonus_programs"]:
        # Apply bonus programs
        for bonus in supplier.get("bonusPrograms", []):
            if bonus.get("type") == "loyalty" or bonus.get("type") == "annual":
                discount_percentage = max(discount_percentage, bonus.get("percentage", 0))
    
    # Apply discount
    discounted_price = base_price * (1 - discount_percentage / 100)
    
    return discounted_price

def filter_meals_by_parameters(meals: List[Dict[str, Any]], params: Dict[str, Any], 
                               ingredient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Filter meals based on the provided parameters."""
    filtered_meals = []
    customer_contract = params["customer_contract"]
    
    for meal in meals:
        # Skip meals without ingredients
        if "ingredients" not in meal:
            continue
        
        # Calculate total weight
        total_weight = sum(ing.get("quantity", 0) for ing in meal["ingredients"])
        
        # Check portion weight
        if (params["portion_weight"]["min"] <= total_weight <= params["portion_weight"]["max"]):
            # Calculate discounted price if needed
            if params["supplier_discounts"]["apply_volume_discounts"] or \
               params["supplier_discounts"]["apply_seasonal_discounts"] or \
               params["supplier_discounts"]["apply_contract_discounts"] or \
               params["supplier_discounts"]["apply_bonus_programs"]:
                
                # Calculate discounted price for each ingredient
                total_discounted_price = 0
                for ing in meal["ingredients"]:
                    discounted_price = calculate_discounted_price(ing, params, ingredient_data)
                    total_discounted_price += discounted_price
                
                # Add markup for preparation, etc.
                markup_factor = 2.5
                discounted_meal_price = round(total_discounted_price * markup_factor, 2)
                
                # Update meal price
                meal["discounted_price"] = discounted_meal_price
                meal["original_price"] = meal.get("price", 0)
                meal["price"] = discounted_meal_price
            
            # Check price
            if "price" in meal and params["price"]["min"] <= meal["price"] <= params["price"]["max"]:
                # Check customer contract price limit
                if meal["price"] <= customer_contract["max_price_per_meal"]:
                    # Check CO2 footprint
                    if "co2Footprint" in meal and meal["co2Footprint"] <= params["co2_footprint"]["max"]:
                        # Check customer contract CO2 limit
                        if meal["co2Footprint"] <= customer_contract["max_co2_per_meal"]:
                            # Check organic percentage
                            organic_count = sum(1 for ing in meal["ingredients"] if ing.get("isOrganic", False))
                            organic_percentage = (organic_count / len(meal["ingredients"])) * 100
                            
                            if organic_percentage >= params["organic_percentage"]["min"] and \
                               organic_percentage >= customer_contract["min_organic_percentage"]:
                                
                                # Check excluded origins
                                origins = [ing.get("origin", "") for ing in meal["ingredients"]]
                                if not any(origin in params["excluded_origins"] for origin in origins if origin) and \
                                   not any(origin in customer_contract["excluded_origins"] for origin in origins if origin):
                                    
                                    # Check excluded suppliers
                                    suppliers = [ing.get("supplierId", 0) for ing in meal["ingredients"]]
                                    if not any(supplier in params["excluded_suppliers"] for supplier in suppliers if supplier) and \
                                       not any(supplier in customer_contract["excluded_suppliers"] for supplier in suppliers if supplier):
                                        
                                        # Check preferred origins and suppliers
                                        has_preferred_origin = False
                                        if customer_contract["preferred_origins"]:
                                            has_preferred_origin = any(origin in customer_contract["preferred_origins"] for origin in origins if origin)
                                        else:
                                            has_preferred_origin = True
                                        
                                        has_preferred_supplier = False
                                        if customer_contract["preferred_suppliers"]:
                                            has_preferred_supplier = any(supplier in customer_contract["preferred_suppliers"] for supplier in suppliers if supplier)
                                        else:
                                            has_preferred_supplier = True
                                        
                                        if has_preferred_origin or has_preferred_supplier:
                                            filtered_meals.append(meal)
    
    return filtered_meals

def adjust_user_profiles(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate users with adjusted profiles based on parameters."""
    # Adjust vegetarian percentage
    from simulate_user_choices import USER_PROFILES
    
    # Create a copy of the profiles to modify
    adjusted_profiles = []
    for profile in USER_PROFILES:
        profile_copy = profile.copy()
        adjusted_profiles.append(profile_copy)
    
    # Set vegetarian percentage
    vegetarian_count = int(params["user_count"] * (params["vegetarian_percentage"] / 100))
    
    # Set eco-conscious percentage
    eco_conscious_count = int(params["user_count"] * (params["eco_conscious_percentage"] / 100))
    
    # Generate users with the adjusted profiles
    users = generate_users(params["user_count"])
    
    # Ensure the right number of vegetarians
    for i in range(vegetarian_count):
        if i < len(users):
            users[i]["dietary_preferences"]["vegetarian"] = True
    
    # Ensure the right number of eco-conscious users
    for i in range(eco_conscious_count):
        if i < len(users):
            users[i]["dietary_preferences"]["eco_conscious"] = True
    
    return users

def run_parametrized_simulation(params: Dict[str, Any]) -> Dict[str, Any]:
    """Run a simulation with the specified parameters."""
    # Create output directory if it doesn't exist
    os.makedirs(params["output_dir"], exist_ok=True)
    
    # Save parameters to file
    with open(os.path.join(params["output_dir"], "parameters.json"), 'w') as f:
        json.dump(params, f, indent=2)
    
    # Generate yearly menu
    update_meal_data_file()
    
    # Load meal data
    with open('meal_data.json', 'r') as f:
        data = json.load(f)
    
    # Load ingredient data
    with open('ingredient_data.json', 'r') as f:
        ingredient_data = json.load(f)
    
    # Filter meals by parameters
    filtered_meals = filter_meals_by_parameters(data["meals"], params, ingredient_data)
    
    # If too few meals remain, warn and use all meals
    if len(filtered_meals) < 30:  # Arbitrary threshold
        print(f"Warning: Only {len(filtered_meals)} meals meet the criteria. Using all meals instead.")
        filtered_meals = data["meals"]
    
    # Update meal data with filtered meals
    data["meals"] = filtered_meals
    
    # Save filtered meal data
    with open(os.path.join(params["output_dir"], "filtered_meal_data.json"), 'w') as f:
        json.dump(data, f, indent=2)
    
    # Generate users with adjusted profiles
    users = adjust_user_profiles(params)
    
    # Simulate user choices
    user_choices = simulate_user_choices(users, data["yearlyMenu"], data["meals"])
    
    # Analyze results
    analysis = analyze_results(user_choices, users, data["meals"])
    
    # Save simulation results
    simulation_data = {
        "parameters": params,
        "users": users,
        "userChoices": user_choices,
        "analysis": analysis
    }
    
    with open(os.path.join(params["output_dir"], "simulation_results.json"), 'w') as f:
        json.dump(simulation_data, f, indent=2)
    
    # Generate visualizations
    generate_visualizations(analysis, params["output_dir"])
    
    # Generate report
    generate_report(analysis, params, os.path.join(params["output_dir"], "simulation_report.md"))
    
    return analysis

def generate_visualizations(analysis: Dict[str, Any], output_dir: str):
    """Generate visualizations from the analysis results."""
    # Set up matplotlib
    plt.style.use('seaborn-v0_8-whitegrid')
    
    # 1. Category popularity
    plt.figure(figsize=(10, 6))
    categories = []
    percentages = []
    
    for category_id, data in sorted(analysis["category_popularity"].items()):
        categories.append(data["name"])
        percentages.append(data["percentage"])
    
    plt.pie(percentages, labels=categories, autopct='%1.1f%%', startangle=90, colors=sns.color_palette("pastel"))
    plt.title('Meal Category Popularity')
    plt.savefig(os.path.join(output_dir, 'category_popularity.png'))
    plt.close()
    
    # 2. Attendance by weekday
    plt.figure(figsize=(10, 6))
    weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    attendance_rates = [analysis["weekday_attendance"].get(str(i), 0) for i in range(5)]
    
    plt.bar(weekdays, attendance_rates, color=sns.color_palette("Blues_d"))
    plt.title('Attendance Rate by Weekday')
    plt.ylabel('Attendance Rate')
    plt.ylim(0, 1)
    
    # Add percentage labels
    for i, rate in enumerate(attendance_rates):
        plt.text(i, rate + 0.02, f"{rate:.1%}", ha='center')
    
    plt.savefig(os.path.join(output_dir, 'weekday_attendance.png'))
    plt.close()
    
    # 3. Top 10 most popular meals
    plt.figure(figsize=(12, 8))
    
    # Sort meals by popularity
    top_meals = sorted(analysis["meal_popularity"].items(), key=lambda x: x[1]["count"], reverse=True)[:10]
    meal_names = [data["name"] for _, data in top_meals]
    meal_counts = [data["count"] for _, data in top_meals]
    meal_categories = [data["category"] for _, data in top_meals]
    
    # Map category IDs to colors
    category_colors = {
        1: sns.color_palette("pastel")[0],  # Vegetarian
        2: sns.color_palette("pastel")[1],  # Organic with meat
        3: sns.color_palette("pastel")[2]   # Quick
    }
    
    colors = [category_colors.get(category, 'gray') for category in meal_categories]
    
    # Create bar chart
    plt.barh(meal_names, meal_counts, color=colors)
    plt.title('Top 10 Most Popular Meals')
    plt.xlabel('Number of Selections')
    
    # Add count labels
    for i, count in enumerate(meal_counts):
        plt.text(count + 10, i, f"{count}", va='center')
    
    # Add legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor=category_colors[1], label='Vegetarian'),
        Patch(facecolor=category_colors[2], label='Organic with meat'),
        Patch(facecolor=category_colors[3], label='Quick')
    ]
    plt.legend(handles=legend_elements, loc='lower right')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'top_meals.png'))
    plt.close()
    
    # 4. Ingredient statistics (if available)
    if "ingredient_stats" in analysis and analysis["ingredient_stats"]:
        # Origin pie chart
        plt.figure(figsize=(10, 6))
        
        # Get top 5 origins
        top_origins = sorted(analysis["ingredient_stats"]["originCounts"].items(), key=lambda x: x[1], reverse=True)[:5]
        origin_names = [origin for origin, _ in top_origins]
        origin_counts = [count for _, count in top_origins]
        
        plt.pie(origin_counts, labels=origin_names, autopct='%1.1f%%', startangle=90, colors=sns.color_palette("Set3"))
        plt.title('Top 5 Ingredient Origins')
        plt.savefig(os.path.join(output_dir, 'ingredient_origins.png'))
        plt.close()
        
        # Allergen bar chart
        plt.figure(figsize=(10, 6))
        
        # Get allergens
        allergens = sorted(analysis["ingredient_stats"]["allergenCounts"].items(), key=lambda x: x[1], reverse=True)
        allergen_names = [allergen for allergen, _ in allergens]
        allergen_counts = [count for _, count in allergens]
        
        plt.bar(allergen_names, allergen_counts, color=sns.color_palette("Reds_d"))
        plt.title('Allergen Frequency')
        plt.ylabel('Count')
        plt.xticks(rotation=45, ha='right')
        
        # Add count labels
        for i, count in enumerate(allergen_counts):
            plt.text(i, count + 10, f"{count}", ha='center')
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'allergen_frequency.png'))
        plt.close()

def generate_report(analysis: Dict[str, Any], params: Dict[str, Any], output_path: str):
    """Generate a markdown report of the simulation results."""
    summary = analysis["summary"]
    customer_contract = params["customer_contract"]
    
    report = f"""
# Kanteeno Simulation Report

## Customer Contract

- **Contract Name**: {customer_contract["name"]}
- **Maximum Price Per Meal**: {customer_contract["max_price_per_meal"]} DKK
- **Minimum Organic Percentage**: {customer_contract["min_organic_percentage"]}%
- **Maximum CO2 Per Meal**: {customer_contract["max_co2_per_meal"]} kg CO2
- **Preferred Origins**: {", ".join(customer_contract["preferred_origins"]) if customer_contract["preferred_origins"] else "None"}
- **Excluded Origins**: {", ".join(customer_contract["excluded_origins"]) if customer_contract["excluded_origins"] else "None"}
- **Preferred Suppliers**: {", ".join(map(str, customer_contract["preferred_suppliers"])) if customer_contract["preferred_suppliers"] else "None"}
- **Excluded Suppliers**: {", ".join(map(str, customer_contract["excluded_suppliers"])) if customer_contract["excluded_suppliers"] else "None"}

## Supplier Discounts

- **Volume Discounts Applied**: {params["supplier_discounts"]["apply_volume_discounts"]}
- **Seasonal Discounts Applied**: {params["supplier_discounts"]["apply_seasonal_discounts"]}
- **Contract Discounts Applied**: {params["supplier_discounts"]["apply_contract_discounts"]}
- **Bonus Programs Applied**: {params["supplier_discounts"]["apply_bonus_programs"]}
- **Contract Length**: {params["supplier_discounts"]["contract_length_months"]} months

## Simulation Parameters

- **Portion Weight**: {params["portion_weight"]["min"]}g - {params["portion_weight"]["max"]}g
- **Price Range**: {params["price"]["min"]} - {params["price"]["max"]} DKK
- **Minimum Organic Percentage**: {params["organic_percentage"]["min"]}%
- **Target Organic Percentage**: {params["organic_percentage"]["target"]}%
- **Maximum CO2 Footprint**: {params["co2_footprint"]["max"]} kg CO2
- **Excluded Origins**: {", ".join(params["excluded_origins"]) if params["excluded_origins"] else "None"}
- **Excluded Suppliers**: {", ".join(map(str, params["excluded_suppliers"])) if params["excluded_suppliers"] else "None"}
- **User Count**: {params["user_count"]}
- **Vegetarian Percentage**: {params["vegetarian_percentage"]}%
- **Eco-conscious Percentage**: {params["eco_conscious_percentage"]}%

## Summary

- **Total Simulation Days**: {summary["total_days"]}
- **Total Users**: {summary["total_users"]}
- **Total Possible Visits**: {summary["total_possible_visits"]:,}
- **Total Actual Visits**: {summary["total_actual_visits"]:,}
- **Overall Attendance Rate**: {summary["overall_attendance_rate"]:.2%}

## Category Popularity
"""
    
    for category_id, data in sorted(analysis["category_popularity"].items()):
        report += f"- **{data['name']}**: {data['percentage']:.1f}% ({data['count']:,} selections)\n"
    
    report += """
## Top 5 Most Popular Meals
"""
    
    top_meals = sorted(analysis["meal_popularity"].items(), key=lambda x: x[1]["count"], reverse=True)[:5]
    for meal_id, data in top_meals:
        report += f"- **{data['name']}**: {data['percentage']:.1f}% ({data['count']:,} selections)\n"
    
    report += """
## Attendance Patterns
"""
    
    weekday_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    weekday_attendance = analysis["weekday_attendance"]
    for i, day in enumerate(weekday_names):
        report += f"- **{day}**: {weekday_attendance.get(str(i), 0):.2%}\n"
    
    report += """
## Monthly Attendance
"""
    
    month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    month_attendance = analysis["month_attendance"]
    for i, month in enumerate(month_names, 1):
        report += f"- **{month}**: {month_attendance.get(str(i), 0):.2%}\n"
    
    report += """
## User Profile Analysis
"""
    
    profile_attendance = analysis["profile_attendance"]
    for profile, data in sorted(profile_attendance.items(), key=lambda x: x[1]["rate"], reverse=True):
        report += f"- **{profile}**: {data['rate']:.2%} attendance rate ({data['count']:,} visits out of {data['total']:,} possible)\n"
    
    # Add ingredient statistics if available
    if "ingredient_stats" in analysis and analysis["ingredient_stats"]:
        report += """
## Ingredient Statistics
"""
        
        report += f"- **Average Organic Percentage**: {analysis['ingredient_stats']['organicPercentageAvg']:.1f}%\n"
        report += f"- **Average CO2 Footprint**: {analysis['ingredient_stats']['co2FootprintAvg']:.2f} kg CO2\n"
        report += f"- **Average Meal Price**: {analysis['ingredient_stats']['priceAvg']:.2f} kr\n"
        
        report += """
### Top 5 Ingredient Origins
"""
        
        top_origins = sorted(analysis["ingredient_stats"]["originCounts"].items(), key=lambda x: x[1], reverse=True)[:5]
        for origin, count in top_origins:
            report += f"- **{origin}**: {count:,} occurrences\n"
        
        report += """
### Top Allergens
"""
        
        top_allergens = sorted(analysis["ingredient_stats"]["allergenCounts"].items(), key=lambda x: x[1], reverse=True)[:5]
        for allergen, count in top_allergens:
            report += f"- **{allergen}**: {count:,} occurrences\n"
    
    # Write report to file
    with open(output_path, 'w') as f:
        f.write(report)
    
    print(f"Report generated at {output_path}")

def main():
    """Main function to run the parametrized simulation."""
    parser = argparse.ArgumentParser(description='Run a parametrized simulation')
    parser.add_argument('--config', type=str, help='Path to configuration JSON file')
    args = parser.parse_args()
    
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Set random seed for reproducibility
    random.seed(42)
    np.random.seed(42)
    
    # Load configuration
    params = load_config(args.config)
    
    print(f"Running simulation with the following parameters:")
    for key, value in params.items():
        print(f"  {key}: {value}")
    
    # Run simulation
    analysis = run_parametrized_simulation(params)
    
    print(f"\nSimulation completed successfully.")
    print(f"Results saved to {params['output_dir']}")
    print(f"Overall attendance rate: {analysis['summary']['overall_attendance_rate']:.2%}")
    
    # Print category popularity
    print("\nCategory Popularity:")
    for category_id, data in sorted(analysis["category_popularity"].items()):
        print(f"  {data['name']}: {data['percentage']:.1f}% ({data['count']} selections)")
    
    # Print top 5 most popular meals
    print("\nTop 5 Most Popular Meals:")
    top_meals = sorted(analysis["meal_popularity"].items(), key=lambda x: x[1]["count"], reverse=True)[:5]
    for meal_id, data in top_meals:
        print(f"  {data['name']}: {data['percentage']:.1f}% ({data['count']} selections)")
    
    # Print ingredient statistics if available
    if "ingredient_stats" in analysis and analysis["ingredient_stats"]:
        print("\nIngredient Statistics:")
        print(f"  Average Organic Percentage: {analysis['ingredient_stats']['organicPercentageAvg']:.1f}%")
        print(f"  Average CO2 Footprint: {analysis['ingredient_stats']['co2FootprintAvg']:.2f} kg CO2")
        print(f"  Average Meal Price: {analysis['ingredient_stats']['priceAvg']:.2f} kr")

if __name__ == "__main__":
    main()
