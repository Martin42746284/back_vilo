// createAdmin.js - Script pour créer un administrateur
const { User } = require('../models'); 

async function createAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ 
      where: { 
        email: 'admin@test.com' 
      } 
    });
    
    if (adminExists) {
      console.log('❌ Un admin existe déjà avec cet email:', adminExists.email);
      console.log('Rôle:', adminExists.role);
      return;
    }

    // Créer un nouvel administrateur
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin.login@viloassist.com',
      password: 'loginAdmin@25!!vilo', // Sera hashé automatiquement par le hook beforeSave
      phone: '0332178785',
      role: 'admin',
      emailVerified: true,
      isActive: true
    });

    console.log('✅ Admin créé avec succès !');
    console.log('Email:', admin.email);
    console.log('Rôle:', admin.role);
    console.log('Mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error('- ', err.message);
      });
    }
  }
}

// Fonction pour vérifier les admins existants
async function checkExistingAdmins() {
  try {
    const admins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });
    
    if (admins.length === 0) {
      console.log('❌ Aucun administrateur trouvé en base');
    } else {
      console.log(`✅ ${admins.length} administrateur(s) trouvé(s):`);
      admins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName}) - Actif: ${admin.isActive}`);
      });
    }
    
    return admins;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des admins:', error.message);
  }
}

// Script principal
async function main() {
  console.log('🔍 Vérification des administrateurs existants...');
  await checkExistingAdmins();
  
  console.log('\n🔧 Création d\'un nouvel administrateur...');
  await createAdmin();
  
  console.log('\n🔍 Vérification finale...');
  await checkExistingAdmins();
  
  process.exit(0);
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { createAdmin, checkExistingAdmins };