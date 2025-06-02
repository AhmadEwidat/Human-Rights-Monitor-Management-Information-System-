// 📁 src/pages/ManageCases.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageCases = () => {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState({ status: '', region: '', violation_type: '' });
  const navigate = useNavigate();

  


  const fetchCases = async () => {
  try {
    const response = await axios.get('http://localhost:8000/cases/', {
      params: filter
    });
    setCases(response.data);
  } catch (error) {
    console.error('Error fetching cases:', error);
  }
};

useEffect(() => {
  fetchCases();
}, [filter]);

  const toggleArchive = async (id, currentStatus) => {
  const isArchived = currentStatus === "archived";

  const confirmText = isArchived
    ? "Do you want to unarchive this case?"
    : "Are you sure you want to archive this case?";

  if (!window.confirm(confirmText)) return;

  try {
    const newStatus = isArchived ? "new" : "archived";
    await axios.patch(`http://localhost:8000/cases/${id}`, { status: newStatus });
    fetchCases();  // تحديث القائمة بعد التعديل
  } catch (error) {
    console.error("Error toggling archive status:", error);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this case?")) return;
    try {
      await axios.delete(`http://localhost:8000/cases/${id}`);
      const response = await axios.get('http://localhost:8000/cases/', {
        params: filter
      });
      setCases(response.data);
    } catch (error) {
      console.error("Error archiving case:", error);
    }
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#1f2937' }}>📁 Manage Cases</h2>

      <button
        onClick={() => navigate('/admin/cases/create')}
        style={{
          backgroundColor: '#2563eb',
          color: '#fff',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
        + Create New Case
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Filter by region"
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          onChange={(e) => setFilter({ ...filter, region: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by status"
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by violation"
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          onChange={(e) => setFilter({ ...filter, violation_type: e.target.value })}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ backgroundColor: '#e5e7eb' }}>
            <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Priority</th>
            <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Reported</th>
            <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                No cases found.
              </td>
            </tr>
          ) : (
            cases.map((c) => (
              <tr key={c.case_id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.case_id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.title?.en}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.status}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.priority}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {new Date(c.date_reported).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => navigate(`/cases/${c._id}`)}
                    style={{
                      marginRight: '6px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '3px'
                    }}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => navigate(`/cases/${c._id}/update`)}
                    style={{
                      marginRight: '6px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '3px'
                    }}
                  >
                    Update
                  </button>
                  <button
  onClick={() => toggleArchive(c._id, c.status)}
  style={{
    backgroundColor: c.status === "archived" ? "#9ca3af" : "#ef4444",
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '3px'
  }}
>
  {c.status === "archived" ? "Archived" : "Archive"}
</button>

                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCases;
