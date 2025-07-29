import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../HospitalStyles.css';
import { useUser } from './UserContext';

const CredentialsModal = ({ credentials, onClose }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`Username: ${credentials.username}\nPassword: ${credentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(30,64,175,0.18)', textAlign: 'center' }}>
        <h3>Patient Credentials</h3>
        <div style={{ margin: '18px 0', fontSize: 17 }}>
          <div><b>Username:</b> {credentials.username}</div>
          <div><b>Password:</b> {credentials.password}</div>
        </div>
        <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>
          Please save these credentials and provide them securely to the patient. This information will not be shown again.
        </div>
        <button onClick={handleCopy} style={{ marginRight: 12 }}>{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Patients = () => {
  const { user } = useUser();
  const isManager = user && (user.role === 'admin' || user.role === 'receptionist');
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ fullName: '', age: '', gender: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [filterGender, setFilterGender] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [credentialsModal, setCredentialsModal] = useState(null);
  const [generatedUsernames, setGeneratedUsernames] = useState({});
  const [generatingId, setGeneratingId] = useState(null);
  // Advanced filtered patients
  const filteredPatients = patients.filter((p) => {
      const matchesName = (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender ? p.gender === filterGender : true;
    const matchesMinAge = minAge ? Number(p.age) >= Number(minAge) : true;
    const matchesMaxAge = maxAge ? Number(p.age) <= Number(maxAge) : true;
    return matchesName && matchesGender && matchesMinAge && matchesMaxAge;
  });
  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/patients`);
      setPatients(res.data);
    } catch (err) {
      toast.error('Failed to fetch patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Fetch all users with patient role to know which patients have credentials
    async function fetchGeneratedUsernames() {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/generated-patient-usernames`);
        setGeneratedUsernames(res.data || {});
      } catch {}
    }
    if (isManager) fetchGeneratedUsernames();
  }, [isManager]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Name is required.';
    if (!form.age || isNaN(form.age) || form.age <= 0) newErrors.age = 'Valid age is required.';
    if (!form.gender) newErrors.gender = 'Gender is required.';
    if (!form.email) newErrors.email = 'Email is required for credentials.';
    return newErrors;
  };

  const handleFileChange = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    // For demo, just clear files after submit
    setUploadedFiles([]);
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/patients/${editingId}`, form);
        toast.success('Patient updated successfully!');
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/patients`, form);
        toast.success('Patient added successfully!');
        if (res.data && res.data.credentials && res.data.credentials.password) {
          setCredentialsModal(res.data.credentials);
        }
      }
      setForm({ fullName: '', age: '', gender: '', email: '' });
      setEditingId(null);
      fetchPatients();
    } catch (err) {
      toast.error('Error saving patient. Please try again.');
    }
  };

  const handleEdit = (patient) => {
    setForm({ fullName: patient.fullName || '', age: patient.age, gender: patient.gender, email: patient.email });
    setEditingId(patient._id);
    setTimeout(() => {
      if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/patients/${id}`);
      toast.info('Patient deleted successfully.');
      fetchPatients();
    } catch (err) {
      toast.error('Failed to delete patient. Please try again.');
    }
  };

  const handleGenerateCredentials = async (patient) => {
    setGeneratingId(patient._id);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/patients/${patient._id}/generate-credentials`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredentialsModal({ username: res.data.username, password: res.data.password });
      setGeneratedUsernames((prev) => ({ ...prev, [patient._id]: true }));
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info('Credentials already generated for this patient.');
        setGeneratedUsernames((prev) => ({ ...prev, [patient._id]: true }));
      } else {
        toast.error('Failed to generate credentials.');
      }
    } finally {
      setGeneratingId(null);
    }
  };

  // CSV export function
  function exportPatientsToCSV() {
    const headers = ['Name', 'Age', 'Gender'];
    const rows = filteredPatients.map(p => [
      p.fullName || 'Unknown',
      p.age,
      p.gender
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {credentialsModal && (
        <CredentialsModal credentials={credentialsModal} onClose={() => setCredentialsModal(null)} />
      )}
      {isManager && (
        <div className="form-card" ref={formRef}>
          <h3 style={{textAlign:'center', marginBottom:18}}>Manage Patients</h3>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-section">
              <div>
                <label className="form-label" htmlFor="patient-fullName">Name</label>
                <input id="patient-fullName" name="fullName" placeholder="Name" value={form.fullName} onChange={handleChange} autoFocus />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>
              <div>
                <label className="form-label" htmlFor="patient-age">Age</label>
                <input id="patient-age" name="age" placeholder="Age" type="number" min="0" value={form.age} onChange={handleChange} />
                {errors.age && <span className="form-error">{errors.age}</span>}
              </div>
              <div>
                <label className="form-label" htmlFor="patient-gender">Gender</label>
                <select id="patient-gender" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="form-error">{errors.gender}</span>}
              </div>
              <div>
                <label className="form-label" htmlFor="patient-email">Email</label>
                <input id="patient-email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>
            <div className="form-section">
              <div style={{flex:1}}>
                <label className="form-label" htmlFor="patient-files">Upload Documents</label>
                <input id="patient-files" type="file" multiple onChange={handleFileChange} />
                {uploadedFiles.length > 0 && (
                  <ul style={{marginTop:8, fontSize:13}}>
                    {uploadedFiles.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button type="submit" style={{marginTop:12}}>{editingId ? 'Update Patient' : 'Add Patient'}</button>
          </form>
        </div>
      )}
      <h3>Search Patients</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', minWidth: 180 }}
        />
        <select
          value={filterGender}
          onChange={e => { setFilterGender(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', minWidth: 140 }}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          placeholder="Min Age"
          value={minAge}
          min="0"
          onChange={e => { setMinAge(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', width: 90 }}
        />
        <input
          type="number"
          placeholder="Max Age"
          value={maxAge}
          min="0"
          onChange={e => { setMaxAge(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', width: 90 }}
        />
      </div>
      <button
        className="toggle-list-btn"
        onClick={() => setShowList((prev) => !prev)}
        aria-pressed={showList}
        type="button"
      >
        {showList ? 'Hide Patients List' : 'Show Patients List'}
      </button>
      {showList && (
        <>
          <h3>Patients List</h3>
          <button onClick={exportPatientsToCSV} style={{marginBottom: 12, marginRight: 12}}>Export to CSV</button>
          {loading ? (
            <div style={{textAlign:'center', margin:'20px'}}>
              <span className="spinner" /> Loading patients...
            </div>
          ) : (
            paginatedPatients.map((p) => (
              <div key={p._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <p><b>{p.fullName || 'Unknown'}</b> — {p.age} yrs — {p.gender}</p>
                {isManager && <button onClick={() => handleEdit(p)}>Edit</button>}
                {isManager && <button onClick={() => handleDelete(p._id)} style={{ marginLeft: '10px', color: 'red' }}>
                  Delete
                </button>}
                {isManager && !generatedUsernames[p._id] && (
                  <button onClick={() => handleGenerateCredentials(p)} disabled={generatingId === p._id} style={{ marginLeft: '10px', background: '#2563eb', color: 'white' }}>
                    {generatingId === p._id ? 'Generating...' : 'Generate Credentials'}
                  </button>
                )}
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
    </div>
  );
};

export default Patients;
