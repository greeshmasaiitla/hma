import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key] || 'Unknown';
    result[group] = (result[group] || 0) + 1;
    return result;
  }, {});
}

const Dashboard = ({ appointments, patients, doctors }) => {
  // Appointments per day
  const apptByDate = groupBy(appointments, 'date');
  const apptDates = Object.keys(apptByDate).sort();
  const apptCounts = apptDates.map(date => apptByDate[date]);

  // Patients by gender
  const patientsByGender = groupBy(patients, 'gender');
  const genderLabels = Object.keys(patientsByGender);
  const genderCounts = genderLabels.map(g => patientsByGender[g]);

  // Doctors by specialization
  const docsBySpec = groupBy(doctors, 'specialization');
  const specLabels = Object.keys(docsBySpec);
  const specCounts = specLabels.map(s => docsBySpec[s]);

  return (
    <div className="container">
      <h2 className="section-title">Dashboard</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h4>Appointments per Day</h4>
          <Bar
            data={{
              labels: apptDates,
              datasets: [{ label: 'Appointments', data: apptCounts, backgroundColor: '#2563eb' }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={220}
          />
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h4>Patients by Gender</h4>
          <Pie
            data={{
              labels: genderLabels,
              datasets: [{ data: genderCounts, backgroundColor: ['#2563eb', '#10b981', '#f59e42'] }],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            height={220}
          />
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h4>Doctors by Specialization</h4>
          <Bar
            data={{
              labels: specLabels,
              datasets: [{ label: 'Doctors', data: specCounts, backgroundColor: '#10b981' }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={220}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
        <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 24, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{patients.length}</div>
          <div style={{ color: '#2563eb', fontWeight: 600 }}>Total Patients</div>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 24, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{doctors.length}</div>
          <div style={{ color: '#10b981', fontWeight: 600 }}>Total Doctors</div>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 24, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{appointments.length}</div>
          <div style={{ color: '#f59e42', fontWeight: 600 }}>Total Appointments</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 