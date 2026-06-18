const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Client API centralisé pour communiquer avec le backend.
 */

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.error || 'Une erreur est survenue.',
        details: data.details || null,
      };
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    console.error('Erreur réseau:', error);
    throw {
      status: 0,
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
    };
  }
}

// ─── Équipement ─────────────────────────────────────────────

export async function getEquipment() {
  return request('/equipment');
}

// ─── Commandes ──────────────────────────────────────────────

export async function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function validateOrderToken(orderId, token) {
  return request(`/orders/${orderId}/validate?token=${token}`);
}

export async function approveOrder(orderId, token) {
  return request(`/orders/${orderId}/approve?token=${token}`, { method: 'PUT' });
}

export async function rejectOrder(orderId, token) {
  return request(`/orders/${orderId}/reject?token=${token}`, { method: 'PUT' });
}

export async function cancelApproval(orderId, token) {
  return request(`/orders/${orderId}/cancel?token=${token}`, { method: 'PUT' });
}

export async function confirmPickup(orderId, token) {
  return request(`/orders/${orderId}/pickup?token=${token}`, { method: 'PUT' });
}

export async function confirmReturn(orderId, token) {
  return request(`/orders/${orderId}/return?token=${token}`, { method: 'PUT' });
}

export async function markOverdue(orderId, token) {
  return request(`/orders/${orderId}/overdue?token=${token}`, { method: 'PUT' });
}

export async function getAuditLog(orderId, token) {
  return request(`/orders/${orderId}/audit?token=${token}`);
}
