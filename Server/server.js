require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connesso a MongoDB'))
  .catch(err => console.error('❌ Errore MongoDB:', err));

app.use('/', (req, res, next) =>{ 
  console.log("Richiesta: ", req.url);
  next();
})
app.use('/api/Cemeteries', require('./Routes/cemeteries'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server in ascolto su http://localhost:${PORT}`));