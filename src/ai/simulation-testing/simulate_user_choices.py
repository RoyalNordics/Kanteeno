#!/usr/bin/env python3
"""
Simulate User Choices Script

This script simulates 300 app users' daily meal choices and attendance patterns
for a full year. It generates realistic patterns of:
1. Which days users eat in the canteen
2. Which of the 3 daily meal options they choose when they do eat there

The simulation takes into account:
- User preferences (vegetarian, meat-eater, etc.)
- Weekday patterns (some users eat more often on certain days)
- Seasonal patterns
- Special events
"""

import json
import random
import datetime
import os
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

# Constants
YEAR = 2025
NUM_USERS = 300
WORKDAYS_PER_YEAR = 260  # Approximate

# User preference profiles
USER_PROFILES = [
    {"name": "Vegetarian", "veg_pref": 0.8, "organic_pref": 0.15, "quick_pref": 0.05, "attendance_rate": 0.7, "is_vegetarian": True, "organic_preference": 0.4, "eco_conscious": True},
    {"name": "Meat Lover", "veg_pref": 0.1, "organic_pref": 0.7, "quick_pref": 0.2, "attendance_rate": 0.8, "is_vegetarian": False, "organic_preference": 0.3, "eco_conscious": False},
    {"name": "Health Conscious", "veg_pref": 0.4, "organic_pref": 0.5, "quick_pref": 0.1, "attendance_rate": 0.75, "is_vegetarian": False, "organic_preference": 0.8, "eco_conscious": True},
    {"name": "Busy Professional", "veg_pref": 0.2, "organic_pref": 0.2, "quick_pref": 0.6, "attendance_rate": 0.6, "is_vegetarian": False, "organic_preference": 0.2, "eco_conscious": False},
    {"name": "Occasional Visitor", "veg_pref": 0.33, "organic_pref": 0.33, "quick_pref": 0.34, "attendance_rate": 0.3, "is_vegetarian": False, "organic_preference": 0.3, "eco_conscious": False},
    {"name": "Regular Balanced", "veg_pref": 0.33, "organic_pref": 0.33, "quick_pref": 0.34, "attendance_rate": 0.9, "is_vegetarian": False, "organic_preference": 0.5, "eco_conscious": True}
]

# Weekday attendance modifiers (Monday=0, Friday=4)
WEEKDAY_MODIFIERS = {
    0: 0.9,  # Monday
    1: 1.0,  # Tuesday
    2: 1.1,  # Wednesday
    3: 1.0,  # Thursday
    4: 0.8   # Friday
}

# Seasonal attendance modifiers
SEASONAL_MODIFIERS = {
    1: 0.9,   # January
    2: 0.95,  # February
    3: 1.0,   # March
    4: 1.0,   # April
    5: 1.05,  # May
    6: 0.9,   # June (summer vacation starting)
    7: 0.7,   # July (summer vacation)
    8: 0.8,   # August (summer vacation ending)
    9: 1.1,   # September
    10: 1.05, # October
    11: 1.0,  # November
    12: 0.8   # December (Christmas)
}

# Special events that affect attendance and preferences
SPECIAL_EVENTS = [
    {"date": "2025-01-15", "name": "New Year Health Kick", "attendance_mod": 1.2, "veg_mod": 1.5, "organic_mod": 1.2, "quick_mod": 0.7},
    {"date": "2025-02-14", "name": "Valentine's Day", "attendance_mod": 1.1, "veg_mod": 1.0, "organic_mod": 1.3, "quick_mod": 0.8},
    {"date": "2025-04-22", "name": "Earth Day", "attendance_mod": 1.1, "veg_mod": 1.4, "organic_mod": 1.3, "quick_mod": 0.8},
    {"date": "2025-05-01", "name": "Labor Day", "attendance_mod": 0.5, "veg_mod": 1.0, "organic_mod": 1.0, "quick_mod": 1.0},
    {"date": "2025-06-05", "name": "Constitution Day", "attendance_mod": 0.7, "veg_mod": 1.0, "organic_mod": 1.0, "quick_mod": 1.0},
    {"date": "2025-10-16", "name": "World Food Day", "attendance_mod": 1.2, "veg_mod": 1.2, "organic_mod": 1.3, "quick_mod": 0.8},
    {"date": "2025-11-01", "name": "World Vegan Day", "attendance_mod": 1.1, "veg_mod": 2.0, "organic_mod": 1.0, "quick_mod": 0.7},
    {"date": "2025-12-15", "name": "Christmas Lunch Season", "attendance_mod": 1.3, "veg_mod": 0.8, "organic_mod": 1.5, "quick_mod": 0.7}
]

def generate_users(num_users: int) -> List[Dict[str, Any]]:
    """Generate a list of simulated users with preferences."""
    users = []
    
    for i in range(1, num_users + 1):
        # Randomly assign a profile
        profile = random.choice(USER_PROFILES)
        
        # Add some randomness to the preferences
        veg_pref = max(0, min(1, profile["veg_pref"] + random.uniform(-0.1, 0.1)))
        organic_pref = max(0, min(1, profile["organic_pref"] + random.uniform(-0.1, 0.1)))
        quick_pref = max(0, min(1, profile["quick_pref"] + random.uniform(-0.1, 0.1)))
        
        # Normalize preferences to sum to 1
        total = veg_pref + organic_pref + quick_pref
        veg_pref /= total
        organic_pref /= total
        quick_pref /= total
        
        # Add some randomness to attendance rate
        attendance_rate = max(0.1, min(1, profile["attendance_rate"] + random.uniform(-0.1, 0.1)))
        
        # Generate weekday preferences (some users prefer certain days)
        weekday_prefs = {}
        for day in range(5):
            weekday_prefs[day] = max(0.5, min(1.5, random.uniform(0.7, 1.3)))
        
        # Generate some food allergies and preferences
        allergies = []
        if random.random() < 0.15:  # 15% chance of having allergies
            possible_allergies = ["gluten", "mælk", "nødder", "æg", "soja", "selleri", "sesam"]
            num_allergies = random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
            allergies = random.sample(possible_allergies, num_allergies)
        
        # Add dietary preferences
        is_vegetarian = profile.get("is_vegetarian", False)
        if not is_vegetarian and random.random() < 0.05:  # 5% chance of being vegetarian regardless of profile
            is_vegetarian = True
        
        organic_preference = profile.get("organic_preference", 0.3) + random.uniform(-0.1, 0.1)
        organic_preference = max(0, min(1, organic_preference))
        
        eco_conscious = profile.get("eco_conscious", False)
        if not eco_conscious and random.random() < 0.1:  # 10% chance of being eco-conscious regardless of profile
            eco_conscious = True
        
        users.append({
            "id": i,
            "profile": profile["name"],
            "preferences": {
                "vegetarian": veg_pref,
                "organic": organic_pref,
                "quick": quick_pref
            },
            "dietary_preferences": {
                "vegetarian": is_vegetarian,
                "organic_preference": organic_preference,
                "eco_conscious": eco_conscious
            },
            "attendance_rate": attendance_rate,
            "weekday_preferences": weekday_prefs,
            "allergies": allergies
        })
    
    return users

def get_special_event_modifiers(date_str: str) -> Tuple[float, Dict[str, float]]:
    """Get attendance and preference modifiers for special events on a given date."""
    attendance_mod = 1.0
    pref_mods = {"vegetarian": 1.0, "organic": 1.0, "quick": 1.0}
    
    for event in SPECIAL_EVENTS:
        if event["date"] == date_str:
            attendance_mod = event["attendance_mod"]
            pref_mods["vegetarian"] = event["veg_mod"]
            pref_mods["organic"] = event["organic_mod"]
            pref_mods["quick"] = event["quick_mod"]
            break
    
    return attendance_mod, pref_mods

def simulate_user_choices(users: List[Dict[str, Any]], yearly_menu: List[Dict[str, Any]], meals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Simulate user choices for each day in the yearly menu."""
    # Create a lookup for meals by ID
    meal_lookup = {meal["id"]: meal for meal in meals}
    
    # Create a mapping from category ID to preference key
    category_to_pref = {
        1: "vegetarian",
        2: "organic",
        3: "quick"
    }
    
    # Initialize results
    user_choices = []
    
    # Process each day in the yearly menu
    for day_menu in yearly_menu:
        date_obj = datetime.datetime.strptime(day_menu["date"], "%Y-%m-%d").date()
        weekday = date_obj.weekday()
        month = date_obj.month
        
        # Skip weekends
        if weekday >= 5:
            continue
        
        # Get special event modifiers for this date
        event_attendance_mod, event_pref_mods = get_special_event_modifiers(day_menu["date"])
        
        # Get the meals for this day
        day_meals = [meal_lookup[meal_id] for meal_id in day_menu["meals"]]
        
        # Process each user
        for user in users:
            # Determine if user attends on this day
            base_probability = user["attendance_rate"]
            weekday_mod = WEEKDAY_MODIFIERS[weekday] * user["weekday_preferences"][weekday]
            seasonal_mod = SEASONAL_MODIFIERS[month]
            
            attendance_probability = base_probability * weekday_mod * seasonal_mod * event_attendance_mod
            
            # Cap probability at 1.0
            attendance_probability = min(1.0, attendance_probability)
            
            # Decide if user attends
            attends = random.random() < attendance_probability
            
            if attends:
                # Calculate meal preferences for this user on this day
                meal_prefs = []
                
                for meal in day_meals:
                    category_id = meal["categoryId"]
                    pref_key = category_to_pref[category_id]
                    
                    # Base preference for this category
                    base_pref = user["preferences"][pref_key]
                    
                    # Apply event modifier
                    modified_pref = base_pref * event_pref_mods[pref_key]
                    
                    # Check for allergies and other preferences
                    has_allergen = False
                    is_compatible = True
                    
                    if "ingredients" in meal:
                        # Check for allergies
                        for ingredient in meal["ingredients"]:
                            if any(allergen in user["allergies"] for allergen in ingredient.get("allergens", [])):
                                has_allergen = True
                                break
                        
                    # Check for dietary preferences (if user has them)
                    if "dietary_preferences" in user:
                        # Check if vegetarian user is being offered a non-vegetarian meal
                        if user["dietary_preferences"].get("vegetarian", False) and category_id != 1:
                            is_compatible = False
                        
                        # Check if user prefers organic food
                        if user["dietary_preferences"].get("organic_preference", 0) > 0.7:
                            # Count organic ingredients
                            organic_count = sum(1 for ing in meal["ingredients"] if ing.get("isOrganic", False))
                            if organic_count < len(meal["ingredients"]) / 2:  # Less than half ingredients are organic
                                # Reduce preference but don't eliminate
                                modified_pref *= 0.5
                        
                        # Check if user prefers low CO2 footprint
                        if user["dietary_preferences"].get("eco_conscious", False) and "co2Footprint" in meal:
                            if meal["co2Footprint"] > 5.0:  # High CO2 footprint
                                modified_pref *= 0.7
                    
                    # Check for dietary restrictions (if user has them)
                    if "dietary_restrictions" in user:
                        # Check for vegan restriction
                        if user["dietary_restrictions"].get("vegan", False):
                            # Check if meal contains animal products
                            has_animal_products = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isAnimalProduct", False) or ingredient.get("isDairy", False) or ingredient.get("isEgg", False):
                                    has_animal_products = True
                                    break
                            if has_animal_products:
                                is_compatible = False
                        
                        # Check for pescatarian restriction
                        if user["dietary_restrictions"].get("pescatarian", False):
                            # Check if meal contains meat (but fish is allowed)
                            has_meat = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isMeat", False) and not ingredient.get("isFish", False):
                                    has_meat = True
                                    break
                            if has_meat:
                                is_compatible = False
                        
                        # Check for no fish restriction
                        if user["dietary_restrictions"].get("no_fish", False):
                            # Check if meal contains fish
                            has_fish = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isFish", False):
                                    has_fish = True
                                    break
                            if has_fish:
                                is_compatible = False
                        
                        # Check for no shellfish restriction
                        if user["dietary_restrictions"].get("no_shellfish", False):
                            # Check if meal contains shellfish
                            has_shellfish = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isShellfish", False):
                                    has_shellfish = True
                                    break
                            if has_shellfish:
                                is_compatible = False
                        
                        # Check for no pork restriction
                        if user["dietary_restrictions"].get("no_pork", False):
                            # Check if meal contains pork
                            has_pork = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isPork", False):
                                    has_pork = True
                                    break
                            if has_pork:
                                is_compatible = False
                        
                        # Check for no beef restriction
                        if user["dietary_restrictions"].get("no_beef", False):
                            # Check if meal contains beef
                            has_beef = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isBeef", False):
                                    has_beef = True
                                    break
                            if has_beef:
                                is_compatible = False
                        
                        # Check for no dairy restriction
                        if user["dietary_restrictions"].get("no_dairy", False):
                            # Check if meal contains dairy
                            has_dairy = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isDairy", False):
                                    has_dairy = True
                                    break
                            if has_dairy:
                                is_compatible = False
                        
                        # Check for no eggs restriction
                        if user["dietary_restrictions"].get("no_eggs", False):
                            # Check if meal contains eggs
                            has_eggs = False
                            for ingredient in meal["ingredients"]:
                                if ingredient.get("isEgg", False):
                                    has_eggs = True
                                    break
                            if has_eggs:
                                is_compatible = False
                    
                    # If user has allergy to this meal or it's incompatible with dietary preferences, set preference to 0
                    if has_allergen or not is_compatible:
                        modified_pref = 0
                    
                    meal_prefs.append((meal["id"], modified_pref))
                
                # If all meals have 0 preference (e.g., due to allergies), user doesn't attend
                if all(pref == 0 for _, pref in meal_prefs):
                    attends = False
                else:
                    # Normalize preferences
                    total_pref = sum(pref for _, pref in meal_prefs)
                    if total_pref > 0:
                        normalized_prefs = [(meal_id, pref / total_pref) for meal_id, pref in meal_prefs]
                    else:
                        # If all prefs are 0, make them equal
                        normalized_prefs = [(meal_id, 1.0 / len(meal_prefs)) for meal_id, _ in meal_prefs]
                    
                    # Choose meal based on preferences
                    meal_ids = [meal_id for meal_id, _ in normalized_prefs]
                    weights = [pref for _, pref in normalized_prefs]
                    chosen_meal_id = random.choices(meal_ids, weights=weights)[0]
                    
                    # Record the choice with detailed information
                    choice_data = {
                        "userId": user["id"],
                        "date": day_menu["date"],
                        "attended": True,
                        "mealId": chosen_meal_id
                    }
                    
                    # Add detailed meal information if available
                    chosen_meal = meal_lookup[chosen_meal_id]
                    if "ingredients" in chosen_meal:
                        # Calculate nutritional totals
                        total_calories = chosen_meal.get("nutritionalInfo", {}).get("calories", 0)
                        total_protein = chosen_meal.get("nutritionalInfo", {}).get("protein", 0)
                        total_carbs = chosen_meal.get("nutritionalInfo", {}).get("carbs", 0)
                        total_fat = chosen_meal.get("nutritionalInfo", {}).get("fat", 0)
                        
                        # Calculate ingredient statistics
                        organic_count = sum(1 for ing in chosen_meal["ingredients"] if ing.get("isOrganic", False))
                        organic_percentage = organic_count / len(chosen_meal["ingredients"]) * 100
                        
                        # Get unique allergens
                        all_allergens = []
                        for ing in chosen_meal["ingredients"]:
                            all_allergens.extend(ing.get("allergens", []))
                        unique_allergens = list(set(all_allergens))
                        
                        # Get unique origins
                        origins = [ing.get("origin", "Unknown") for ing in chosen_meal["ingredients"]]
                        unique_origins = list(set(origins))
                        
                        # Add to choice data
                        choice_data["mealDetails"] = {
                            "name": chosen_meal["name"],
                            "category": chosen_meal["categoryId"],
                            "price": chosen_meal.get("price", 0),
                            "co2Footprint": chosen_meal.get("co2Footprint", 0),
                            "nutritionalInfo": {
                                "calories": total_calories,
                                "protein": total_protein,
                                "carbs": total_carbs,
                                "fat": total_fat
                            },
                            "ingredientStats": {
                                "totalCount": len(chosen_meal["ingredients"]),
                                "organicCount": organic_count,
                                "organicPercentage": organic_percentage,
                                "allergens": unique_allergens,
                                "origins": unique_origins
                            }
                        }
                    
                    user_choices.append(choice_data)
            else:
                # Record non-attendance
                user_choices.append({
                    "userId": user["id"],
                    "date": day_menu["date"],
                    "attended": False,
                    "mealId": None
                })
    
    return user_choices

def analyze_results(user_choices: List[Dict[str, Any]], users: List[Dict[str, Any]], meals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze the simulation results to extract insights."""
    # Create a DataFrame for easier analysis
    df = pd.DataFrame(user_choices)
    
    # Create a lookup for meals by ID
    meal_lookup = {meal["id"]: meal for meal in meals}
    
    # Basic statistics
    total_days = len(df["date"].unique())
    total_users = len(df["userId"].unique())
    total_possible_visits = total_days * total_users
    total_actual_visits = df["attended"].sum()
    attendance_rate = total_actual_visits / total_possible_visits
    
    # Meal popularity
    meal_counts = df[df["attended"]]["mealId"].value_counts().to_dict()
    meal_popularity = {
        meal_id: {
            "count": count,
            "percentage": count / total_actual_visits * 100,
            "name": meal_lookup[meal_id]["name"] if meal_id in meal_lookup else "Unknown",
            "category": meal_lookup[meal_id]["categoryId"] if meal_id in meal_lookup else "Unknown"
        }
        for meal_id, count in meal_counts.items()
    }
    
    # Category popularity
    category_counts = {
        1: 0,  # Vegetarian
        2: 0,  # Organic with meat
        3: 0   # Quick
    }
    
    for meal_id, count in meal_counts.items():
        if meal_id in meal_lookup:
            category = meal_lookup[meal_id]["categoryId"]
            category_counts[category] += count
    
    category_popularity = {
        category: {
            "count": count,
            "percentage": count / total_actual_visits * 100,
            "name": {1: "Vegetarian", 2: "Organic with meat", 3: "Quick"}[category]
        }
        for category, count in category_counts.items()
    }
    
    # Attendance by weekday
    df["weekday"] = pd.to_datetime(df["date"]).dt.weekday
    weekday_attendance = {str(k): float(v) for k, v in df.groupby("weekday")["attended"].mean().to_dict().items()}
    
    # Attendance by month
    df["month"] = pd.to_datetime(df["date"]).dt.month
    month_attendance = {str(k): float(v) for k, v in df.groupby("month")["attended"].mean().to_dict().items()}
    
    # User profile analysis
    user_lookup = {user["id"]: user for user in users}
    profile_attendance = {}
    
    for user_id in df["userId"].unique():
        user = user_lookup[user_id]
        profile = user["profile"]
        
        if profile not in profile_attendance:
            profile_attendance[profile] = {"count": 0, "total": 0}
        
        user_df = df[df["userId"] == user_id]
        profile_attendance[profile]["count"] += user_df["attended"].sum()
        profile_attendance[profile]["total"] += len(user_df)
    
    for profile, data in profile_attendance.items():
        data["rate"] = data["count"] / data["total"] if data["total"] > 0 else 0
    
    # Ingredient analysis (if detailed meal information is available)
    ingredient_stats = {}
    organic_percentage_avg = 0
    co2_footprint_avg = 0
    price_avg = 0
    
    # Filter choices with meal details
    detailed_choices = [choice for choice in user_choices if choice.get("attended") and "mealDetails" in choice]
    
    if detailed_choices:
        # Calculate averages
        organic_percentage_avg = sum(choice["mealDetails"]["ingredientStats"]["organicPercentage"] for choice in detailed_choices) / len(detailed_choices)
        co2_footprint_avg = sum(choice["mealDetails"]["co2Footprint"] for choice in detailed_choices) / len(detailed_choices)
        price_avg = sum(choice["mealDetails"]["price"] for choice in detailed_choices) / len(detailed_choices)
        
        # Count origins
        origin_counts = {}
        for choice in detailed_choices:
            for origin in choice["mealDetails"]["ingredientStats"]["origins"]:
                origin_counts[origin] = origin_counts.get(origin, 0) + 1
        
        # Count allergens
        allergen_counts = {}
        for choice in detailed_choices:
            for allergen in choice["mealDetails"]["ingredientStats"]["allergens"]:
                allergen_counts[allergen] = allergen_counts.get(allergen, 0) + 1
        
        ingredient_stats = {
            "organicPercentageAvg": organic_percentage_avg,
            "co2FootprintAvg": co2_footprint_avg,
            "priceAvg": price_avg,
            "originCounts": origin_counts,
            "allergenCounts": allergen_counts
        }
    
    # Create a JSON-serializable result dictionary
    # Convert any NumPy types to native Python types
    return {
        "summary": {
            "total_days": int(total_days),
            "total_users": int(total_users),
            "total_possible_visits": int(total_possible_visits),
            "total_actual_visits": int(total_actual_visits),
            "overall_attendance_rate": float(attendance_rate)
        },
        "meal_popularity": {
            str(meal_id): {
                "count": int(data["count"]),
                "percentage": float(data["percentage"]),
                "name": str(data["name"]),
                "category": int(data["category"]) if isinstance(data["category"], (int, np.integer)) else str(data["category"])
            }
            for meal_id, data in meal_popularity.items()
        },
        "category_popularity": {
            str(category): {
                "count": int(data["count"]),
                "percentage": float(data["percentage"]),
                "name": str(data["name"])
            }
            for category, data in category_popularity.items()
        },
        "weekday_attendance": weekday_attendance,
        "month_attendance": month_attendance,
        "profile_attendance": {
            profile: {
                "count": int(data["count"]),
                "total": int(data["total"]),
                "rate": float(data["rate"])
            }
            for profile, data in profile_attendance.items()
        },
        "ingredient_stats": {
            "organicPercentageAvg": float(organic_percentage_avg),
            "co2FootprintAvg": float(co2_footprint_avg),
            "priceAvg": float(price_avg),
            "originCounts": {str(origin): int(count) for origin, count in ingredient_stats.get("originCounts", {}).items()},
            "allergenCounts": {str(allergen): int(count) for allergen, count in ingredient_stats.get("allergenCounts", {}).items()}
        } if ingredient_stats else {}
    }

def run_simulation():
    """Run the full simulation and save results."""
    # Load meal data
    with open('meal_data.json', 'r') as f:
        data = json.load(f)
    
    # Generate users
    users = generate_users(NUM_USERS)
    
    # Simulate user choices
    user_choices = simulate_user_choices(users, data["yearlyMenu"], data["meals"])
    
    # Analyze results
    analysis = analyze_results(user_choices, users, data["meals"])
    
    # Save simulation results
    simulation_data = {
        "users": users,
        "userChoices": user_choices,
        "analysis": analysis
    }
    
    with open('simulation_results.json', 'w') as f:
        json.dump(simulation_data, f, indent=2)
    
    print(f"Simulation completed with {len(user_choices)} user choice records.")
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
        
        print("\nTop 5 Ingredient Origins:")
        top_origins = sorted(analysis["ingredient_stats"]["originCounts"].items(), key=lambda x: x[1], reverse=True)[:5]
        for origin, count in top_origins:
            print(f"  {origin}: {count} occurrences")
        
        print("\nTop Allergens:")
        top_allergens = sorted(analysis["ingredient_stats"]["allergenCounts"].items(), key=lambda x: x[1], reverse=True)[:5]
        for allergen, count in top_allergens:
            print(f"  {allergen}: {count} occurrences")

if __name__ == "__main__":
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Set random seed for reproducibility
    random.seed(42)
    np.random.seed(42)
    
    run_simulation()
