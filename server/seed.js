const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

// Load environment variables
dotenv.config();

/**
 * Seed data: 10 doctors with realistic profiles and 1 test patient.
 * All accounts use password: "password123"
 */
const doctors = [
  {
    user: {
      name: 'Dr. Ananya Sharma',
      email: 'ananya.sharma@hospital.com',
      role: 'doctor',
      phone: '+91-9876543201',
    },
    profile: {
      specialization: 'Cardiologist',
      experience: 15,
      qualification: 'MBBS, MD (Cardiology), DM (Cardiology)',
      consultationFee: 1500,
      hospital: 'Apollo Heart Institute',
      bio: 'Dr. Ananya Sharma is a highly experienced cardiologist specializing in interventional cardiology and heart failure management. She has performed over 3000 cardiac procedures and is renowned for her patient-centric approach.',
      rating: 4.8,
      totalRatings: 245,
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
        { day: 'Friday', startTime: '10:00', endTime: '14:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Rajesh Patel',
      email: 'rajesh.patel@hospital.com',
      role: 'doctor',
      phone: '+91-9876543202',
    },
    profile: {
      specialization: 'Dermatologist',
      experience: 10,
      qualification: 'MBBS, MD (Dermatology)',
      consultationFee: 800,
      hospital: 'SkinCare Clinic & Research Centre',
      bio: 'Dr. Rajesh Patel specializes in cosmetic dermatology, acne treatment, and skin cancer screening. He is a published researcher with over 30 papers in peer-reviewed journals.',
      rating: 4.5,
      totalRatings: 189,
      availableSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '12:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Priya Menon',
      email: 'priya.menon@hospital.com',
      role: 'doctor',
      phone: '+91-9876543203',
    },
    profile: {
      specialization: 'Orthopedic',
      experience: 12,
      qualification: 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement',
      consultationFee: 1200,
      hospital: 'Fortis Bone & Joint Institute',
      bio: 'Dr. Priya Menon is an expert orthopedic surgeon specializing in joint replacement and sports medicine. She has successfully performed over 2000 knee and hip replacement surgeries.',
      rating: 4.7,
      totalRatings: 210,
      availableSlots: [
        { day: 'Monday', startTime: '14:00', endTime: '18:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
        { day: 'Friday', startTime: '09:00', endTime: '13:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Arjun Reddy',
      email: 'arjun.reddy@hospital.com',
      role: 'doctor',
      phone: '+91-9876543204',
    },
    profile: {
      specialization: 'Pediatrician',
      experience: 8,
      qualification: 'MBBS, MD (Pediatrics), IAP Fellowship in Neonatology',
      consultationFee: 700,
      hospital: 'Rainbow Children\'s Hospital',
      bio: 'Dr. Arjun Reddy is a compassionate pediatrician with expertise in neonatal care, childhood infections, and developmental disorders. He is known for his gentle approach with young patients.',
      rating: 4.9,
      totalRatings: 320,
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00' },
        { day: 'Thursday', startTime: '14:00', endTime: '17:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Sneha Iyer',
      email: 'sneha.iyer@hospital.com',
      role: 'doctor',
      phone: '+91-9876543205',
    },
    profile: {
      specialization: 'Neurologist',
      experience: 18,
      qualification: 'MBBS, MD (Internal Medicine), DM (Neurology)',
      consultationFee: 2000,
      hospital: 'NIMHANS Affiliated Clinic',
      bio: 'Dr. Sneha Iyer is a leading neurologist specializing in epilepsy management, stroke rehabilitation, and neurodegenerative diseases. She has 18 years of clinical and research experience.',
      rating: 4.6,
      totalRatings: 175,
      availableSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '13:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '13:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Vikram Singh',
      email: 'vikram.singh@hospital.com',
      role: 'doctor',
      phone: '+91-9876543206',
    },
    profile: {
      specialization: 'General Physician',
      experience: 20,
      qualification: 'MBBS, MD (General Medicine)',
      consultationFee: 500,
      hospital: 'City General Hospital',
      bio: 'Dr. Vikram Singh is a seasoned general physician with 20 years of experience in primary care, chronic disease management, and preventive medicine. He believes in holistic, evidence-based treatment.',
      rating: 4.4,
      totalRatings: 410,
      availableSlots: [
        { day: 'Monday', startTime: '08:00', endTime: '12:00' },
        { day: 'Tuesday', startTime: '08:00', endTime: '12:00' },
        { day: 'Wednesday', startTime: '08:00', endTime: '12:00' },
        { day: 'Thursday', startTime: '08:00', endTime: '12:00' },
        { day: 'Friday', startTime: '08:00', endTime: '12:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Fatima Khan',
      email: 'fatima.khan@hospital.com',
      role: 'doctor',
      phone: '+91-9876543207',
    },
    profile: {
      specialization: 'Gynecologist',
      experience: 14,
      qualification: 'MBBS, MS (Obstetrics & Gynecology), Fellowship in Reproductive Medicine',
      consultationFee: 1000,
      hospital: 'Motherhood Hospital',
      bio: 'Dr. Fatima Khan is an experienced gynecologist and obstetrician specializing in high-risk pregnancies, fertility treatments, and minimally invasive gynecological surgeries.',
      rating: 4.7,
      totalRatings: 280,
      availableSlots: [
        { day: 'Monday', startTime: '10:00', endTime: '14:00' },
        { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
        { day: 'Friday', startTime: '10:00', endTime: '14:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Karthik Nair',
      email: 'karthik.nair@hospital.com',
      role: 'doctor',
      phone: '+91-9876543208',
    },
    profile: {
      specialization: 'Ophthalmologist',
      experience: 11,
      qualification: 'MBBS, MS (Ophthalmology), Fellowship in Vitreo-Retinal Surgery',
      consultationFee: 900,
      hospital: 'Sankara Eye Hospital',
      bio: 'Dr. Karthik Nair specializes in cataract surgery, LASIK, and retinal disorders. He has performed over 5000 successful eye surgeries using the latest technologies.',
      rating: 4.5,
      totalRatings: 195,
      availableSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '11:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Deepa Gupta',
      email: 'deepa.gupta@hospital.com',
      role: 'doctor',
      phone: '+91-9876543209',
    },
    profile: {
      specialization: 'Psychiatrist',
      experience: 9,
      qualification: 'MBBS, MD (Psychiatry)',
      consultationFee: 1100,
      hospital: 'Mindwell Psychiatry Centre',
      bio: 'Dr. Deepa Gupta is a compassionate psychiatrist specializing in anxiety disorders, depression, bipolar disorder, and addiction medicine. She integrates therapy with medical management for optimal outcomes.',
      rating: 4.8,
      totalRatings: 150,
      availableSlots: [
        { day: 'Monday', startTime: '11:00', endTime: '15:00' },
        { day: 'Wednesday', startTime: '11:00', endTime: '15:00' },
        { day: 'Friday', startTime: '11:00', endTime: '15:00' },
      ],
    },
  },
  {
    user: {
      name: 'Dr. Suresh Kumar',
      email: 'suresh.kumar@hospital.com',
      role: 'doctor',
      phone: '+91-9876543210',
    },
    profile: {
      specialization: 'ENT Specialist',
      experience: 13,
      qualification: 'MBBS, MS (ENT), Fellowship in Head & Neck Surgery',
      consultationFee: 750,
      hospital: 'Max Super Speciality Hospital',
      bio: 'Dr. Suresh Kumar is a senior ENT specialist with expertise in sinus surgery, cochlear implants, and head & neck oncology. He is passionate about restoring hearing and quality of life for his patients.',
      rating: 4.3,
      totalRatings: 165,
      availableSlots: [
        { day: 'Tuesday', startTime: '14:00', endTime: '18:00' },
        { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
      ],
    },
  },
];

const testPatient = {
  name: 'Test Patient',
  email: 'patient@test.com',
  role: 'patient',
  phone: '+91-9876543200',
};

/**
 * Main seed function.
 * Clears existing data and inserts fresh seed records.
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Prescription.deleteMany({});
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    console.log('   ✓ All collections cleared');

    // Create test patient
    console.log('\n👤 Creating test patient...');
    const patient = await User.create({
      ...testPatient,
      password: 'password123',
    });
    console.log(`   ✓ Patient: ${patient.name} (${patient.email})`);

    // Create doctors
    console.log('\n🩺 Creating doctor accounts...');
    for (const doc of doctors) {
      const user = await User.create({
        ...doc.user,
        password: 'password123',
      });

      const doctorProfile = await Doctor.create({
        userId: user._id,
        ...doc.profile,
      });

      console.log(
        `   ✓ ${user.name} — ${doc.profile.specialization} (${doc.profile.experience} yrs exp, ₹${doc.profile.consultationFee})`
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Database seeded successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 Test Credentials:');
    console.log('   Patient: patient@test.com / password123');
    console.log('   Doctor:  ananya.sharma@hospital.com / password123');
    console.log('            (and 9 other doctor accounts)');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Import Prescription and Appointment for cleanup
const Prescription = require('./models/Prescription');
const Appointment = require('./models/Appointment');

// Run the seed
seedDatabase();
