// ===== IMAGE SLIDESHOW =====
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const slideDuration = 4000; // 4 seconds

function showSlide(index) {
  // Remove active class from all slides and indicators
  slides.forEach(slide => slide.classList.remove('active'));
  indicators.forEach(indicator => indicator.classList.remove('active'));

  // Add active class to current slide and indicator
  slides[index].classList.add('active');
  indicators[index].classList.add('active');
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// Auto advance slides
let slideInterval = setInterval(nextSlide, slideDuration);

// Manual slide navigation via indicators
indicators.forEach((indicator, index) => {
  indicator.addEventListener('click', () => {
    currentSlide = index;
    showSlide(currentSlide);
    
    // Reset interval when manually clicking
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
  });
});

// ===== ORGANIZATION TAB SWITCHING =====
const orgTabs = document.querySelectorAll('.org-tab');

orgTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs
    orgTabs.forEach(t => t.classList.remove('active'));
    
    // Add active class to clicked tab
    tab.classList.add('active');
    
    // You can add logic here to change form fields based on org type
    const orgType = tab.dataset.org;
    console.log('Selected organization type:', orgType);
  });
});

// ===== FORM VALIDATION =====

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;
    
    if (!terms) {
      alert('Please agree to the Terms & Privacy');
      return;
    }
    
    // Add your login logic here
    console.log('Login attempt:', { email, password });
    
    // For now, just show success message
    alert('Login successful! (This is a demo)');
  });
}

// Sign Up Form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;
    
    if (!terms) {
      alert('Please agree to the Terms & Privacy');
      return;
    }
    
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    // Add your signup logic here
    console.log('Sign up attempt:', { email, password });
    
    // For now, just show success message
    alert('Sign up successful! (This is a demo)');
  });
}

// Password Reset Form
const passwordResetForm = document.getElementById('passwordResetForm');
if (passwordResetForm) {
  passwordResetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    // Add your password reset logic here
    console.log('Password reset request for:', email);
    
    // For now, just show success message
    alert('Password reset email sent! (This is a demo)');
  });
}

// ===== SOCIAL LOGIN BUTTONS =====
const googleBtn = document.querySelector('.btn-google');
const appleBtn = document.querySelector('.btn-apple');

if (googleBtn) {
  googleBtn.addEventListener('click', () => {
    console.log('Google login clicked');
    alert('Google login would happen here (This is a demo)');
  });
}

if (appleBtn) {
  appleBtn.addEventListener('click', () => {
    console.log('Apple login clicked');
    alert('Apple login would happen here (This is a demo)');
  });
}