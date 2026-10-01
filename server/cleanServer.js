// Clean Production Runner for CBSM Requerimentos
// Starts the system on port 5000 with 0 mock data, 0 mock catalog items, and 0 hardcoded logins.

process.env.PORT = process.env.PORT || '5000';
process.env.CBSM_MODE = 'clean';
process.env.DB_FILE = 'clean_cbsm_data.json';

console.log('[CBSM Clean Production] Starting clean instance on port ' + process.env.PORT + '...');
await import('./server.js');
