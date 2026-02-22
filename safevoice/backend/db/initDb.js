import { query } from './index.js';

const initDb = async () => {
    try {
        console.log('⏳ Initializing SafeVoice Database Tables...');

        // Create Complaints Table
        await query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                case_id VARCHAR(50) UNIQUE NOT NULL,
                incident_details JSONB,
                accused_details JSONB,
                public_key TEXT,
                contact_phone VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Submitted',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Add new columns if they don't exist
        await query(`
            ALTER TABLE complaints 
            ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS icc_message TEXT;
        `);
        console.log('✅ Complaints table checked/created');

        // Create Evidence Table
        await query(`
            CREATE TABLE IF NOT EXISTS evidence (
                id SERIAL PRIMARY KEY,
                case_id VARCHAR(50) REFERENCES complaints(case_id) ON DELETE CASCADE,
                file_path VARCHAR(255) NOT NULL,
                file_hash VARCHAR(255) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Evidence table checked/created');

        // Create ICC Members Table
        await query(`
            CREATE TABLE IF NOT EXISTS icc_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'icc_member',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ ICC Members table checked/created');

        console.log('🎉 Database initialization complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

initDb();
