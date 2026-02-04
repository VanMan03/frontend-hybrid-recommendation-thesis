import React, { createContext, useContext, useState } from 'react';
import { type MainCategory, type SubCategory } from '@/app/data/tourismCategories';

export type Destination = {
  id: number;
  name: string;
  description: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  image: string;
  status: string;
  entryFee: string;
  duration: string;
  accessibility: string;
};

export type User = {
  id: number;
  name: string;
  activityLevel: string;
  itineraryCount: number;
  joinDate: string;
  accountStatus: string;
};

export type Itinerary = {
  id: number;
  user: string;
  budgetRange: string;
  destinations: string;
  dateGenerated: string;
  status: string;
};

type AdminDataContextType = {
  destinations: Destination[];
  users: User[];
  itineraries: Itinerary[];
  addDestination: (d: Omit<Destination, 'id' | 'image' | 'status' | 'entryFee' | 'duration' | 'accessibility'>) => void;
  removeDestination: (id: number) => void;
  updateDestinationCategory: (id: number, mainCategory: MainCategory, subCategory: SubCategory) => void;
  addUser: (u: Omit<User, 'id'>) => void;
  removeUser: (id: number) => void;
  addItinerary: (it: Omit<Itinerary, 'id'>) => void;
  removeItinerary: (id: number) => void;
};

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  const addDestination = (d: Omit<Destination, 'id' | 'image' | 'status' | 'entryFee' | 'duration' | 'accessibility'>) => {
    const id = Date.now();
    const destination: Destination = {
      id,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      status: 'Active',
      entryFee: 'TBD',
      duration: 'TBD',
      accessibility: 'Moderate',
      ...d,
    } as Destination;
    setDestinations((s) => [...s, destination]);
  };

  const removeDestination = (id: number) => setDestinations((s) => s.filter((d) => d.id !== id));

  const updateDestinationCategory = (id: number, mainCategory: MainCategory, subCategory: SubCategory) => {
    setDestinations((s) => s.map((d) => (d.id === id ? { ...d, mainCategory, subCategory } : d)));
  };

  const addUser = (u: Omit<User, 'id'>) => {
    const id = Date.now();
    setUsers((s) => [...s, { id, ...u } as User]);
  };

  const removeUser = (id: number) => setUsers((s) => s.filter((u) => u.id !== id));

  const addItinerary = (it: Omit<Itinerary, 'id'>) => {
    const id = Date.now();
    setItineraries((s) => [...s, { id, ...it } as Itinerary]);
  };

  const removeItinerary = (id: number) => setItineraries((s) => s.filter((i) => i.id !== id));

  return (
    <AdminDataContext.Provider value={{
      destinations,
      users,
      itineraries,
      addDestination,
      removeDestination,
      updateDestinationCategory,
      addUser,
      removeUser,
      addItinerary,
      removeItinerary,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
};

export default AdminDataContext;
