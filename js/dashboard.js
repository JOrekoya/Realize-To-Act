import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentUser = null;
let userData = null;

// ===== CHECK AUTHENTICATION =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // User not logged in, redirect to login
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  
  try {
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      window.location.href = 'profile-setup.html';
      return;
    }

    userData = userDoc.data();

    // Check if profile is complete
    if (!userData.profileComplete) {
      window.location.href = 'profile-setup.html';
      return;
    }

    // Load dashboard data
    loadDashboard();
    
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Error loading dashboard. Please try again.');
  }
});

// ===== LOAD DASHBOARD DATA =====
async function loadDashboard() {
  // Display user information
  document.getElementById('userName').textContent = userData.firstName || 'User';
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('organizationName').textContent = userData.organizationName || 'Your Organization';

  // Load statistics
  await loadStats();

  // Load recent activity
  await loadRecentActivity();
}

// ===== LOAD STATISTICS =====
async function loadStats() {
  try {
    // Count available resources
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('status', '==', 'available')
    );
    const resourcesSnapshot = await getDocs(resourcesQuery);
    document.getElementById('resourceCount').textContent = resourcesSnapshot.size;

    // Count pending requests
    const pendingQuery = query(
      collection(db, 'requests'),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    document.getElementById('pendingCount').textContent = pendingSnapshot.size;

    // Count fulfilled requests
    const fulfilledQuery = query(
      collection(db, 'requests'),
      where('status', '==', 'fulfilled')
    );
    const fulfilledSnapshot = await getDocs(fulfilledQuery);
    document.getElementById('fulfilledCount').textContent = fulfilledSnapshot.size;

    // Count total organizations
    const orgsSnapshot = await getDocs(collection(db, 'users'));
    document.getElementById('orgCount').textContent = orgsSnapshot.size;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ===== LOAD RECENT ACTIVITY =====
async function loadRecentActivity() {
  try {
    const activityList = document.getElementById('activityList');
    
    // Get recent requests (both made and received)
    const requestsQuery = query(
      collection(db, 'requests'),
      where('requesterId', '==', currentUser.uid)
    );
    
    const requestsSnapshot = await getDocs(requestsQuery);
    
    if (requestsSnapshot.empty) {
      activityList.innerHTML = '<p class="empty-state">No recent activity. Start by adding resources or browsing available items!</p>';
      return;
    }

    activityList.innerHTML = '';
    
    requestsSnapshot.forEach((doc) => {
      const request = doc.data();
      const activityItem = createActivityItem(request);
      activityList.appendChild(activityItem);
    });

  } catch (error) {
    console.error('Error loading activity:', error);
  }
}

// ===== CREATE ACTIVITY ITEM =====
function createActivityItem(request) {
  const div = document.createElement('div');
  div.className = 'activity-item';
  
  const statusColors = {
    pending: '#F97316',
    approved: '#3B82F6',
    fulfilled: '#22C55E',
    denied: '#EF4444'
  };
  
  const date = new Date(request.createdAt).toLocaleDateString();
  
  div.innerHTML = `
    <div class="activity-info">
      <h4>${request.resourceName || 'Resource Request'}</h4>
      <p>Status: <span style="color: ${statusColors[request.status] || '#5E5E5E'}">${request.status}</span></p>
    </div>
    <span class="activity-time">${date}</span>
  `;
  
  return div;
}

// ===== LOGOUT FUNCTIONALITY =====
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out. Please try again.');
  }
});

// ===== REAL-TIME UPDATES (OPTIONAL) =====
// Listen for real-time updates to stats
function setupRealtimeListeners() {
  // Listen to resources collection
  onSnapshot(collection(db, 'resources'), (snapshot) => {
    const availableCount = snapshot.docs.filter(doc => doc.data().status === 'available').length;
    document.getElementById('resourceCount').textContent = availableCount;
  });

  // Listen to requests collection
  onSnapshot(collection(db, 'requests'), (snapshot) => {
    const pendingCount = snapshot.docs.filter(doc => doc.data().status === 'pending').length;
    const fulfilledCount = snapshot.docs.filter(doc => doc.data().status === 'fulfilled').length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('fulfilledCount').textContent = fulfilledCount;
  });
}

// Uncomment to enable real-time updates
// setupRealtimeListeners();