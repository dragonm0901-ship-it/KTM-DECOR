import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/ktm_decor_dashboard';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('--- DATABASE DIAGNOSTIC SUMMARY ---');
    console.log(`Connected to: ${MONGO_URI}\n`);
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`Collection: "${col.name}" - Count: ${count}`);
    }
    
    // Check some sample orders
    if (collections.some(c => c.name === 'orders')) {
      const sampleOrders = await db.collection('orders').find({}).limit(3).toArray();
      console.log('\nSample Orders:');
      sampleOrders.forEach(o => {
        console.log(`- ID: ${o._id}, Customer: ${o.customerName}, Product: ${o.productName}, Total: Rs. ${o.totalPrice}, Deleted: ${o.deleted}`);
      });
    }
    
    // Check some sample sales
    if (collections.some(c => c.name === 'sales')) {
      const sampleSales = await db.collection('sales').find({}).limit(3).toArray();
      console.log('\nSample Sales:');
      sampleSales.forEach(s => {
        console.log(`- ID: ${s._id}, Client: ${s.clientName}, Amount: Rs. ${s.amount}`);
      });
    }

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
