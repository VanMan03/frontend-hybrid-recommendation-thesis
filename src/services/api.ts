const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("adminToken"); 
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API error");
  }

  return res.json();
}

export const uploadDestinationImage = async (id: string, file: File) => {
  const token = localStorage.getItem("adminToken");

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `${API_URL}/admin/destinations/${id}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }
  );

  if (!res.ok) throw new Error("Image upload failed");

  return res.json();
};
