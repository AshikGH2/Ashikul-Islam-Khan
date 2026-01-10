/* ==========================================================================
   GOOGLE DRIVE API CONFIG
   ========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com";

const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_FOLDER_ID = "1ioaYVdHLgGObZvDz2RtkyK8DpvSHTXMI";
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
    loadDriveAPI();
});

/* ==========================================================================
   LOAD GOOGLE DRIVE API
   ========================================================================== */

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

        loadMyWorks();
        loadContentsVideos();
        loadLatestCV();
        loadProfileImage();

    } catch (err) {
        console.error("Drive init error:", err);
    }
}

/* ==========================================================================
   LOAD LATEST CV + PROFILE PHOTO
   ========================================================================== */

async function loadLatestCV() {
    const query = `'${CV_FOLDER_ID}' in parents and mimeType='application/pdf'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        orderBy: "modifiedTime desc",
        fields: "files(id, name, webViewLink, modifiedTime)"
    });

    if (!response.result.files.length) return;

    const cv = response.result.files[0];

    document.getElementById("cv-download-btn").href = cv.webViewLink;

    fetchAndExtractCV(cv.id);
}

/* ==========================================================================
   DYNAMIC PROFILE IMAGE LOADING — ALWAYS UPDATES
   ========================================================================== */

async function loadProfileImage() {
    const query = `'${CV_FOLDER_ID}' in parents and name='profile.jpg' and mimeType contains 'image/'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name)"
    });

    if (!response.result.files.length) {
        console.warn("No profile.jpg found in CV folder.");
        return;
    }

    const file = response.result.files[0];
    const heroImg = document.getElementById("hero-profile");

    const directURL = `https://drive.google.com/uc?export=view&id=${file.id}`;

    heroImg.src = directURL;
}

/* ==========================================================================
   FETCH & EXTRACT CV TEXT
   ========================================================================== */

async function fetchAndExtractCV(fileId) {
    try {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
        const pdfData = await fetch(url).then(r => r.arrayBuffer());

        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = () => extractPDF(pdfData);
        document.body.appendChild(script);

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
        fullText += content.items.map(t => t.str).join(" ") + "\n";
    }

    parseCVText(fullText);
}

/* ==========================================================================
   PARSE CV TEXT → UPDATE WEBSITE
   ========================================================================== */

function parseCVText(text) {
    updateAbout(text);
    updateSkills(text);
    updateExperience(text);
    updateEducation(text);
    updateLanguages(text);
    updateHobbies(text);
}

/* --- ABOUT --- */
function updateAbout(text) {
    const about = document.getElementById("about-content");
    about.innerHTML = `
        <p>
            Motivated and passionate educator with strong communication skills. 
            Proven ability to mentor learners effectively and deliver academic growth.
        </p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card glass">Educator</div>
        <div class="about-card glass">English Instructor</div>
        <div class="about-card glass">Economics Student</div>
        <div class="about-card glass">Public Speaker</div>
    `;
}

/* --- SKILLS --- */
function updateSkills(text) {
    const skills = [
        "Communication",
        "Public Speaking",
        "Complex Problem Solving",
        "Moderate Graphics Design",
        "Constructive Teaching",
        "MS Office Applications"
    ];

    const container = document.getElementById("skills-container");
    container.innerHTML = "";

    skills.forEach(skill => {
        container.innerHTML += `<div class="skill-card glass">${skill}</div>`;
    });
}

/* --- EXPERIENCE --- */
function updateExperience(text) {
    const container = document.getElementById("experience-container");
    container.innerHTML = `
        <div class="exp-card glass">
            <h3>English Instructor — Core Academy, Barishal</h3>
            <p>June 2023 — August 2023</p>
        </div>

        <div class="exp-card glass">
            <h3>Executive Member — Economics Cultural Club</h3>
            <p>2024 — Present</p>
        </div>
    `;
}

/* --- EDUCATION --- */
function updateEducation(text) {
    document.getElementById("education-container").innerHTML = `
        <div class="edu-card glass">
            <h3>BSS in Economics</h3>
            <p>University of Dhaka</p>
            <p>2023 — Present</p>
        </div>

        <div class="edu-card glass">
            <h3>HSC — Humanities</h3>
            <p>Amrita Lal Dey College</p>
            <p>GPA: 5.00 (2022)</p>
        </div>

        <div class="edu-card glass">
            <h3>SSC — Humanities</h3>
            <p>Shahid Arju Moni Govt. School</p>
            <p>GPA: 5.00 (2020)</p>
        </div>
    `;
}

/* --- LANGUAGES --- */
function updateLanguages() {
    document.getElementById("languages-container").innerHTML += `
        <p>Bangla — Native</p>
        <p>English — Fluent</p>
    `;
}

/* --- HOBBIES --- */
function updateHobbies() {
    document.getElementById("hobbies-container").innerHTML += `
        <p>Debate</p>
        <p>Poetry</p>
        <p>Singing</p>
        <p>Football</p>
        <p>Research</p>
    `;
}

/* ==========================================================================
   MY WORKS — SUBFOLDERS
   ========================================================================== */

async function loadMyWorks() {
    if (!gapiLoaded) return;

    const query = `'${MY_WORKS_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`;

    const response = await gapi.client.drive.files.list({
        q: query,
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
    const query = `'${folderId}' in parents`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name, mimeType, thumbnailLink, webViewLink)"
    });

    const container = document.getElementById(`folder-${folderId}`);
    container.innerHTML = "";

    response.result.files.forEach(file => {
        container.appendChild(createPreviewCard(file));
    });
}

/* ==========================================================================
   CONTENTS — VIDEO ONLY
   ========================================================================== */

async function loadContentsVideos() {
    const query = `'${CONTENTS_FOLDER_ID}' in parents and mimeType contains 'video/'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name, thumbnailLink, webViewLink)"
    });

    const container = document.getElementById("contents-video-container");
    container.innerHTML = "";

    response.result.files.forEach(video => {
        container.appendChild(createPreviewCard(video));
    });
}

/* ==========================================================================
   PREVIEW CARD WITH BRIGHTNESS DETECTION
   ========================================================================== */

function createPreviewCard(file) {
    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";

    if (file.thumbnailLink) {
        img.src = file.thumbnailLink;
    } else if (file.mimeType === "application/pdf") {
        img.src = `https://drive.google.com/uc?export=view&id=${file.id}`;
    } else {
        img.src = "https://via.placeholder.com/300x200?text=No+Preview";
    }

    const label = document.createElement("div");
    label.className = "preview-label";
    label.innerText = file.name;

    img.onload = () => {
        detectBrightness(img, brightness => {
            label.style.color = brightness > 160 ? "black" : "white";
        });
    };

    card.appendChild(img);
    card.appendChild(label);

    card.onclick = () => window.open(file.webViewLink, "_blank");

    return card;
}

function detectBrightness(image, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    try {
        ctx.drawImage(image, 0, 0);
    } catch {
        callback(255); // assume bright
        return;
    }

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let brightness = 0;

    for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    callback(brightness / (data.length / 4));
}

/* ==========================================================================
   CURSOR
   ========================================================================== */

function initCursor() {
    const c = document.getElementById("cursor");
    const f = document.getElementById("cursor-follower");

    document.addEventListener("mousemove", e => {
        c.style.left = e.pageX + "px";
        c.style.top = e.pageY + "px";

        f.style.left = (e.pageX - 10) + "px";
        f.style.top = (e.pageY - 10) + "px";
    });
}

/* ==========================================================================
   SCROLL REVEAL
   ========================================================================== */

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

/* ==========================================================================
   PARALLAX
   ========================================================================== */

function initParallax() {
    const content = document.querySelector(".hero-content");

    document.addEventListener("mousemove", e => {
        const x = (window.innerWidth / 2 - e.clientX) * 0.01;
        const y = (window.innerHeight / 2 - e.clientY) * 0.01;
        content.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
    });
}

/* ==========================================================================
   PARTICLES
   ========================================================================== */

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
            r: Math.random() * 2 + 1,
            sX: (Math.random() - 0.5) * 0.6,
            sY: (Math.random() - 0.5) * 0.6
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.8)";

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.sX;
            p.y += p.sY;

            if (p.x < 0 || p.x > canvas.width) p.sX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.sY *= -1;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   LOADER
   ========================================================================== */

function fadeOutLoader() {
    const loader = document.getElementById("loading-screen");
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 600);
}

/* ==========================================================================
   SCROLL TO SECTION
   ========================================================================== */

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

