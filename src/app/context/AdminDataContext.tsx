import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest } from "../../services/api";
import { uploadDestinationImage } from "../../services/api";

/* =======================
   TYPES (MATCH BACKEND)
======================= */

export type Destination = {
  _id: string;
  name: string;
  description: string;
  estimatedCost: number;
  category: string; // display only
  features: string[] | Record<string, number>; // display only
  location?: {
    latitude: number;
    longitude: number;
    resolvedAddress?: string;
  };
  isActive: boolean;
  image?: {
    url: string;
    publicId: string;
  }[];
  images?: {
    url: string;
    publicId: string;
  }[];
};

export type CreateDestinationPayload = {
  name: string;
  description: string;
  category: string;
  features: string[];
  estimatedCost: number;
  latitude?: number;
  longitude?: number;
  location: {
    latitude: number;
    longitude: number;
    resolvedAddress?: string;
  };
};



type AdminDataContextType = {
  destinations: Destination[];
  users: any[];                 
  itineraries: any[];
  loading: boolean;
  error: string | null;
  createDestination: (data: CreateDestinationPayload) => Promise<Destination>;

  fetchDestinations: () => Promise<void>;
  updateDestination: (id: string, data: Partial<Destination>) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;

  fetchUsers: () => Promise<void>;
  fetchItineraries: () => Promise<void>;

  uploadImages: (id: string, files: File[]) => Promise<void>;

};

/* =======================
   CONTEXT
======================= */

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);

/* =======================
   PROVIDER
======================= */

export const AdminDataProvider: React.FC<
  React.PropsWithChildren<{}>
> = ({ children }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [itineraries, setItineraries] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- Fetch -------- */
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Destination[];
      try {
        // Prefer admin list when available (may include inactive records)
        data = await apiRequest("/admin/destinations");
      } catch {
        // Fallback for backends that only expose public list route
        data = await apiRequest("/destinations");
      }
      setDestinations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  /* -------- Create -------- */
  const createDestination = async (data: CreateDestinationPayload) => {
  try {
    setLoading(true);
    setError(null);

    const created = await apiRequest("/admin/destinations", {
      method: "POST",
      body: JSON.stringify(data),
    });

    await fetchDestinations();
    return created;
  } catch (err: any) {
    setError(err.message || "Failed to create destination");
    throw err;
  } finally {
    setLoading(false);
  }
};



  // Updates destination data
const updateDestination = async (
  id: string,
  updates: Partial<Destination>
) => {
  await apiRequest(`/admin/destinations/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  setDestinations((prev) =>
    prev.map((destination) =>
      destination._id === id ? { ...destination, ...updates } : destination
    )
  );
};

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchItineraries = async () => {
    try {
      const data = await apiRequest("/itineraries");
      setItineraries(data);
    } catch (err) {
      console.error("Failed to fetch itineraries", err);
    }
  };




  /* -------- Soft Delete -------- */
  const deleteDestination = async (id: string) => {
  await apiRequest(`/admin/destinations/${id}`, {
    method: "DELETE",
  });
  await fetchDestinations();
};

const uploadImages = async (destinationId: string, files: File[]) => {
  if (!files || files.length === 0) return;

  for (const file of files) {
    await uploadDestinationImage(destinationId, file);
  }

  await fetchDestinations();
};




  /* -------- Initial Load -------- */
  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        destinations,
        users,
        itineraries,
        loading,
        error,
        fetchDestinations,
        createDestination,
        updateDestination,
        deleteDestination,
        fetchUsers,
        fetchItineraries,
        uploadImages,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

/* =======================
   HOOK
======================= */

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error(
      "useAdminData must be used within an AdminDataProvider"
    );
  }
  return ctx;
};

export default AdminDataContext;
