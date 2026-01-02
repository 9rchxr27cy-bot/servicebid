
export type Role = 'CLIENT' | 'PRO' | null;

export type Category = 
  | 'Cleaning' 
  | 'Electrician' 
  | 'Plumbing' 
  | 'Gardening' 
  | 'IT Support' 
  | 'Moving' 
  | 'Beauty' 
  | 'Pet Sitter'
  | 'Mechanic'
  | 'ElectricVehicle'
  | 'AutoBody'
  | 'Micromobility'
  | 'SolarEnergy';

export type LanguageCode = 'LB' | 'FR' | 'DE' | 'EN' | 'PT';

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  postalCode: string;
  locality: string;
  floor?: string;
  block?: string;
  residence?: string;
  hasElevator: boolean;
  easyParking: boolean;
  additionalInfo?: string;
}

export interface User {
  id: string;
  name: string;
  surname?: string;
  avatar: string;
  role: Role;
  email: string;
  phone?: string;
  languages: LanguageCode[];
  addresses: Address[];
  isVerified?: boolean;
  level?: 'Novice' | 'Professional' | 'Expert' | 'Master';
  xp?: number;
  rating?: number;
  reviewsCount?: number;
  joinedDate?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
}

export interface Review {
  id: string;
  service: string;
  price: number;
  rating: number;
  comment: string;
  date: string;
}

export type JobStatus = 
  | 'OPEN' 
  | 'NEGOTIATING' 
  | 'CONFIRMED'   // Pro aceito
  | 'EN_ROUTE'    // A caminho
  | 'ARRIVED'     // Chegou no local
  | 'IN_PROGRESS' // Trabalho iniciado
  | 'COMPLETED'   // Finalizado
  | 'CANCELLED';

export interface JobRequest {
  id: string;
  clientId: string;
  category: Category;
  title?: string;
  description: string;
  photos: string[];
  location: string;
  urgency: 'URGENT' | 'THIS_WEEK' | 'PLANNING' | 'SPECIFIC_DATE';
  scheduledDate?: string; // Format YYYY-MM-DD
  suggestedPrice?: number;
  finalPrice?: number; // Preço acordado final
  status: JobStatus;
  createdAt: string;
  startedAt?: string; // ISO String
  finishedAt?: string; // ISO String
  proposalsCount?: number;
  distance?: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  proId: string;
  proName: string;
  proAvatar: string;
  proLevel: string;
  proRating: number;
  price: number;
  message: string;
  estimatedTime?: string;
  createdAt: string;
  distance?: string;
  status?: JobStatus; // Added to pass initial state to Chat
}

export interface OfferDetails {
  oldPrice: number;
  newPrice: number;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string; // Optional now, used for text messages
  timestamp: string;
  isSystem?: boolean;
  type: 'text' | 'image' | 'offer_update' | 'receipt'; 
  offerDetails?: OfferDetails; 
  receiptDetails?: {
    startTime: string;
    endTime: string;
    duration: string;
    totalAmount: number;
  };
}
