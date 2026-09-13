const WORKER_URL = "https://core-auth.mnvv07.workers.dev";


// =========================
// ADMIN SESSION
// =========================

async function checkAdminSession() {
  try {
    const response = await fetch(
      `${WORKER_URL}/check-session`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.authenticated) {
      window.location.href = "index.html";
      return;
    }

    console.log("Admin access verified ✅");
    showNotification("Welcome, Admin", "user-round-key");

  } catch (error) {
    console.error("Session check failed:", error);
    window.location.href = "index.html";
  }
}

checkAdminSession();


// =========================
// LOGOUT
// =========================

const adminLogout =
  document.getElementById("adminLogout");

adminLogout.addEventListener("click", async () => {

  try {

    const response = await fetch(
      `${WORKER_URL}/logout`,
      {
        method: "POST",
        credentials: "include"
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      window.location.href = "index.html";
    } else {
      showNotification("Logout failed.", "alert-circle");
    }

  } catch (error) {

    console.error("Logout error:", error);
    showNotification("Unable to connect to the server.", "alert-circle");

  }

});



// =========================
// PATH
// =========================

const params =
  new URLSearchParams(window.location.search);

const currentPath =
  params.get("path") || "";


// =========================
// PAGE ELEMENTS
// =========================

const welcomeTitle =
  document.querySelector(".welcome-section h2");

const welcomeSubtitle =
  document.querySelector(".welcome-section p");

const sectionTitle =
  document.querySelector(".subjects-section h3");

const subjectsGrid =
  document.querySelector(".subjects-grid");

const itemActionsOverlay =
  document.getElementById("itemActionsOverlay");

const renameItemButton =
  document.getElementById("renameItemButton");

const deleteItemButton =
  document.getElementById("deleteItemButton");

  const renameOverlay =
  document.getElementById("renameOverlay");

const renameInput =
  document.getElementById("renameInput");

const renameConfirmButton =
  document.getElementById("renameConfirmButton");

  const deleteOverlay =
  document.getElementById("deleteOverlay");

const deleteMessage =
  document.getElementById("deleteMessage");

const deleteConfirmButton =
  document.getElementById("deleteConfirmButton");

const deleteAnimation =
  document.getElementById("deleteAnimation");

  const announcementMessageInput = document.getElementById(
  "announcementMessageInput"
);
const addAnnouncementButton = document.getElementById(
  "addAnnouncementButton"
);
const announcementList = document.getElementById("announcementList");

let selectedItem = null;

let renameTarget = null;

let deleteTarget = null;

// =========================
// NEW MENU ELEMENTS
// =========================

const adminNewButton =
  document.getElementById("adminNewButton");

const adminNewMenu =
  document.getElementById("adminNewMenu");

const createFolderButton =
  document.getElementById("createFolderButton");

const uploadFileButton =
  document.getElementById("uploadFileButton");

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

// announcement

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

addAnnouncementButton.addEventListener("click", addAnnouncement);

async function loadAnnouncements() {
  try {
    const response = await fetch(`${WORKER_URL}/announcements`);

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to load announcements");
    }

    announcementList.innerHTML = "";

    if (!result.announcements.length) {
      announcementList.innerHTML = `
        <p class="no-announcements">
          No active announcements.
        </p>
      `;
      return;
    }

    result.announcements.forEach((announcement) => {
      const item = document.createElement("div");
      item.className = "announcement-item";

      const expiresAt = new Date(announcement.expires_at);
      const expiresText = expiresAt.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
      });

      item.innerHTML = `
        <div class="announcement-item-content">
          <p>${escapeHtml(announcement.message)}</p>
          <small>Expires: ${expiresText}</small>
        </div>

        <button
          class="delete-announcement-button"
          type="button"
          data-id="${announcement.id}"
          aria-label="Delete announcement"
        >
          <i data-lucide="trash-2"></i>
        </button>
      `;

      announcementList.appendChild(item);
    });

    lucide.createIcons();

    document.querySelectorAll(".delete-announcement-button").forEach((button) => {
      button.addEventListener("click", () => {
        deleteAnnouncement(button.dataset.id);
      });
    });
  } catch (error) {
    console.error("Load announcements failed:", error);

    announcementList.innerHTML = `
      <p class="no-announcements">
        Failed to load announcements.
      </p>
    `;
  }
}

async function addAnnouncement() {
  const message = announcementMessageInput.value.trim();

  const duration = document.querySelector(
    'input[name="announcementDuration"]:checked'
  )?.value;

  if (!message) {
    showNotification("Please enter an announcement.", "megaphone");
    return;
  }

  addAnnouncementButton.disabled = true;

  try {
    const response = await fetch(`${WORKER_URL}/create-announcement`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        duration
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to create announcement");
    }

    announcementMessageInput.value = "";

    showNotification("Announcement added.", "check-circle");

    await loadAnnouncements();
  } catch (error) {
    console.error("Add announcement failed:", error);
    showNotification("Failed to add announcement.", "circle-alert");
  } finally {
    addAnnouncementButton.disabled = false;
  }
}

async function deleteAnnouncement(id) {
  try {
    const response = await fetch(`${WORKER_URL}/delete-announcement`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    const result = await response.json();

if (!response.ok || !result.success) {
  throw new Error(result.error || "Failed to create announcement");
}
    showNotification("Announcement deleted.", "trash-2");

    await loadAnnouncements();
  } catch (error) {
    console.error("Delete announcement failed:", error);
     showNotification(
    error.message || "Failed to add announcement.",
    "circle-alert"
  );
  }
}


// =========================
// FIND FOLDER
// =========================

let coreData = {
  type: "folder",
  name: "CORE",
  items: []
};

// something new 

async function loadCoreData() {

  try {

    const response = await fetch(
      `${WORKER_URL}/list-items`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Failed to load CORE data:",
        result.message
      );
      return false;
    }

    const items = result.items;

    coreData = {
      type: "folder",
      name: "CORE",
      items: []
    };

    const itemMap = {};

    // Create a local object for every database item
    items.forEach(item => {

      itemMap[item.id] = {
        id: item.id,
        type: item.type,
        name: item.name,
        storage_path: item.storage_path,
        items: []
      };

    });

    // Build the folder hierarchy
    items.forEach(item => {

      if (item.parent_id) {

        const parent =
          itemMap[item.parent_id];

        if (parent) {
          parent.items.push(
            itemMap[item.id]
          );
        }

      } else {

        coreData.items.push(
          itemMap[item.id]
        );

      }

    });

    return true;

  } catch (error) {

    console.error(
      "CORE data loading error:",
      error
    );

    return false;
  }
}

// Find folder in CORE hierarchy


function findFolder(path) {

  if (!path) {
    return coreData;
  }

  const parts = path.split("/");

  let current = coreData;

  for (const part of parts) {

    if (!current.items) {
      return null;
    }

    current = current.items.find(
      item =>
        item.type === "folder" &&
        item.name === part
    );

    if (!current) {
      return null;
    }
  }

  return current;
}


// =========================
// OPEN PATH
// =========================

function openPath(path) {

  window.location.href =
    `admin.html?path=${encodeURIComponent(path)}`;
}


// =========================
// CREATE FOLDER CARD
// =========================

function createFolderCard(item, path) {

  const card =
    document.createElement("div");

  card.className = "subject-card";

  card.innerHTML = `
    <div class="subject-icon">
      <i data-lucide="folder"></i>
    </div>

    <h4>${item.name}</h4>

    <button
      class="item-actions-button"
      type="button"
      aria-label="Folder options"
    >
      <i data-lucide="more-vertical"></i>
    </button>
  `;

  const actionsButton =
    card.querySelector(".item-actions-button");

actionsButton.addEventListener("click", (event) => {

  event.stopPropagation();

  if (
    selectedItem &&
    selectedItem.id === item.id &&
    itemActionsOverlay.classList.contains("show")
  ) {
    itemActionsOverlay.classList.remove("show");
    selectedItem = null;
    return;
  }

  selectedItem = item;

  itemActionsOverlay.classList.add("show");

});

  card.addEventListener("click", () => {
    openPath(path);
  });

  subjectsGrid.appendChild(card);
}

// rename 

renameItemButton.addEventListener("click", () => {

  if (!selectedItem) {
    return;
  }

  renameTarget = selectedItem;

  renameInput.value = selectedItem.name;

  itemActionsOverlay.classList.remove("show");

  renameOverlay.classList.add("show");

  setTimeout(() => {
    renameInput.focus();
    renameInput.select();
  }, 100);

});


renameConfirmButton.addEventListener("click", async () => {

  const newName =
    renameInput.value.trim();

  if (!newName) {
    renameInput.focus();
    return;
  }

  if (!renameTarget) {
    return;
  }

  try {

    const response = await fetch(
      `${WORKER_URL}/rename-item`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: renameTarget.id,
          name: newName
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      showNotification(
      result.message ||
      "Unable to rename item.",
      "alert-circle"
  );
      return;
    }

    renameOverlay.classList.remove("show");

    renameTarget = null;

    // Reload data from Supabase
    const loaded = await loadCoreData();

    if (loaded) {
      renderCurrentFolder();
      lucide.createIcons();
    }

  } catch (error) {

    console.error(
      "Rename item error:",
      error
    );

    showNotification(
  "Unable to connect to the server.",
  "alert-circle"
);
  }

});

renameOverlay.addEventListener("click", (event) => {

  if (event.target === renameOverlay) {
    renameOverlay.classList.remove("show");
    renameTarget = null;
  }

});

// delete

deleteItemButton.addEventListener("click", () => {

  if (!selectedItem) {
    return;
  }

  deleteTarget = selectedItem;

  deleteMessage.textContent =
    `Are you sure you want to delete "${selectedItem.name}"?`;

    const deleteContents =
  document.getElementById("deleteContents");

deleteContents.innerHTML = "";
deleteContents.style.display = "none";

if (
  selectedItem.type === "folder" &&
  selectedItem.items &&
  selectedItem.items.length > 0
) {

  function addDeleteContent(items, level = 0) {

    items.forEach(item => {

      const contentItem =
        document.createElement("div");

      contentItem.className =
        "delete-content-item";

      contentItem.style.paddingLeft =
        `${6 + level * 18}px`;

      contentItem.innerHTML = `
        <i data-lucide="${
          item.type === "folder"
            ? "folder"
            : "file-text"
        }"></i>

        <span>${item.name}</span>
      `;

      deleteContents.appendChild(contentItem);

      if (
        item.type === "folder" &&
        item.items &&
        item.items.length > 0
      ) {
        addDeleteContent(
          item.items,
          level + 1
        );
      }

    });
  }

  addDeleteContent(selectedItem.items);

  deleteContents.style.display = "block";

  lucide.createIcons();
}

  itemActionsOverlay.classList.remove("show");

  deleteOverlay.classList.add("show");

});


deleteConfirmButton.addEventListener("click", async () => {

  if (!deleteTarget) {
    return;
  }

    deleteAnimation.style.display = "flex";
    deleteConfirmButton.disabled = true;

  try {

    const response = await fetch(
      `${WORKER_URL}/delete-item`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: deleteTarget.id
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      showNotification(
    result.message ||
    "Unable to delete item.",
    "alert-circle"
  );
      return;
    }

    deleteOverlay.classList.remove("show");

    deleteTarget = null;
    selectedItem = null;

    // Reload data from Supabase
    const loaded = await loadCoreData();

    if (loaded) {
      renderCurrentFolder();
      lucide.createIcons();
    }

  } catch (error) {

    console.error(
      "Delete item error:",
      error
    );

    showNotification(
  "Unable to connect to the server.",
  "alert-circle"
);
  } finally {

    deleteAnimation.style.display = "none";
    deleteConfirmButton.disabled = false;

  }

});

deleteOverlay.addEventListener("click", (event) => {

  if (event.target === deleteOverlay) {
    deleteOverlay.classList.remove("show");
    deleteTarget = null;
  }

});


// =========================
// CREATE FILE CARD
// =========================
function createFileCard(item) {

  const storagePath = item.storage_path || "";
const originalFileName = storagePath.split("/").pop() || "";
const extension = originalFileName.includes(".")
  ? originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase()
  : "";

let fileIcon = "file-text";

if (extension === ".pdf") {
  fileIcon = "file-text";
} else if (extension === ".docx") {
  fileIcon = "file-pen";
} else if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
  fileIcon = "image";
}

  const card =
    document.createElement("div");

  card.className = "file-card";

  card.innerHTML = `
    <div class="file-icon">
      <i data-lucide="${fileIcon}"></i>
    </div>

    <div class="file-info">
      <h4>${item.name}</h4>
      <p>File</p>
    </div>

    <span class="file-download">
  <i data-lucide="download"></i>
</span>

    <button
      class="item-actions-button"
      type="button"
      aria-label="File options"
    >
      <i data-lucide="more-vertical"></i>
    </button>
  `;

  const downloadButton =
  card.querySelector(".file-download");

downloadButton.addEventListener("click", (event) => {

  event.stopPropagation();

  if (!item.storage_path) {
    console.error(
      "File storage path is missing."
    );
    return;
  }

  const downloadUrl =
    `${WORKER_URL}/file?path=${encodeURIComponent(
      item.storage_path
    )}&download=true`;

  window.location.href =
    downloadUrl;
});

  const actionsButton =
    card.querySelector(".item-actions-button");

  actionsButton.addEventListener("click", (event) => {

    event.stopPropagation();

    if (
      selectedItem &&
      selectedItem.id === item.id &&
      itemActionsOverlay.classList.contains("show")
    ) {
      itemActionsOverlay.classList.remove("show");
      selectedItem = null;
      return;
    }

    selectedItem = item;

    itemActionsOverlay.classList.add("show");

  });


  card.addEventListener("click", () => {

  if (!item.storage_path) {
    console.error(
      "File storage path is missing."
    );
    return;
  }

  const fileUrl =
    `${WORKER_URL}/file?path=${encodeURIComponent(
      item.storage_path
    )}`;

  window.open(
    fileUrl,
    "_blank"
  );

});

  subjectsGrid.appendChild(card);
}

// Close file actions popup when clicking outside
itemActionsOverlay.addEventListener("click", (event) => {

  if (event.target === itemActionsOverlay) {
    itemActionsOverlay.classList.remove("show");
    selectedItem = null;
  }

});

// =========================
// RENDER CURRENT FOLDER
// =========================

function renderCurrentFolder() {

  const folder =
    findFolder(currentPath);

  subjectsGrid.innerHTML = "";

  if (!folder) {

    welcomeTitle.textContent =
      "Not Found";

    welcomeSubtitle.textContent =
      "This location does not exist.";

    sectionTitle.textContent =
      "Error";

    return;
  }


  welcomeTitle.textContent =
    currentPath
      ? folder.name
      : "Welcome to CORE";


  welcomeSubtitle.textContent =
    currentPath
      ? "Select a folder or file."
      : "Centralized Online Repository";


  sectionTitle.textContent =
    currentPath
      ? "Contents"
      : "Your Subjects";


  if (
    !folder.items ||
    folder.items.length === 0
  ) {

    const emptyMessage =
      document.createElement("p");

    emptyMessage.textContent =
      "This folder is empty.";

    subjectsGrid.appendChild(emptyMessage);

    lucide.createIcons();

    return;
  }


  folder.items.forEach(item => {

    const itemPath =
      currentPath
        ? `${currentPath}/${item.name}`
        : item.name;


    if (item.type === "folder") {

      createFolderCard(
        item,
        itemPath
      );

    } else if (item.type === "file") {

      createFileCard(item);

    }

  });


  lucide.createIcons();
}


// =========================
// BACK BUTTON
// =========================

function setupBackButton() {

  if (!currentPath) {
    return;
  }

  const backButton =
    document.createElement("button");

  backButton.className =
    "back-button";

  backButton.innerHTML = `
    <i data-lucide="arrow-left"></i>
    <span>Back</span>
  `;

  backButton.addEventListener("click", () => {

    const parts =
      currentPath.split("/");

    parts.pop();

    if (parts.length === 0) {

      window.location.href =
        "admin.html";

      return;
    }

    openPath(
      parts.join("/")
    );

  });

  document
    .querySelector(".main-content")
    .prepend(backButton);

  lucide.createIcons();
}


// =========================
// NEW BUTTON
// =========================

adminNewButton.addEventListener("click", () => {

  adminNewMenu.classList.toggle("show");

});


// =========================
// HOME / FOLDER UPLOAD RULE
// =========================

if (!currentPath) {

  uploadFileButton.style.display =
    "none";

} else {

  uploadFileButton.style.display =
    "flex";
}


// =========================
// CREATE NEW FOLDER
// =========================

// =========================
// CREATE FOLDER MODAL
// =========================

const createFolderOverlay =
  document.getElementById("createFolderOverlay");

const createFolderClose =
  document.getElementById("createFolderClose");

const createFolderCancel =
  document.getElementById("createFolderCancel");

const createFolderConfirm =
  document.getElementById("createFolderConfirm");

const folderNameInput =
  document.getElementById("folderNameInput");


// Open modal

createFolderButton.addEventListener("click", () => {

  adminNewMenu.classList.remove("show");

  createFolderOverlay.classList.add("show");

  folderNameInput.value = "";

  setTimeout(() => {
    folderNameInput.focus();
  }, 100);

});


// Close modal

function closeCreateFolderModal() {

  createFolderOverlay.classList.remove("show");

  folderNameInput.value = "";

}

createFolderClose.addEventListener(
  "click",
  closeCreateFolderModal
);

createFolderCancel.addEventListener(
  "click",
  closeCreateFolderModal
);


// Create folder

createFolderConfirm.addEventListener("click", async () => {

  const folderName =
    folderNameInput.value.trim();

  if (!folderName) {
    folderNameInput.focus();
    return;
  }

  try {

    const response = await fetch(
      `${WORKER_URL}/create-folder`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: folderName,
          parent_id: findFolder(currentPath)?.id || null
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      showNotification(
  result.message ||
  "Unable to create folder.",
  "alert-circle"
);
      return;
    }

    console.log(
  "Folder created:",
  JSON.stringify(result.folder, null, 2)
);

    closeCreateFolderModal();

  } catch (error) {

    console.error(
      "Create folder error:",
      error
    );

    showNotification(
  "Unable to connect to the server.",
  "alert-circle"
);
  }

});

// =========================
// SIDE MENU
// =========================

const menuButton =
  document.getElementById("menuButton");

const sideMenu =
  document.getElementById("sideMenu");

if (menuButton && sideMenu) {

  menuButton.addEventListener("click", () => {

    menuButton.classList.toggle("active");

    sideMenu.classList.toggle("active");

  });

}

// =========================
// CREDITS
// =========================

const creditsButton =
  document.getElementById("creditsButton");

const creditsOverlay =
  document.getElementById("creditsOverlay");

const creditsClose =
  document.getElementById("creditsClose");


if (creditsButton && creditsOverlay) {

  creditsButton.addEventListener("click", () => {

    creditsOverlay.classList.add("active");

    if (menuButton && sideMenu) {
      menuButton.classList.remove("active");
      sideMenu.classList.remove("active");
    }

  });

}


if (creditsClose && creditsOverlay) {

  creditsClose.addEventListener("click", () => {

    creditsOverlay.classList.remove("active");

  });

}

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


// =========================
// UPLOAD FILE MODAL
// =========================

const uploadFileOverlay =
  document.getElementById("uploadFileOverlay");

const uploadFileClose =
  document.getElementById("uploadFileClose");

const uploadFileCancel =
  document.getElementById("uploadFileCancel");

const uploadFileConfirm =
  document.getElementById("uploadFileConfirm");

const adminFileInput =
  document.getElementById("adminFileInput");

const selectedFileName =
  document.getElementById("selectedFileName");

const uploadAnimation = 
  document.getElementById("uploadAnimation");


// Open upload modal

uploadFileButton.addEventListener("click", () => {

  adminNewMenu.classList.remove("show");

  uploadFileOverlay.classList.add("show");

  adminFileInput.value = "";

  selectedFileName.textContent =
    "No file selected";

  uploadFileConfirm.disabled = true;

});


// File selected

adminFileInput.addEventListener("change", () => {

  if (!adminFileInput.files.length) {
    selectedFileName.textContent =
      "No file selected";

    uploadFileConfirm.disabled = true;

    return;
  }

  const file =
    adminFileInput.files[0];

  selectedFileName.textContent =
    file.name;

  uploadFileConfirm.disabled = false;

});

uploadFileConfirm.addEventListener("click", async () => {

  if (!adminFileInput.files.length) {
    return;
  }

  const file = adminFileInput.files[0];

  const currentFolder =
    findFolder(currentPath);

  if (!currentFolder) {
    return;
  }

  if (!currentFolder.id) {
    showNotification(
  "Unable to identify the current folder.",
  "alert-circle"
);

return;
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("parent_id", currentFolder.id);

  uploadFileConfirm.disabled = true;

  uploadAnimation.style.display = "flex";

  try {

    const response = await fetch(
      `${WORKER_URL}/upload-file`,
      {
        method: "POST",
        credentials: "include",
        body: formData
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      showNotification(
  result.message ||
  "Unable to upload file.",
  "alert-circle"
);

      return;
    }

    closeUploadFileModal();

    // Reload data from Supabase
    const loaded = await loadCoreData();

    if (loaded) {
      renderCurrentFolder();
      lucide.createIcons();
    }

  } catch (error) {

    console.error(
      "Upload file error:",
      error
    );

    showNotification(
  "Unable to connect to the server.",
  "alert-circle"
);

  } finally {

    uploadFileConfirm.disabled = false;
    uploadAnimation.style.display = "none";

  }

});

// Close modal

function closeUploadFileModal() {

  uploadFileOverlay.classList.remove("show");

  adminFileInput.value = "";

  selectedFileName.textContent =
    "No file selected";

  uploadFileConfirm.disabled = true;

}


uploadFileClose.addEventListener(
  "click",
  closeUploadFileModal
);

uploadFileCancel.addEventListener(
  "click",
  closeUploadFileModal
);


// =========================
// START
// =========================
async function startAdminPage() {

  const loaded =
    await loadCoreData();

  if (!loaded) {
    return;
  }

  renderCurrentFolder();

  setupBackButton();
  
  await loadAnnouncements();

  lucide.createIcons();
}

startAdminPage();