const apiUrl = 'http://localhost:5000/orders';

// Lista de estatus sincronizada con el backend
const statuses = [
  "Pedido realizado",
  "Preparando por SHEIN",
  "En tránsito a USA",
  "Llegó a USA",
  "En tránsito a Honduras",
  "Llegó a Honduras",
  "Preparando por Me lo Merezco",
  "Entregado"
];

// Función para cargar la lista de pedidos en la tabla de la interfaz de administrador
async function loadOrders() {
  console.log('Cargando pedidos...');
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Error al cargar los pedidos');
    }

    const orders = await response.json();
    console.log('Pedidos cargados:', orders);

    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de poblarla

    orders.forEach(order => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = order.id;
      row.appendChild(idCell);

      const statusCell = document.createElement('td');
      statusCell.textContent = order.status;
      row.appendChild(statusCell);

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para rastrear un pedido desde la interfaz de usuario
async function trackOrder() {
  const orderId = document.getElementById('order-id-input').value.trim();
  try {
    const response = await fetch(`${apiUrl}/${orderId}`);
    if (response.ok) {
      const order = await response.json();
      displayProgress(order.statusIndex);
    } else {
      document.getElementById('order-status-display').innerHTML = '<p>Pedido no encontrado.</p>';
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para actualizar el estatus de un pedido desde la interfaz de administrador
async function updateOrder() {
  const orderId = document.getElementById('admin-order-id-input').value.trim();
  const statusIndex = parseInt(document.getElementById('status-select').value);

  try {
    const response = await fetch(`${apiUrl}/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statusIndex }),
    });

    if (response.ok) {
      const updatedOrder = await response.json();
      alert(`Estado del pedido ${updatedOrder.id} actualizado a "${statuses[updatedOrder.statusIndex]}"`);
      loadOrders(); // Actualiza la tabla después de actualizar un pedido
    } else {
      alert('Error al actualizar el pedido.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para mostrar el progreso del pedido
function displayProgress(currentStatusIndex) {
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';

  statuses.forEach((status, index) => {
    const progressStep = document.createElement('div');
    progressStep.className = 'progress-step';
    if (index < currentStatusIndex) {
      progressStep.classList.add('completed');
    }
    if (index === currentStatusIndex) {
      progressStep.classList.add('active');
    }

    const stepLabel = document.createElement('div');
    stepLabel.textContent = status;
    progressStep.appendChild(stepLabel);
    progressContainer.appendChild(progressStep);
  });

  const orderStatusDisplay = document.getElementById('order-status-display');
  orderStatusDisplay.innerHTML = '';
  orderStatusDisplay.appendChild(progressContainer);
}

// --- Acceso a la Interfaz de Administrador ---
const adminPassword = "admin123";

// Evento para detectar una combinación de teclas específica (Ctrl + Alt + A)
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.altKey && event.key === 'a') {
    accessAdminInterface();
  }
});

// Función para acceder a la interfaz de administrador
function accessAdminInterface() {
  const password = prompt("Ingresa la contraseña de administrador:");
  if (password === adminPassword) {
    document.getElementById('admin-interface').style.display = 'block';
    alert('Has accedido al panel de administración.');
  } else {
    alert('Contraseña incorrecta.');
  }
}

// Evento para rastrear el pedido (Usuario)
document.getElementById('track-order-btn').addEventListener('click', trackOrder);

// Evento para actualizar el pedido (Administrador)
document.getElementById('update-status-btn').addEventListener('click', updateOrder);

// Llama a la función para poblar el select de estatus en la interfaz de administrador
function populateStatusSelect() {
  const statusSelect = document.getElementById('status-select');
  statuses.forEach((status, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = status;
    statusSelect.appendChild(option);
  });
}

populateStatusSelect();

// Cargar los pedidos inicialmente
loadOrders();
