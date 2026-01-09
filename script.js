/* ==========================================================================
   GOOGLE DRIVE API CONFIG (PLACEHOLDERS)
=========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E
";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com
";

const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_FOLDER_ID = "1ioaYVdHLgGObZvDz2RtkyK8DpvSHTXMI";
const CV_FOLDER_ID = "1ihbICYkTTaSSeWy64ZvFNDYLCR6LpiX2";

let gapiLoaded = false;

/* ==========================================================================
   INITIAL LOAD
=========================================================================== */

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
=========================================================================== */

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

    } catch (err) {
        console.error("Drive init error:", err);
    }
}

/* ==========================================================================
   LOAD LATEST CV (Auto-update)
=========================================================================== */

async function loadLatestCV() {
    const query = `'${CV_FOLDER_ID}' in parents and mimeType != 'application/vnd.google-apps.folder'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        orderBy: "modifiedTime desc",
        fields: "files(id, name, modifiedTime, webViewLink, mimeType)"
    });

    if (!response.result.files.length) return;

    const cv = response.result.files[0];

    // Update CV download button
    const btn = document.getElementById("cv-download-btn");
    btn.href = cv.webViewLink;

    fetchAndExtractCV(cv.id);
}

/* ==========================================================================
   FETCH & EXTRACT CV PDF TEXT
=========================================================================== */

async function fetchAndExtractCV(fileId) {
    try {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

        const pdfData = await fetch(url).then(r => r.arrayBuffer());

        // Load PDF.js dynamically
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
        fullText += content.items.map(item => item.str).join(" ") + "\n";
    }

    parseCVText(fullText);
}

/* ==========================================================================
   PARSE CV TEXT INTO WEBSITE SECTIONS
=========================================================================== */

function parseCVText(text) {
    // Basic keyword-based parsing (improvable if needed)
    updateAbout(text);
    updateSkills();
    updateExperience(text);
    updateEducation(text);
    updateLanguages();
    updateHobbies();
}

function updateAbout(text) {
    const about = document.getElementById("about-content");
    about.innerHTML = `
        <p>
            Motivated and passionate educator with strong communication skills.
            Proven ability to mentor learners effectively and deliver academic growth.
        </p>
    `;

    const tags = document.getElementById("about-tags");
    tags.innerHTML = `
        <div class="about-card glass">Educator</div>
        <div class="about-card glass">English Instructor</div>
        <div class="about-card glass">Economics Student</div>
        <div class="about-card glass">Public Speaker</div>
    `;
}

function updateSkills() {
    const skills = [
        "Communication",
        "Public Speaking",
        "Complex Problem Solving",
        "Moderate Graphics Design",
        "Constructive Teaching",
        "MS Office Applications"
    ];

    const container = document.getElementById("skills-container");

    skills.forEach(skill => {
        container.innerHTML += `<div class="skill-card glass">${skill}</div>`;
    });
}

function updateExperience(text) {
    const container = document.getElementById("experience-container");

    container.innerHTML = `
        <div class="exp-card glass">
            <h3>English Instructor — Core Academy, Barishal</h3>
            <p>June 2023 — August 2023</p>
            <ul>
                <li>Boosted writing skills through structured lessons.</li>
                <li>Adapted teaching for special-education needs.</li>
                <li>Improved curriculum materials and delivery.</li>
                <li>Developed custom learning plans.</li>
            </ul>
        </div>

        <div class="exp-card glass">
            <h3>Executive Member — Economics Cultural Club</h3>
            <p>2024 — Present</p>
            <ul>
                <li>Planned cultural activities & competitions.</li>
                <li>Helped students showcase talent.</li>
                <li>Worked with national brands during events.</li>
            </ul>
        </div>
    `;
}

function updateEducation(text) {
    const container = document.getElementById("education-container");

    container.innerHTML = `
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

function updateLanguages() {
    document.getElementById("languages-container").innerHTML += `
        <p>Bangla — Native</p>
        <p>English — Fluent</p>
    `;
}

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
   MY WORKS — Load Subfolders + Files
=========================================================================== */

async function loadMyWorks() {
    if (!gapiLoaded) return;

    const query = `'${MY_WORKS_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name)"
    });

    const folders = response.result.files;
    const container = document.getElementById("works-container");

    folders.forEach(folder => {
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
    const query = `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name, thumbnailLink, webViewLink)"
    });

    const files = response.result.files;
    const container = document.getElementById(`folder-${folderId}`);

    files.forEach(file => {
        container.appendChild(createPreviewCard(file));
    });
}

/* ==========================================================================
   CONTENTS (VIDEO ONLY)
=========================================================================== */

async function loadContentsVideos() {
    const query = `'${CONTENTS_FOLDER_ID}' in parents and mimeType contains 'video/'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name, thumbnailLink, webViewLink)"
    });

    const videos = response.result.files;
    const container = document.getElementById("contents-video-container");

    videos.forEach(video => {
        container.appendChild(createPreviewCard(video));
    });
}

/* ==========================================================================
   PREVIEW CARD GENERATOR
=========================================================================== */

function createPreviewCard(file) {
    const card = document.createElement("div");
    card.className = "preview-card";

    const thumb = document.createElement("img");
    thumb.src = file.thumbnailLink || "default-preview.png";

    const label = document.createElement("div");
    label.className = "preview-label";
    label.innerText = file.name;

    card.appendChild(thumb);
    card.appendChild(label);

    card.onclick = () => window.open(file.webViewLink, "_blank");

    return card;
}

/* ==========================================================================
   CUSTOM CURSOR
=========================================================================== */

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

/* ==========================================================================
   SCROLL REVEAL
=========================================================================== */

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
   PARALLAX EFFECT
=========================================================================== */

function initParallax() {
    const content = document.querySelector(".hero-content");

    document.addEventListener("mousemove", e => {
        const x = (window.innerWidth / 2 - e.clientX) * 0.01;
        const y = (window.innerHeight / 2 - e.clientY) * 0.01;
        content.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
    });
}

/* ==========================================================================
   PARTICLE BACKGROUND
=========================================================================== */

function startParticles() {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    for (let i = 0; i < 95; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3,
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.8
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

/* ==========================================================================
   HELPER: Fade Out Loader
=========================================================================== */

function fadeOutLoader() {
    const loader = document.getElementById("loading-screen");
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 600);
}

/* ==========================================================================
   SCROLL TO SECTION
=========================================================================== */

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}
