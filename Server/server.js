require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Cemetery = require('./Models/Cemetery');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connesso a MongoDB'))
  .catch(err => console.error('❌ Errore MongoDB:', err));

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] Richiesta: ${req.method} ${req.url}`);
  next();
});

// ==================== ROTTE API ====================

// 1. GET cerca defunti per nome (Messa SOPRA per evitare conflitti con :id)
app.get('/api/Cemeteries/search', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ message: 'Nome richiesto' });
    
    // Trova i cimiteri che contengono quel defunto
    const cemeteries = await Cemetery.find({ 
      'deceased.name': { $regex: name, $options: 'i' } 
    });

    // Estrae solo i defunti che matchano dalla lista dei cimiteri trovati
    const deceased = cemeteries.flatMap(cem => 
      cem.deceased.filter(d => d.name.toLowerCase().includes(name.toLowerCase()))
    );
    
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET tutti i cimiteri
app.get('/api/cemeteries', async (req, res) => {
  try {
    const cemeteries = await Cemetery.find();   // o .find().lean() se vuoi

    // NON sovrascrivere deceased con array vuoto!
    res.json(cemeteries);
    
  } catch (err) {
    console.error('Errore caricamento cimiteri:', err);
    res.status(500).json({ message: err.message });
  }
});

// 3. GET un cimitero per ID
app.get('/api/cemeteries/:id', async (req, res) => {   // tutto minuscolo
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    
    if (!cemetery) {
      return res.status(404).json({ message: 'Cimitero non trovato' });
    }

    res.json(cemetery);        // ← restituisci il documento completo
    // NON fare .toObject() + deceased: [] 

  } catch (err) {
    console.error('Errore:', err);
    res.status(500).json({ message: err.message });
  }
});

// 4. GET defunti per un cimitero specifico
app.get('/api/cemeteries/:id/deceased', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) return res.status(404).json({ message: 'Cimitero non trovato' });
    
    res.json(cemetery.deceased || []);   // restituisce direttamente l'array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. POST nuovo cimitero (Opzionale)
app.post('/api/Cemeteries', async (req, res) => {
  const cemetery = new Cemetery(req.body);
  try {
    const newCemetery = await cemetery.save();
    res.status(201).json(newCemetery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==================== AVVIO SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server unico in ascolto su http://localhost:${PORT}`);
});