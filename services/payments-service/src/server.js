const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "payments-service" });
});

app.post("/api/payments", (req, res) => {
  const payment = {
    id: Math.floor(Math.random() * 10000),
    ...req.body,
    status: "approved",
    processedAt: new Date().toISOString(),
  };
  console.log("Pagamento processado:", payment);
  res.status(201).json(payment);
});

app.listen(PORT, () => {
  console.log(`payments-service rodando na porta ${PORT}`);
});
