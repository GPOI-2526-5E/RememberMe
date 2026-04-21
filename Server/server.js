require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Cemetery = require('./Models/Cemetery');
const Deceased = require('./Models/Deceased');
const Employees = require('./Models/Employees');
const Municipalities = require('./Models/Municipalities');
const Tombstones = require('./Models/Tombstones');
const Users = require('./Models/Users');
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

// Ricerca defunti per nome
app.get('/api/Deceaseds/search', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ message: 'Nome richiesto' });
    
    const deceased = await Deceased.find({ 
      fullName: { $regex: name, $options: 'i' } 
    }).populate('assignedUsers');
    
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Query per tutti i cimiteri
app.get('/api/Cemeteries', async (req, res) => {
  try {
    const cemeteries = await Cemetery.find();

    res.json(cemeteries);
    
  } catch (err) {
    console.error('Errore caricamento cimiteri:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/Cemeteries/:id', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    
    if (!cemetery) {
      return res.status(404).json({ message: 'Cimitero non trovato' });
    }

    res.json(cemetery);

  } catch (err) {
    console.error('Errore:', err);
    res.status(500).json({ message: err.message });
  }
});

// Ottieni defunti per cimitero
app.get('/api/Cemeteries/:id/Deceased', async (req, res) => {
  try {
    const cemeteryId = req.params.id;
    
    // Verifica che il cimitero esista
    const cemetery = await Cemetery.findById(cemeteryId);
    if (!cemetery) {
      return res.status(404).json({ message: 'Cimitero non trovato' });
    }
    
    // PASSO 1: Trova tutte le tombe di questo cimitero
    const tombstones = await Tombstones.find({ cemeteryId: cemeteryId });
    console.log(`Tombe trovate per cimitero ${cemeteryId}:`, tombstones.length);
    
    if (tombstones.length === 0) {
      return res.json([]); // Nessuna tomba, nessun defunto
    }
    
    // PASSO 2: Estrai gli ID delle tombe
    const tombstoneIds = tombstones.map(t => t._id.toString());
    console.log('ID Tombe:', tombstoneIds);
    
    // PASSO 3: Trova i defunti che hanno graveId corrispondente a questi ID
    const deceased = await Deceased.find({ 
      graveId: { $in: tombstoneIds } 
    }).populate('assignedUsers');
    
    console.log(`Defunti trovati:`, deceased.length);
    
    // PASSO 4: Arricchisci i dati con le info della tomba
    const enrichedDeceased = deceased.map(defunto => {
      const tombstone = tombstones.find(t => t._id.toString() === defunto.graveId);
      return {
        ...defunto.toObject(),
        graveDetails: tombstone ? {
          section: tombstone.section,
          plotNumber: tombstone.plotNumber,
          coordinates: tombstone.coordinates,
          status: tombstone.status
        } : null
      };
    });
    
    res.json(enrichedDeceased);
    
  } catch (err) {
    console.error('Errore dettagliato:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

app.post('/api/Cemeteries', async (req, res) => {
  const cemetery = new Cemetery(req.body);
  try {
    const newCemetery = await cemetery.save();
    res.status(201).json(newCemetery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server unico in ascolto su http://localhost:${PORT}`);
});
