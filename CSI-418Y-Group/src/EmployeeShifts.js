import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageStyle from './PageStyle';

const EmployeeShifts = () => {
  const [date, setDate] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [hours, setHours] = useState('');
  const [scheduleType, setScheduleType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shifts, setShifts] = useState([]);
  const [editingShift, setEditingShift] = useState(null);
  const navigate = useNavigate();
  
  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };

  // Fetch employee shifts when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Login');
      return;
    }
  
    const decodedToken = decodeToken(token);

    const fetchShifts = async () => {
      try {
        // API endpoint to get all shifts for a specific employee (GET: /api/employees/:employeeId/shifts)
        const response = await axios.get(
          `http://localhost:9000/api/employees/shifts/${decodedToken.userId}`, 
        );
        setShifts(response.data);  // Update the shifts state with the fetched shifts
      } catch (err) {
        console.error('Error fetching shifts:', err);
        setError('Error fetching shifts');
      }
    };

    fetchShifts();
  }, [navigate]);

  // Handle creating a new shift
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Login');
      return;
    }

    const decodedToken = decodeToken(token);

    try {
      // API endpoint to create a new shift (POST: /api/employees/shifts)
      const response = await axios.post(
        'http://localhost:9000/api/employees/shifts', 
        {
          employeeId: decodedToken.userId,
          scheduleType: scheduleType,
          date: date,
          startHour: shiftStart,
          hours: hours,
          approved: false
        }
      );

      setSuccess('Shift created successfully!'); // Display success message
      setError('');
      setShifts([...shifts, response.data.shift]); // Add the new shift to the state
    } catch (err) {
      setError('Error creating shift: ' + err.message); // Display error message
      setSuccess('');
    }
  };

  // Handle deleting a shift
  const handleDelete = async (shiftId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Login');
      return;
    }

    try {
      // API endpoint to delete a shift (DELETE: /api/employees/shifts/:shiftId)
      await axios.delete(
        `http://localhost:9000/api/employees/shifts/${shiftId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Shift deleted successfully!'); // Display success message
      setError('');
      setShifts(shifts.filter((shift) => shift._id !== shiftId)); // Remove the deleted shift from state
    } catch (err) {
      setError('Error deleting shift: ' + err.message); // Display error message
      setSuccess('');
    }
  };

  return (
    <PageStyle>
    <div>
      <h2>{editingShift ? 'Edit Shift' : 'Create Shift and Break'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Shift Start Time:</label>
          <select value={shiftStart} onChange={(e) => setShiftStart(e.target.value)}>
            <option>Select</option>
            <option value="Opening">Opening</option>
            <option value="Noon">Noon</option>
            <option value="Closing">Closing</option>
          </select>
          </div>
        <div>
          <label>Hours:</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Schedule Type:</label>
          <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
            <option>Select</option>
            <option value="Shift">Shift</option>
            <option value="Break">Break</option>
          </select>
        </div>
        <button type="submit">{editingShift ? 'Update Shift' : 'Create Shift'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <h3>Shifts</h3>
      <ul>
        {shifts.map((shift) => (
          <li id={shift._id} key={shift._id}>
            {shift.scheduleType} - {shift.approved ? "Approved" : "Pending"}: {shift.date} | {shift.startHour} - {shift.hours} Hours - 
            <button onClick={() => {handleDelete(shift._id); document.getElementById(shift._id).style.display = 'none'}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
    </PageStyle>
  );
};

export default EmployeeShifts;

