import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Pre-fill organization type if it exists
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.organizationType) {
      document.getElementById('organizationType').value = userData.organizationType;
    }
  }
});

// Handle form submission
const profileSetupForm = document.getElementById('profileSetupForm');
profileSetupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const submitBtn = profileSetupForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const profileData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      organizationName: document.getElementById('organizationName').value,
      organizationType: document.getElementById('organizationType').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipCode: document.getElementById('zipCode').value,
      phone: document.getElementById('phone').value,
      description: document.getElementById('description').value,
      profileComplete: true,
      updatedAt: new Date().toISOString()
    };

    // Update user profile in Firestore
    await updateDoc(doc(db, 'users', user.uid), profileData);

    console.log('Profile updated successfully');
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';

  } catch (error) {
    console.error('Profile update error:', error);
    alert('Failed to save profile: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Profile';
  }
});