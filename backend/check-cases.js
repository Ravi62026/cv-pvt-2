import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Query from './models/Query.js';
import Dispute from './models/Dispute.js';

dotenv.config();

const checkCases = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chainverdict');
    console.log('✅ Connected to MongoDB');

    // Check all queries
    const allQueries = await Query.find({});
    console.log(`📊 Total Queries in DB: ${allQueries.length}`);

    // Check pending queries
    const pendingQueries = await Query.find({ status: 'pending' });
    console.log(`⏳ Pending Queries: ${pendingQueries.length}`);

    // Check unassigned pending queries
    const unassignedQueries = await Query.find({
      $or: [
        { assignedLawyer: { $exists: false } },
        { assignedLawyer: null }
      ],
      status: 'pending'
    });
    console.log(`🔓 Unassigned Pending Queries: ${unassignedQueries.length}`);

    if (unassignedQueries.length > 0) {
      console.log('\n📝 Sample unassigned query:');
      console.log(`Title: ${unassignedQueries[0].title}`);
      console.log(`Status: ${unassignedQueries[0].status}`);
      console.log(`Category: ${unassignedQueries[0].category}`);
      console.log(`Priority: ${unassignedQueries[0].priority}`);
      console.log(`Assigned Lawyer: ${unassignedQueries[0].assignedLawyer}`);
    }

    // Check all disputes
    const allDisputes = await Dispute.find({});
    console.log(`\n📊 Total Disputes in DB: ${allDisputes.length}`);

    // Check pending disputes
    const pendingDisputes = await Dispute.find({ status: 'pending' });
    console.log(`⏳ Pending Disputes: ${pendingDisputes.length}`);

    // Check unassigned pending disputes
    const unassignedDisputes = await Dispute.find({
      $or: [
        { assignedLawyer: { $exists: false } },
        { assignedLawyer: null }
      ],
      status: 'pending'
    });
    console.log(`🔓 Unassigned Pending Disputes: ${unassignedDisputes.length}`);

    if (unassignedDisputes.length > 0) {
      console.log('\n📝 Sample unassigned dispute:');
      console.log(`Title: ${unassignedDisputes[0].title}`);
      console.log(`Status: ${unassignedDisputes[0].status}`);
      console.log(`Category: ${unassignedDisputes[0].category}`);
      console.log(`Priority: ${unassignedDisputes[0].priority}`);
      console.log(`Assigned Lawyer: ${unassignedDisputes[0].assignedLawyer}`);
    }

    console.log('\n🎯 Total Available Cases:', unassignedQueries.length + unassignedDisputes.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkCases();
