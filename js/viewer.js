const WORKER_URL = "https://core-auth.mnvv07.workers.dev";


const params = new URLSearchParams(window.location.search);
const currentPath = params.get("path") || "";


const welcomeTitle = document.querySelector(".welcome-section h2");
const welcomeSubtitle = document.querySelector(".welcome-section p");
const sectionTitle = document.querySelector(".subjects-section h3");
const subjectsGrid = document.querySelector(".subjects-grid");
const announcementTicker =document.getElementById("announcementTicker");
const announcementTickerTrack =document.getElementById("announcementTickerTrack");

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

  // Open 
  
  // edited for viewing docx

card.addEventListener("click", async () => {

  if (!item.storage_path) {
    console.error("File storage path is missing.");
    return;
  }

  const fileUrl =
    `${WORKER_URL}/file?path=${encodeURIComponent(
      item.storage_path
    )}`;

  // DOCX → render inside CORE
  if (item.storage_path.toLowerCase().endsWith(".docx")) {

    const viewer =
      document.getElementById("docx-viewer");

    const content =
      document.getElementById("docx-viewer-content");

    if (!viewer || !content) {
      console.error("DOCX viewer container is missing.");
      return;
    }

    viewer.style.display = "block";
    content.innerHTML = "Loading document...";

    const title =
  document.getElementById("docx-viewer-title");

if (title) {
  title.textContent = item.name;
}

    try {

      const response =
        await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch DOCX file."
        );
      }

      const blob =
        await response.blob();

      content.innerHTML = "";

      await docx.renderAsync(blob, content, null, {
  ignoreWidth: true,
  ignoreHeight: true
});


    } catch (error) {

      console.error(
        "DOCX rendering failed:",
        error
      );

      content.textContent =
        "Unable to display this document.";
    }

    return;
  }

  // Everything else → open normally
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

// ============================================================
// DOCX VIEWER MODULE
// ============================================================

const DOCX_VIEWER_CONFIG = {

  // Existing CORE logo
  logo: "assets/logo.png.png",

  // Existing watermark
  watermark: "assets/20260812_223038.png"

};


function setupDocxViewer() {

  const viewer =
    document.getElementById("docx-viewer");

  const content =
    document.getElementById("docx-viewer-content");

  if (!viewer || !content) {
    console.error("DOCX viewer elements are missing.");
    return;
  }


  // ----------------------------------------------------------
  // Viewer styling
  // ----------------------------------------------------------

  viewer.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    overflow-y: auto;
    background: #f4f1ff;
    padding-top: 64px;
    box-sizing: border-box;
  `;


  content.style.cssText = `
    position: relative;
    z-index: 2;
    width: min(900px, calc(100% - 30px));
    margin: 25px auto;
    padding: 30px;
    box-sizing: border-box;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  `;


  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------

  const header =
    document.createElement("div");

  header.id = "docx-viewer-header";

  header.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    z-index: 10002;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 16px;
    box-sizing: border-box;

    background: #000;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  `;


  // CORE logo + filename

  const brand =
    document.createElement("div");

  brand.style.cssText = `
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
  `;


  const logo =
    document.createElement("img");

  logo.src =
    DOCX_VIEWER_CONFIG.logo;

  logo.alt = "CORE";

  logo.style.cssText = `
    width: 44px;
    height: 44px;
    object-fit: contain;
    flex-shrink: 0;
  `;


  const title =
    document.createElement("span");

  title.id =
    "docx-viewer-title";

  title.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;


  brand.appendChild(logo);
  brand.appendChild(title);


  // Close button

  const closeButton =
    document.createElement("button");

  closeButton.id =
    "docx-viewer-close";

  closeButton.type = "button";

  closeButton.innerHTML =
    `<i data-lucide="x"></i>`;

  closeButton.style.cssText = `
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(255 , 255, 255, 0.12);
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
  `;


  header.appendChild(brand);
  header.appendChild(closeButton);

  viewer.appendChild(header);


  // ----------------------------------------------------------
  // Watermark
  // ----------------------------------------------------------

  const watermark =
    document.createElement("img");

  watermark.id =
    "docx-viewer-watermark";

  watermark.src =
    DOCX_VIEWER_CONFIG.watermark;

  watermark.alt = "";

  watermark.style.cssText = `
  position: fixed;
  right: 18px;
  bottom: 18px;

  width: 65px;
  height: auto;

  opacity: 0.45;

  display: block;
  pointer-events: none;
  user-select: none;

  z-index: 10;
`;

  viewer.appendChild(watermark);


  // ----------------------------------------------------------
  // Close viewer
  // ----------------------------------------------------------

  closeButton.addEventListener("click", () => {

    viewer.style.display = "none";

    content.innerHTML = "";

  });


  lucide.createIcons();

}


// ============================================================
// END DOCX VIEWER MODULE
// ============================================================

// announcement
async function loadAnnouncements() {
  if (!announcementTicker || !announcementTickerTrack) {
    return;
  }

  const fallback =
    "Tip: Download DOCX files if they behave unusually.";

  try {
    const response =
      await fetch(`${WORKER_URL}/announcements`);

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to load announcements."
      );
    }

    const announcements =
      result.announcements || [];

    const messages = announcements.length
      ? announcements.map(item => item.message)
      : [fallback];

    announcementTickerTrack.innerHTML = "";

    const span = document.createElement("span");
    span.textContent = messages.join(" • ");

    announcementTickerTrack.appendChild(span);

  } catch (error) {
    console.error(
      "Announcements load failed:",
      error
    );

    announcementTickerTrack.innerHTML = "";

    const span = document.createElement("span");
    span.textContent = fallback;

    announcementTickerTrack.appendChild(span);
  }
}


// start viewer
async function startViewer() {

  const loaded =
    await loadCoreData();

  if (!loaded) {
    return;
  }

  await loadAnnouncements();

  renderCurrentFolder();

  setupBackButton();

  setupDocxViewer();

  lucide.createIcons();
}

startViewer();

console.log("DOCX renderer:", typeof docx);