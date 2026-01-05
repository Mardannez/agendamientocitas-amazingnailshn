const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type ApiService = {
  id: string;
  name: string;
  duration_min: number;
  price: string | number | null;
  is_active: boolean;
  description: string;
};

export async function getServices(): Promise<ApiService[]> {
  const res = await fetch(`${API_BASE_URL}/services`);
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(data?.error || data?.message || JSON.stringify(data) || "Error al cargar services");
  }

  return data;
}
