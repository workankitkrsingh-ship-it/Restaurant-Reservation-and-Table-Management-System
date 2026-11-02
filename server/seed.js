const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');

dotenv.config();

const initialTables = [
  { tableNumber: 101, capacity: 2, location: 'Window Side', status: 'Available', features: ['Botanical View', 'Natural Light'] },
  { tableNumber: 102, capacity: 2, location: 'Window Side', status: 'Reserved', features: ['Corner Nook', 'Intimate Setting'] },
  { tableNumber: 103, capacity: 4, location: 'Indoor', status: 'Available', features: ['Velvet Banquette', 'Main Dining'] },
  { tableNumber: 104, capacity: 4, location: 'Indoor', status: 'Occupied', features: ['Chef Kitchen View', 'Sommelier Table'] },
  { tableNumber: 105, capacity: 6, location: 'Outdoor Patio', status: 'Available', features: ['Olive Tree Terrace', 'Pergola Shade'] },
  { tableNumber: 106, capacity: 6, location: 'Outdoor Patio', status: 'Available', features: ['Courtyard Fountain', 'Breeze Seating'] },
  { tableNumber: 107, capacity: 8, location: 'Private Lounge', status: 'Reserved', features: ['Glass Conservatory', 'Private Server'] },
  { tableNumber: 108, capacity: 10, location: 'Private Lounge', status: 'Available', features: ['Grand Tasting Room', 'AV Equipped'] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas (cluster0.qs0ni8c.mongodb.net) successfully!');

    await Reservation.deleteMany();
    await Table.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      name: 'Head Maitre D (Admin)',
      email: 'admin@restaurant.com',
      phone: '+91 98765 43210',
      password: 'password123',
      role: 'admin',
    });

    const guest = await User.create({
      name: 'Ankit Singh',
      email: 'user@restaurant.com',
      phone: '+91 91234 56789',
      password: 'password123',
      role: 'user',
    });

    const createdTables = await Table.insertMany(initialTables);
    const todayStr = new Date().toISOString().split('T')[0];

    await Reservation.insertMany([
      {
        user: guest._id,
        customerName: 'Ankit Singh',
        customerEmail: 'user@restaurant.com',
        customerPhone: '+91 91234 56789',
        table: createdTables[1]._id, // Table #102
        date: todayStr,
        timeSlot: '19:30',
        guests: 2,
        status: 'Confirmed',
        specialRequests: 'Quiet window table with sparkling water on arrival',
      },
      {
        user: admin._id,
        customerName: 'Rohan Kapoor',
        customerEmail: 'rohan@example.com',
        customerPhone: '+91 99887 76655',
        table: createdTables[3]._id, // Table #104
        date: todayStr,
        timeSlot: '20:00',
        guests: 4,
        status: 'Seated',
        specialRequests: 'Chef tasting menu, gluten-free bread',
      },
      {
        user: guest._id,
        customerName: 'Ankit Singh',
        customerEmail: 'user@restaurant.com',
        customerPhone: '+91 91234 56789',
        table: createdTables[6]._id, // Table #107
        date: todayStr,
        timeSlot: '21:00',
        guests: 8,
        status: 'Confirmed',
        specialRequests: 'Family celebration in the Glass Conservatory',
      },
    ]);

    console.log('Database seeded with 8 tables (101-108) and 3 reservations!');
    console.log('Admin Login: admin@restaurant.com / password123');
    console.log('Guest Login: user@restaurant.com / password123');
    console.log('Admin Secret Key: admin_restaurant_2026');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
