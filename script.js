let timer;
let timeLeft = 25 * 60; // Default: 25 minutes in seconds
let isRunning = false;

const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");

const presetDropdown = document.getElementById("preset");
const applyPresetButton = document.getElementById("applyPreset");

const customInput = document.getElementById("custom");
const applyCustomButton = document.getElementById("applyCustom");

const alarmSound = document.getElementById("alarmSound"); // Get the audio element

// Function to update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to start the timer
function startTimer() {
   if (isRunning) return;
   isRunning = true;
   timer = setInterval(() => {
     if (timeLeft > 0) {
       timeLeft--;
       updateTimerDisplay();
     } else {
       onTimerEnd(); // Trigger timer end behavior when time is up
     }
   }, 1000);
}

// Function to pause the timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timer);
  timeLeft = 25 * 60; // Reset to default 25 minutes
  isRunning = false;
  updateTimerDisplay();
  saveUserPreference(25); // Reset the preference to 25 minutes
}

// Function to apply a predefined time
function applyPresetTime() {
  const selectedTime = parseInt(presetDropdown.value);
  timeLeft = selectedTime * 60; // Convert minutes to seconds
  updateTimerDisplay();
  saveUserPreference(selectedTime);
}

// Function to apply a custom time
function applyCustomTime() {
  const customTime = parseInt(customInput.value);
  if (customTime > 0) {
    timeLeft = customTime * 60; // Convert minutes to seconds
    updateTimerDisplay();
    saveUserPreference(customTime);
  } else {
    alert("Please enter a valid custom time (greater than 0).");
  }
}

// Function to save user preference in localStorage
const saveUserPreference = minutes => localStorage.setItem("pomodoroTime", minutes);

// Function to load user preference from localStorage
function loadUserPreference() {
  const savedTime = localStorage.getItem("pomodoroTime");
  if (savedTime) {
    const savedMinutes = parseInt(savedTime);
    timeLeft = savedMinutes * 60;
    updateTimerDisplay();

    // Set the dropdown value to match saved time if it exists
    const option = Array.from(presetDropdown.options).find(
      (option) => parseInt(option.value) === savedMinutes
    );
    if (option) {
      presetDropdown.value = savedTime;
    } else {
      customInput.value = savedTime;
    }
  }
}

// Event Listeners
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);
applyPresetButton.addEventListener("click", applyPresetTime);
applyCustomButton.addEventListener("click", applyCustomTime);

// Initialize timer display and load preferences
loadUserPreference();
updateTimerDisplay();

function incrementSessionCount() {
  completedSessions++;
  localStorage.setItem("completedSessions", completedSessions);
  sessionCount.textContent = `Sessions Completed: ${completedSessions}`;
}

// **Function to handle end of timer**
function onTimerEnd() {
  incrementSessionCount();
    
  // Play the alarm sound
  alarmSound.play();
  
  // Alert the user
  alert("Time's up!");
}

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDarkMode = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

// Load the user's theme preference from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}
