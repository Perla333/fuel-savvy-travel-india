
export interface StateFuelPrice {
  state: string;
  petrol: number;
  diesel: number;
  center: [number, number]; // [latitude, longitude]
}

export const fuelPrices: StateFuelPrice[] = [
  {
    state: "Andhra Pradesh",
    petrol: 108.35,
    diesel: 96.22,
    center: [15.9129, 79.7400]
  },
  {
    state: "Telangana",
    petrol: 107.46,
    diesel: 95.7,
    center: [17.1232, 79.2089]
  },
  {
    state: "Madhya Pradesh",
    petrol: 106.28,
    diesel: 91.68,
    center: [22.9734, 78.6569]
  },
  {
    state: "Maharashtra",
    petrol: 103.5,
    diesel: 90.03,
    center: [19.7515, 75.7139]
  },
  {
    state: "Uttar Pradesh",
    petrol: 94.69,
    diesel: 87.81,
    center: [26.8467, 80.9462]
  },
  {
    state: "Haryana",
    petrol: 94.3,
    diesel: 82.45,
    center: [29.0588, 76.0856]
  },
  {
    state: "Delhi",
    petrol: 95.41,
    diesel: 86.67,
    center: [28.7041, 77.1025]
  },
  {
    state: "Karnataka",
    petrol: 101.94,
    diesel: 91.68,
    center: [15.3173, 75.7139]
  },
  {
    state: "Tamil Nadu",
    petrol: 102.63,
    diesel: 94.24,
    center: [11.1271, 78.6569]
  },
  {
    state: "Kerala",
    petrol: 107.54,
    diesel: 96.84,
    center: [10.8505, 76.2711]
  },
  {
    state: "Gujarat",
    petrol: 96.42,
    diesel: 92.17,
    center: [22.2587, 71.1924]
  },
  {
    state: "Rajasthan",
    petrol: 108.48,
    diesel: 93.72,
    center: [27.0238, 74.2179]
  },
  {
    state: "Punjab",
    petrol: 98.65,
    diesel: 89.02,
    center: [31.1471, 75.3412]
  },
  {
    state: "Bihar",
    petrol: 107.24,
    diesel: 94.04,
    center: [25.0961, 85.3131]
  },
  {
    state: "West Bengal",
    petrol: 104.67,
    diesel: 92.97,
    center: [22.9868, 87.8550]
  },
  {
    state: "Odisha",
    petrol: 103.19,
    diesel: 94.76,
    center: [20.9517, 85.0985]
  },
  {
    state: "Assam",
    petrol: 101.54,
    diesel: 89.29,
    center: [26.2006, 92.9376]
  },
  {
    state: "Jharkhand",
    petrol: 104.33,
    diesel: 91.57,
    center: [23.6102, 85.2799]
  },
  {
    state: "Chhattisgarh",
    petrol: 102.33,
    diesel: 95.23,
    center: [21.2787, 81.8661]
  },
  {
    state: "Uttarakhand",
    petrol: 95.81,
    diesel: 90.56,
    center: [30.0668, 79.0193]
  },
  {
    state: "Himachal Pradesh",
    petrol: 99.59,
    diesel: 86.39,
    center: [31.1048, 77.1734]
  },
  {
    state: "Goa",
    petrol: 97.57,
    diesel: 89.7,
    center: [15.2993, 74.1240]
  }
];

// Helper function to get nearest state based on coordinates
export const getNearestState = (lat: number, lng: number): StateFuelPrice => {
  let nearestState = fuelPrices[0];
  let minDistance = Number.MAX_VALUE;
  
  fuelPrices.forEach(state => {
    const distance = Math.sqrt(
      Math.pow(lat - state.center[0], 2) + Math.pow(lng - state.center[1], 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestState = state;
    }
  });
  
  return nearestState;
};

// Helper function to get fuel price by state name
export const getFuelPriceByState = (stateName: string): StateFuelPrice | undefined => {
  return fuelPrices.find(state => state.state.toLowerCase() === stateName.toLowerCase());
};
