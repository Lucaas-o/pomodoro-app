// Timer Variables
let timer;
let timeLeft = 25 * 60; // Default: 25 minutes in seconds
let initialTime = 25 * 60; // Store initial time for progress
let isRunning = false;
let isBreak = false;
let breakCount = 0;
let completedSessions = parseInt(localStorage.getItem("completedSessions")) || 0;

// DOM Elements
const timerLabel = document.getElementById("timer-label");
const timerDisplay = document.getElementById("timer");
const progressCircle = document.getElementById("progress-circle");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const presetDropdown = document.getElementById("preset");
const applyPresetButton = document.getElementById("applyPreset");
const customInput = document.getElementById("custom");
const applyCustomButton = document.getElementById("applyCustom");
const soundSelect = document.getElementById("soundSelect");
const alarmSound = document.getElementById("alarmSound");
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTask");
const taskList = document.getElementById("task-list");
const sessionCount = document.getElementById("session-count");
const dailyStats = document.getElementById("daily-stats");
const themeToggle = document.getElementById("themeToggle");

// Update Timer Display
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  updateProgress();
}

// Update Progress Circle
function updateProgress() {
  const circumference = 2 * Math.PI * 45; // Circle circumference
  const progress = (initialTime - timeLeft) / initialTime;
  progressCircle.style.strokeDashoffset = circumference * (1 - progress);
}

// Start Timer
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerDisplay.classList.add("running");
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      onTimerEnd();
    }
  }, 1000);
}

// Pause Timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  timerDisplay.classList.remove("running");
}

// Reset Timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timerDisplay.classList.remove("running");
  isBreak = false;
  breakCount = 0;
  timeLeft = parseInt(localStorage.getItem("pomodoroTime")) * 60 || 25 * 60;
  initialTime = timeLeft;
  timerLabel.textContent = "Work Time Left";
  updateTimerDisplay();
}

// Apply Preset Time
function applyPresetTime() {
  pauseTimer();
  const selectedTime = parseInt(presetDropdown.value);
  timeLeft = selectedTime * 60;
  initialTime = timeLeft;
  updateTimerDisplay();
  saveUserPreference(selectedTime);
}

// Apply Custom Time
function applyCustomTime() {
  const customTime = parseInt(customInput.value);
  if (customTime > 0) {
    pauseTimer();
    timeLeft = customTime * 60;
    initialTime = timeLeft;
    updateTimerDisplay();
    saveUserPreference(customTime);
  } else {
    alert("Please enter a valid custom time (greater than 0).");
  }
}

// Save User Preference
function saveUserPreference(minutes) {
  localStorage.setItem("pomodoroTime", minutes);
}

// Load User Preference
function loadUserPreference() {
  const savedTime = localStorage.getItem("pomodoroTime");
  if (savedTime) {
    const savedMinutes = parseInt(savedTime);
    timeLeft = savedMinutes * 60;
    initialTime = timeLeft;
    updateTimerDisplay();
    const option = Array.from(presetDropdown.options).find(
      (opt) => parseInt(opt.value) === savedMinutes
    );
    if (option) presetDropdown.value = savedTime;
    else customInput.value = savedTime;
  }
}

// Timer End Logic
function onTimerEnd() {
  clearInterval(timer);
  isRunning = false;
  timerDisplay.classList.remove("running");
  alarmSound.play();
  notifyUser(isBreak ? "Break’s over! Back to work." : "Work session done! Time for a break.");

  if (!isBreak) {
    completedSessions++;
    breakCount++;
    logSession();
    updateSessionCount();
    isBreak = true;
    timeLeft = breakCount % 4 === 0 ? 15 * 60 : 5 * 60; // Long break every 4th
    initialTime = timeLeft;
    timerLabel.textContent = breakCount % 4 === 0 ? "Long Break Time Left" : "Short Break Time Left";
  } else {
    isBreak = false;
    timeLeft = parseInt(localStorage.getItem("pomodoroTime")) * 60 || 25 * 60;
    initialTime = timeLeft;
    timerLabel.textContent = "Work Time Left";
  }
  updateTimerDisplay();
  startTimer(); // Auto-start next phase
}

// Update Session Count
function updateSessionCount() {
  sessionCount.textContent = `Sessions Completed: ${completedSessions}`;
  localStorage.setItem("completedSessions", completedSessions);
}

// Log Session for Stats
function logSession() {
  const today = new Date().toDateString();
  let stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  stats[today] = (stats[today] || 0) + 1;
  localStorage.setItem("pomodoroStats", JSON.stringify(stats));
  displayStats();
}

// Display Stats
function displayStats() {
  const stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  dailyStats.innerHTML = Object.entries(stats)
    .map(([date, count]) => `<p>${date}: ${count} sessions</p>`)
    .join("");
}

// Task Management
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox"> ${taskText} <button class="delete">Delete</button>`;
    taskList.appendChild(li);
    taskInput.value = "";
    li.querySelector(".delete").addEventListener("click", () => li.remove());
  }
}

// Desktop Notifications
function requestNotificationPermission() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function notifyUser(message) {
  if (Notification.permission === "granded") {
    new Notification("Pomodoro Timer", { body: message });
  }
}

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
});

// Event Listeners
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);
applyPresetButton.addEventListener("click", applyPresetTime);
applyCustomButton.addEventListener("click", applyCustomTime);
addTaskButton.addEventListener("click", addTask);
soundSelect.addEventListener("change", (e) => {
  alarmSound.src = `sounds/${e.target.value}`;
});

// Initialization
loadUserPreference();
updateTimerDisplay();
updateSessionCount();
displayStats();
requestNotificationPermission();
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}