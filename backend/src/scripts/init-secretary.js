const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function initSecretary() {
    try {
        // Check if secretary exists
        const existingSecretary = await User.findOne({
            where: { role: 'secretary' }
        });

        if (!existingSecretary) {
            // Create secretary if doesn't exist
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            await User.create({
                username: 'secretary',
                email: 'secretary@garage.com',
                password: hashedPassword,
                full_name: 'System Administrator',
                id_number: 'SEC001',
                role: 'secretary',
                is_active: true
            });
            console.log('✅ Secretary account created successfully');
        } else {
            console.log('✅ Secretary account already exists');
        }
    } catch (error) {
        console.error('❌ Error initializing secretary account:', error);
    }
}

module.exports = initSecretary;
