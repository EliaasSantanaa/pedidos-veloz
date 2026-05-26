# 🚀 Pedidos Veloz — Plataforma de Microsserviços com DevOps Completo

> **Disciplina:** Cloud DevOps: Orchestrating Containers and Micro Services  
> **Professor:** Fernando Leonid  
> **Aluno:** Elias Santana | **RA:** 97351  
> **Instituição:** UniFECAF

---

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como resposta ao desafio proposto na disciplina de Cloud DevOps. O cenário simula uma empresa de varejo digital chamada **Loja Veloz** que cresceu rapidamente e passou a enfrentar três problemas críticos em produção:

- Indisponibilidade durante deploys
- Dificuldade de escalar em picos de acesso
- Baixa rastreabilidade de falhas entre serviços

A solução moderniza toda a esteira de entrega de software: do ambiente local de desenvolvimento até a produção em nuvem, cobrindo conteinerização, orquestração com Kubernetes, CI/CD automatizado e observabilidade completa.

---

## 🏗️ Arquitetura da Solução

```
Internet
    │
    ▼
[ API Gateway — porta 8080 ]  ← único ponto de entrada (NGINX)
    │
    ├──► [ orders-service   :3001 ]  → armazena pedidos em memória
    │
    ├──► [ payments-service :3002 ]  → processa pagamentos
    │
    └──► [ inventory-service:3003 ]  → controla estoque

Infraestrutura de suporte:
    ├── PostgreSQL  :5432  → banco de dados relacional
    └── RabbitMQ    :5672  → mensageria entre serviços
                   :15672  → painel de gerenciamento (web)
```

### Por que essa arquitetura?

Cada serviço é independente e pode ser atualizado, escalado ou substituído sem afetar os demais. O RabbitMQ desacopla a comunicação entre eles de forma assíncrona — se o serviço de pagamentos ficar lento, os pedidos continuam sendo aceitos normalmente. O API Gateway é o único ponto de entrada, centralizando roteamento e segurança.

---

## 🛠️ Tecnologias Utilizadas

| Camada          | Tecnologia               | Motivo da escolha                          |
| --------------- | ------------------------ | ------------------------------------------ |
| Containerização | Docker                   | Empacotamento padronizado dos serviços     |
| Ambiente local  | Docker Compose           | Stack completa com um único comando        |
| Orquestração    | Kubernetes (AKS)         | Escalabilidade e resiliência em produção   |
| Registry        | Azure Container Registry | Integração nativa com AKS e GitHub Actions |
| CI/CD           | GitHub Actions           | Automação integrada ao repositório         |
| IaC             | Terraform                | Infraestrutura reproduzível e versionada   |
| API Gateway     | NGINX                    | Roteamento leve e eficiente                |
| Serviços        | Node.js + Express        | Simples, rápido e amplamente adotado       |
| Mensageria      | RabbitMQ                 | Comunicação assíncrona entre serviços      |
| Banco de dados  | PostgreSQL 16            | Banco relacional robusto e open-source     |
| Métricas        | Prometheus + Grafana     | Observabilidade de métricas                |
| Logs            | Loki + Grafana           | Centralização de logs                      |
| Tracing         | OpenTelemetry + Jaeger   | Rastreamento distribuído                   |
| Cloud           | Microsoft Azure          | Disponível no GitHub Student Pack          |

---

## 📁 Estrutura do Repositório

```
pedidos-veloz/
│
├── services/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   ├── orders-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       └── server.js
│   ├── payments-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       └── server.js
│   └── inventory-service/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           └── server.js
│
├── infra/
│   ├── k8s/
│   │   ├── 00-namespace.yaml
│   │   ├── 01-configmaps.yaml
│   │   ├── 02-secrets.template.yaml
│   │   ├── 03-deployments.yaml
│   │   ├── 04-services.yaml
│   │   ├── 05-hpa.yaml
│   │   └── 06-network-policies.yaml
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## ⚡ Como Rodar Localmente

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **em execução**
- [Git](https://git-scm.com/downloads) instalado

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/SEU-USUARIO/pedidos-veloz.git
cd pedidos-veloz
```

**2. Suba toda a stack com um único comando**

```bash
docker compose up --build
```

Aguarde até ver estas mensagens no terminal, que confirmam que tudo está no ar:

```
orders-service-1    | orders-service rodando na porta 3001
payments-service-1  | payments-service rodando na porta 3002
inventory-service-1 | inventory-service rodando na porta 3003
postgres-1          | database system is ready to accept connections
rabbitmq-1          | Server startup complete; 5 plugins started.
```

**3. Teste os endpoints**

Health check geral:

```bash
curl http://localhost:8080/health
```

Resposta esperada: `{"status":"ok"}`

Listar pedidos:

```bash
curl http://localhost:8080/api/orders
```

Criar um pedido:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"productId\": \"1\", \"quantity\": 2, \"customerId\": \"cliente-123\"}"
```

Listar estoque:

```bash
curl http://localhost:8080/api/inventory
```

Reservar itens do estoque:

```bash
curl -X POST http://localhost:8080/api/inventory/reserve \
  -H "Content-Type: application/json" \
  -d "{\"productId\": \"1\", \"quantity\": 5}"
```

Processar pagamento:

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"1\", \"amount\": 99.90}"
```

**4. Painel do RabbitMQ**

Acesse no navegador: [http://localhost:15672](http://localhost:15672)

| Campo   | Valor   |
| ------- | ------- |
| Usuário | `guest` |
| Senha   | `guest` |

**5. Verificar containers rodando**

```bash
docker compose ps
```

**6. Ver logs de um serviço específico**

```bash
docker compose logs orders-service
docker compose logs payments-service
docker compose logs inventory-service
```

**7. Derrubar o ambiente**

```bash
# Para os containers mantendo os dados
docker compose down

# Para os containers e apaga os volumes (dados zerados)
docker compose down -v
```

---

## 🔄 Pipeline CI/CD

O projeto possui dois pipelines automatizados no GitHub Actions.

### CI — Integração Contínua (`ci.yml`)

Disparado em todo **Pull Request** ou **push na branch main**.

```
Código enviado
      │
      ▼
  Lint do código
      │
      ▼
  Testes unitários
      │
      ▼
  Build das imagens Docker
      │
      ▼
  Scan de vulnerabilidades (Trivy)
```

### CD — Entrega Contínua (`cd.yml`)

Disparado apenas em **push na branch main**, após o CI passar com sucesso.

```
Push aprovado na main
        │
        ▼
  Login Azure via OIDC
  (sem senha estática)
        │
        ▼
  Build + Push das imagens
  para o Azure Container Registry
        │
        ▼
  Deploy no AKS
  com Rolling Update
        │
        ▼
  Verificação automática
  do rollout
```

> **Segurança:** A autenticação usa OIDC (OpenID Connect). Nenhuma senha ou chave de API fica armazenada no repositório — o GitHub e a Azure trocam tokens temporários automaticamente a cada execução.

---

## ☸️ Kubernetes em Produção

### Estratégia de Deploy: Rolling Update

- **Zero-downtime garantido:** com `maxUnavailable: 0`, sempre há pelo menos uma réplica respondendo durante a atualização
- **Rollback automático:** se os health checks falharem, o Kubernetes interrompe o deploy e mantém a versão anterior no ar
- **Nativo no Kubernetes:** sem necessidade de ferramentas extras

### Escalabilidade Automática — HPA

| Serviço           | Réplicas mínimas | Réplicas máximas | Gatilho (CPU) |
| ----------------- | ---------------- | ---------------- | ------------- |
| orders-service    | 2                | 10               | 60%           |
| inventory-service | 2                | 8                | 60%           |

Durante picos de tráfego (como campanhas promocionais), o HPA provisiona novas réplicas automaticamente antes que a experiência do usuário seja degradada.

### Segurança no Cluster

- **Pod Security Admission** com perfil `restricted` — impede containers privilegiados
- Todos os containers rodam com **usuário não-root**
- **Network Policies** bloqueiam todo tráfego por padrão — apenas o API Gateway aceita conexões externas
- **Secrets** nunca versionados no repositório — populados pelo pipeline via Azure Key Vault

---

## 🏗️ Infraestrutura como Código (Terraform)

O diretório `infra/terraform/` provisiona toda a infraestrutura na Azure:

```bash
cd infra/terraform

# Inicializar o Terraform
terraform init

# Ver o que será criado
terraform plan -var="environment=prod"

# Criar a infraestrutura
terraform apply -var="environment=prod"
```

O **state** é armazenado remotamente em Azure Blob Storage, garantindo consistência entre toda a equipe.

---

## 📊 Observabilidade

### Métricas — Prometheus + Grafana

Todos os pods expõem métricas via anotações automáticas. O Grafana exibe dashboards com taxa de requisições, latência e uso de recursos em tempo real.

### Logs — Loki + Grafana

Os serviços emitem logs estruturados. O Loki centraliza e permite correlacionar logs com métricas no mesmo painel.

### Tracing — OpenTelemetry + Jaeger

O contexto de rastreamento é propagado via headers HTTP entre todos os serviços, permitindo visualizar no Jaeger o caminho completo de uma requisição — do API Gateway até o banco de dados. Isso resolve diretamente o problema de **baixa rastreabilidade** da Loja Veloz.

---

## 📚 Referências

- [Azure-Samples/aks-store-demo](https://github.com/Azure-Samples/aks-store-demo) — Arquitetura de referência oficial Microsoft
- [Kubernetes Documentation](https://kubernetes.io/docs)
- [Docker Documentation](https://docs.docker.com)
- [The Twelve-Factor App](https://12factor.net)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [OpenTelemetry for Node.js](https://opentelemetry.io/docs/instrumentation/js)
- [Terraform AKS Tutorial](https://developer.hashicorp.com/terraform/tutorials/kubernetes/aks)
- NEWMAN, S. **Building Microservices**. 2. ed. O'Reilly Media, 2019.
- MAJORS, C. **Observability Engineering**. O'Reilly Media, 2022.

---

## 🎥 Vídeo Pitch

📹 **Link:** _[https://youtu.be/gqCjyS07zkE]_

---

_Projeto desenvolvido para a disciplina Cloud DevOps: Orchestrating Containers and Micro Services — UniFECAF, 2026._
