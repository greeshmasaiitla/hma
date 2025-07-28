# Hospital Management System - Automatic Data Flow

This hospital management system implements automatic data flow across all dashboards. Once data is entered once, it automatically appears in all relevant dashboards without manual re-entry.

## Key Features

### 🔄 Automatic Data Flow
- **Appointment Booking**: When a receptionist books an appointment, it automatically appears in:
  - Patient's upcoming appointments
  - Doctor's daily schedule
  - Receptionist's today's appointments
  - Admin's appointment overview

- **Prescription Management**: When a doctor adds a prescription, it automatically appears in:
  - Patient's prescription history
  - Doctor's prescription records
  - Patient's health summary

- **Real-time Updates**: All changes are reflected immediately across all dashboards using Socket.IO

### 📊 Dashboard Integration

#### Patient Dashboard
- **Upcoming Appointments**: Shows all scheduled appointments for the patient
- **Prescription History**: Displays all prescriptions written by doctors
- **Health Summary**: Shows updated health information from doctor visits

#### Doctor Dashboard
- **Daily Schedule**: Shows today's appointments
- **Assigned Patients**: Lists patients who have appointments with the doctor
- **Completed Appointments**: Shows past completed appointments
- **Prescription Management**: Dropdown to select patients and add prescriptions

#### Receptionist Dashboard
- **Today's Appointments**: Real-time view of today's schedule
- **Conflict Warnings**: Automatic detection of scheduling conflicts
- **Patient Management**: Add and manage patient records
- **Appointment Management**: Book and modify appointments

#### Admin Dashboard
- **Overview Metrics**: Total appointments, patients, doctors, receptionists
- **Recent Activity**: Latest appointments, patients, and doctors
- **System Management**: User management and system configuration

### 🚀 How It Works

1. **Data Entry**: Data is entered once through the appropriate interface
2. **Database Storage**: Data is stored in MongoDB with proper relationships
3. **Real-time Emission**: Socket.IO events are emitted when data changes
4. **Automatic Updates**: All connected dashboards receive updates and refresh automatically
5. **Role-based Display**: Each dashboard shows only relevant data based on user role

### 🛠️ Technical Implementation

#### Backend (Node.js + Express + MongoDB)
- **Real-time Events**: Socket.IO for instant updates
- **Database Models**: Proper relationships between appointments, patients, doctors, prescriptions
- **API Routes**: RESTful endpoints with automatic data population
- **Middleware**: Authentication and role-based access control

#### Frontend (React)
- **Socket Integration**: Real-time updates across all components
- **Role-based Routing**: Different dashboards for different user types
- **Automatic Refresh**: Components update when relevant data changes
- **User Context**: Global state management for user information

### 📋 Setup Instructions

1. **Install Dependencies**
   ```bash
   # Backend
   cd backends
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. **Start MongoDB**
   ```bash
   mongod
   ```

3. **Seed Sample Data**
   ```bash
   cd backends
   node scripts/seedSampleData.js
   ```

4. **Start the Application**
   ```bash
   # Backend (Terminal 1)
   cd backends
   npm start

   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

### 🧪 Testing the Automatic Flow

1. **Login as Receptionist**
   - Email: `receptionist@hospital.com`
   - Book a new appointment

2. **Login as Patient**
   - Email: `john@example.com`
   - Check "Upcoming Appointments" - the new appointment should appear

3. **Login as Doctor**
   - Email: `anjali@hospital.com`
   - Check "Daily Schedule" - the appointment should appear
   - Go to "Manage Prescriptions" and add a prescription for a patient

4. **Login as Patient Again**
   - Check "Prescription History" - the new prescription should appear

### 🔧 Key Components

- **Socket Events**: `appointmentCreated`, `prescriptionAdded`, `dashboardUpdate`
- **Real-time Updates**: All dashboards listen for relevant events
- **Data Relationships**: Proper MongoDB references between collections
- **Role-based Access**: Each user sees only relevant information

### 📈 Benefits

- **No Manual Re-entry**: Data entered once appears everywhere it's needed
- **Real-time Updates**: Changes are reflected immediately across all dashboards
- **Reduced Errors**: Single source of truth eliminates data inconsistencies
- **Improved Efficiency**: Staff can focus on patient care rather than data entry
- **Better User Experience**: Patients see their information updated in real-time

This system ensures that once any data is entered (appointments, prescriptions, patient info), it automatically flows to all relevant dashboards without requiring manual re-entry, exactly as requested. 