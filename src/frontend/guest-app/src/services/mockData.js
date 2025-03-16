// Mock data for ratings and reviews
export const mockRatings = {
  // Mock ratings for meal with ID 1
  1: [
    {
      id: 101,
      mealId: 1,
      userId: 201,
      userName: "Emma Jensen",
      userAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
      rating: 4.5,
      comment: "The salmon was perfectly cooked and the vegetables were fresh. I would definitely order this again!",
      date: "2025-03-10T14:30:00Z",
      helpfulCount: 12,
      verified: true
    },
    {
      id: 102,
      mealId: 1,
      userId: 202,
      userName: "Michael Poulsen",
      userAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 5,
      comment: "Absolutely delicious! The herb sauce complemented the salmon perfectly. One of the best meals I've had at the canteen.",
      date: "2025-03-08T12:15:00Z",
      helpfulCount: 8,
      verified: true
    },
    {
      id: 103,
      mealId: 1,
      userId: 203,
      userName: "Sophie Nielsen",
      rating: 3,
      comment: "The salmon was good but a bit overcooked for my taste. The vegetables were excellent though.",
      date: "2025-03-05T13:45:00Z",
      helpfulCount: 3,
      verified: true
    }
  ],
  
  // Mock ratings for meal with ID 2
  2: [
    {
      id: 201,
      mealId: 2,
      userId: 204,
      userName: "Lars Andersen",
      userAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 5,
      comment: "This Buddha bowl is amazing! So fresh and flavorful. The tahini dressing is to die for.",
      date: "2025-03-12T11:20:00Z",
      helpfulCount: 15,
      verified: true
    },
    {
      id: 202,
      mealId: 2,
      userId: 205,
      userName: "Anna Christensen",
      userAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 4,
      comment: "Really enjoyed this healthy option. The sweet potatoes were perfectly roasted and the avocado was ripe.",
      date: "2025-03-09T12:30:00Z",
      helpfulCount: 7,
      verified: true
    },
    {
      id: 203,
      mealId: 2,
      userId: 206,
      userName: "Morten Hansen",
      rating: 4.5,
      comment: "Great vegan option! Filling and nutritious. Would recommend adding a bit more tahini dressing.",
      date: "2025-03-07T13:10:00Z",
      helpfulCount: 5,
      verified: true
    },
    {
      id: 204,
      mealId: 2,
      userId: 207,
      userName: "Camilla Pedersen",
      rating: 3.5,
      comment: "Good but not great. The quinoa was a bit undercooked, but the flavors were nice.",
      date: "2025-03-04T12:45:00Z",
      helpfulCount: 2,
      verified: true
    }
  ],
  
  // Mock ratings for meal with ID 3
  3: [
    {
      id: 301,
      mealId: 3,
      userId: 208,
      userName: "Thomas Rasmussen",
      userAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
      rating: 4,
      comment: "Perfect quick lunch option. The chicken was moist and the wrap was fresh.",
      date: "2025-03-11T12:15:00Z",
      helpfulCount: 9,
      verified: true
    },
    {
      id: 302,
      mealId: 3,
      userId: 209,
      userName: "Julie Møller",
      rating: 3,
      comment: "It was okay. The wrap was a bit dry and could use more dressing.",
      date: "2025-03-06T13:30:00Z",
      helpfulCount: 4,
      verified: true
    }
  ]
};

// Function to get mock ratings for a meal
export const getMockRatings = (mealId) => {
  // Return the ratings for the specified meal, or an empty array if none exist
  return mockRatings[mealId] || [];
};

// Function to add a mock rating
export const addMockRating = (mealId, ratingData) => {
  // Create a new rating object
  const newRating = {
    id: Date.now(), // Use timestamp as a simple unique ID
    mealId: parseInt(mealId),
    userId: ratingData.userId || 999, // Default user ID if not provided
    userName: ratingData.userName || "Anonymous",
    userAvatar: ratingData.userAvatar,
    rating: ratingData.rating,
    comment: ratingData.comment || "",
    date: ratingData.date || new Date().toISOString(),
    helpfulCount: 0,
    verified: ratingData.verified || false
  };
  
  // Initialize the ratings array for this meal if it doesn't exist
  if (!mockRatings[mealId]) {
    mockRatings[mealId] = [];
  }
  
  // Add the new rating to the beginning of the array
  mockRatings[mealId].unshift(newRating);
  
  return newRating;
};
