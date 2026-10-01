import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedUsers, seedObras, seedCatalog, seedRequisitions } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODE = process.env.CBSM_MODE || 'demo';
const DB_FILENAME = process.env.DB_FILE || (MODE === 'clean' ? 'clean_cbsm_data.json' : 'cbsm_data.json');
const DB_PATH = path.join(__dirname, DB_FILENAME);

class Database {
  constructor(options = {}) {
    this.mode = options.mode || MODE;
    this.dbFile = options.dbFile || DB_FILENAME;
    this.dbPath = path.join(__dirname, this.dbFile);
    this.data = {
      users: [],
      obras: [],
      catalog: [],
      requisitions: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure keys exist
        if (!this.data.users) this.data.users = this.mode === 'clean' ? [] : seedUsers;
        if (!this.data.obras) this.data.obras = this.mode === 'clean' ? [] : seedObras;
        if (!this.data.catalog) this.data.catalog = this.mode === 'clean' ? [] : seedCatalog;
        if (!this.data.requisitions) this.data.requisitions = this.mode === 'clean' ? [] : seedRequisitions;
      } else {
        this.reset();
      }
    } catch (err) {
      console.error('[DB] Error loading DB, resetting to defaults:', err);
      this.reset();
    }
  }

  save() {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error('[DB] Error saving DB:', err);
    }
  }

  reset() {
    if (this.mode === 'clean') {
      this.data = {
        users: [],
        obras: [],
        catalog: [],
        requisitions: []
      };
    } else {
      this.data = {
        users: JSON.parse(JSON.stringify(seedUsers)),
        obras: JSON.parse(JSON.stringify(seedObras)),
        catalog: JSON.parse(JSON.stringify(seedCatalog)),
        requisitions: JSON.parse(JSON.stringify(seedRequisitions))
      };
    }
    this.save();
    console.log(`[DB] Database (${this.dbFile}) initialized in ${this.mode} mode.`);
  }

  // --- Users ---
  getUsers() {
    return this.data.users.map(({ password, ...u }) => u);
  }

  addUser(userData) {
    const id = `usr-${userData.role === 'ENGENHEIRO' ? 'eng' : 'chefe'}-${Date.now()}`;
    const newUser = {
      id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'CHEFE_OBRA',
      assignedObraId: userData.assignedObraId || null,
      crea: userData.crea || '',
      phone: userData.phone || ''
    };
    this.data.users.push(newUser);
    this.save();
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  deleteUser(id) {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
    return this.data.users.length < initialLen;
  }

  authenticate(email, password) {
    const user = this.data.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  getUserById(id) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  // --- Obras ---
  getObras() {
    return this.data.obras;
  }

  getObraById(id) {
    return this.data.obras.find(o => o.id === id);
  }

  addObra(obraData) {
    const id = `obra-${Date.now()}`;
    const newObra = { id, ...obraData };
    this.data.obras.push(newObra);
    this.save();
    return newObra;
  }

  // --- Catalog ---
  getCatalog(category) {
    if (!category || category === 'ALL') {
      return this.data.catalog;
    }
    return this.data.catalog.filter(i => i.category === category);
  }

  addCatalogItem(item) {
    const id = `${item.category.toLowerCase().slice(0, 3)}-${Date.now()}`;
    const newItem = { id, ...item };
    this.data.catalog.push(newItem);
    this.save();
    return newItem;
  }

  updateCatalogItem(id, updates) {
    const index = this.data.catalog.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.catalog[index] = { ...this.data.catalog[index], ...updates };
    this.save();
    return this.data.catalog[index];
  }

  deleteCatalogItem(id) {
    const initialLen = this.data.catalog.length;
    this.data.catalog = this.data.catalog.filter(i => i.id !== id);
    this.save();
    return this.data.catalog.length < initialLen;
  }

  // --- Requisitions ---
  getRequisitions(filters = {}) {
    let list = [...this.data.requisitions];
    if (filters.obraId) {
      list = list.filter(r => r.obraId === filters.obraId);
    }
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.priority) {
      list = list.filter(r => r.priority === filters.priority);
    }
    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getRequisitionById(id) {
    return this.data.requisitions.find(r => r.id === id);
  }

  createRequisition(data) {
    const year = new Date().getFullYear();
    const count = this.data.requisitions.length + 40;
    const code = `REQ-${String(count).padStart(4, '0')}`;
    const id = `REQ-${year}-${String(count).padStart(4, '0')}`;

    const newReq = {
      id,
      code,
      obraId: data.obraId,
      obraName: data.obraName,
      sector: data.sector || 'Frente Geral',
      requestedBy: data.requestedBy,
      createdAt: new Date().toISOString(),
      neededByDate: data.neededByDate || new Date().toISOString().split('T')[0],
      priority: data.priority || 'NORMAL',
      status: 'PENDENTE',
      generalNotes: data.generalNotes || '',
      audioNote: data.audioNote || '',
      items: data.items.map(item => ({
        itemId: item.itemId,
        code: item.code || '',
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantityRequested: Number(item.quantityRequested),
        quantityApproved: Number(item.quantityRequested), // default initial
        status: 'PENDENTE',
        itemNotes: item.itemNotes || ''
      })),
      review: null,
      history: [
        {
          timestamp: new Date().toISOString(),
          user: data.requestedBy.name,
          action: 'REQUERIMENTO_CRIADO',
          notes: `Aberto para a obra ${data.obraName} (${data.sector}) com ${data.items.length} itens.`
        }
      ]
    };

    this.data.requisitions.unshift(newReq);
    this.save();
    return newReq;
  }

  reviewRequisition(id, { decision, engineer, engineerNotes, itemsReview, warehouseSource, dispatchDate }) {
    const req = this.data.requisitions.find(r => r.id === id);
    if (!req) return null;

    const now = new Date().toISOString();

    // Update item-level approved quantities if provided
    if (itemsReview && Array.isArray(itemsReview)) {
      req.items = req.items.map(item => {
        const itemUpdate = itemsReview.find(ir => ir.itemId === item.itemId);
        if (itemUpdate) {
          return {
            ...item,
            quantityApproved: Number(itemUpdate.quantityApproved ?? item.quantityRequested),
            status: itemUpdate.status || (decision === 'APROVADO' ? 'APROVADO' : decision === 'REPROVADO' ? 'REJEITADO' : 'AJUSTADO'),
            itemNotes: itemUpdate.itemNotes || item.itemNotes
          };
        }
        return item;
      });
    } else if (decision === 'REPROVADO') {
      req.items = req.items.map(item => ({
        ...item,
        quantityApproved: 0,
        status: 'REJEITADO'
      }));
    } else if (decision === 'APROVADO') {
      req.items = req.items.map(item => ({
        ...item,
        quantityApproved: item.quantityRequested,
        status: 'APROVADO'
      }));
    }

    req.status = decision; // 'APROVADO', 'APROVADO_PARCIAL', 'REPROVADO'
    req.review = {
      reviewedBy: {
        id: engineer.id,
        name: engineer.name,
        crea: engineer.crea || 'CREA-BA 48219/D'
      },
      reviewedAt: now,
      decision,
      engineerNotes: engineerNotes || '',
      dispatchDate: dispatchDate || now,
      warehouseSource: warehouseSource || 'Almoxarifado Central CBSM'
    };

    req.history.push({
      timestamp: now,
      user: engineer.name,
      action: `REQUERIMENTO_${decision}`,
      notes: engineerNotes || `Decisão: ${decision}.`
    });

    this.save();
    return req;
  }
}

export const db = new Database();
