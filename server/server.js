import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './data/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static client build if present
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// --- API ROUTES ---

// 0. System Info
app.get('/api/system/info', (req, res) => {
  res.json({
    mode: db.mode,
    isClean: db.mode === 'clean',
    dbFile: db.dbFile,
    userCount: db.getUsers().length,
    obraCount: db.getObras().length,
    catalogCount: db.getCatalog().length,
    requisitionCount: db.getRequisitions().length
  });
});

// 1. Auth / Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = db.authenticate(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e senha.' });
  }

  res.json({
    success: true,
    user,
    token: `cbsm-token-${user.id}-${Date.now()}`
  });
});

// Register Initial Master Engineer (Available when no users exist)
app.post('/api/auth/register-master', (req, res) => {
  const { name, email, password, crea, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const existingUsers = db.getUsers();
  if (existingUsers.length > 0) {
    return res.status(400).json({ error: 'O sistema já possui usuários cadastrados. Faça login com a conta existente.' });
  }

  const newUser = db.addUser({
    name,
    email,
    password,
    role: 'ENGENHEIRO',
    crea: crea || 'CREA-BA Registrado',
    phone: phone || ''
  });

  res.status(201).json({
    success: true,
    user: newUser,
    token: `cbsm-token-${newUser.id}-${Date.now()}`
  });
});

// 2. Users
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/users', (req, res) => {
  const { name, email, password, role, assignedObraId, crea, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const existing = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Já existe um usuário com este e-mail.' });
  }

  const newUser = db.addUser({
    name,
    email,
    password,
    role: role || 'CHEFE_OBRA',
    assignedObraId: assignedObraId || null,
    crea: crea || '',
    phone: phone || ''
  });

  res.status(201).json(newUser);
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteUser(id);
  if (!success) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  res.json({ success: true });
});

// 3. Obras
app.get('/api/obras', (req, res) => {
  res.json(db.getObras());
});

app.post('/api/obras', (req, res) => {
  const { name, code, location, type, sectors } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Nome e código da obra são obrigatórios.' });
  }
  const newObra = db.addObra({
    name,
    code,
    location: location || 'Salvador - BA',
    type: type || 'Construção Civil',
    engineerInCharge: req.body.engineerInCharge || 'Engenharia CBSM',
    chiefInCharge: req.body.chiefInCharge || 'A Definir',
    status: 'EM_ANDAMENTO',
    sectors: sectors && sectors.length ? sectors : ['Canteiro Geral']
  });
  res.status(201).json(newObra);
});

// 4. Catalog (Materiais, Maquinário, Homens, Ferramentas)
app.get('/api/catalog', (req, res) => {
  const { category } = req.query;
  const items = db.getCatalog(category);
  res.json(items);
});

app.post('/api/catalog', (req, res) => {
  const { category, name, spec, unit, stock, minQty, presets, description } = req.body;
  if (!category || !name || !unit) {
    return res.status(400).json({ error: 'Categoria, nome e unidade são obrigatórios.' });
  }
  const newItem = db.addCatalogItem({
    category,
    code: req.body.code || `${category.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
    name,
    spec: spec || '',
    unit,
    stock: Number(stock) || 0,
    minQty: Number(minQty) || 1,
    presets: Array.isArray(presets) && presets.length ? presets : [1, 2, 5, 10],
    icon: req.body.icon || 'Package',
    categoryLabel: req.body.categoryLabel || category,
    description: description || ''
  });
  res.status(201).json(newItem);
});

app.put('/api/catalog/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateCatalogItem(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Item não encontrado no catálogo.' });
  }
  res.json(updated);
});

app.delete('/api/catalog/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteCatalogItem(id);
  if (!success) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }
  res.json({ success: true });
});

// 5. Requisitions
app.get('/api/requisitions', (req, res) => {
  const { obraId, status, priority } = req.query;
  const list = db.getRequisitions({ obraId, status, priority });
  res.json(list);
});

app.get('/api/requisitions/:id', (req, res) => {
  const { id } = req.params;
  const item = db.getRequisitionById(id);
  if (!item) {
    return res.status(404).json({ error: 'Requerimento não encontrado.' });
  }
  res.json(item);
});

app.post('/api/requisitions', (req, res) => {
  const { obraId, obraName, sector, requestedBy, items, neededByDate, priority, generalNotes, audioNote } = req.body;
  if (!obraId || !requestedBy || !items || !items.length) {
    return res.status(400).json({ error: 'Obra, solicitante e ao menos um item são obrigatórios.' });
  }

  const newReq = db.createRequisition({
    obraId,
    obraName,
    sector,
    requestedBy,
    items,
    neededByDate,
    priority,
    generalNotes,
    audioNote
  });

  res.status(201).json(newReq);
});

// 6. Review Requisition (Engenheiro Mestre)
app.post('/api/requisitions/:id/review', (req, res) => {
  const { id } = req.params;
  const { decision, engineer, engineerNotes, itemsReview, warehouseSource, dispatchDate } = req.body;

  if (!decision || !['APROVADO', 'APROVADO_PARCIAL', 'REPROVADO'].includes(decision)) {
    return res.status(400).json({ error: 'Decisão válida obrigatória: APROVADO, APROVADO_PARCIAL ou REPROVADO.' });
  }

  if (!engineer || !engineer.name) {
    return res.status(400).json({ error: 'Identificação do engenheiro responsável é obrigatória.' });
  }

  const updatedReq = db.reviewRequisition(id, {
    decision,
    engineer,
    engineerNotes,
    itemsReview,
    warehouseSource,
    dispatchDate
  });

  if (!updatedReq) {
    return res.status(404).json({ error: 'Requerimento não encontrado.' });
  }

  res.json(updatedReq);
});

// 7. System Reset
app.post('/api/system/reset', (req, res) => {
  db.reset();
  res.json({ success: true, message: 'Banco de dados restaurado com dados de demonstração.' });
});

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('API CBSM operacional. Execute o frontend com "npm run client" ou compile com "npm run build".');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[CBSM Server] Servidor de Requerimentos rodando em http://localhost:${PORT}`);
});
