import './style.css';
import Chart from 'chart.js/auto';
import { api } from './api.js';

const app = document.querySelector('#app');

let clients = [];
let editId = null;
let searchText = "";
let chartInstance = null;

async function fetchClients() {
  render();
  showLoader();
  try {
    const res = await api.get('/clients');
    clients = res.data;
  } catch (err) {
    showToast("Failed to fetch clients from server", "error");
    console.error(err);
  } finally {
    hideLoader();
    render();
  }
}

function render() {
  const total = clients.length;
  const newCount = clients.filter(c => c.status === "New").length;
  const contacted = clients.filter(c => c.status === "Contacted").length;
  const converted = clients.filter(c => c.status === "Converted").length;

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchText.toLowerCase()) ||
    client.email.toLowerCase().includes(searchText.toLowerCase())
  );

  app.innerHTML = `
    <div class="loader-overlay" id="loader">
      <div class="spinner"></div>
    </div>
    
    <div class="container">
      <header class="app-header">
        <div class="app-title">
          <h1>ClientFlow CRM</h1>
          <p>A sleek, modern dashboard for managing your clients.</p>
        </div>
        <button id="logoutBtn" class="btn btn-logout btn-small">
          <span>Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logout-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </header>

      <div class="metrics-grid">
        <div class="glass-panel metric-card">
          <span class="metric-label">Total</span>
          <span class="metric-value">${total}</span>
        </div>
        <div class="glass-panel metric-card">
          <span class="metric-label" style="color: #60a5fa">New</span>
          <span class="metric-value">${newCount}</span>
        </div>
        <div class="glass-panel metric-card">
          <span class="metric-label" style="color: #fbbf24">Contacted</span>
          <span class="metric-value">${contacted}</span>
        </div>
        <div class="glass-panel metric-card">
          <span class="metric-label" style="color: #34d399">Converted</span>
          <span class="metric-value">${converted}</span>
        </div>
      </div>

      <div class="controls-bar">
        <div class="search-box">
          <input id="search" value="${searchText}" placeholder="Search clients by name or email...">
        </div>
        <div style="display: flex; gap: 1rem;">
          <button id="chartToggleBtn" class="btn btn-secondary">Toggle Analytics</button>
          <button id="exportBtn" class="btn btn-primary">Export CSV</button>
        </div>
      </div>

      <div id="chartSection" class="glass-panel chart-container" style="display: none; margin-bottom: 2rem;">
        <canvas id="crmChart"></canvas>
      </div>

      <div class="content-grid">
        <div class="glass-panel">
          <h2 style="margin-bottom: 1.5rem">Client List <span style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">(${filteredClients.length} match)</span></h2>
          <div class="client-list">
            ${filteredClients.length === 0 ? '<div class="empty-state">No clients found.</div>' : 
              filteredClients.map(c => `
                <div class="client-item">
                  <div class="client-header">
                    <div>
                      <div class="client-name">${c.name}</div>
                      <div class="client-meta">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          ${c.email}
                        </span>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                          ${c.phone}
                        </span>
                        ${c.date ? `
                          <span style="font-size: 0.75rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${new Date(c.date).toLocaleDateString()}
                          </span>
                        ` : ''}
                      </div>
                    </div>
                    <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
                  </div>
                  ${c.notes ? `<p style="font-size: 0.875rem; margin-top: 0.5rem; background: var(--bg-input); padding: 0.5rem; border-radius: 0.25rem;">${c.notes}</p>` : ''}
                  <div class="client-actions">
                    <button class="btn btn-secondary btn-small" onclick="window.startEdit('${c._id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="window.deleteClient('${c._id}')">Delete</button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <div class="glass-panel" style="height: fit-content;">
          <h2 style="margin-bottom: 1.5rem">${editId ? 'Edit Client' : 'Add New Client'}</h2>
          <div class="form-group">
            <label>Name</label>
            <input id="name" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input id="email" type="email" placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input id="phone" placeholder="1234567890">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="status">
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea id="notes" placeholder="Meeting scheduled for next week..."></textarea>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button id="saveBtn" class="btn btn-primary" style="flex: 1;">
              ${editId ? 'Update Client' : 'Save Client'}
            </button>
            ${editId ? `<button id="cancelEditBtn" class="btn btn-secondary">Cancel</button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  document.getElementById('search').addEventListener('input', (e) => {
    searchText = e.target.value;
    render();
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    }
  });

  document.getElementById('saveBtn').addEventListener('click', saveClient);
  
  if (editId) {
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      editId = null;
      render();
    });
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    renderAuth(false);
  });

  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  const chartToggle = document.getElementById('chartToggleBtn');
  const chartSection = document.getElementById('chartSection');
  
  chartToggle.addEventListener('click', () => {
    if (chartSection.style.display === 'none') {
      chartSection.style.display = 'block';
      renderChart(newCount, contacted, converted);
    } else {
      chartSection.style.display = 'none';
    }
  });

  // If chart was already visible, re-render it
  if (chartInstance) {
    chartSection.style.display = 'block';
    renderChart(newCount, contacted, converted);
  }

  // Pre-fill form if editing
  if (editId) {
    const client = clients.find(c => c._id === editId);
    if (client) {
      document.getElementById('name').value = client.name;
      document.getElementById('email').value = client.email;
      document.getElementById('phone').value = client.phone;
      document.getElementById('status').value = client.status;
      document.getElementById('notes').value = client.notes || "";
    }
  }
}

function renderChart(newCount, contacted, converted) {
  const ctx = document.getElementById('crmChart');
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  Chart.defaults.color = '#94a3b8';
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['New', 'Contacted', 'Converted'],
      datasets: [{
        data: [newCount, contacted, converted],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          '#0f1624',
          '#0f1624',
          '#0f1624'
        ],
        borderWidth: 4,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
}

// Ensure toast container exists
if (!document.getElementById("toast-container")) {
  const tContainer = document.createElement('div');
  tContainer.id = 'toast-container';
  document.body.appendChild(tContainer);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('active');
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.remove('active');
}

async function saveClient() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const status = document.getElementById("status").value;

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  const phonePattern = /^[0-9]{10}$/;

  if (!name) return showToast("Please enter client name", "warning");
  if (!email.match(emailPattern)) return showToast("Valid email required", "warning");
  if (!phone.match(phonePattern)) return showToast("Phone must be 10 digits", "warning");

  const clientData = { name, email, phone, notes, status };

  showLoader();
  try {
    if (editId) {
      await api.put(`/clients/${editId}`, clientData);
      showToast("Client updated successfully", "success");
      editId = null;
    } else {
      await api.post('/clients', clientData);
      showToast("Client added successfully", "success");
    }
    await fetchClients();
  } catch (error) {
    console.error(error);
    showToast("Failed to save client", "error");
    hideLoader();
  }
}

window.startEdit = function(id) {
  editId = id;
  render();
}

window.deleteClient = async function(id) {
  if (!confirm("Are you sure you want to delete this client?")) return;
  
  showLoader();
  try {
    await api.delete(`/clients/${id}`);
    showToast("Client deleted", "success");
    if (editId === id) editId = null;
    await fetchClients();
  } catch (error) {
    console.error(error);
    showToast("Failed to delete client", "error");
    hideLoader();
  }
}

function exportCSV() {
  let csv = "Name,Email,Phone,Status,Notes\n";
  clients.forEach(c => {
    csv += `"${c.name}","${c.email}","${c.phone}","${c.status}","${c.notes || ''}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'clients_export.csv';
  a.click();
}

function renderAuth(isRegister = false) {
  app.innerHTML = `
    <div class="auth-split-container">
      <div class="auth-image-side"></div>
      <div class="auth-form-side">
        <div class="glass-panel">
          <h1 style="text-align: center; margin-bottom: 0.5rem; background: linear-gradient(135deg, #ec4899 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClientFlow CRM</h1>
          <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">${isRegister ? 'Create a new account' : 'Sign in to continue'}</p>
          
          <div class="form-group">
            <input id="username" placeholder="Username">
          </div>
          <div class="form-group">
            <input id="password" type="password" placeholder="Password">
          </div>
          
          <button id="authBtn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
            ${isRegister ? 'Register' : 'Login'}
          </button>
          
          <div class="auth-switch-text">
            ${isRegister ? 'Already have an account?' : "Don't have an account?"} 
            <span id="switchAuthBtn" class="auth-switch-link">${isRegister ? 'Login here' : 'Register here'}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('authBtn').addEventListener('click', async () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    
    if (!u || !p) {
      return showToast("Please fill all fields", "warning");
    }

    showLoader();
    try {
      if (isRegister) {
        await api.post('/auth/register', { username: u, password: p });
        showToast("Registration successful!", "success");
        hideLoader();
        setTimeout(() => renderAuth(false), 1000);
      } else {
        const res = await api.post('/auth/login', { username: u, password: p });
        showToast("Login successful!", "success");
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", res.data.username);
        hideLoader();
        fetchClients();
      }
    } catch (err) {
      hideLoader();
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      showToast(errorMsg, "error");
      console.error(err);
    }
  });

  document.getElementById('switchAuthBtn').addEventListener('click', () => {
    renderAuth(!isRegister);
  });
}

// Initial Boot
if (!localStorage.getItem("loggedIn")) {
  renderAuth(false);
} else {
  fetchClients();
}