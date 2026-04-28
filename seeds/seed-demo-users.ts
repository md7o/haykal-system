import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'haykal_db',
});

async function seedDemoUsers() {
  let client;
  try {
    client = await pool.connect();
    console.log('✓ Database connected');

    // Create 10 demo users with Arabic names in English
    const demoUsers = [
      {
        username: 'Mohammad Ali',
        email: 'mohammad.ali@email.com',
        password: '123456',
        role: 'User',
      },
      {
        username: 'Fatima Ahmad',
        email: 'fatima.ahmad@email.com',
        password: '123456',
        role: 'User',
      },
      {
        username: 'Ali Mahmoud',
        email: 'ali.mahmoud@email.com',
        password: 'password123',
        role: 'User',
      },
      {
        username: 'Sarah Hassan',
        email: 'sara.hassan@email.com',
        password: 'password123',
        role: 'User',
      },
      {
        username: 'Ahmed Ibrahim',
        email: 'ahmad.ibrahim@email.com',
        password: '123456',
        role: 'User',
      },
      {
        username: 'Noor Mohammad',
        email: 'noor.mohammad@email.com',
        password: 'welcome123',
        role: 'User',
      },
      {
        username: 'Zaid Khalil',
        email: 'zaid.khalil@email.com',
        password: 'welcome123',
        role: 'User',
      },
      {
        username: 'Layla Omar',
        email: 'layla.omar@email.com',
        password: '123456',
        role: 'User',
      },
      {
        username: 'Hind Salem',
        email: 'hind.salem@email.com',
        password: 'password123',
        role: 'User',
      },
      {
        username: 'Omar Rahim',
        email: 'omar.rahim@email.com',
        password: 'welcome123',
        role: 'User',
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUserResult = await client.query(
          'SELECT id FROM "user" WHERE email = $1 OR username = $2 LIMIT 1',
          [userData.email, userData.username],
        );

        if (existingUserResult.rows.length > 0) {
          console.log(`⚠ User ${userData.username} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Insert user
        const id = uuidv4();
        const now = new Date();

        await client.query(
          `INSERT INTO "user" (id, username, email, password, role, "isBanned", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, userData.username, userData.email, hashedPassword, userData.role, false, now, now],
        );

        console.log(`✓ Created demo user: ${userData.username} (${userData.email})`);
        createdCount++;
      } catch (error) {
        console.error(`✗ Failed to create ${userData.username}:`, (error as Error).message);
      }
    }

    console.log('\n✅ Demo users seeding completed!');
    console.log(`Created: ${createdCount}, Skipped: ${skippedCount}`);
    console.log('\nDefault password for all demo users: Demo@12345');
    console.log('\nAll demo users:');
    demoUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} / ${user.email}`);
    });

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error seeding demo users:', (error as Error).message);
    if (client) {
      client.release();
    }
    await pool.end();
    process.exit(1);
  }
}

seedDemoUsers();
