document.addEventListener('DOMContentLoaded', async () => {
  // Φόρτωση αυτοκινήτων χρήστη
  const cars = await apiService.getUserCars();
  const carSelect = document.getElementById('car-select');
  
  cars.forEach(car => {
    const option = document.createElement('option');
    option.value = car.vin;
    option.textContent = `${car.brand} ${car.model} (${car.vin})`;
    carSelect.appendChild(option);
  });
  
  // Toggle πεδίου επιδιόρθωσης
  document.querySelectorAll('input[name="reason"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.getElementById('problem-description-group').style.display = 
        e.target.value === 'repair' ? 'block' : 'none';
    });
  });
  
  // Υποβολή φόρμας
  document.getElementById('appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const appointmentData = {
      date: document.getElementById('appointment-date').value,
      start_time: document.getElementById('appointment-time').value,
      car_vin: document.getElementById('car-select').value,
      reason: document.querySelector('input[name="reason"]:checked').value,
      problem_description: document.getElementById('problem-description').value
    };
    
    try {
      const appointment = await apiService.createAppointment(appointmentData);
      showNotification('Το ραντεβού καταχωρήθηκε επιτυχώς!');
      loadUserAppointments();
    } catch (error) {
      showNotification(error.message || 'Σφάλμα καταχώρησης', 'error');
    }
  });
  
  // Φόρτωση ραντεβού χρήστη
  await loadUserAppointments();
});

async function loadUserAppointments() {
  const appointmentsList = document.getElementById('appointments-list');
  appointmentsList.innerHTML = '';
  
  try {
    const appointments = await apiService.getUserAppointments();
    
    if (appointments.length === 0) {
      appointmentsList.innerHTML = '<p>Δεν έχετε προγραμματισμένα ραντεβού</p>';
      return;
    }
    
    appointments.forEach(app => {
      const appCard = document.createElement('div');
      appCard.className = 'appointment-card';
      appCard.innerHTML = `
        <h4>${formatDate(app.date)} - ${app.start_time}</h4>
        <p>Αυτοκίνητο: ${app.Car.brand} ${app.Car.model}</p>
        <p>Κατάσταση: ${translateStatus(app.status)}</p>
        <button class="btn-cancel" data-id="${app.id}">Ακύρωση</button>
      `;
      appointmentsList.appendChild(appCard);
    });
  } catch (error) {
    showNotification('Σφάλμα φόρτωσης ραντεβού', 'error');
  }
}

// Βοηθητικές συναρτήσεις
function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('el-GR', options);
}

function translateStatus(status) {
  const statusMap = {
    created: 'Προγραμματισμένο',
    in_progress: 'Σε Εξέλιξη',
    completed: 'Ολοκληρωμένο',
    cancelled: 'Ακυρωμένο'
  };
  return statusMap[status] || status;
}