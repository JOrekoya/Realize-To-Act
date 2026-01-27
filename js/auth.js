// Import Firebase modules
import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ===== IMAGE SLIDESHOW =====
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const slideDuration = 4000;

if (slides.length > 0) {
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  let slideInterval = setInterval(nextSlide, slideDuration);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, slideDuration);
    });
  });
}

// ===== ORGANIZATION TAB SWITCHING =====
const orgTabs = document.querySelectorAll('.org-tab');
let selectedOrgType = 'school'; // Default

orgTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    orgTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    selectedOrgType = tab.dataset.org;
    console.log('Selected organization type:', selectedOrgType);
  });
});

// ===== HELPER FUNCTIONS =====
function showLoading(button) {
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.textContent = 'Loading...';
}

function hideLoading(button) {
  button.disabled = false;
  button.textContent = button.dataset.originalText;
}

function showError(message) {
  alert(message); // You can replace this with a better UI notification
}

// ===== SIGN UP FORM =====
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    
    if (!terms) {
      showError('Please agree to the Terms & Privacy');
      return;
    }
    
    if (password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }
    
    showLoading(submitBtn);
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        organizationType: selectedOrgType,
        createdAt: new Date().toISOString(),
        profileComplete: false
      });
      
      console.log('User created successfully:', user.uid);
      
      // Redirect to profile setup
      window.location.href = 'profile-setup.html';
      
    } catch (error) {
      hideLoading(submitBtn);
      console.error('Sign up error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        showError('This email is already registered. Please log in instead.');
      } else if (error.code === 'auth/invalid-email') {
        showError('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        showError('Password is too weak. Please use a stronger password.');
      } else {
        showError('Sign up failed: ' + error.message);
      }
    }
  });
}

// ===== LOGIN FORM =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    if (!terms) {
      showError('Please agree to the Terms & Privacy');
      return;
    }
    
    showLoading(submitBtn);
    
    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User logged in:', user.uid);
      
      // Check if profile is complete
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists() && userDoc.data().profileComplete) {
        // Profile complete, go to dashboard
        window.location.href = 'dashboard.html';
      } else {
        // Profile incomplete, go to setup
        window.location.href = 'profile-setup.html';
      }
      
    } catch (error) {
      hideLoading(submitBtn);
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        showError('Invalid email or password.');
      } else if (error.code === 'auth/invalid-email') {
        showError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        showError('Too many failed attempts. Please try again later.');
      } else {
        showError('Login failed: ' + error.message);
      }
    }
  });
}

// ===== PASSWORD RESET FORM =====
const passwordResetForm = document.getElementById('passwordResetForm');
if (passwordResetForm) {
  passwordResetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const submitBtn = passwordResetForm.querySelector('button[type="submit"]');
    
    showLoading(submitBtn);
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.');
      window.location.href = 'login.html';
      
    } catch (error) {
      hideLoading(submitBtn);
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        showError('No account found with this email.');
      } else if (error.code === 'auth/invalid-email') {
        showError('Please enter a valid email address.');
      } else {
        showError('Password reset failed: ' + error.message);
      }
    }
  });
}

// ===== GOOGLE SIGN IN =====
const googleBtn = document.querySelector('.btn-google');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Google sign in successful:', user.uid);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // New user, create profile
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          organizationType: selectedOrgType,
          createdAt: new Date().toISOString(),
          profileComplete: false
        });
        window.location.href = 'profile-setup.html';
      } else if (userDoc.data().profileComplete) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'profile-setup.html';
      }
      
    } catch (error) {
      console.error('Google sign in error:', error);
      showError('Google sign in failed: ' + error.message);
    }
  });
}

// ===== MICROSOFT SIGN IN (Placeholder) =====
const microsoftBtn = document.querySelector('.btn-microsoft');
if (microsoftBtn) {
  microsoftBtn.addEventListener('click', () => {
    showError('Microsoft sign in is not yet configured. Please use email or Google.');
  });
}