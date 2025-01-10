const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Lista de estatus
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

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://davidbcooking:Estefany26@cluster0.eco5u.mongodb.net/ordersDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((error) => console.error('Error de conexión a MongoDB:', error));

// Definir el esquema y modelo de pedidos
const orderSchema = new mongoose.Schema({
  id: String,
  statusIndex: Number,
  status: String,
});

const Order = mongoose.model('Order', orderSchema);

// Rutas de la API

// Obtener todos los pedidos
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo pedido
app.post('/orders', async (req, res) => {
  const { id, statusIndex } = req.body;
  try {
    const status = statuses[statusIndex];
    const newOrder = new Order({ id, statusIndex, status });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar el estatus de un pedido
app.put('/orders/:id', async (req, res) => {
  console.log('Datos recibidos del frontend:', req.body);

  const { statusIndex } = req.body;
  try {
    const status = statuses[statusIndex];
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { statusIndex, status },
      { new: true }
    );
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Pedido no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir los archivos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
