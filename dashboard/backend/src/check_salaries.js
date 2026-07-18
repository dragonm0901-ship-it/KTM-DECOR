import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/ktm_decor_dashboard';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const salaries = await db.collection('salaries').find({}).toArray();
    console.log(`Found ${salaries.length} salary records in DB:`);
    salaries.forEach(s => {
      console.log(`- User ID: ${s.user}, Month: ${s.month}/${s.year}, Base Salary in Record: ${s.baseSalary}, Final: ${s.finalSalary}`);
    });
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
