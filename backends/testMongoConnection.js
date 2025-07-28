const mongoose = require('mongoose');

// 🔧 REPLACE THIS WITH YOUR ACTUAL CONNECTION STRING
// To find your connection string:
// 1. Go to your MongoDB Atlas dashboard
// 2. Look for your cluster name (like "Cluster0")
// 3. Find the cluster address (like "cluster0.xxxxx.mongodb.net")
// 4. Use your username and password
const MONGODB_URI = 'mongodb+srv://hospital-admin:AdminHospital@cluster0.t9dx5gg.mongodb.net/Hospitals?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('📝 Make sure you replaced YOUR_PASSWORD with your actual password!');
console.log('');

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ SUCCESS! MongoDB Atlas connection working!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔗 Connection String:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Test creating a collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ 
      test: 'connection', 
      timestamp: new Date(),
      message: 'MongoDB Atlas is working perfectly!'
    });
    console.log('✅ Database write test successful!');
    
    // Clean up test data
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Database cleanup successful!');
    
    console.log('');
    console.log('🎉 Your MongoDB Atlas is working perfectly!');
    console.log('📋 Save this connection string for deployment:');
    console.log(MONGODB_URI);
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed!');
    console.error('Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if you replaced YOUR_PASSWORD with actual password');
    console.log('2. Verify your username is correct');
    console.log('3. Make sure your cluster is running');
    console.log('4. Check if IP is whitelisted (should allow from anywhere)');
    console.log('5. Verify connection string format');
    console.log('');
    console.log('📝 Current connection string:');
    console.log(MONGODB_URI);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Connection closed');
    }
  }
}

testConnection(); 