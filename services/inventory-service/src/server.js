const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

const inventory = [
  { productId: "1", name: "Camiseta", quantity: 100 },
  { productId: "2", name: "Calça", quantity: 50 },
  { productId: "3", name: "Tênis", quantity: 30 },
];

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "inventory-service" });
});

app.get("/api/inventory", (req, res) => {
  res.json({ inventory });
});

app.post("/api/inventory/reserve", (req, res) => {
  const { productId, quantity } = req.body;
  const item = inventory.find((i) => i.productId === productId);
  if (!item) return res.status(404).json({ error: "Produto não encontrado" });
  if (item.quantity < quantity)
    return res.status(400).json({ error: "Estoque insuficiente" });
  item.quantity -= quantity;
  console.log(`Reserva: produto ${productId}, quantidade ${quantity}`);
  res.json({ success: true, remaining: item.quantity });
});

app.listen(PORT, () => {
  console.log(`inventory-service rodando na porta ${PORT}`);
});
