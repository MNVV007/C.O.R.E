const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");

if (menuButton && sideMenu) {
    menuButton.addEventListener("click", () => {
        menuButton.classList.toggle("active");
        sideMenu.classList.toggle("active");
    });
}


function openSubject(page) {
    window.location.href = page;
}


function openFile(file) {
    window.open(file, "_blank");
}


const files = [
    {
        name: "Unit 1 Notes.pdf",
        type: "PDF Document",
        icon: "file-text",
        path: "files/unit1-notes.pdf"

    },
    {
        name: "Important Questions.docx",
        type: "Word Document",
        icon: "file-pen",
        path: "files/unit1-notes.pdf"
    },
    {
        name: "Question Paper.pdf",
        type: "PDF Document",
        icon: "file-text",
        path: "files/unit1-notes.pdf"
    }
];


const filesGrid = document.getElementById("filesGrid");

if (filesGrid) {

    files.forEach(file => {

        const fileCard = document.createElement("button");

        fileCard.className = "file-card";

        fileCard.innerHTML = `
            <div class="file-icon">
                <i data-lucide="${file.icon}"></i>
            </div>

            <div class="file-info">
                <h4>${file.name}</h4>
                <p>${file.type}</p>
            </div>
        `;

        filesGrid.appendChild(fileCard);
    });

}

if (typeof lucide !== "undefined") {
    lucide.createIcons();
}

const creditsButton = document.getElementById("creditsButton");
const creditsOverlay = document.getElementById("creditsOverlay");
const creditsClose = document.getElementById("creditsClose");

creditsButton.addEventListener("click", () => {
    creditsOverlay.classList.add("active");
});

creditsClose.addEventListener("click", () => {
    creditsOverlay.classList.remove("active");
});

creditsOverlay.addEventListener("click", (event) => {
    if (event.target === creditsOverlay) {
        creditsOverlay.classList.remove("active");
    }
});

const creditsStar =
  document.getElementById("creditsStar");

const creditsAssistance =
  document.getElementById("creditsAssistance");

creditsStar.addEventListener("click", () => {
  creditsAssistance.classList.toggle("show");
});

creditsStar.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    creditsAssistance.classList.toggle("show");
  }
});

const adminButton = document.getElementById("adminButton");

const adminCodeOverlay = document.getElementById("adminCodeOverlay");
const adminCodeClose = document.getElementById("adminCodeClose");
const adminVButton = document.getElementById("adminVButton");

const adminLoginOverlay = document.getElementById("adminLoginOverlay");
const adminLoginClose = document.getElementById("adminLoginClose");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");

// notification

const notification = document.getElementById("notification");
const notificationMessage = document.getElementById("notificationMessage");

let notificationTimer;

function showNotification(message, icon = "check-circle") {
  notificationMessage.textContent = message;

  const iconElement = notification.querySelector("i, svg");

  if (iconElement) {
    iconElement.setAttribute("data-lucide", icon);
    iconElement.removeAttribute("class");
  }

  lucide.createIcons();

  notification.classList.add("show");

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(() => {
    notification.classList.remove("show");
  }, 2500);
}


// Open M.N.V.V panel
adminButton.addEventListener("click", () => {
  adminCodeOverlay.classList.add("active");
});


// Close M.N.V.V panel
adminCodeClose.addEventListener("click", () => {
  adminCodeOverlay.classList.remove("active");
});


// Open login panel through the hidden V
adminVButton.addEventListener("click", () => {
  adminCodeOverlay.classList.remove("active");
  adminLoginOverlay.classList.add("active");
});


// Close M.N.V.V panel by clicking outside
adminCodeOverlay.addEventListener("click", (event) => {
  if (event.target === adminCodeOverlay) {
    adminCodeOverlay.classList.remove("active");
  }
});


// Close login panel
adminLoginClose.addEventListener("click", () => {
  adminLoginOverlay.classList.remove("active");
});


// Admin login
adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = adminPassword.value;

  try {
    const response = await fetch(
      "https://core-auth.mnvv07.workers.dev/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          password: password
        })
      }
    );

    const result = await response.json();

    console.log("LOGIN RESPONSE:", result);
console.log("LOGIN STATUS:", response.status);

    if (response.ok && result.success) {
  showNotification("Login successful!");

  const sessionResponse = await fetch(
    "https://core-auth.mnvv07.workers.dev/check-session",
    {
      method: "GET",
      credentials: "include"
    }
  );

  const sessionResult = await sessionResponse.json();

  console.log("SESSION STATUS:", sessionResponse.status);
  console.log("SESSION RESULT:", sessionResult);

  if (sessionResponse.ok && sessionResult.authenticated) {
    console.log("Admin session verified ✅");

  window.location.href = "admin.html";
  } else {
    console.log("Admin session verification failed ❌");
  }
}else {
showNotification(
  result.message ||
  "Invalid password.",
  "alert-circle"
);
}

  } catch (error) {
    console.error("Login error:", error);
    showNotification(
  "Unable to connect to the server.",
  "alert-circle"
);
  }
});