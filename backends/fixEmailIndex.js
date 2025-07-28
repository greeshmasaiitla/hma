const mongoose = require('mongoose');

async function fixEmailIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/hospital', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Drop the existing unique index on email
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the email index if it exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('Dropped email_1 index');
    } catch (err) {
      console.log('Email index not found or already dropped');
    }
    
    // Create a sparse unique index on email (only unique for non-null values)
    await usersCollection.createIndex({ email: 1 }, { 
      unique: true, 
      sparse: true 
    });
    console.log('Created sparse unique index on email');
    
    console.log('Email index fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing email index:', error);
    process.exit(1);
  }
}

fixEmailIndex(); 