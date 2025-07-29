import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../HospitalStyles.css';
import { useUser } from './UserContext';
import Modal from 'react-modal';

const Doctors = () => {
  const { user } = useUser();
  const isManager = user && (user.role === 'admin' || user.role === 'receptionist');
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ fullName: '', specialization: '', experience: '', qualification: '', availableSlots: '' });
  const [editingId, setEditingId] = useState(null);
  const [showList, setShowList] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [searchName, setSearchName] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  // Get unique specializations for filter dropdown
  const specializations = Array.from(new Set(doctors.map(d => d.specialization))).filter(Boolean);
  // Filtered doctors
  const filteredDoctors = doctors.filter(d =>
    (d.fullName || '').toLowerCase().includes(searchName.toLowerCase()) &&
    (filterSpecialization ? d.specialization === filterSpecialization : true)
  );
  const totalPages = Math.ceil(filteredDoctors.length / pageSize);
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [slotRanges, setSlotRanges] = useState([{ start: '', end: '' }]);
  const [credentialsModal, setCredentialsModal] = useState({ open: false, username: '', password: '' });
  const [generatingId, setGeneratingId] = useState(null);

  // Helper to check if credentials exist (for demo, fetch all users or add a field to doctor)
  const [generatedUsernames, setGeneratedUsernames] = useState({});

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/doctors`);
      setDoctors(res.data);
    } catch (err) {
      toast.error('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Fetch all users with doctor role to know which doctors have credentials
    async function fetchGeneratedUsernames() {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/generated-doctor-usernames`);
        setGeneratedUsernames(res.data || {});
      } catch {}
    }
    if (isManager && user.role === 'admin') fetchGeneratedUsernames();
  }, [isManager, user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  const handleSlotChange = (idx, field, value) => {
    setSlotRanges(ranges => ranges.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };
  const addSlotRange = () => setSlotRanges(ranges => [...ranges, { start: '', end: '' }]);
  const removeSlotRange = (idx) => setSlotRanges(ranges => ranges.filter((_, i) => i !== idx));

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Name is required.';
    if (!form.specialization) newErrors.specialization = 'Specialization is required.';
    if (!form.experience || isNaN(form.experience)) newErrors.experience = 'Valid experience is required.';
    if (!form.qualification) newErrors.qualification = 'Qualification is required.';
    
    // Check if at least one slot range is filled
    const validSlots = slotRanges.filter(s => s.start && s.end);
    if (validSlots.length === 0) {
      newErrors.availableSlots = 'At least one available slot is required.';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    setUploadedFiles([]);
    const payload = {
      fullName: form.fullName,
      specialization: form.specialization,
      experience: form.experience,
      qualification: form.qualification,
      availableSlots: slotRanges.filter(s => s.start && s.end),
    };
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/doctors/${editingId}`, payload);
        toast.success('Doctor updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/doctors`, payload);
        toast.success('Doctor added successfully!');
      }
      setForm({ fullName: '', specialization: '', experience: '', qualification: '', availableSlots: '' });
      setSlotRanges([{ start: '', end: '' }]);
      setEditingId(null);
      fetchDoctors();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error saving doctor. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (doctor) => {
    setForm({
      fullName: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      qualification: doctor.qualification,
      availableSlots: '',
    });
    setSlotRanges(
      Array.isArray(doctor.availableSlots) && doctor.availableSlots.length > 0
        ? doctor.availableSlots.map(s => ({
            start: s.start ? new Date(s.start).toISOString().slice(0, 16) : '',
            end: s.end ? new Date(s.end).toISOString().slice(0, 16) : '',
          }))
        : [{ start: '', end: '' }]
    );
    setEditingId(doctor._id);
    setTimeout(() => {
      if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/doctors/${id}`);
      toast.info('Doctor deleted successfully.');
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to delete doctor. Please try again.');
    }
  };

  const handleGenerateCredentials = async (doctor) => {
    setGeneratingId(doctor._id);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/doctors/${doctor._id}/generate-credentials`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredentialsModal({ open: true, username: res.data.username, password: res.data.password });
      setGeneratedUsernames((prev) => ({ ...prev, [doctor._id]: true }));
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info('Credentials already generated for this doctor.');
        setGeneratedUsernames((prev) => ({ ...prev, [doctor._id]: true }));
      } else {
        toast.error('Failed to generate credentials.');
      }
    } finally {
      setGeneratingId(null);
    }
  };

  // CSV export function
  function exportDoctorsToCSV() {
    const headers = ['Name', 'Specialization', 'Experience', 'Qualification', 'Available Slots'];
    const rows = filteredDoctors.map(d => [
      d.fullName,
      d.specialization,
      d.experience,
      d.qualification,
      (d.availableSlots || []).join('; ')
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {isManager && (
        <div className="form-card" ref={formRef}>
          <h3 style={{textAlign:'center', marginBottom:18}}>Manage Doctors</h3>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-section">
              <div>
                <label className="form-label" htmlFor="doctor-fullName">Name</label>
                <input id="doctor-fullName" name="fullName" placeholder="Name" value={form.fullName} onChange={handleChange} autoFocus />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>
              <div>
                <label className="form-label" htmlFor="doctor-specialization">Specialization</label>
                <input id="doctor-specialization" name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} />
                {errors.specialization && <span className="form-error">{errors.specialization}</span>}
              </div>
            </div>
            <div className="form-section">
              <div>
                <label className="form-label" htmlFor="doctor-qualification">Qualification</label>
                <input id="doctor-qualification" name="qualification" placeholder="Qualification (e.g., MBBS)" value={form.qualification} onChange={handleChange} />
                {errors.qualification && <span className="form-error">{errors.qualification}</span>}
              </div>
              <div>
                <label className="form-label" htmlFor="doctor-experience">Experience (years)</label>
                <input id="doctor-experience" name="experience" placeholder="Experience (years)" value={form.experience} onChange={handleChange} type="number" min="0" />
                {errors.experience && <span className="form-error">{errors.experience}</span>}
              </div>
            </div>
            <div className="form-section">
              <div style={{flex: 1}}>
                <label className="form-label">Available Slots (Date & Time Ranges)</label>
                {slotRanges.map((slot, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <input
                      type="datetime-local"
                      value={slot.start}
                      onChange={e => handleSlotChange(idx, 'start', e.target.value)}
                      style={{ flex: 1 }}
                      aria-label="Slot Start"
                    />
                    <span>to</span>
                    <input
                      type="datetime-local"
                      value={slot.end}
                      onChange={e => handleSlotChange(idx, 'end', e.target.value)}
                      style={{ flex: 1 }}
                      aria-label="Slot End"
                    />
                    {slotRanges.length > 1 && (
                      <button type="button" onClick={() => removeSlotRange(idx)} style={{marginLeft:4}} aria-label="Remove Slot">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSlotRange} style={{marginTop:4, marginBottom:8}}>Add Slot</button>
                <span className="form-helper">Add one or more available date/time ranges for this doctor.</span>
                {errors.availableSlots && <span className="form-error">{errors.availableSlots}</span>}
              </div>
            </div>
            <div className="form-section">
              <div style={{flex:1}}>
                <label className="form-label" htmlFor="doctor-files">Upload Credentials</label>
                <input id="doctor-files" type="file" multiple onChange={handleFileChange} />
                {uploadedFiles.length > 0 && (
                  <ul style={{marginTop:8, fontSize:13}}>
                    {uploadedFiles.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button type="submit" style={{marginTop:12}}>{editingId ? 'Update Doctor' : 'Add Doctor'}</button>
          </form>
        </div>
      )}
      <button
        className="toggle-list-btn"
        onClick={() => setShowList((prev) => !prev)}
        aria-pressed={showList}
        type="button"
      >
        {showList ? 'Hide Doctors List' : 'Show Doctors List'}
      </button>
      {showList && (
        <>
          <h3>Doctors List</h3>
          <button onClick={exportDoctorsToCSV} style={{marginBottom: 12, marginRight: 12}}>Export to CSV</button>
          {/* Advanced Search/Filter */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by Name"
              value={searchName}
              onChange={e => { setSearchName(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', minWidth: 180 }}
            />
            <select
              value={filterSpecialization}
              onChange={e => { setFilterSpecialization(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', minWidth: 180 }}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div style={{textAlign:'center', margin:'20px'}}>
              <span className="spinner" /> Loading doctors...
            </div>
          ) : (
            paginatedDoctors.map((d) => (
              <div key={d._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <p><b>{d.fullName}</b> — {d.specialization} ({d.experience} yrs)</p>
                <p>Qualification: {d.qualification}</p>
                <p>Available Slots: {(d.availableSlots || []).map((s, i) => s.start && s.end ? `${new Date(s.start).toLocaleString()} - ${new Date(s.end).toLocaleString()}` : '').join('; ')}</p>
                {isManager && user.role === 'admin' && !generatedUsernames[d._id] && (
                  <button onClick={() => handleGenerateCredentials(d)} disabled={generatingId === d._id} style={{ marginLeft: '10px', background: '#2563eb', color: 'white' }}>
                    {generatingId === d._id ? 'Generating...' : 'Generate Credentials'}
                  </button>
                )}
                {isManager && <button onClick={() => handleEdit(d)}>Edit</button>}
                {isManager && <button onClick={() => handleDelete(d._id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>}
              </div>
            ))
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{marginRight:8}}>
                Prev
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{ fontWeight: currentPage === idx + 1 ? 'bold' : 'normal', marginRight: 4 }}
                  disabled={currentPage === idx + 1}
                >
                  {idx + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{marginLeft:8}}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal for showing credentials */}
      <Modal
        isOpen={credentialsModal.open}
        onRequestClose={() => setCredentialsModal({ open: false, username: '', password: '' })}
        contentLabel="Generated Credentials"
        ariaHideApp={false}
        style={{ content: { maxWidth: 400, margin: 'auto', borderRadius: 12, padding: 32 } }}
      >
        <h2>Doctor Credentials</h2>
        <div style={{ margin: '18px 0' }}>
          <div><b>Username:</b> <code>{credentialsModal.username}</code></div>
          <div><b>Password:</b> <code>{credentialsModal.password}</code></div>
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}><b>Please save these credentials and provide them securely to the doctor. This information will not be shown again.</b></div>
        </div>
        <button onClick={() => setCredentialsModal({ open: false, username: '', password: '' })} style={{ background: '#2563eb', color: 'white', borderRadius: 8, padding: '8px 18px' }}>Close</button>
      </Modal>
    </div>
  );
};

export default Doctors;
