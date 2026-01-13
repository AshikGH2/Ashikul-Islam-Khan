/* ==========================================================================
   GOOGLE API CONFIG
   ========================================================================== */

const GOOGLE_API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";  // <--- REPLACE THIS ONLY
const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_CHANNEL_ID = "UCD56-UAP7KCQNiICDla2w7Q";
const CV_FOLDER_ID = "1ihbICYkTTaSSeWy64ZvFNDYLCR6LpiX2";

let gapiLoaded = false;

/* ==========================================================================
   INITIAL LOAD
   ========================================================================== */

window.addEventListener("load", () => {
    fadeOutLoader();
    initCursor();
    initScrollReveal();
    initParallax();
    startParticles();
    loadGoogleAPI();
});

/* ==========================================================================
   LOAD GOOGLE API (Drive + YouTube unified)
   ========================================================================== */

function loadGoogleAPI() {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => gapi.load("client", initGoogleClient);
    document.body.appendChild(script);
}

async function initGoogleClient() {
    try {
        await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
            ]
        });

        gapiLoaded = true;

        loadCVAndProfile();
        loadMyWorks();
        loadYouTubeContents(); // Updated version

    } catch (error) {
        console.error("Google API initialization failed:", error);
    }
}

/* ==========================================================================
   LOAD CV + PROFILE (Drive)
   ========================================================================== */

async function loadCVAndProfile() {
    const response = await gapi.client.drive.files.list({
        q: `'${CV_FOLDER_ID}' in parents`,
        fields: "files(id, name, mimeType, webViewLink, thumbnailLink)"
    });

    const files = response.result.files;
    if (!files || !files.length) return;

    let cv = null;
    let profile = null;

    files.forEach(f => {
        if (f.mimeType === "application/pdf") cv = f;
        if (f.name.toLowerCase().includes("profile")) profile = f;
    });

    if (cv) {
        document.getElementById("cv-download-btn").href = cv.webViewLink;
        fetchAndExtractCV(cv.id);
    }

    if (profile) {
        loadProfilePhoto(profile.id);
    }
}

function loadProfilePhoto(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;
    document.getElementById("profile-photo").src = url;
}

/* ==========================================================================
   PDF EXTRACT + PARSE
   ========================================================================== */

async function fetchAndExtractCV(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;
    const pdfData = await fetch(url).then(r => r.arrayBuffer());

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
    script.onload = () => extractPDF(pdfData);
    document.body.appendChild(script);
}

async function extractPDF(buffer) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(a => a.str).join(" ") + "\n";
    }

    parseCV(text);
}

function parseCV(text) {
    updateAbout(text);
    updateSkills(text);
    updateExperience(text);
    updateEducation(text);
    updateLanguages();
    updateHobbies();
    updateContactInfo(text);
}

/* ==========================================================================
   ABOUT / SKILLS / EXPERIENCE / EDUCATION / LANGUAGES / HOBBIES
   ========================================================================== */

function updateAbout() {
    document.getElementById("about-content").innerHTML = `
        <p>~ The greatest rewards demand the highest sacrifice.</p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card glass">Economics Student</div>
        <div class="about-card glass">Mediocre Graphic Designer</div>
        <div class="about-card glass">Mediocre Video Editor</div>
        <div class="about-card glass">Aspiring Data Analyst & Researcher</div>
    `;
}

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

    document.getElementById("skills-container").innerHTML =
        skills.map(s => `<div class="skill-card glass">${s}</div>`).join("");
}

function updateExperience() {
    document.getElementById("experience-container").innerHTML = `
        <div class="exp-card glass"><h3>Graphic Designer — PPSRF</h3><p>2025 — Present</p></div>
        <div class="exp-card glass"><h3>Associate Member — ESC</h3><p>2024 — Present</p></div>
        <div class="exp-card glass"><h3>Talent Acquisition Secretary — ECC</h3><p>2024 — Present</p></div>
        <div class="exp-card glass"><h3>Organising Associate — ECA</h3><p>2021 — 2023</p></div>
        <div class="exp-card glass"><h3>Joint Co-ordinator — ARANYAK</h3><p>2021 — 2023</p></div>
    `;
}

function updateEducation() {
    document.getElementById("education-container").innerHTML = `
        <div class="edu-card glass"><h3>BSS in Economics</h3><p>University of Dhaka</p><p>2023 — Present</p></div>
        <div class="edu-card glass"><h3>Higher Secondary Certificate</h3><p>Amrita Lal Dey College</p></div>
        <div class="edu-card glass"><h3>Secondary School Certificate</h3><p>Kaunia Govt. Secondary School</p></div>
    `;
}

function updateLanguages() {
    document.getElementById("languages-container").innerHTML = `
        <h3>Languages</h3>
        <p>Bangla — Native</p>
        <p>English — Fluent</p>
    `;
}

function updateHobbies() {
    document.getElementById("hobbies-container").innerHTML = `
        <h3>Hobbies</h3>
        <p>Debating</p>
        <p>Presentation</p>
        <p>Designing</p>
        <p>Volunteering</p>
        <p>Content Creation</p>
    `;
}

function updateContactInfo(text) {
    const email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i) || "mail.ashikulislam@gmail.com";
    const phone = text.match(/\+?\d[\d\s-]{7,14}\d/) || "+8801753932582";

    document.querySelector(".contact-info").innerHTML = `
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
    `;
}

/* ==========================================================================
   MY WORKS (GOOGLE DRIVE)
   ========================================================================== */

async function loadMyWorks() {
    const response = await gapi.client.drive.files.list({
        q: `'${MY_WORKS_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id, name)"
    });

    const container = document.getElementById("works-container");
    container.innerHTML = "";

    response.result.files.forEach(folder => {
        container.innerHTML += `
            <div class="folder-block">
                <h3 class="folder-title">${folder.name}</h3>
                <div class="scroll-container" id="folder-${folder.id}"></div>
            </div>
        `;
        loadFilesInSubfolder(folder.id);
    });
}

async function loadFilesInSubfolder(folderId) {
    const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents`,
        fields: "files(id, name, thumbnailLink, webViewLink)"
    });

    const container = document.getElementById(`folder-${folderId}`);
    container.innerHTML = "";

    response.result.files.forEach(file => {
        container.appendChild(createDrivePreviewCard(file));
    });
}

function createDrivePreviewCard(file) {
    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");
    img.src = file.thumbnailLink || "default-preview.png";

    const label = document.createElement("div");
    label.className = "preview-label";
    label.innerText = file.name;

    card.appendChild(img);
    card.appendChild(label);

    card.onclick = () => window.open(file.webViewLink, "_blank");

    return card;
}

/* ==========================================================================
   YOUTUBE CONTENTS (Corrected to use uploads playlist)
   ========================================================================== */

async function loadYouTubeContents() {
    // STEP 1 — Get the hidden uploads playlist ID
    const channelResponse = await gapi.client.youtube.channels.list({
        part: "contentDetails",
        id: CONTENTS_CHANNEL_ID
    });

    const uploadsPlaylistId = channelResponse.result.items[0].contentDetails.relatedPlaylists.uploads;

    // STEP 2 — Get actual uploaded videos
    const videoResponse = await gapi.client.youtube.playlistItems.list({
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: 50
    });

    const container = document.getElementById("contents-video-container");
    container.innerHTML = "";

    videoResponse.result.items.forEach(item => {
        container.appendChild(createYouTubePreviewCard(item.snippet));
    });
}

function createYouTubePreviewCard(snippet) {
    const videoId = snippet.resourceId.videoId;
    const thumbnail = snippet.thumbnails.medium.url;
    const title = snippet.title;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const card = document.createElement("div");
    card.className = "preview-card";

    card.innerHTML = `
        <a href="${url}" target="_blank">
            <img src="${thumbnail}" class="preview-thumbnail" />
            <h3 class="preview-title">${title}</h3>
        </a>
    `;

    return card;
}

/* ==========================================================================
   VISUAL EFFECTS
   ========================================================================== */

function initCursor() {
    const c = document.getElementById("cursor");
    const f = document.getElementById("cursor-follower");

    document.addEventListener("mousemove", e => {
        c.style.left = e.pageX + "px";
        c.style.top = e.pageY + "px";
        f.style.left = e.pageX - 10 + "px";
        f.style.top = e.pageY - 10 + "px";
    });
}

function initScrollReveal() {
    const elements = document.querySelectorAll(".reveal");

    function reveal() {
        elements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 100) {
                el.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", reveal);
    reveal();
}

function initParallax() {
    const content = document.querySelector(".hero-content");

    document.addEventListener("mousemove", e => {
        const x = (window.innerWidth / 2 - e.clientX) * 0.01;
        const y = (window.innerHeight / 2 - e.clientY) * 0.01;
        content.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
    });
}

function startParticles() {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.7)";

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

function fadeOutLoader() {
    const loader = document.getElementById("loading-screen");
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 600);
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}
