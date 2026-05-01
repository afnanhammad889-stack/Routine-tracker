// Load saved activities from localStorage and update UI.
const activityForm = document.getElementById('activity-form');
const activityNameInput = document.getElementById('activity-name');
const activityCategoryInput = document.getElementById('activity-category');
const activityHoursInput = document.getElementById('activity-hours');
const activityList = document.getElementById('activity-list');
const summaryList = document.getElementById('summary-list');
const analysisMessage = document.getElementById('analysis-message');
const totalHoursLabel = document.getElementById('total-hours');

const STORAGE_KEY = 'routineTrackerActivities';

let activities = [];

// Retrieve activities from localStorage when the page loads.
function loadActivities() {
  const stored = localStorage.getItem(STORAGE_KEY);
  activities = stored ? JSON.parse(stored) : [];
}

// Save current activity list to localStorage.
function saveActivities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

// Create a single activity card for the history list.
function createActivityItem(activity) {
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `
    <div>
      <strong>${activity.name}</strong>
      <span>${activity.category} • ${activity.hours} hours</span>
    </div>
    <div>${new Date(activity.addedAt).toLocaleDateString()}</div>
  `;
  return item;
}

// Update the list of entered routines.
function renderActivityList() {
  activityList.innerHTML = '';

  if (activities.length === 0) {
    activityList.innerHTML = '<div class="analysis-message">No routines yet. Add your first activity above.</div>';
    return;
  }

  activities.slice().reverse().forEach(activity => {
    activityList.appendChild(createActivityItem(activity));
  });
}

// Build weekly summary totals per category and render progress bars.
function renderSummary() {
  const totals = {};
  let totalHours = 0;

  activities.forEach(activity => {
    totals[activity.category] = (totals[activity.category] || 0) + activity.hours;
    totalHours += activity.hours;
  });

  totalHoursLabel.textContent = totalHours.toFixed(1);

  summaryList.innerHTML = '';
  if (Object.keys(totals).length === 0) {
    summaryList.innerHTML = '<div class="analysis-message">Add activities to see your weekly summary.</div>';
    return;
  }

  const maximum = Math.max(...Object.values(totals), 1);

  Object.entries(totals).forEach(([category, hours]) => {
    const item = document.createElement('div');
    item.className = 'summary-item';
    item.innerHTML = `
      <div>
        <strong>${category}</strong>
        <span>${hours.toFixed(1)} hours</span>
        <div class="bar">
          <div class="bar-inner" style="width: ${Math.round((hours / maximum) * 100)}%;"></div>
        </div>
      </div>
    `;
    summaryList.appendChild(item);
  });

  renderAnalysis(totals);
}

// Produce a simple analysis message based on how routines compare.
function renderAnalysis(totals) {
  const study = totals['Study'] || 0;
  const exercise = totals['Exercise'] || 0;
  const entertainment = totals['Entertainment'] || 0;
  const work = totals['Work'] || 0;

  if (entertainment > study && entertainment > exercise) {
    analysisMessage.textContent = 'Warning: Entertainment is your top category. Try balancing it with study or exercise for healthier habits.';
    analysisMessage.className = 'analysis-message warning';
    return;
  }

  if (study >= exercise && study >= work) {
    analysisMessage.textContent = 'Great job! Study is a strong focus in your routine. Keep building that momentum.';
    analysisMessage.className = 'analysis-message good';
    return;
  }

  if (exercise >= study && exercise >= entertainment) {
    analysisMessage.textContent = 'Nice work staying active. A healthy routine includes movement and rest.';
    analysisMessage.className = 'analysis-message good';
    return;
  }

  analysisMessage.textContent = 'Your routine is growing. Keep tracking daily and use the summary to stay balanced.';
  analysisMessage.className = 'analysis-message';
}

// Add a new activity and refresh all UI sections.
function addActivity(event) {
  event.preventDefault();

  const name = activityNameInput.value.trim();
  const category = activityCategoryInput.value;
  const hours = parseFloat(activityHoursInput.value);

  if (!name || !category || Number.isNaN(hours) || hours <= 0) {
    alert('Please enter a valid activity name, category, and hours.');
    return;
  }

  const activity = {
    name,
    category,
    hours,
    addedAt: new Date().toISOString(),
  };

  activities.push(activity);
  saveActivities();
  renderActivityList();
  renderSummary();
  activityForm.reset();
  activityNameInput.focus();
}

// Initialize the app and attach events.
function bootstrap() {
  loadActivities();
  renderActivityList();
  renderSummary();
  activityForm.addEventListener('submit', addActivity);
}

bootstrap();
