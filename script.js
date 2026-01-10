/* ==========================================================================  
   GOOGLE DRIVE API CONFIG  
   ========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com";

const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_FOLDER_ID = "1ioaYVdHLgGObZvDz2RtkyK8DpvSHTXMI";
const CV_FOLDER_ID = "1ihbICYkTTaSSeWy64ZvFNDYLCR6LpiX2";

let gapiLoaded = false;

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
    initCursor();
    initScrollReveal();
    initParallax();
    startParticles();
    loadDriveAPI();
});

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
        fetchAndExtractCV(cvFile.id);
    }

    if (profileFile) {
        loadProfilePhoto(profileFile.id);
    }
}

function loadProfilePhoto(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
    const img = document.getElementById("profile-photo");
    if (img) img.src = url;
}

async function fetchAndExtractCV(fileId) {
    try {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
        const pdfData = await fetch(url).then(r => r.arrayBuffer());

        const pdfjsScript = document.createElement("script");
        pdfjsScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        pdfjsScript.onload = () => extractPDF(pdfData);
        document.body.appendChild(pdfjsScript);

    } catch (err) {
        console.error("PDF extraction failed:", err);
    }
}

async function extractPDF(buffer) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(a => a.str).join(" ") + "\n";
    }

    parseCV(fullText);
}

function parseCV(text) {
    updateAbout(text);
    updateSkills(text);
    updateExperience(text);
    updateEducation(text);
    updateLanguages(text);
    updateHobbies(text);
    updateContactInfo(text);
}

/* ABOUT SECTION */

function updateAbout(text) {
    const aboutBox = document.getElementById("about-content");

    aboutBox.innerHTML = `
        <p>
            ~ The greatest rewards demand the highest sacrifice.
        </p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card">Economics Student</div>
        <div class="about-card">Mediocre Graphic Designer</div>
        <div class="about-card">Mediocre Video Editor</div>
        <div class="about-card">Aspiring Data Analyst & Researcher</div>
    `;
}

/* SKILLS */

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

/* EXPERIENCE, EDUCATION, LANGUAGES, HOBBIES, CONTACT */
/* unchanged */

