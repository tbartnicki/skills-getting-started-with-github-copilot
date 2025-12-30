document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list and dropdown
      Object.entries(activities).forEach(([activityName, activity]) => {
        activitiesList.innerHTML += renderActivityCard(activity, activityName);
        const option = document.createElement("option");
        option.value = activityName;
        option.textContent = activityName;
        activitySelect.appendChild(option);
      });
      attachDeleteHandlers();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Only update activities after successful registration
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

function renderActivityCard(activity, activityName) {
  return `
    <div class="activity-card">
      <h4>${activityName}</h4>
      <p>${activity.description}</p>
      <div class="activity-card-participants">
        <h5>Participants</h5>
        <ul>
          ${
            activity.participants && activity.participants.length > 0
              ? activity.participants.map(name => `
                  <li class="participant-item">
                    <span class="participant-name">${name}</span>
                    <button class="delete-participant" title="Remove participant" data-activity="${activityName}" data-participant="${name}">🗑️</button>
                  </li>
                `).join('')
              : '<li><em>No participants yet</em></li>'
          }
        </ul>
      </div>
    </div>
  `;
}

// Helper to re-render activities with participants and delete buttons
async function refreshActivities() {
  try {
    const response = await fetch("/activities");
    const activities = await response.json();
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";
    Object.entries(activities).forEach(([activityName, activity]) => {
      activitiesList.innerHTML += renderActivityCard(activity, activityName);
    });
    attachDeleteHandlers();
  } catch (error) {
    // fallback error
  }
}

// Attach click handlers to delete buttons
function attachDeleteHandlers() {
  document.querySelectorAll('.delete-participant').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const activity = btn.getAttribute('data-activity');
      const participant = btn.getAttribute('data-participant');
      try {
        const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(participant)}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          refreshActivities();
        } else {
          // Optionally show error
        }
      } catch (err) {
        // Optionally show error
      }
    });
  });
}