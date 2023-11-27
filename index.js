const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 8000;

app.use(express.json());
const upload = multer();


const notesFilePath = './notes.json';


if (!fs.existsSync(notesFilePath)) {
  fs.writeFileSync(notesFilePath, JSON.stringify([]));
}


app.get('/', (req, res) => {
    const indexPath = './static/UploadForm.html'; 
    res.sendFile(indexPath, { root: __dirname });
  });
  
  

app.get('/notes', (req, res) => {
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8'));
  res.json(notes);
});

app.get('/UploadForm.html', (req, res) => {
  const formPath = './static/UploadForm.html';
  res.sendFile(formPath, { root: __dirname });
});


app.post('/upload', upload.fields([{ name: 'note_name' }, { name: 'note' }]), (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;
  
    const notesFilePath = './notes.json';
    let notes = [];
  
   
    if (fs.existsSync(notesFilePath)) {
      notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8'));
    }
  
    const existingNoteIndex = notes.findIndex((note) => note.note_name === noteName);
  
    if (existingNoteIndex !== -1) {
      return res.status(400).send('Bad Request: Note with this name already exists');
    }
  

    const newNote = { note_name: noteName, note: noteText };
    notes.push(newNote);
  
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2)); 
  
    res.status(201).send('Note uploaded successfully'); 
  });
  

app.get('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8'));

  const requestedNote = notes.find((note) => note.note_name === noteName);

  if (!requestedNote) {
    return res.status(404).send('Note not found');
  }

  res.send(requestedNote.note);
});

app.put('/notes/:noteName', express.text(), (req, res) => {
  const noteName = req.params.noteName;
  const newText = req.body;
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8'));

  const requestedNoteIndex = notes.findIndex((note) => note.note_name === noteName);

  if (requestedNoteIndex === -1) {
    return res.status(404).send('Note not found');
  }

 
  notes[requestedNoteIndex].note = newText;
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
  

  res.send('Note updated successfully');
});


app.delete('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8'));

  const updatedNotes = notes.filter((note) => note.note_name !== noteName);
  fs.writeFileSync(notesFilePath, JSON.stringify(updatedNotes, null, 2));

  res.send('Note deleted successfully');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});