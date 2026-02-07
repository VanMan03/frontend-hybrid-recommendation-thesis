import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest } from "../../services/api";

/* =======================
   TYPES (MATCH BACKEND)
======================= */

export type Destination = {
  _id: string;
  name: string;
  description: string;
  category: string;
  estimatedCost: number;
  features: Record<string, number>;
  isActive: boolean;
};

type AdminDataContextType = {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  fetchDestinations: () => Promise<void>;
  createDestination: (data: Partial<Destination>) => Promise<void>;
  updateDestination: (id: string, data: Partial<Destination>) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- Fetch -------- */
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest("/destinations");
      setDestinations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  /* -------- Create -------- */
  const createDestination = async (data: Partial<Destination>) => {
    try {
      setLoading(true);
      setError(null);

      await apiRequest("/admin/destinations", {
        method: "POST",
        body: JSON.stringify(data),
      });

      await fetchDestinations();
    } catch (err: any) {
      setError(err.message || "Failed to create destination");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -------- Update -------- */
  const updateDestination = async (
    id: string,
    data: Partial<Destination>
  ) => {
    try {
      setLoading(true);
      setError(null);

      await apiRequest(`/admin/destinations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      await fetchDestinations();
    } catch (err: any) {
      setError(err.message || "Failed to update destination");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -------- Soft Delete -------- */
  const deleteDestination = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiRequest(`/admin/destinations/${id}`, {
        method: "DELETE",
      });

      await fetchDestinations();
    } catch (err: any) {
      setError(err.message || "Failed to deactivate destination");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -------- Initial Load -------- */
  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        destinations,
        loading,
        error,
        fetchDestinations,
        createDestination,
        updateDestination,
        deleteDestination,
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
