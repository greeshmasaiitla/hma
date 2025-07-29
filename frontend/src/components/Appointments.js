// Appointments.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../HospitalStyles.css';
import socket from '../socket';
import { useCombobox } from 'downshift';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ 
    patient: '', 
    doctor: '', 
    date: '', 
    time: '', 
    datetime: '', 
    status: 'Scheduled' 
  });
  const [editingId, setEditingId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showFuture, setShowFuture] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPageToday, setCurrentPageToday] = useState(1);
  const [currentPageFuture, setCurrentPageFuture] = useState(1);
  const pageSize = 5;
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [waitlist, setWaitlist] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err.response?.data || err.message);
      toast.error('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/doctors`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setDoctors(res.data);
  };

  const fetchPatients = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/patients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setPatients(res.data);
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    // Real-time updates
    socket.on('appointmentCreated', fetchAppointments);
    socket.on('appointmentUpdated', fetchAppointments);
    return () => {
      socket.off('appointmentCreated', fetchAppointments);
      socket.off('appointmentUpdated', fetchAppointments);
    };
  }, []);

  const handleSlotSelect = (e) => {
    setSelectedSlot(e.target.value);
    if (e.target.value) {
      const slotDate = new Date(e.target.value);
      setForm({ 
        ...form, 
        date: slotDate.toISOString().split('T')[0],
        time: slotDate.toTimeString().slice(0, 5),
        datetime: e.target.value 
      });
    }
  };

  const handleSubmit = async () => {
    const { patient, doctor, datetime, status } = form;
    if (!patient || !doctor || !datetime) {
      toast.error('Please complete all fields');
      return;
    }

    // Check if slot is already booked
    const slotTaken = appointments.some(a => a.doctor === doctor && a.datetime === datetime);
    if (!editingId && slotTaken) {
      setWaitlist(wl => [...wl, { patient, doctor, datetime }]);
      toast.info('Slot is booked. Patient added to waitlist.');
      setForm({ patient: '', doctor: '', datetime: '', status: 'Scheduled' });
      setEditingId(null);
      return;
    }

    try {
      const payload = {
        patient,
        doctor,
        datetime,
        status: editingId ? status : 'Scheduled',
      };
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/appointments/${editingId}`, payload, { headers });
        toast.success('Appointment updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/appointments`, payload, { headers });
        toast.success('Appointment scheduled successfully!');
      }
      
      setForm({ patient: '', doctor: '', datetime: '', status: 'Scheduled' });
      setEditingId(null);
      fetchAppointments();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
        
        // If patient or doctor not found, suggest adding them
        if (errorMessage.includes('Patient not found')) {
          toast.info('Please add the patient to the database first before booking appointment.');
        } else if (errorMessage.includes('Doctor not found')) {
          toast.info('Please add the doctor to the database first before booking appointment.');
        }
      } else {
        toast.error('Error saving appointment. Please try again.');
      }
    }
  };

  const handleEdit = (a) => {
    const appointmentDate = new Date(a.datetime);
    
    // Get patient and doctor names with fallbacks for different data structures
    const patientName = a.patient && typeof a.patient === 'object' ? 
                       (a.patient.name || a.patient.Name || a.patient.patientName || '') : 
                       patients.find(p => p._id === a.patient)?.name || 
                       patients.find(p => p._id === a.patient)?.Name || 
                       patients.find(p => p._id === a.patient)?.patientName || '';
    
    const doctorName = a.doctor && typeof a.doctor === 'object' ? 
                      (a.doctor.name || a.doctor.Name || a.doctor.doctorName || '') : 
                      doctors.find(d => d._id === a.doctor)?.name || 
                      doctors.find(d => d._id === a.doctor)?.Name || 
                      doctors.find(d => d._id === a.doctor)?.doctorName || '';
    
    console.log('Editing appointment - Patient:', a.patient, 'Patient Name:', patientName);
    console.log('Editing appointment - Doctor:', a.doctor, 'Doctor Name:', doctorName);
    
    setForm({
      patient: a.patient,
      doctor: a.doctor,
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      datetime: a.datetime,
      status: a.status || 'Scheduled',
    });
    
    // Update input fields with names
    setInputPatient(patientName);
    setInputDoctor(doctorName);
    
    setSelectedDoctorId(a.doctor);
    setSelectedSlot(a.datetime);
    setEditingId(a._id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/appointments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.info('Appointment deleted successfully.');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to delete appointment. Please try again.');
    }
  };

  // Update status from list
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/appointments/${id}`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const futureLimit = new Date();
  futureLimit.setDate(today.getDate() + 20);

  const isTodayOrTomorrow = (dateStr) => {
    const date = new Date(dateStr);
    return (
      date.toDateString() === today.toDateString() ||
      date.toDateString() === tomorrow.toDateString()
    );
  };

  const isWithinNext20Days = (dateStr) => {
    const date = new Date(dateStr);
    return date > tomorrow && date <= futureLimit;
  };

  // Filter appointments based on search
  const filteredAppointments = appointments.filter(a => {
    const doctor = doctors.find(d => d._id === a.doctor);
    const patient = patients.find(p => p._id === a.patient);
    const doctorName = doctor ? doctor.fullName : 'Unknown';
    const patientName = patient ? patient.fullName : 'Unknown';
    const matchesDoctor = doctorName.toLowerCase().includes(searchDoctor.toLowerCase());
    const matchesPatient = patientName.toLowerCase().includes(searchPatient.toLowerCase());
    return matchesDoctor && matchesPatient;
  });

  // Get the selected doctor's available slots
  const todayTomorrowAppointments = filteredAppointments.filter((a) => isTodayOrTomorrow(a.datetime));
  const futureAppointments = filteredAppointments.filter((a) => isWithinNext20Days(a.datetime));
  const totalPagesToday = Math.ceil(todayTomorrowAppointments.length / pageSize);
  const totalPagesFuture = Math.ceil(futureAppointments.length / pageSize);
  const paginatedToday = todayTomorrowAppointments.slice((currentPageToday - 1) * pageSize, currentPageToday * pageSize);
  const paginatedFuture = futureAppointments.slice((currentPageFuture - 1) * pageSize, currentPageFuture * pageSize);

  // CSV export function
  function exportAppointmentsToCSV() {
    const headers = ['Patient Name', 'Doctor Name', 'Date', 'Time', 'Status'];
    const rows = filteredAppointments.map(a => [
      a.patientName,
      a.doctorName,
      a.date ? new Date(a.date).toISOString().slice(0, 10) : '',
      Array.isArray(a.time) ? a.time.join('; ') : String(a.time).replace(/"/g, ''),
      a.status || 'Scheduled'
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const canBook = form.patient && form.doctor && form.datetime;

  // Helper to add new patient
  const addNewPatient = async (name) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5000/patients', { name }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.data.patient;
  };
  // Helper to add new doctor
  const addNewDoctor = async (name) => {
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5000/doctors', { name, specialization: '', experience: 0, qualification: '', availableSlots: [] }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.data;
  };

  // Downshift for patient
  const [inputPatient, setInputPatient] = useState('');
  
  const {
    isOpen: isPatientOpen,
    getMenuProps: getPatientMenuProps,
    getInputProps: getPatientInputProps,
    getItemProps: getPatientItemProps,
    highlightedIndex: highlightedPatientIndex,
  } = useCombobox({
    items: patients.filter(p => {
      const name = p.fullName || '';
      return name.toLowerCase().includes((inputPatient || '').toLowerCase());
    }),
    itemToString: (item) => (item ? item.fullName || '' : ''),
    onInputValueChange: ({ inputValue }) => {
      setInputPatient(inputValue || '');
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        const patientName = selectedItem.fullName || '';
        const patientId = selectedItem._id || selectedItem.id;
        if (patientName && patientId) {
          setForm(f => ({ ...f, patient: patientId }));
          setInputPatient(patientName);
        }
      }
    },
  });
  // Downshift for doctor
  const [inputDoctor, setInputDoctor] = useState('');
  const {
    isOpen: isDoctorOpen,
    getMenuProps: getDoctorMenuProps,
    getInputProps: getDoctorInputProps,
    getItemProps: getDoctorItemProps,
    highlightedIndex: highlightedDoctorIndex,
  } = useCombobox({
    items: doctors.filter(d => d.fullName && d.fullName.toLowerCase().includes(inputDoctor.toLowerCase())),
    itemToString: (item) => (item ? item.fullName || '' : ''),
    onInputValueChange: ({ inputValue }) => setInputDoctor(inputValue || ''),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSelectedDoctorId(selectedItem._id);
        setForm(f => ({ ...f, doctor: selectedItem._id }));
        setInputDoctor(selectedItem.fullName || '');
      }
    },
  });

  return (
    <div className="container">
      <h3 className="section-title">Schedule Appointment</h3>

      <div className="form-section">
      <div style={{ marginBottom: 12 }}>
        <label>Patient</label>
        <input 
          {...getPatientInputProps({ 
            placeholder: 'Type or select patient...'
          })} 
          style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb' }} 
        />
        <ul {...getPatientMenuProps()} style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 120, overflowY: 'auto', background: '#fff', border: isPatientOpen ? '1px solid #bbb' : 'none', borderRadius: 8, position: 'absolute', zIndex: 10, width: '100%' }}>
          {isPatientOpen && patients.filter(p => {
            const name = p.fullName || '';
            return name.toLowerCase().includes(inputPatient.toLowerCase());
          }).map((item, index) => (
            <li key={item._id || item.id} {...getPatientItemProps({ item, index })} style={{ background: highlightedPatientIndex === index ? '#f1f5f9' : '#fff', padding: 8, cursor: 'pointer' }}>
              {item.fullName || 'Unknown Patient'}
            </li>
          ))}
          {isPatientOpen && inputPatient && !patients.some(p => {
            const name = p.fullName || '';
            return name.toLowerCase() === inputPatient.toLowerCase();
          }) && (
            <li style={{ background: '#e0f2fe', padding: 8, cursor: 'pointer' }} onClick={async () => {
              const newPatient = await addNewPatient(inputPatient);
              setPatients(ps => [...ps, newPatient]);
              setForm(f => ({ ...f, patient: newPatient._id }));
              setInputPatient('');
            }}>+ Add "{inputPatient}" as new patient</li>
          )}
        </ul>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Doctor</label>
        <input {...getDoctorInputProps({ placeholder: 'Type or select doctor...' })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb' }} />
        <ul {...getDoctorMenuProps()} style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 120, overflowY: 'auto', background: '#fff', border: isDoctorOpen ? '1px solid #bbb' : 'none', borderRadius: 8, position: 'absolute', zIndex: 10, width: '100%' }}>
          {isDoctorOpen && doctors.filter(d => d.fullName && d.fullName.toLowerCase().includes(inputDoctor.toLowerCase())).map((item, index) => (
            <li key={item._id} {...getDoctorItemProps({ item, index })} style={{ background: highlightedDoctorIndex === index ? '#f1f5f9' : '#fff', padding: 8, cursor: 'pointer' }}>{item.fullName}</li>
          ))}
          {isDoctorOpen && inputDoctor && !doctors.some(d => d.fullName && d.fullName.toLowerCase() === inputDoctor.toLowerCase()) && (
            <li style={{ background: '#e0f2fe', padding: 8, cursor: 'pointer' }} onClick={async () => {
              const newDoctor = await addNewDoctor(inputDoctor);
              setDoctors(ds => [...ds, newDoctor]);
              setForm(f => ({ ...f, doctor: newDoctor._id }));
              setInputDoctor('');
            }}>+ Add "{inputDoctor}" as new doctor</li>
          )}
        </ul>
      </div>

      {/* Available Slots for Selected Doctor */}
      {selectedDoctorId && (
        <div style={{ marginBottom: 12 }}>
          <label>Available Slots</label>
          <select 
            name="datetime" 
            value={selectedSlot} 
            onChange={handleSlotSelect}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb' }}
          >
        <option value="">Select Available Slot</option>
        {doctors.find(d => d._id === selectedDoctorId)?.availableSlots?.map((slot, idx) => (
              <option key={idx} value={slot.start}>
                {`${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}`}
              </option>
        ))}
      </select>
        </div>
      )}

      {/* Manual Date and Time Selection */}
      <div style={{ marginBottom: 12 }}>
        <label>Or Select Date & Time Manually</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Date</label>
            <input
              type="date"
              value={form.date || ''}
              onChange={e => {
                const selectedDate = e.target.value;
                setForm(f => ({ ...f, date: selectedDate }));
                // Combine date and time for datetime field
                if (form.time) {
                  const datetime = new Date(`${selectedDate}T${form.time}`);
                  setForm(f => ({ ...f, datetime: datetime.toISOString() }));
                }
              }}
              min={new Date().toISOString().split('T')[0]} // Can't book past dates
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Time</label>
            <input
              type="time"
              value={form.time || ''}
              onChange={e => {
                const selectedTime = e.target.value;
                setForm(f => ({ ...f, time: selectedTime }));
                // Combine date and time for datetime field
                if (form.date) {
                  const datetime = new Date(`${form.date}T${selectedTime}`);
                  setForm(f => ({ ...f, datetime: datetime.toISOString() }));
                }
              }}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb' }}
            />
          </div>
        </div>
      </div>

      {/* Show selected date/time */}
      {form.datetime && (
        <div style={{ marginBottom: 12, padding: 8, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
          <strong>Selected Appointment:</strong> {new Date(form.datetime).toLocaleString()}
        </div>
      )}

      {editingId && (
        <select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #bbb', marginBottom: 12 }}>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      )}
      </div>
      <button onClick={handleSubmit} disabled={!canBook} style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
        {editingId ? 'Update Appointment' : 'Add Appointment'}
      </button>

      <h3 className="section-title" style={{fontSize: '1.2rem'}}>Search Appointments</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
      <input
        type="text"
          className="search"
        placeholder="Search by Doctor Name"
        value={searchDoctor}
          onChange={(e) => { setSearchDoctor(e.target.value); setCurrentPageToday(1); setCurrentPageFuture(1); }}
      />
      <input
        type="text"
          className="search"
        placeholder="Search by Patient Name"
        value={searchPatient}
          onChange={(e) => { setSearchPatient(e.target.value); setCurrentPageToday(1); setCurrentPageFuture(1); }}
        />
        <input
          type="date"
          value={dateStart}
          onChange={e => { setDateStart(e.target.value); setCurrentPageToday(1); setCurrentPageFuture(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', minWidth: 140 }}
        />
        <input
          type="date"
          value={dateEnd}
          onChange={e => { setDateEnd(e.target.value); setCurrentPageToday(1); setCurrentPageFuture(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', minWidth: 140 }}
        />
      </div>

      <h3 className="section-title" style={{fontSize: '1.2rem'}}>Today & Tomorrow's Appointments</h3>
      <button onClick={exportAppointmentsToCSV} style={{marginBottom: 12, marginRight: 12}}>Export to CSV</button>
      {todayTomorrowAppointments.length === 0 && (
        loading ? (
          <div style={{textAlign:'center', margin:'20px'}}>
            <span className="spinner" /> Loading appointments...
          </div>
        ) : null
      )}
      {paginatedToday.map((a) => (
        <div key={a._id} className="card">
          <p>
            <b>
              {a.patient && typeof a.patient === 'object' ? a.patient.fullName : 
               patients.find(p => p._id === a.patient)?.fullName || 'Unknown Patient'}
            </b> with Dr. <b>
              {a.doctor && typeof a.doctor === 'object' ? a.doctor.fullName : 
               doctors.find(d => d._id === a.doctor)?.fullName || 'Unknown Doctor'}
            </b> on {a.datetime ? new Date(a.datetime).toLocaleString() : ''}
            {a.recurrence && <span style={{marginLeft:8, color:'#2563eb', fontWeight:500}}>[{a.recurrence}]</span>}
          </p>
          <p>Status: <strong>{a.status || 'Scheduled'}</strong></p>
          <select value={a.status || 'Scheduled'} onChange={e => handleStatusChange(a._id, e.target.value)} style={{marginBottom:8}}>
            <option value="Scheduled">Scheduled</option>
            <option value="Checked-in">Checked-in</option>
            <option value="In-progress">In-progress</option>
            <option value="No-show">No-show</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button onClick={() => handleEdit(a)}>Edit</button>
          <button onClick={() => handleDelete(a._id)} className="danger" style={{ marginLeft: '10px' }}>
            Delete
          </button>
        </div>
      ))}
      {/* Pagination Controls for Today & Tomorrow */}
      {totalPagesToday > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
          <button onClick={() => setCurrentPageToday((p) => Math.max(1, p - 1))} disabled={currentPageToday === 1} style={{marginRight:8}}>
            Prev
          </button>
          {[...Array(totalPagesToday)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPageToday(idx + 1)}
              style={{ fontWeight: currentPageToday === idx + 1 ? 'bold' : 'normal', marginRight: 4 }}
              disabled={currentPageToday === idx + 1}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPageToday((p) => Math.min(totalPagesToday, p + 1))} disabled={currentPageToday === totalPagesToday} style={{marginLeft:8}}>
            Next
          </button>
        </div>
      )}

      {/* Future Appointments Toggle Button */}
      <button
        className="future-appointments-btn"
        onClick={() => setShowFuture(!showFuture)}
        aria-pressed={showFuture}
        type="button"
      >
        {showFuture ? 'Hide Future Appointments (Next 20 Days)' : 'Show Future Appointments (Next 20 Days)'}
      </button>

      {showFuture &&
        (futureAppointments.length === 0 && (
          loading ? (
            <div style={{textAlign:'center', margin:'20px'}}>
              <span className="spinner" /> Loading appointments...
            </div>
          ) : null
        ))}
      {showFuture &&
        paginatedFuture.map((a) => (
          <div
            key={a._id}
            className="card"
            style={{ background: '#f9f9f9' }}
          >
            <p>
              <b>
                {(() => {
                  if (a.patient && typeof a.patient === 'object' && a.patient.fullName) {
                    return a.patient.fullName;
                  } else if (a.patient) {
                    // If patient is just an ID, find it in the patients array
                    const patient = patients.find(p => p._id === a.patient);
                    return patient ? patient.fullName : 'Unknown Patient';
                  }
                  return 'Unknown Patient';
                })()}
              </b> with Dr. <b>
                {(() => {
                  if (a.doctor && typeof a.doctor === 'object' && a.doctor.fullName) {
                    return a.doctor.fullName;
                  } else if (a.doctor) {
                    // If doctor is just an ID, find it in the doctors array
                    const doctor = doctors.find(d => d._id === a.doctor);
                    return doctor ? doctor.fullName : 'Unknown Doctor';
                  }
                  return 'Unknown Doctor';
                })()}
              </b> on {a.datetime ? new Date(a.datetime).toLocaleString() : ''}
            </p>
            <p>Status: <strong>{a.status || 'Scheduled'}</strong></p>
            <button onClick={() => handleEdit(a)}>Edit</button>
            <button onClick={() => handleDelete(a._id)} className="danger" style={{ marginLeft: '10px' }}>
              Delete
            </button>
          </div>
        ))}
      {/* Pagination Controls for Future Appointments */}
      {showFuture && totalPagesFuture > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
          <button onClick={() => setCurrentPageFuture((p) => Math.max(1, p - 1))} disabled={currentPageFuture === 1} style={{marginRight:8}}>
            Prev
          </button>
          {[...Array(totalPagesFuture)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPageFuture(idx + 1)}
              style={{ fontWeight: currentPageFuture === idx + 1 ? 'bold' : 'normal', marginRight: 4 }}
              disabled={currentPageFuture === idx + 1}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPageFuture((p) => Math.min(totalPagesFuture, p + 1))} disabled={currentPageFuture === totalPagesFuture} style={{marginLeft:8}}>
            Next
              </button>
        </div>
      )}

      {/* Waitlist Section */}
      {waitlist.length > 0 && (
        <div style={{marginTop:32}}>
          <h3 className="section-title" style={{fontSize:'1.1rem'}}>Waitlist</h3>
          {waitlist.map((w, idx) => (
            <div key={idx} className="card" style={{background:'#fffbe6'}}>
              <p><b>{w.patientName}</b> waiting for Dr. <b>{w.doctorName}</b> on {w.date} at {w.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
