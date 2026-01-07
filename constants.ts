
import { User, JobRequest, Proposal, Review, Category } from './types';

// Expanded Categories List for the "All Services" Catalog (80+ Items)
export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  // --- HOME & CONSTRUCTION ---
  { id: 'Cleaning', label: 'Cleaning', icon: 'Sparkles' },
  { id: 'Electrician', label: 'Electrician', icon: 'Zap' },
  { id: 'Plumbing', label: 'Plumbing', icon: 'Droplets' },
  { id: 'Gardening', label: 'Gardening', icon: 'Flower2' },
  { id: 'SolarEnergy', label: 'Solar & Battery', icon: 'Sun' },
  { id: 'Painter', label: 'Painter', icon: 'Paintbrush' },
  { id: 'Carpenter', label: 'Carpenter', icon: 'Hammer' },
  { id: 'Roofer', label: 'Roofer', icon: 'Home' },
  { id: 'HVAC', label: 'Heating & AC', icon: 'Thermometer' },
  { id: 'Locksmith', label: 'Locksmith', icon: 'Lock' },
  { id: 'Flooring', label: 'Flooring', icon: 'Grid' },
  { id: 'PoolMaintenance', label: 'Pool Maintenance', icon: 'Droplets' },
  { id: 'PestControl', label: 'Pest Control', icon: 'Bug' },
  { id: 'InteriorDesign', label: 'Interior Design', icon: 'Layout' },
  { id: 'Handyman', label: 'Handyman', icon: 'Wrench' },
  { id: 'Mason', label: 'Mason / Bricklayer', icon: 'Hammer' },
  { id: 'Welder', label: 'Welder', icon: 'Zap' },
  { id: 'Glazier', label: 'Glazier (Windows)', icon: 'Grid' },
  { id: 'ChimneySweep', label: 'Chimney Sweep', icon: 'Home' },
  { id: 'SecuritySys', label: 'Security Systems', icon: 'Shield' },
  { id: 'SmartHome', label: 'Smart Home Install', icon: 'Wifi' },
  { id: 'FengShui', label: 'Feng Shui Consultant', icon: 'Compass' },
  { id: 'Architect', label: 'Architect', icon: 'PenTool' },
  { id: 'Insulation', label: 'Insulation Expert', icon: 'Home' },
  { id: 'Demolition', label: 'Demolition Service', icon: 'Hammer' },

  // --- AUTO & TRANSPORT ---
  { id: 'Mechanic', label: 'Mechanic', icon: 'Wrench' },
  { id: 'ElectricVehicle', label: 'Electric Vehicle', icon: 'Zap' },
  { id: 'AutoBody', label: 'Auto Body & Paint', icon: 'Paintbrush' },
  { id: 'CarWash', label: 'Car Wash', icon: 'Droplets' },
  { id: 'Towing', label: 'Towing Service', icon: 'Truck' },
  { id: 'Micromobility', label: 'Scooters & Bikes', icon: 'Bike' },
  { id: 'Moving', label: 'Moving', icon: 'Truck' },
  { id: 'Driver', label: 'Private Driver', icon: 'Car' },
  { id: 'DrivingInstructor', label: 'Driving Instructor', icon: 'Car' },
  { id: 'BoatMechanic', label: 'Boat Mechanic', icon: 'Anchor' },
  { id: 'BikeRepair', label: 'Bicycle Repair', icon: 'Bike' },
  { id: 'CarDetailing', label: 'Car Detailing', icon: 'Sparkles' },
  { id: 'Logistics', label: 'Logistics / Courier', icon: 'Truck' },

  // --- TECH & DIGITAL ---
  { id: 'IT Support', label: 'IT Support', icon: 'Laptop' },
  { id: 'WebDev', label: 'Web Developer', icon: 'Code' },
  { id: 'GraphicDesign', label: 'Graphic Design', icon: 'PenTool' },
  { id: 'VideoEditor', label: 'Video Editor', icon: 'Video' },
  { id: 'SEO', label: 'SEO Specialist', icon: 'Search' },
  { id: 'SocialMedia', label: 'Social Media Manager', icon: 'Smartphone' },
  { id: 'DataRecovery', label: 'Data Recovery', icon: 'Database' },
  { id: 'PhoneRepair', label: 'Phone/Tablet Repair', icon: 'Smartphone' },
  { id: 'ApplianceRepair', label: 'Appliance Repair', icon: 'Wrench' },
  { id: 'NetworkAdmin', label: 'Network Admin', icon: 'Wifi' },
  { id: 'CyberSecurity', label: 'Cyber Security', icon: 'Lock' },

  // --- BUSINESS & LEGAL ---
  { id: 'Accountant', label: 'Accountant', icon: 'FileText' },
  { id: 'Translator', label: 'Translator', icon: 'Languages' },
  { id: 'Lawyer', label: 'Lawyer / Legal', icon: 'Briefcase' },
  { id: 'Notary', label: 'Notary Services', icon: 'FileText' },
  { id: 'TaxAdvisor', label: 'Tax Advisor', icon: 'FileText' },
  { id: 'HRConsultant', label: 'HR Consultant', icon: 'Users' },
  { id: 'Copywriter', label: 'Copywriter', icon: 'Edit3' },
  { id: 'BusinessCoach', label: 'Business Coach', icon: 'TrendingUp' },
  { id: 'VirtualAssistant', label: 'Virtual Assistant', icon: 'Laptop' },

  // --- EVENTS & PARTY ---
  { id: 'EventPlanner', label: 'Event Planner', icon: 'Calendar' },
  { id: 'DJ', label: 'DJ & Music', icon: 'Music' },
  { id: 'Photographer', label: 'Photographer', icon: 'Camera' },
  { id: 'Caterer', label: 'Caterer / Food', icon: 'ChefHat' },
  { id: 'Florist', label: 'Florist', icon: 'Flower2' },
  { id: 'Musician', label: 'Live Musician/Band', icon: 'Music' },
  { id: 'Magician', label: 'Magician / Entertainer', icon: 'Sparkles' },
  { id: 'Bartender', label: 'Private Bartender', icon: 'Glass' },
  { id: 'WeddingOfficiant', label: 'Wedding Officiant', icon: 'Heart' },
  { id: 'PartyDecorator', label: 'Party Decorator', icon: 'Gift' },

  // --- LIFESTYLE & CARE (Non-Medical) ---
  { id: 'Beauty', label: 'Beauty & Esthetics', icon: 'Scissors' },
  { id: 'Pet Sitter', label: 'Pet Sitter', icon: 'Dog' },
  { id: 'Hairdresser', label: 'Hairdresser', icon: 'Scissors' },
  { id: 'MakeupArtist', label: 'Makeup Artist', icon: 'Smile' },
  { id: 'PersonalTrainer', label: 'Personal Trainer', icon: 'Dumbbell' },
  { id: 'Yoga', label: 'Yoga Instructor', icon: 'Flower2' },
  { id: 'Massage', label: 'Massage (Relax)', icon: 'Heart' }, // Strictly relaxation
  { id: 'Babysitter', label: 'Babysitter', icon: 'Baby' },
  { id: 'Chef', label: 'Personal Chef', icon: 'ChefHat' },
  { id: 'Tailor', label: 'Tailor / Alterations', icon: 'Scissors' },
  { id: 'Shoemaker', label: 'Shoemaker / Cobbler', icon: 'Wrench' },
  { id: 'PersonalShopper', label: 'Personal Shopper', icon: 'ShoppingBag' },
  { id: 'LifeCoach', label: 'Life Coach', icon: 'Compass' },
  { id: 'Astrologer', label: 'Astrologer / Tarot', icon: 'Star' },
  { id: 'TravelPlanner', label: 'Travel Planner', icon: 'Globe' },
  { id: 'DogWalker', label: 'Dog Walker', icon: 'Dog' },
  { id: 'DogTrainer', label: 'Dog Trainer', icon: 'Dog' },

  // --- EDUCATION & MUSIC ---
  { id: 'Tutor', label: 'Tutor / Schooling', icon: 'BookOpen' },
  { id: 'LanguageTutor', label: 'Language Tutor', icon: 'Languages' },
  { id: 'MusicTeacher', label: 'Music Teacher', icon: 'Music' },
  { id: 'ArtTeacher', label: 'Art Teacher', icon: 'Palette' },
  { id: 'CodingTutor', label: 'Coding Instructor', icon: 'Code' },
  { id: 'MathTutor', label: 'Math Tutor', icon: 'Calculator' }
];

export const MOCK_CLIENT: User = {
  id: 'client-1',
  name: 'Alice',
  surname: 'Johnson',
  email: 'alice.j@email.lu',
  phone: '+352 621 123 456',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  role: 'CLIENT',
  languages: ['EN', 'FR', 'LB'],
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      street: 'Avenue de la Gare',
      number: '42',
      postalCode: 'L-1611',
      locality: 'Luxembourg City',
      floor: '3',
      hasElevator: true,
      easyParking: false,
    }
  ],
  twoFactorEnabled: false,
};

export const MOCK_PRO: User = {
  id: 'pro-1',
  name: 'Roberto',
  surname: 'Silva',
  email: 'roberto.pro@servicebid.lu',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
  role: 'PRO',
  isVerified: true,
  level: 'Master',
  xp: 4500,
  rating: 4.9,
  reviewsCount: 128,
  joinedDate: '2021',
  bio: 'Certified Master Electrician and EV Specialist with 10+ years of experience. Expert in residential solar systems.',
  languages: ['PT', 'FR', 'EN'],
  addresses: [],
  companyDetails: {
    legalName: "Roberto Electric Solutions",
    legalType: "independant",
    vatNumber: "LU12345678",
    rcsNumber: "A12345",
    licenseNumber: "10023456/0",
    licenseExpiry: "2026-12-31",
    iban: "LU88 0011 2233 4455 66",
    bankName: "BGL BNP Paribas",
    plan: "Premium",
    cardLast4: "4242",
    cardBrand: "Visa"
  }
};

// Jobs including past jobs for analytics
export const MOCK_JOBS: JobRequest[] = [
  // Job pronto para testar o Workflow (A caminho / Iniciar Serviço)
  {
    id: 'job-confirmed-1',
    clientId: 'client-1',
    category: 'Electrician',
    description: 'Urgent: Power outage in the kitchen.',
    photos: [],
    urgency: 'URGENT',
    suggestedPrice: 200,
    finalPrice: 220,
    status: 'CONFIRMED',
    createdAt: '1 hour ago',
    location: 'Route d\'Esch, Luxembourg',
    distance: '3.2 km'
  },
  {
    id: 'job-1',
    clientId: 'client-99',
    category: 'Electrician',
    description: 'Need to replace a circuit breaker that keeps tripping. Also check 2 outlets.',
    photos: ['https://picsum.photos/400/300?random=10'],
    urgency: 'THIS_WEEK',
    suggestedPrice: 150,
    status: 'OPEN',
    createdAt: '10 mins ago',
    location: 'Luxembourg City, Avenue de la Gare',
    distance: '2.5 km',
  },
  // Past jobs for analytics
  {
    id: 'job-old-1',
    clientId: 'client-55',
    category: 'Electrician',
    description: 'Install EV Charger',
    photos: [],
    urgency: 'URGENT',
    suggestedPrice: 850,
    finalPrice: 900,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    finishedAt: new Date(Date.now() - 82800000).toISOString(),
    location: 'Kirchberg',
    distance: '5 km'
  },
  {
    id: 'job-old-2',
    clientId: 'client-56',
    category: 'SolarEnergy',
    description: 'Solar Panel Maintenance',
    photos: [],
    urgency: 'PLANNING',
    suggestedPrice: 200,
    finalPrice: 200,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    finishedAt: new Date(Date.now() - 169200000).toISOString(),
    location: 'Bertrange',
    distance: '8 km'
  },
  {
    id: 'job-old-3',
    clientId: 'client-57',
    category: 'Electrician',
    description: 'Kitchen Rewiring',
    photos: [],
    urgency: 'THIS_WEEK',
    suggestedPrice: 1200,
    finalPrice: 1250,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    finishedAt: new Date(Date.now() - 601200000).toISOString(),
    location: 'Esch-sur-Alzette',
    distance: '15 km'
  }
];

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    jobId: 'job-new',
    proId: 'pro-2',
    proName: 'Carlos M.',
    proAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    proLevel: 'Expert',
    proRating: 4.8,
    price: 180,
    message: 'I can be there in 30 mins. Includes parts.',
    distance: '1.2 km',
    createdAt: '2 mins ago',
  }
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', service: 'Full House Rewiring', price: 1200, rating: 5, comment: 'Exceptional work, very clean.', date: 'Yesterday' },
];
