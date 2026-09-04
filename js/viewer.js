const WORKER_URL = "https://core-auth.mnvv07.workers.dev";


const params = new URLSearchParams(window.location.search);
const currentPath = params.get("path") || "";


const welcomeTitle = document.querySelector(".welcome-section h2");
const welcomeSubtitle = document.querySelector(".welcome-section p");
const sectionTitle = document.querySelector(".subjects-section h3");
const subjectsGrid = document.querySelector(".subjects-grid");

let coreData = {
  type: "folder",
  name: "CORE",
  items: []
};

async function loadCoreData() {

  try {

    const response = await fetch(
      `${WORKER_URL}/list-items`
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

    items.forEach(item => {

      itemMap[item.id] = {
        id: item.id,
        type: item.type,
        name: item.name,
        storage_path: item.storage_path,
        url: item.url,
        items: []
      };

    });

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
      item => item.type === "folder" && item.name === part
    );

    if (!current) {
      return null;
    }
  }

  return current;
}


function openPath(path) {
  window.location.href =
    `index.html?path=${encodeURIComponent(path)}`;
}


function createFolderCard(item, path) {
  const card = document.createElement("button");

  card.className = "subject-card";

  card.innerHTML = `
    <div class="subject-icon">
      <i data-lucide="folder"></i>
    </div>

    <h4>${item.name}</h4>
  `;

  card.addEventListener("click", () => {
    openPath(path);
  });

  subjectsGrid.appendChild(card);
}


function createFileCard(item) {

  const card =
    document.createElement("div");
const storagePath = item.storage_path || "";
const originalFileName = storagePath.split("/").pop() || "";

const extension = originalFileName.includes(".")
  ? originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase()
  : "";

const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif"
];

const isImage =
  imageExtensions.includes(extension);

const isDocx =
  extension === ".docx";

const isPdf =
  extension === ".pdf";

  card.className = "file-card";

  card.innerHTML = `
    <div class="file-icon">
<i data-lucide="${
  isImage
    ? "image"
    : isDocx
      ? "file-pen"
      : isPdf
        ? "file-text"
        : "file-type"
}"></i>
    </div>

    <div class="file-info">
      <h4>${item.name}</h4>
      <p>${
  isImage
    ? "Image"
    : isDocx
      ? "DOCX"
      : isPdf
        ? "PDF"
        : "File"
}</p>
    </div>

    <span class="file-download">
  <i data-lucide="download"></i>
</span>
  `;

  const downloadIcon =
    card.querySelector(".file-download");

    const downloadButton =
  card.querySelector(".file-download");

downloadButton.addEventListener("click", (event) => {

  event.stopPropagation();

  if (!item.storage_path) {
    console.error("File storage path is missing.");
    return;
  }

  const downloadUrl =
    `${WORKER_URL}/file?path=${encodeURIComponent(
      item.storage_path
    )}&download=true`;

  window.location.href = downloadUrl;
});

  // Open file
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

  // Download file
  downloadIcon.addEventListener(
    "click",
    (event) => {

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

    }
  );

  subjectsGrid.appendChild(card);
}



function renderCurrentFolder() {
  const folder = findFolder(currentPath);

  subjectsGrid.innerHTML = "";

  if (!folder) {
    welcomeTitle.textContent = "Not Found";
    welcomeSubtitle.textContent =
      "This location does not exist.";

    sectionTitle.textContent = "Error";

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


  if (!folder.items || folder.items.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.textContent = "This folder is empty.";

    subjectsGrid.appendChild(emptyMessage);

    return;
  }


  folder.items.forEach(item => {

    const itemPath = currentPath
      ? `${currentPath}/${item.name}`
      : item.name;


    if (item.type === "folder") {
      createFolderCard(item, itemPath);
    }

    else if (item.type === "file") {
      createFileCard(item);
    }

  });


  lucide.createIcons();
}


function setupBackButton() {

  if (!currentPath) {
    return;
  }


  const backButton = document.createElement("button");

  backButton.className = "back-button";

  backButton.innerHTML = `
    <i data-lucide="arrow-left"></i>
    <span>Back</span>
  `;


  backButton.addEventListener("click", () => {

    const parts = currentPath.split("/");

    parts.pop();


    if (parts.length === 0) {
      window.location.href = "index.html";
      return;
    }


    openPath(parts.join("/"));
  });


  document
    .querySelector(".main-content")
    .prepend(backButton);
}

async function startViewer() {

  const loaded =
    await loadCoreData();

  if (!loaded) {
    return;
  }

  renderCurrentFolder();

  setupBackButton();

  lucide.createIcons();
}

startViewer();