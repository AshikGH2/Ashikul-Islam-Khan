/* ==========================================================================  
   GOOGLE DRIVE API CONFIG  
========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com";

const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_FOLDER_ID = "1ioaYVdHLgGObZvDz2RtkyK8DpvSHTXMI";
const CV_FOLDER_ID = "1ihbICYkTTaSSeWy64ZvFNDYLCR6LpiX2";

let gapiLoaded = false;

/* LOADING SCREEN FADE OUT */
function fadeOutLoader() {
    const loader = document.getElementById("loading-screen");
    if (!loader) return;

    loader.style.opacity = "0";
    setTimeout(() => {
        loader.style.display = "none";
    }, 600);
}

window.addEventListener("load", () => {
    fadeOutLoader();
    loadDriveAPI();
});

/* LOAD GOOGLE DRIVE */
function loadDriveAPI() {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => gapi.load("client", initDrive);
    document.body.appendChild(script);
}

async function initDrive() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
        });

        gapiLoaded = true;

        loadCVAndProfile();
        loadMyWorks();
        loadContentsVideos();

    } catch (err) {
        console.error("Drive init error:", err);
    }
}

/* LOAD CV + PROFILE IMAGE */
async function loadCVAndProfile() {
    const files = await gapi.client.drive.files.list({
        q: `'${CV_FOLDER_ID}' in parents`,
        fields: "files(id, name, mimeType, webViewLink, thumbnailLink)"
    });

    if (!files.result.files.length) return;

    let cvFile = null;
    let profileFile = null;

    files.result.files.forEach(f => {
        if (f.mimeType === "application/pdf") cvFile = f;
        if (f.name.toLowerCase().includes("profile")) profileFile = f;
    });

    if (cvFile) {
        document.getElementById("cv-download-btn").href = cvFile.webViewLink;
    }

    if (profileFile) {
        loadProfilePhoto(profileFile.id);
    }
}

function loadProfilePhoto(fileId) {
    const url =
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

    const img = document.getElementById("profile-photo");
    if (img) img.src = url;
}

/* UPDATE ABOUT SECTION */
function updateAbout() {
    document.getElementById("about-content").innerHTML = `
        <p>~ The greatest rewards demand the highest sacrifice.</p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card">Economics Student</div>
        <div class="about-card">Mediocre Graphic Designer</div>
        <div class="about-card">Mediocre Video Editor</div>
        <div class="about-card">Aspiring Data Analyst & Researcher</div>
    `;
}

/* UPDATE SKILLS */
function updateSkills() {
    const skills = [
        "Mediocre Graphic Designing",
        "Mediocre Video Editing",
        "Content Writing",
        "Presentation",
        "Debating",
        "Communication",
        "Software Proficiency"
    ];

    const container = document.getElementById("skills-container");
    container.innerHTML = "";

    skills.forEach(s => {
        container.innerHTML += `<div class="skill-card">${s}</div>`;
    });
}

/* PLACEHOLDER LOADERS */
function loadMyWorks() {
    document.getElementById("works-container").innerHTML = "";
}

function loadContentsVideos() {
    document.getElementById("contents-video-container").innerHTML = "";
}

/* INITIALIZE STATIC SECTIONS */
updateAbout();
updateSkills();
