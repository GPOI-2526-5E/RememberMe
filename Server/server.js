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

app.get('/api/Cemeteries/search', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ message: 'Nome richiesto' });
    
    const cemeteries = await Cemetery.find({ 
      'deceased.name': { $regex: name, $options: 'i' } 
    });

    const deceased = cemeteries.flatMap(cem => 
      cem.deceased.filter(d => d.name.toLowerCase().includes(name.toLowerCase()))
    );
    
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

app.get('/api/Cemeteries/:id/Deceased', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) return res.status(404).json({ message: 'Cimitero non trovato' });
    
    res.json(cemetery.deceased || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
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