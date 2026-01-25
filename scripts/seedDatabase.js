import mongoose from "mongoose";

import User from "../models/user.js";
import ProjectSpace from "../models/projectSpace.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/lynxapp');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  console.log('🌱 Seeding database...');
  
  // Clear existing data
  await User.deleteMany({});
  await ProjectSpace.deleteMany({});
  console.log('🗑️  Cleared existing data');
  
  // Create 3 test users
  const users = [
    {
      username: 'ayokunmi',
      firstname: 'Ayokunmi',
      lastname: 'Buko',
      email: 'ayokunmi@example.com',
      password: 'password123'
    },
    {
      username: 'davidmark',
      firstname: 'David',
      lastname: 'Mark',
      email: 'David@example.com',
      password: 'password123'
    },
    {
      username: 'joshua',
      firstname: 'Joshua',
      lastname: 'Brown',
      email: 'joshuab@example.com',
      password: 'password123'
    }
  ];
  
  // Save users to database
  const savedUsers = await User.insertMany(users);
  console.log(`✅ Created ${savedUsers.length} users`);
  
  // Create 2 project spaces with different admins
  const projects = [
    {
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI/UX',
      owner: savedUsers[0]._id, // Alice is owner
      members: [
        {
          user: savedUsers[0]._id,
          role: 'admin'
        },
        {
          user: savedUsers[1]._id,
          role: 'member'
        },
        {
          user: savedUsers[2]._id,
          role: 'member'
        }
      ]
    },
    {
      name: 'Mobile App Development',
      description: 'Build new mobile app for iOS and Android',
      owner: savedUsers[1]._id, // Bob is owner
      members: [
        {
          user: savedUsers[1]._id,
          role: 'admin'
        },
        {
          user: savedUsers[2]._id,
          role: 'admin' // Charlie is also admin in this project
        },
        {
          user: savedUsers[0]._id,
          role: 'member'
        }
      ]
    },
    {
      name: 'Marketing Campaign Q4',
      description: 'Q4 marketing strategy and execution',
      owner: savedUsers[2]._id, // Charlie is owner
      members: [
        {
          user: savedUsers[2]._id,
          role: 'admin'
        },
        {
          user: savedUsers[0]._id,
          role: 'member'
        }
        // Bob is NOT in this project
      ]
    }
  ];
  
  // Save projects to database
  const savedProjects = await ProjectSpace.insertMany(projects);
  console.log(`✅ Created ${savedProjects.length} project spaces`);
  
  // Display the created data
  console.log('\n📊 Database Summary:');
  console.log('====================');
  
  const allUsers = await User.find();
  console.log(`👥 Total Users: ${allUsers.length}`);
  allUsers.forEach(user => {
    console.log(`  - ${user.username} (${user.email})`);
  });
  
  console.log('\n🏢 Total Projects:');
  const allProjects = await ProjectSpace.find()
    .populate('owner', 'username')
    .populate('members.user', 'username');
  
  allProjects.forEach(project => {
    console.log(`\n  ${project.name} (Owner: ${project.owner.username})`);
    console.log(`  Members:`);
    project.members.forEach(member => {
      console.log(`    - ${member.user.username} (${member.role})`);
    });
  });
  
  console.log('\n🎉 Database seeded successfully!');
  
  // Exit
  mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
};

// Run the seed script
connectDB().then(() => {
  seedDatabase().catch(error => {
    console.error('❌ Error seeding database:', error);
    mongoose.disconnect();
  });
});