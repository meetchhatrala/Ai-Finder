import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/AiFinder', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to AiList collection.');
});

const aiListSchema = new mongoose.Schema({
    name: String,
    url: String,
    Description: String,
    Tags: [String],
    Category: String,
    Image: String,
    Use_by: String,
  });
  
  const AiList = mongoose.model("AiList", aiListSchema);

export default AiList;