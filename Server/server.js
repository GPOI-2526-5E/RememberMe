require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Cemetery = require('./Models/Cemetery');
const Deceased = require('./Models/Deceased');
const Employees = require('./Models/Employees');
const Municipalities = require('./Models/Municipalities');
const Tombstones = require('./Models/Tombstones');
const Users = require('./Models/Users');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ✅ limit per le foto base64

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connesso a MongoDB'))
  .catch(err => console.error('❌ Errore MongoDB:', err));

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════
app.post('/api/users', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email e password sono necessari' });

    const normalizedEmail = email.trim().toLowerCase();
    const emailQuery = { email: { $regex: `^${normalizedEmail}$`, $options: 'i' } };
    let authUser = null;

    const employee = await Employees.findOne(emailQuery);
    if (employee) {
      const valid = await bcrypt.compare(password, employee.passwordHash || '');
      if (valid) {
        authUser = {
          role: 'employee',
          fullName: employee.fullName,
          email: employee.email,
          employeeId: employee._id,
          municipalityId: employee.municipalityId,
        };
      }
    }

    if (!authUser) {
      let user = await Users.findOne(emailQuery)
        || await Users.findOne({ username: { $regex: `^${normalizedEmail}$`, $options: 'i' } });

      if (user) {
        const valid = await bcrypt.compare(password, user.passwordHash || '');
        if (valid) {
          authUser = {
            role: 'user',
            username: user.fullName,
            email: user.email,
            userId: user._id,
            municipalityId: user.municipalityId,
            assignedDeceased: user.assignedDeceased || [],
          };
        }
      }
    }

    if (!authUser)
      return res.status(401).json({ message: 'Email o password non validi' });

    res.json(authUser);
  } catch (err) {
    console.error('Errore login:', err);
    res.status(500).json({ message: 'Errore interno durante il login' });
  }
});

// ════════════════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════════════════

// Lista tutti gli user (per employee)
app.get('/api/users', async (req, res) => {
  try {
    const users = await Users.find({}, 'username email municipalityId');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Defunti assegnati a uno user
app.get('/api/users/:userId/deceased', async (req, res) => {
  try {
    const deceased = await Deceased.find({
      assignedUsers: new mongoose.Types.ObjectId(req.params.userId)
    });
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  CIMITERI
// ════════════════════════════════════════════════════════

app.get('/api/Cemeteries', async (req, res) => {
  try {
    const cemeteries = await Cemetery.find();
    res.json(cemeteries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/Cemeteries/:id', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) return res.status(404).json({ message: 'Cimitero non trovato' });
    res.json(cemetery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/Cemeteries', async (req, res) => {
  try {
    const cemetery = new Cemetery(req.body);
    const saved = await cemetery.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Defunti per cimitero
app.get('/api/Cemeteries/:id/Deceased', async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) return res.status(404).json({ message: 'Cimitero non trovato' });

    const tombstones = await Tombstones.find({ cemeteryId: req.params.id });
    if (tombstones.length === 0) return res.json([]);

    const tombstoneIds = tombstones.map(t => t._id.toString());
    const deceased = await Deceased.find({ graveId: { $in: tombstoneIds } }).populate('assignedUsers');

    const enriched = deceased.map(d => {
      const tombstone = tombstones.find(t => t._id.toString() === d.graveId);
      return {
        ...d.toObject(),
        graveDetails: tombstone ? {
          section: tombstone.section,
          plotNumber: tombstone.plotNumber,
          coordinates: tombstone.coordinates,
          status: tombstone.status
        } : null
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  DECEASED
// ════════════════════════════════════════════════════════

// ⚠️ /search PRIMA di /:id altrimenti Express legge "search" come un id
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

app.get('/api/Deceaseds/:id', async (req, res) => {
  try {
    const deceased = await Deceased.findById(req.params.id).populate('assignedUsers');
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/Deceaseds', async (req, res) => {
  try {
    const { fullName, birthDate, deathDate, deceasedImage, assignedUsers } = req.body;
    if (!fullName || !birthDate || !deathDate)
      return res.status(400).json({ message: 'Nome, data nascita e data morte sono obbligatori' });

    const deceased = new Deceased({
      fullName, birthDate, deathDate,
      deceasedImage: deceasedImage || '',
      assignedUsers: assignedUsers || [],
      images: [],
      memories: [],
    });
    const saved = await deceased.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/Deceaseds/:id/story', async (req, res) => {
  try {
    const deceased = await Deceased.findByIdAndUpdate(
      req.params.id, { $set: { story: req.body.story } }, { new: true }
    );
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/Deceaseds/:id/epitaph', async (req, res) => {
  try {
    const deceased = await Deceased.findByIdAndUpdate(
      req.params.id, { $set: { biography: req.body.epitaph } }, { new: true }
    );
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });
    res.json(deceased);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/Deceaseds/:id/photos', async (req, res) => {
  try {
    const deceased = await Deceased.findByIdAndUpdate(
      req.params.id, { $push: { images: req.body.photo } }, { new: true }
    );
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });
    res.json(deceased.images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/Deceaseds/:id/photos/:index', async (req, res) => {
  try {
    const deceased = await Deceased.findById(req.params.id);
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });
    deceased.images.splice(Number(req.params.index), 1);
    await deceased.save();
    res.json(deceased.images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/Deceaseds/:id/memories', async (req, res) => {
  try {
    const { author, message, type } = req.body;
    if (!author || !message)
      return res.status(400).json({ message: 'Autore e messaggio sono obbligatori' });

    const deceased = await Deceased.findById(req.params.id);
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });

    const newMemory = {
      id: new mongoose.Types.ObjectId().toString(),
      deceasedId: deceased._id?.toString(),
      author: author.trim(),
      message: message.trim(),
      date: new Date(),
      type: ['memory', 'message', 'prayer'].includes(type) ? type : 'memory'
    };

    deceased.memories = [newMemory, ...(deceased.memories || [])].slice(0, 5);
    await deceased.save();
    res.status(201).json(deceased.memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/Deceaseds/:id/memories/:memoryId', async (req, res) => {
  try {
    const deceased = await Deceased.findById(req.params.id);
    if (!deceased) return res.status(404).json({ message: 'Defunto non trovato' });
    deceased.memories = (deceased.memories || []).filter(m => m.id !== req.params.memoryId);
    await deceased.save();
    res.json(deceased.memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  START
// ════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});