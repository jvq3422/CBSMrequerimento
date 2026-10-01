# 🏗️ CBSM Requerimentos — Sistema de Canteiro de Obras & Engenharia
### Construtora BSM (CBSM) • Salvador / Bahia
**Repositório Oficial**: [https://github.com/jvq3422/CBSMrequerimento](https://github.com/jvq3422/CBSMrequerimento)

Sistema full-stack desenvolvido sob medida para a gestão e requisição de suprimentos, maquinário, equipes e ferramentas para frentes de obra da **Construtora BSM** ([construtorabsm.com.br](https://construtorabsm.com.br)).

---

## 📱 Destaques do Projeto & Adaptação para o Campo de Obra

1. **Design Primariamente Preto e Branco (Alto Contraste para Sol Forte)**:
   - **Legibilidade Sob Sol Intenso**: Desenvolvido com foco total em usabilidade ao ar livre em canteiros de obra sob forte radiação solar.
   - **Contraste Puro**: Fundo neutro claro (`#FFFFFF` / `#F5F5F5`), tipografia em preto sólido (`#000000`), bordas de alta visibilidade e botões de grande impacto visual.
   - Atende com folga as diretrizes de acessibilidade visual WCAG AAA (proporção de contraste superior a 15:1).
   - Topo da aplicação e cabeçalhos em preto puro com logotipo oficial em alta resolução.

2. **Mobile-First para Celulares Android de Qualquer Tamanho**:
   - Testado e otimizado para celulares populares (telas de 360px a 430px) e tablets de engenharia.
   - **Sem Quebra de Bordas**: Carrosséis horizontais de navegação por toque (*swipeable pill carousels*).
   - **Áreas de toque ampliadas (48px a 56px)** para operação ágil mesmo com mãos sujas ou uso de luvas de proteção.
   - **Ditado por Voz / Observação em Áudio**: Microfone integrado com reconhecimento de fala em português (Web Speech API) e chips rápidos (*"Faltou material"*, *"Máquina quebrou"*, *"Urgente p/ amanhã"*).
   - **Feedback Sonoro Mobile**: Sinais auditivos sutis no celular confirmando toques, adições ao carrinho e envio.

---

## 👥 Perfis de Acesso e Permissões

### 1. 👷 Chefe de Obra / Canteiro (Mestre de Obras)
- **Local de Uso**: Smartphone no canteiro.
- **Permissões**:
  - Selecionar a frente de serviço ativa no canteiro.
  - Solicitar itens organizados por categorias:
    - 📦 **Materiais**: Cimento CP-II, areia lavada, brita, ferro CA-50, blocos, tubos PVC, etc.
    - 🚜 **Maquinário**: Retroescavadeiras, rolos compactadores, caminhões caçamba, betoneiras, caminhão pipa, etc.
    - 👷 **Homens (Mão de Obra)**: Pedreiros, serventes, armadores, carpinteiros, eletricistas, etc.
    - 🔧 **Ferramentas**: Marteletes, compactadores "sapo", vibradores de concreto, níveis laser, etc.
  - Definir urgência: 🟢 **Normal**, 🟡 **Urgente (24h)** ou 🔴 **Crítico (Paralisação)**.
  - Acompanhar status em tempo real com histórico detalhado e parecer do engenheiro.
  - Opção de **Repetir Pedido** com 1 toque.

### 2. 🏗️ Engenheiro Fiscal / Coordenador (Login Mestre)
- **Local de Uso**: Computador, tablet ou smartphone.
- **Permissões Mestre**:
  - **Dashboard de Gestão**: Métricas de pendências, urgência crítica e volume de pedidos por obra.
  - **Análise Técnica**:
    - Ajustar quantidade aprovada item a item em relação ao estoque central.
    - **Aprovar Integralmente**, **Aprovar c/ Ajustes** ou **Desaprovar** com parecer técnico obrigatório.
    - Designar almoxarifado de expedição (*Base Lauro de Freitas*, *Central Salvador*, etc.) e data de despacho.
  - **Guia de Despacho & Romaneio Oficial CBSM**:
    - Gera documento formatado para impressão ou exportação em PDF, com número de protocolo, identificação do engenheiro (CREA), motorista e campos de assinatura física.
  - **Gestão do Banco de Dados / Catálogo**:
    - Cadastrar novos materiais, máquinas, mão de obra e ferramentas.
  - **Gestão de Canteiros**:
    - Cadastrar novas obras e frentes de serviço.
  - **Gestão de Equipe**:
    - Cadastrar e gerenciar contas de chefes de obra e engenheiros fiscais.

---

## ⚡ 2 Modos de Execução Disponíveis

O sistema suporta execução independente em duas portas:

| Modo | Porta | Descrição |
|---|---|---|
| **Demonstração** | `4000` | Pré-carregado com 31 itens no catálogo, 4 obras de Salvador, histórico de pedidos e botões de login rápido em 1 toque (Mestre Raimundo, Eng. Roberto). |
| **Produção Limpo** | `5000` | **Zero mock data**, zero produtos pré-definidos e zero logins hardcoded. Permite cadastrar a primeira conta mestre do engenheiro, cadastrar recursos reais e gerenciar canteiros do zero. |

---

## 🚀 Como Executar o Sistema

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior).
- Git (opcional, para clonar).

### Passo 1: Baixar ou Clonar
```bash
git clone https://github.com/jvq3422/CBSMrequerimento.git
cd CBSMrequerimento
```
*(Ou baixe o arquivo ZIP diretamente pelo botão Code -> Download ZIP no GitHub e descompacte).*

### Passo 2: Instalar Dependências
```bash
npm install
```

### Passo 3: Executar (Escolha a sua forma preferida)

#### 🔹 No Windows (1 Clique):
Basta dar um duplo clique em um dos arquivos executáveis na raiz da pasta:
- `iniciar.bat` -> Menu interativo para escolher Demonstração ou Produção.
- `iniciar-demo.bat` -> Abre direto o modo Demonstração na porta `4000`.
- `iniciar-producao.bat` -> Abre direto o modo Produção Limpo na porta `5000`.

#### 🔹 Pelo Terminal (NPM):
- **Para rodar a versão Demonstração (Porta 4000)**:
  ```bash
  npm start
  ```
  Acesse no navegador: **[http://localhost:4000](http://localhost:4000)**

- **Para rodar a versão Limpa de Produção (Porta 5000)**:
  ```bash
  npm run start:clean
  ```
  Acesse no navegador: **[http://localhost:5000](http://localhost:5000)**

- **Para rodar em modo Desenvolvimento com Hot-Reload**:
  ```bash
  # Terminal 1 (Servidor API):
  npm run server

  # Terminal 2 (Vite React):
  npm run client
  ```
  Acesse no navegador: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Credenciais Pré-configuradas (Modo Demonstração)

| Perfil | Nome | E-mail | Senha |
|---|---|---|---|
| **Engenheiro Mestre** | Eng. Roberto Almeida | `engenheiro@cbsm.com.br` | `123` |
| **Chefe de Obra** | Mestre Raimundo Nonato | `raimundo@cbsm.com.br` | `123` |
| **Chefe de Obra** | Mestre Valdir Santos | `valdir@cbsm.com.br` | `123` |

*(No Modo Produção Limpo na porta 5000, nenhum desses usuários existe: o sistema abre diretamente o assistente para criar a sua própria conta do Engenheiro Mestre).*

---

## 🗄️ Estrutura do Projeto

```
CBSMrequerimento/
├── client/                      # Frontend React 19 + Tailwind v4 + Vite + Lucide
│   ├── dist/                    # Build de produção pré-compilado (pronto para rodar)
│   ├── public/
│   │   └── logo.png             # Logotipo oficial da Construtora BSM
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Cabeçalho preto sólido, seleção de canteiro e perfil
│   │   │   ├── LoginView.jsx    # Tela de login / Assistente de configuração inicial
│   │   │   ├── ChefeView.jsx    # Painel móvel do Chefe de Canteiro
│   │   │   ├── EngenheiroView.jsx # Painel Mestre (Análise, Catálogo, Obras e Equipe)
│   │   │   ├── AudioNoteInput.jsx # Gravação por voz e justificativas rápidas
│   │   │   ├── DispatchPrintModal.jsx # Romaneio / Guia de Despacho para impressão
│   │   │   └── Toast.jsx        # Notificações com feedback sonoro
│   │   ├── utils/
│   │   │   ├── api.js           # Cliente da API REST
│   │   │   └── sound.js         # Síntese de áudio Web Audio API para celular
│   │   ├── App.jsx              # Gerenciador de estado principal
│   │   └── index.css            # Estilos em alto contraste e regras mobile
│   └── vite.config.js
├── server/                      # Backend Node.js Express 5
│   ├── data/
│   │   ├── seedData.js          # Sementes de materiais, maquinário e equipe de Salvador
│   │   ├── db.js                # Motor de persistência JSON com escrita atômica
│   │   ├── cbsm_data.json       # Base do modo Demonstração
│   │   └── clean_cbsm_data.json # Base do modo Produção Limpo
│   ├── server.js                # API REST e servidor da versão Demonstração (Porta 4000)
│   └── cleanServer.js           # Servidor da versão Produção Limpo (Porta 5000)
├── iniciar.bat                  # Executável Windows (Menu de Opções)
├── iniciar-demo.bat             # Executável Windows (Demonstração)
├── iniciar-producao.bat         # Executável Windows (Produção Limpo)
├── package.json
└── README.md
```

---

## 📄 Licença
Desenvolvido para Construtora BSM. Todos os direitos reservados.
