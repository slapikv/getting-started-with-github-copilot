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

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // existing top-level info for the activity
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // participants section (header + list or empty message)
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const header = document.createElement("h5");
        header.textContent = `Participants (${details.participants.length})`;
        participantsDiv.appendChild(header);

        if (!details.participants || details.participants.length === 0) {
          const empty = document.createElement("div");
          empty.className = "participant-empty";
          empty.textContent = "No participants yet";
          participantsDiv.appendChild(empty);
        } else {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          const initials = (full) =>
            full
              .split(" ")
              .map((n) => (n ? n[0] : ""))
              .slice(0, 2)
              .join("")
              .toUpperCase();

          details.participants.forEach((p) => {
            const li = document.createElement("li");
            const badge = document.createElement("span");
            badge.className = "participant-badge";
            badge.textContent = initials(p);
            li.appendChild(badge);
            li.appendChild(document.createTextNode(p));
            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
        }

        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
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
