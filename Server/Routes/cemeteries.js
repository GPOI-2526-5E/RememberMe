const express = require('express');
const router = express.Router();
const Cemetery = require('../Models/Cemetery');

// GET tutti i cimiteri
router.get('/', async (req, res) => {
  try {
    const cemeteries = await Cemetery.find();
    res.json(cemeteries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET un cimitero per ID
router.get('/:id', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) return res.status(404).json({ message: 'Cimitero non trovato' });
    res.json(cemetery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// (Opzionale) POST per aggiungere nuovi cimiteri/defunti
router.post('/', async (req, res) => {
  const cemetery = new Cemetery(req.body);
  try {
    const newCemetery = await cemetery.save();
    res.status(201).json(newCemetery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET defunti per cimitero
router.get('/:id/Deceased', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) return res.status(404).json({ message: 'Cimitero non trovato' });
    res.json(cemetery.deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET cerca defunti per nome
router.get('/search', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ message: 'Nome richiesto' });
    const cemeteries = await Cemetery.find({ 'deceased.name': { $regex: name, $options: 'i' } });
    const deceased = cemeteries.flatMap(cem => cem.deceased.filter(d => d.name.toLowerCase().includes(name.toLowerCase())));
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;