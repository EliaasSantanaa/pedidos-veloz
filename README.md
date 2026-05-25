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

A solução proposta moderniza toda a esteira de entrega de software, indo do ambiente local de desenvolvimento até a produção em nuvem, cobrindo conteinerização, orquestração, CI/CD e observabilidade.

---

## 🏗️ Arquitetura da Solução

```
Internet
    │
    ▼
[ API Gateway — porta 8080 ]  ← único ponto de entrada
    │
    ├──► [ orders-service   :3001 ]  → PostgreSQL (orders_db)
    │              │
    │              └──► publica evento "PedidoCriado" no RabbitMQ
    │
    ├──► [ payments-service :3002 ]  → API externa de pagamento
    │              │
    │              └──► consome evento "PedidoCriado" do RabbitMQ
    │
    └──► [ inventory-service:3003 ]  → PostgreSQL (inventory_db)
                   │
                   └──► consome evento "PedidoCriado" do RabbitMQ
```

### Por que essa arquitetura?

A separação em microsserviços permite que cada equipe trabalhe de forma independente no seu serviço, faça deploys isolados e escale apenas o que precisa escalar. O RabbitMQ desacopla os serviços de forma assíncrona — se o serviço de pagamentos ficar lento, os pedidos continuam sendo criados normalmente na fila, sem derrubar a experiência do usuário.

---

## 🛠️ Tecnologias Utilizadas

| Camada          | Tecnologia                 | Motivo da escolha                          |
| --------------- | -------------------------- | ------------------------------------------ |
| Containerização | Docker + multi-stage build | Imagens enxutas e seguras                  |
| Ambiente local  | Docker Compose             | Stack completa com um comando              |
| Orquestração    | Kubernetes (AKS)           | Escalabilidade e resiliência em produção   |
| Registry        | Azure Container Registry   | Integração nativa com AKS e GitHub Actions |
| CI/CD           | GitHub Actions             | Integração nativa com o repositório        |
| IaC             | Terraform                  | Infraestrutura reproduzível e versionada   |
| Mensageria      | RabbitMQ                   | Comunicação assíncrona entre serviços      |
| Banco de dados  | PostgreSQL 16              | Banco relacional robusto e open-source     |
| Métricas        | Prometheus + Grafana       | Stack de observabilidade consolidada       |
| Logs            | Loki + Grafana             | Centralização de logs estruturados         |
| Tracing         | OpenTelemetry + Jaeger     | Rastreamento distribuído entre serviços    |
| Cloud           | Microsoft Azure            | Disponível no GitHub Student Pack          |

---

## 📁 Estrutura do Repositório

```
pedidos-veloz/
│
├── services/                         # Código-fonte dos microsserviços
│   ├── api-gateway/                  # NGINX — roteamento HTTP
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   ├── orders-service/               # Serviço de pedidos (Node.js)
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── payments-service/             # Serviço de pagamentos (Node.js)
│   │   ├── Dockerfile
│   │   └── package.json
│   └── inventory-service/            # Serviço de estoque (Node.js)
│       ├── Dockerfile
│       └── package.json
│
├── infra/
│   ├── k8s/                          # Manifests Kubernetes
│   │   ├── 00-namespace.yaml         # Namespace com Pod Security Admission
│   │   ├── 01-configmaps.yaml        # Configurações não-sensíveis
│   │   ├── 02-secrets.template.yaml  # Template de Secrets (sem valores reais)
│   │   ├── 03-deployments.yaml       # Deployments com Rolling Update
│   │   ├── 04-services.yaml          # Services (ClusterIP + LoadBalancer)
│   │   ├── 05-hpa.yaml               # Horizontal Pod Autoscaler
│   │   └── 06-network-policies.yaml  # Políticas de rede
│   │
│   └── terraform/                    # Infraestrutura como Código
│       ├── main.tf                   # AKS + ACR + permissões
│       ├── variables.tf              # Variáveis parametrizadas
│       └── outputs.tf                # Outputs úteis pós-provisionamento
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Pipeline de Integração Contínua
│       └── cd.yml                    # Pipeline de Entrega Contínua
│
├── .env.example                      # Modelo de variáveis de ambiente
├── .gitignore                        # Arquivos ignorados pelo Git
├── docker-compose.yml                # Stack completa para desenvolvimento local
└── README.md                         # Este arquivo
```

---

## ⚡ Como Rodar Localmente

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Git](https://git-scm.com/downloads) instalado

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/SEU-USUARIO/pedidos-veloz.git
cd pedidos-veloz
```

**2. Configure as variáveis de ambiente**

```bash
copy .env.example .env
```

Abra o `.env` e defina uma senha para o banco:

```env
POSTGRES_PASSWORD=minhasenha123
```

**3. Suba toda a stack com um único comando**

```bash
docker compose up --build
```

Aguarde todos os serviços subirem. Você verá no terminal as mensagens de healthcheck do PostgreSQL e RabbitMQ sendo aprovadas antes dos serviços de aplicação iniciarem.

**4. Teste se está funcionando**

```bash
curl http://localhost:8080/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

**5. Acesse o painel do RabbitMQ** _(opcional)_

Abra no navegador: http://localhost:15672
Usuário: `guest` | Senha: `guest`

**6. Para derrubar o ambiente**

```bash
# Para os containers mas mantém os dados
docker compose down

# Para os containers e apaga os volumes
docker compose down -v
```

---

## 🔄 Pipeline CI/CD

O projeto possui dois pipelines automatizados no GitHub Actions.

### CI — Integração Contínua (`ci.yml`)

Disparado em todo Pull Request ou push na branch main.

```
Push / PR
    │
    ▼
Lint do código
    │
    ▼
Testes unitários (Jest)
    │
    ▼
Build das imagens Docker
    │
    ▼
Scan de vulnerabilidades (Trivy)
```

### CD — Entrega Contínua (`cd.yml`)

Disparado apenas em push na branch main, após o CI passar.

```
Push na main
    │
    ▼
Login na Azure via OIDC (sem senha estática)
    │
    ▼
Build + Push das imagens para o ACR
    │
    ▼
Deploy no AKS com Rolling Update
    │
    ▼
Verificação automática do rollout
```

> **Segurança:** A autenticação com a Azure usa OIDC (OpenID Connect), o que significa que nenhuma senha ou chave de API fica armazenada no repositório. O GitHub e a Azure trocam tokens temporários automaticamente a cada execução do pipeline.

---

## ☸️ Kubernetes em Produção

### Estratégia de Deploy: Rolling Update

Foi escolhida a estratégia **Rolling Update** pelo seguinte raciocínio:

- É nativa no Kubernetes, sem necessidade de ferramentas extras
- Garante **zero-downtime**: com `maxUnavailable: 0`, sempre há pelo menos uma réplica respondendo durante a atualização
- Em caso de falha nos health checks, o Kubernetes para o rollout automaticamente e mantém a versão anterior no ar

### Escalabilidade Automática (HPA)

O **Horizontal Pod Autoscaler** monitora o uso de CPU e memória dos pods e escala automaticamente o número de réplicas:

| Serviço           | Mínimo | Máximo  | Gatilho CPU |
| ----------------- | ------ | ------- | ----------- |
| orders-service    | 2 pods | 10 pods | 60%         |
| inventory-service | 2 pods | 8 pods  | 60%         |

Durante a campanha promocional, se o tráfego dobrar, o HPA provisiona novas réplicas em menos de 2 minutos, antes que a experiência do usuário seja degradada.

### Segurança

- **Pod Security Admission** no namespace com perfil `restricted`
- Todos os containers rodam com **usuário não-root**
- **Network Policies** bloqueiam todo tráfego por padrão — apenas o API Gateway aceita conexões externas
- **Secrets** nunca são versionados no repositório — em produção são populados via Azure Key Vault pelo pipeline
- Imagens com **sistema de arquivos somente leitura** em produção

---

## 🏗️ Infraestrutura como Código (Terraform)

O diretório `infra/terraform/` provisiona toda a infraestrutura na Azure de forma automatizada e reproduzível:

```bash
cd infra/terraform

# Inicializar (baixa os providers)
terraform init

# Visualizar o que será criado
terraform plan -var="environment=prod"

# Criar a infraestrutura
terraform apply -var="environment=prod"
```

O **state** do Terraform é armazenado remotamente em um Azure Blob Storage, garantindo que toda a equipe trabalhe com o mesmo estado da infraestrutura e evitando conflitos.

---

## 📊 Observabilidade

A solução implementa os três pilares de observabilidade.

### Métricas — Prometheus + Grafana

Todos os pods possuem anotações que habilitam o scraping automático do Prometheus. O Grafana exibe dashboards com taxa de requisições, latência e uso de recursos.

### Logs — Loki + Grafana

Os serviços emitem logs estruturados em JSON seguindo o princípio XI do 12-Factor App (logs como streams). O Loki centraliza e permite correlacionar logs com métricas no mesmo painel do Grafana.

### Tracing — OpenTelemetry + Jaeger

Cada serviço é instrumentado com o SDK do OpenTelemetry. O contexto de rastreamento é propagado via headers HTTP (`traceparent`), permitindo visualizar no Jaeger o caminho completo de uma requisição do API Gateway até o banco de dados.

Isso resolve diretamente o problema de **baixa rastreabilidade** que a Loja Veloz enfrentava: agora é possível identificar em segundos qual serviço causou uma falha e em qual ponto da requisição o erro ocorreu.

---

## 📚 Referências

- [Azure-Samples/aks-store-demo](https://github.com/Azure-Samples/aks-store-demo) — Arquitetura de referência oficial Microsoft
- [Kubernetes Documentation](https://kubernetes.io/docs) — Deployments, HPA, Network Policies, Security
- [Docker Documentation](https://docs.docker.com) — Dockerfile multi-stage, Docker Compose
- [The Twelve-Factor App](https://12factor.net) — Metodologia cloud-native
- [GitHub Actions Documentation](https://docs.github.com/actions) — Pipelines CI/CD
- [OpenTelemetry for Node.js](https://opentelemetry.io/docs/instrumentation/js) — Tracing distribuído
- [Terraform AKS Tutorial](https://developer.hashicorp.com/terraform/tutorials/kubernetes/aks) — IaC para Azure
- NEWMAN, S. **Building Microservices**. 2. ed. O'Reilly Media, 2019.
- MAJORS, C. **Observability Engineering**. O'Reilly Media, 2022.

---

## 🎥 Vídeo Pitch

📹 **Link:** _[adicionar após gravação]_

---

_Projeto desenvolvido para a disciplina Cloud DevOps: Orchestrating Containers and Micro Services — UniFECAF, 2026._
