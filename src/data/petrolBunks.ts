
export interface PetrolBunk {
  id: string;
  name: string;
  brand: string;
  state: string;
  address: string;
  hours: string;
  phone: string;
  coords: [number, number]; // [latitude, longitude]
}

export const petrolBunks: PetrolBunk[] = [
  {
    id: "tel-001",
    name: "Hippocampus Service Station",
    brand: "BPCL", 
    state: "Telangana",
    address: "Door No 103, Hyderabad, Telangana 500003",
    hours: "Open 24 Hours",
    phone: "+914023249042",
    coords: [17.385044, 78.486671]
  },
  {
    id: "tel-002",
    name: "KP Fill Point", 
    brand: "HP",
    state: "Telangana",
    address: "No 12/1/927/1, Asifnagar, Hyderabad, Telangana 500001",
    hours: "Open 24 Hours",
    phone: "+918886552900",
    coords: [17.3840, 78.4580]
  },
  {
    id: "tel-003",
    name: "Secunderabad Fuel Center",
    brand: "IOCL",
    state: "Telangana",
    address: "Near Paradise Circle, Secunderabad, Telangana 500003",
    hours: "Open 24 Hours",
    phone: "+914027898765",
    coords: [17.4400, 78.4982]
  },
  {
    id: "mp-001",
    name: "Shakti Filling Station",
    brand: "IOCL",
    state: "Madhya Pradesh",
    address: "NH 46, Lalghati, Bhopal, Madhya Pradesh 462030",
    hours: "Open 24 Hours",
    phone: "+917552664123",
    coords: [23.2599, 77.4126]
  },
  {
    id: "mp-002",
    name: "Highway Fuels",
    brand: "BPCL",
    state: "Madhya Pradesh",
    address: "NH 3, Dewas Road, Indore, Madhya Pradesh 452010",
    hours: "Open 24 Hours",
    phone: "+917312345678",
    coords: [22.7196, 75.8577]
  },
  {
    id: "mp-003",
    name: "Gwalior Petrol Services",
    brand: "HP",
    state: "Madhya Pradesh",
    address: "NH 3, Gwalior, Madhya Pradesh 474001",
    hours: "Open 24 Hours",
    phone: "+917512345678",
    coords: [26.2183, 78.1828]
  },
  {
    id: "up-001",
    name: "Sai Fuel Station",
    brand: "HP",
    state: "Uttar Pradesh",
    address: "Faizabad Road, Lucknow, Uttar Pradesh 226016",
    hours: "Open 24 Hours",
    phone: "+915224234567",
    coords: [26.8467, 80.9462]
  },
  {
    id: "up-002",
    name: "Kanpur Fuel Center", 
    brand: "IOCL",
    state: "Uttar Pradesh",
    address: "NH 2, Kanpur, Uttar Pradesh 208001",
    hours: "Open 24 Hours",
    phone: "+915123456789",
    coords: [26.4499, 80.3319]
  },
  {
    id: "up-003",
    name: "Agra Fuel Junction",
    brand: "BPCL", 
    state: "Uttar Pradesh",
    address: "NH 2, Agra, Uttar Pradesh 282001",
    hours: "Open 24 Hours",
    phone: "+915623456789",
    coords: [27.1767, 78.0081]
  },
  {
    id: "har-001",
    name: "Gurugram Fuels",
    brand: "BPCL", 
    state: "Haryana",
    address: "NH 48, Sector 18, Gurgaon, Haryana 122022",
    hours: "Open 24 Hours",
    phone: "+911242345678",
    coords: [28.4595, 77.0266]
  },
  {
    id: "har-002",
    name: "Panipat Highway Services",
    brand: "HP", 
    state: "Haryana",
    address: "NH 1, Panipat, Haryana 132103",
    hours: "Open 24 Hours",
    phone: "+911803456789",
    coords: [29.3909, 76.9635]
  },
  {
    id: "del-001",
    name: "Delhi Highway Fuels",
    brand: "IOCL", 
    state: "Delhi",
    address: "Ring Road, Sarai Kale Khan, Delhi 110013",
    hours: "Open 24 Hours",
    phone: "+911123456789",
    coords: [28.5898, 77.2505]
  },
  {
    id: "del-002",
    name: "North Delhi Fuel Point",
    brand: "BPCL", 
    state: "Delhi",
    address: "GT Karnal Road, Model Town, Delhi 110009",
    hours: "Open 24 Hours",
    phone: "+911127456789",
    coords: [28.7041, 77.1925]
  },
  {
    id: "mah-001",
    name: "Mumbai Central Fuels",
    brand: "HP", 
    state: "Maharashtra",
    address: "Western Express Highway, Mumbai, Maharashtra 400050",
    hours: "Open 24 Hours",
    phone: "+912228456789",
    coords: [19.0760, 72.8777]
  },
  {
    id: "mah-002",
    name: "Pune Highway Services",
    brand: "IOCL", 
    state: "Maharashtra",
    address: "NH 4, Pune, Maharashtra 411045",
    hours: "Open 24 Hours",
    phone: "+912025456789",
    coords: [18.5204, 73.8567]
  }
];

// Helper function to get petrol bunks by state
export const getPetrolBunksByState = (stateName: string): PetrolBunk[] => {
  return petrolBunks.filter(bunk => 
    bunk.state.toLowerCase() === stateName.toLowerCase()
  );
};
