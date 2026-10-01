import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LoginView from './components/LoginView';
import ChefeView from './components/ChefeView';
import EngenheiroView from './components/EngenheiroView';
import Toast from './components/Toast';
import { api } from './utils/api';
import { sounds } from './utils/sound';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cbsm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentObra, setCurrentObra] = useState(null);
  const [obras, setObras] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemInfo, setSystemInfo] = useState({ mode: 'demo', isClean: false, userCount: 0 });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Show Toast Helper
  const showToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, duration);
  }, []);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      const [obrasData, catalogData, requisitionsData, usersData, sysInfo] = await Promise.all([
        api.getObras(),
        api.getCatalog(),
        api.getRequisitions(),
        api.getUsers(),
        api.getSystemInfo().catch(() => ({ mode: 'demo', isClean: false, userCount: 0 }))
      ]);

      setObras(obrasData);
      setCatalog(catalogData);
      setRequisitions(requisitionsData);
      setUsers(usersData);
      setSystemInfo(sysInfo);

      // Set default current obra if not selected
      setCurrentObra(prev => {
        if (prev) {
          const updated = obrasData.find(o => o.id === prev.id);
          return updated || prev;
        }
        if (currentUser?.assignedObraId) {
          return obrasData.find(o => o.id === currentUser.assignedObraId) || obrasData[0];
        }
        return obrasData[0] || null;
      });

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
    // Poll updates every 6 seconds so Chefe and Engenheiro are in sync
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Login
  const handleLogin = async (email, password) => {
    setLoginError('');
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      localStorage.setItem('cbsm_user', JSON.stringify(res.user));
      sounds.playSuccess();
      
      // Auto-assign user's obra if site manager
      if (res.user.assignedObraId) {
        const obra = obras.find(o => o.id === res.user.assignedObraId);
        if (obra) setCurrentObra(obra);
      }

      showToast({
        type: 'success',
        title: `Bem-vindo, ${res.user.name.split(' ')[0]}!`,
        message: res.user.role === 'ENGENHEIRO'
          ? 'Painel do Engenheiro Coordenador liberado.'
          : 'Canteiro conectado. Pronto para abrir requerimentos.'
      });
    } catch (err) {
      sounds.playReject();
      setLoginError(err.message || 'Credenciais inválidas.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sounds.playTap();
    setCurrentUser(null);
    localStorage.removeItem('cbsm_user');
    showToast({
      type: 'info',
      title: 'Desconectado',
      message: 'Sessão encerrada com segurança.'
    });
  };

  // Switch demo user instantly
  const handleSwitchUser = async (userId) => {
    sounds.playTap();
    const userToSwitch = users.find(u => u.id === userId);
    if (!userToSwitch) return;

    setCurrentUser(userToSwitch);
    localStorage.setItem('cbsm_user', JSON.stringify(userToSwitch));

    if (userToSwitch.assignedObraId) {
      const matchObra = obras.find(o => o.id === userToSwitch.assignedObraId);
      if (matchObra) setCurrentObra(matchObra);
    }

    showToast({
      type: 'info',
      title: `Perfil Alternado: ${userToSwitch.name.split(' ')[0]}`,
      message: `Modo ${userToSwitch.role === 'ENGENHEIRO' ? 'Engenheiro Mestre' : 'Chefe de Obra'}.`
    });
  };

  // Create Requisition (Chefe)
  const handleCreateRequisition = async (data) => {
    const newReq = await api.createRequisition(data);
    await fetchData();
    return newReq;
  };

  // Review Requisition (Engenheiro)
  const handleReviewRequisition = async (id, reviewData) => {
    const updated = await api.reviewRequisition(id, reviewData);
    await fetchData();
    return updated;
  };

  // Catalog CRUD
  const handleAddCatalogItem = async (data) => {
    await api.createCatalogItem(data);
    await fetchData();
  };

  const handleUpdateCatalogItem = async (id, updates) => {
    await api.updateCatalogItem(id, updates);
    await fetchData();
  };

  const handleDeleteCatalogItem = async (id) => {
    await api.deleteCatalogItem(id);
    await fetchData();
  };

  // Obra CRUD
  const handleAddObra = async (data) => {
    await api.createObra(data);
    await fetchData();
  };

  // Reset Database
  const handleResetDatabase = async () => {
    if (confirm('Deseja restaurar todos os dados e histórico de demonstração da CBSM?')) {
      await api.resetDatabase();
      await fetchData();
      sounds.playSuccess();
      showToast({
        type: 'success',
        title: 'Dados Restaurados',
        message: 'O catálogo e os requerimentos de teste foram restaurados aos valores padrão.'
      });
    }
  };

  // Handle Register Master Engineer (First-time clean setup)
  const handleRegisterMaster = async (formData) => {
    setLoginError('');
    try {
      const res = await api.registerMaster(formData);
      setCurrentUser(res.user);
      localStorage.setItem('cbsm_user', JSON.stringify(res.user));
      sounds.playSuccess();
      await fetchData();
      showToast({
        type: 'success',
        title: 'Conta Mestre Criada!',
        message: `Engenheiro ${res.user.name} conectado com sucesso.`
      });
    } catch (err) {
      sounds.playReject();
      setLoginError(err.message || 'Falha ao criar conta de Engenheiro Mestre.');
    }
  };

  // User Management CRUD (for Engineer)
  const handleCreateUser = async (data) => {
    const newUser = await api.createUser(data);
    await fetchData();
    return newUser;
  };

  const handleDeleteUser = async (id) => {
    await api.deleteUser(id);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black p-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-black text-black uppercase tracking-widest">
          Carregando CBSM Requerimentos...
        </p>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginView 
          onLogin={handleLogin} 
          onRegisterMaster={handleRegisterMaster}
          error={loginError} 
          systemInfo={systemInfo}
          users={users}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-black flex flex-col selection:bg-black selection:text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <Navbar
        currentUser={currentUser}
        currentObra={currentObra}
        obras={obras}
        onSelectObra={setCurrentObra}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onResetDb={handleResetDatabase}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        systemInfo={systemInfo}
      />

      <main className="flex-1">
        {currentUser.role === 'ENGENHEIRO' ? (
          <EngenheiroView
            currentUser={currentUser}
            currentObra={currentObra}
            obras={obras}
            catalog={catalog}
            requisitions={requisitions}
            users={users}
            systemInfo={systemInfo}
            onReviewRequisition={handleReviewRequisition}
            onAddCatalogItem={handleAddCatalogItem}
            onUpdateCatalogItem={handleUpdateCatalogItem}
            onDeleteCatalogItem={handleDeleteCatalogItem}
            onAddObra={handleAddObra}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
            onShowToast={showToast}
          />
        ) : (
          <ChefeView
            currentUser={currentUser}
            currentObra={currentObra}
            catalog={catalog}
            requisitions={requisitions}
            systemInfo={systemInfo}
            onCreateRequisition={handleCreateRequisition}
            onShowToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
