import './style.css'

const app = document.querySelector('#app');

let clients = JSON.parse(localStorage.getItem("clients")) || [];

let editIndex = -1;

function render() {

  const total = clients.length;

  const newCount = clients.filter(
    c => c.status === "New"
  ).length;
  const contacted = clients.filter(
    c => c.status === "Contacted"
  ).length;

  const converted = clients.filter(
    c => c.status === "Converted"
  ).length;

  app.innerHTML = `
    <div class="container">

      <h1 class="title">ClientFlow CRM 🚀</h1>

      <!-- STATS -->
      <div class="stats">

        <div class="card">
          Total
          <br>
          <b>${total}</b>
        </div>

        <div class="card">
          New
          <br>
          <b>${newCount}</b>
        </div>

        <div class="card">
          Contacted
          <br>
          <b>${contacted}</b>
        </div>
        <div class="card">
          Converted
          <br>
          <b>${converted}</b>
        </div>

      </div>

      <!-- FORM -->
      <div class="form">

        <input id="name" placeholder="Client Name">

        <input id="email" placeholder="Email">

        <input id="phone" placeholder="Phone Number">

        <select id="status">
          <option>New</option>
          <option>Contacted</option>
          <option>Converted</option>
        </select>

        <button id="addBtn">
          ${editIndex === -1 ? "Add Client" : "Update Client"}
        </button>

      </div>

      <!-- CLIENT LIST -->
      <div class="list">

        ${clients.length === 0
      ?
      `
            <p class="empty">
              No Clients Available
            </p>
          `
      :
      clients.map((c, i) => `
            <div class="item">

              <div>

                <h3>${c.name}</h3>

                <p>
                  ${c.email}
                </p>

                <p>
                  ${c.phone}
                </p>

                <p class="date">
                  ${c.date}
                </p>

                <span class="tag ${c.status.toLowerCase()}">
                  ${c.status}
                </span>

              </div>

              <div class="actions">

                <button 
                  class="edit"
                  onclick="editClient(${i})"
                >
                  Edit
                </button>

                <button 
                  class="delete"
                  onclick="deleteClient(${i})"
                >
                  Delete
                </button>

              </div>

            </div>
          `).join('')
    }

      </div>

    </div>
  `;

  document.getElementById("addBtn").onclick = addClient;
}

function addClient() {

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const status = document.getElementById("status").value;

  // VALIDATION

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  const phonePattern = /^[0-9]{10}$/;

  if (name.trim() === "") {
    alert("Please enter client name");
    return;
  }

  if (!email.match(emailPattern)) {
    alert("Please enter a valid email");
    return;
  }

  if (!phone.match(phonePattern)) {
    alert("Phone number must contain exactly 10 digits");
    return;
  }

  const client = {
    name,
    email,
    phone,
    status,
    date: new Date().toLocaleString()
  };

  if (editIndex === -1) {
    clients.push(client);
  }
  else {
    clients[editIndex] = client;
    editIndex = -1;
  }

  localStorage.setItem(
    "clients",
    JSON.stringify(clients)
  );

  render();
}

window.deleteClient = function (i) {

  const confirmDelete = confirm(
    "Are you sure you want to delete this client?"
  );

  if (confirmDelete) {

    clients.splice(i, 1);

    localStorage.setItem(
      "clients",
      JSON.stringify(clients)
    );

    render();
  }
}

window.editClient = function (i) {

  const client = clients[i];

  document.getElementById("name").value = client.name;

  document.getElementById("email").value = client.email;

  document.getElementById("phone").value = client.phone;

  document.getElementById("status").value = client.status;

  editIndex = i;

  render();
}

render();