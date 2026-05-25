const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const orders = [];

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "orders-service" });
});

app.get("/api/orders", (req, res) => {
  res.json({ orders });
});

app.post("/api/orders", (req, res) => {
  const order = {
    id: orders.length + 1,
    ...req.body,
    status: "created",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  console.log("Pedido criado:", order);
  res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`orders-service rodando na porta ${PORT}`);
});
