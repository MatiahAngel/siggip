const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function getEspecialidades(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/especialidades${qs ? `?${qs}` : ''}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener especialidades');
  return res.json();
}

export async function createEspecialidad(data) {
  const res = await fetch(`${BASE_URL}/especialidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear especialidad');
  return res.json();
}

export async function updateEspecialidad(id, data) {
  const res = await fetch(`${BASE_URL}/especialidades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar especialidad');
  return res.json();
}

export async function deleteEspecialidad(id) {
  const res = await fetch(`${BASE_URL}/especialidades/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar especialidad');
  return res.json();
}
