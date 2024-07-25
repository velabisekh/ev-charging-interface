let currentInputField = null;
let html5QrCode;
let chargeDuration = 0; // Variable to store the selected charge duration in minutes
let userPin = ""; // Store the user's PIN
let processCompleted = false; // Flag to track if the process is completed

// Function to show a specific screen
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Function to initialize the app
function start() {
  showScreen('authentication-screen');
}

// Function to handle authentication
function authenticate() {
  const accountNumber = document.getElementById('account-number').value;
  userPin = document.getElementById('pin').value;
  const errorElement = document.getElementById('auth-error');

  if (accountNumber.length === 10 && userPin.length === 6) {
    errorElement.textContent = '';
    showScreen('charging-details-screen');
  } else {
    errorElement.textContent = 'Please enter a valid account number and PIN.';
  }
}

// Function to update charge duration options based on vehicle type
function updateChargeDurationOptions() {
  const vehicleType = document.getElementById('vehicle-type').value;
  const chargeDurationSelect = document.getElementById('charge-duration');
  chargeDurationSelect.innerHTML = '<option value="">Select...</option>';

  if (vehicleType === 'car') {
    for (let i = 8; i >= 1; i--) {
      chargeDurationSelect.innerHTML += `<option value="${i * 60}">${i} hour${i > 1 ? 's' : ''}</option>`;
    }
  } else if (vehicleType === 'ebike') {
    chargeDurationSelect.innerHTML += '<option value="120">2 hours</option>';
    chargeDurationSelect.innerHTML += '<option value="60">1 hour</option>';
  } else if (vehicleType === 'escooter') {
    chargeDurationSelect.innerHTML += '<option value="60">1 hour</option>';
  }
}

// Event listener for vehicle type change
document.getElementById('vehicle-type').addEventListener('change', updateChargeDurationOptions);

// Function to handle form submission for charging details
function submitChargingDetails() {
  const chargeDurationSelect = document.getElementById('charge-duration');
  const selectedDuration = chargeDurationSelect.options[chargeDurationSelect.selectedIndex].text;
  document.getElementById('selected-duration').textContent = `Charging for: ${selectedDuration}`;
  chargeDuration = parseInt(chargeDurationSelect.value, 10) / 60; // Store duration in hours
  showScreen('payment-screen');
}

// Function to select payment method and proceed
function selectPayment(method) {
  const instructionsElement = document.getElementById('payment-instructions');

  if (method === 'on-account') {
    instructionsElement.textContent = 'On-Account Payment selected. Please enter your card details.';
    showScreen('on-account-payment');
  } else if (method === 'contactless') {
    instructionsElement.textContent = 'Contactless Card selected. Please tap your card on the reader to proceed.';
    showScreen('contactless-payment');
  }
}

// Function to confirm on-account payment
function confirmOnAccountPayment() {
  const cardNumber = document.getElementById('card-number').value;
  const cardExpiry = document.getElementById('card-expiry').value;
  const cardCVV = document.getElementById('card-cvv').value;
  const errorElement = document.getElementById('on-account-error');

  if (cardNumber.length === 16 && cardExpiry.length === 5 && cardCVV.length === 3) {
    errorElement.textContent = '';
    setTimeout(() => {
      showScreen('charging-info-screen');
      startChargingSession();
    }, 3000); // Simulate a short delay for payment processing
  } else {
    errorElement.textContent = 'Please enter valid card details.';
  }
}

// Add event listener for Google Pay QR code click
document.getElementById('gpay-qr-code').addEventListener('click', () => {
  showScreen('charging-info-screen');
  startChargingSession();
});

// Function to start a charging session
function startChargingSession() {
  let timeRemaining = chargeDuration * 3600; // Convert hours to seconds
  let powerLevel = 0;

  const timeRemainingElement = document.getElementById('time-remaining');
  const powerLevelElement = document.getElementById('power-level');

  const interval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;

      powerLevel += (100 / (chargeDuration * 3600)); // Simulate power increase as a percentage
      timeRemainingElement.textContent = formatTime(timeRemaining);
      powerLevelElement.textContent = Math.round(powerLevel);

    } else {
      clearInterval(interval);
      // Show charge complete message
      chargeCompleteMessage.classList.add('show');
      
      setTimeout(() => {
        chargeCompleteMessage.classList.remove('show');
        if (!processCompleted) {
          processCompleted = true;
          clearAllData(); // Clear all data
          setTimeout(() => {
            location.reload(); // Reload the page after 2 seconds
          }, 2000); // Adjust the delay if needed
        }
      }, 3000); // Display message for 3 seconds
    }
  }, 1000);
}

// Function to format time in hours, minutes, and seconds
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

// Function to validate the PIN for canceling the charging session
function validateCancelPin() {
  const cancelPin = document.getElementById('cancel-pin').value;
  const errorElement = document.getElementById('cancel-error');
  const chargeCanceledMessage = document.getElementById('charge-canceled-message');

  if (cancelPin === userPin) {
    errorElement.textContent = '';
    chargeCanceledMessage.classList.add('show');
    
    setTimeout(() => {
      chargeCanceledMessage.classList.remove('show');
      if (!processCompleted) {
        processCompleted = true;
        clearAllData(); // Clear all data
        setTimeout(() => {
          showScreen('welcome-screen'); // Redirect to welcome screen after a short delay
        }, 2000); // Adjust the delay if needed
      }
    }, 3000); // Display message for 3 seconds

  } else {
    errorElement.textContent = 'Incorrect PIN. Please try again.';
  }
}

// Function to clear input fields and reset states
function clearAllData() {
  document.getElementById('account-number').value = '';
  document.getElementById('pin').value = '';
  document.getElementById('card-number').value = '';
  document.getElementById('card-expiry').value = '';
  document.getElementById('card-cvv').value = '';
  document.getElementById('cancel-pin').value = '';

  // Reset any other relevant variables or states
  chargeDuration = 0;
  userPin = "";
}

// Function to open the on-screen keyboard
function openKeyboard(inputId) {
  currentInputField = document.getElementById(inputId);
  document.getElementById('keyboard').classList.remove('inactive');
  document.getElementById('keyboard').classList.add('active');
}

// Function to close the on-screen keyboard
function closeKeyboard() {
  currentInputField = null;
  document.getElementById('keyboard').classList.remove('active');
  document.getElementById('keyboard').classList.add('inactive');
}

// Function to handle key presses on the on-screen keyboard
function keyPress(key) {
  if (!currentInputField) return;

  const maxLength = {
    'account-number': 10,
    'pin': 6,
    'card-number': 16,
    'card-expiry': 5,
    'card-cvv': 3,
    'cancel-pin': 6
  }[currentInputField.id] || 20; // Default maxLength if not specified

  if (key === 'backspace') {
    currentInputField.value = currentInputField.value.slice(0, -1);
  } else if (key === 'clear') {
    currentInputField.value = '';
  } else if (currentInputField.value.length < maxLength) {
    currentInputField.value += key;
  }
}

// Close the keyboard when clicking outside the input fields
document.addEventListener('click', (event) => {
  if (currentInputField && !event.target.closest('.keyboard') && !event.target.closest('input')) {
    closeKeyboard();
  }
});

// Initialize the first screen
showScreen('welcome-screen');

// QR Scanner Functions
function startQrScanner() {
  showScreen('qr-scanner');

  // Initialize QR Code Scanner
  html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" }, // or { facingMode: "user" } for front camera
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    (decodedText, decodedResult) => {
      console.log(`QR Code detected: ${decodedText}`);
      document.getElementById('scan-result').textContent = `QR Code Data: ${decodedText}`;

      if (decodedText.includes("gpay")) { // Check if QR code contains "gpay"
        stopQrScanner(); // Stop scanning after a successful scan
        showScreen('charging-info-screen');
        startChargingSession(); // Start charging session after QR code scan
      } else {
        alert('Invalid QR Code. Please scan a valid Google Pay QR Code.');
      }
    },
    (errorMessage) => {
      console.log(`QR Code scan error: ${errorMessage}`);
    }
  ).catch(err => {
    console.error(`QR Code scan start error: ${err}`);
  });
}

// Function to stop the QR Scanner and redirect to authentication page
function stopQrScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(ignore => {
      console.log("QR Code scanner stopped.");
      if (!processCompleted) {
        processCompleted = true;
        clearAllData(); // Clear all data
        setTimeout(() => {
          location.reload(); // Reload the page after 2 seconds
        }, 2000); // Adjust the delay if needed
      } else {
        showScreen('authentication-screen');
      }
    }).catch(err => {
      console.error(`QR Code scanner stop error: ${err}`);
      if (!processCompleted) {
        processCompleted = true;
        clearAllData(); // Clear all data
        setTimeout(() => {
          location.reload(); // Reload the page after 2 seconds
        }, 2000); // Adjust the delay if needed
      } else {
        showScreen('authentication-screen');
      }
    });
  } else {
    // Redirect to the authentication screen if the QR scanner is not initialized
    showScreen('authentication-screen');
  }
}
