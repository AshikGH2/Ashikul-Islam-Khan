/* ==========================================================================
   GOOGLE DRIVE API CONFIG
   ========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com";

const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_FOLDER_ID = "1ioaYVdHLgGObZvDz2RtkyK8DpvSHTXMI";
const CV_FOLDER_ID = "1ihbICYkTTaSSeWy64ZvFNDYLCR6LpiX2"; // contains CV + profile.jpg

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

        loadCVAndProfile();
        loadMyWorks();
        loadContentsVideos();

    } catch (err) {
        console.error("Drive init error:", err);
    }
}


/* ==========================================================================
   LOAD CV + PROFILE PHOTO
   ========================================================================== */

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


/* ==========================================================================
   LOAD PROFILE PHOTO
   ========================================================================== */

function loadProfilePhoto(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

    const img = document.getElementById("profile-photo");  // ✔ correct ID

    if (img) img.src = url;
}


/* ==========================================================================
   PDF FETCH + TEXT EXTRACTION
   ========================================================================== */

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


/* ==========================================================================
   PARSE CV TEXT
   ========================================================================== */

function parseCV(text) {

    updateAbout(text);
    updateSkills(text);
    updateExperience(text);
    updateEducation(text);
    updateLanguages(text);
    updateHobbies(text);
    updateContactInfo(text);
}


/* ==========================================================================
   ABOUT SECTION
   ========================================================================== */

function updateAbout(text) {
    const aboutBox = document.getElementById("about-content");

    aboutBox.innerHTML = `
        <p>
            ${extractSummary(text)}
        </p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card glass">Graphic Designer</div>
        <div class="about-card glass">Economics Student</div>
        <div class="about-card glass">Aspiring Researcher</div>
        <div class="about-card glass">Aspiring Data Analyst</div>
    `;
}

function extractSummary(text) {
    return "~ The greatest rewards demand the highest sacrifice.";
}


/* ==========================================================================
   SKILLS
   ========================================================================== */

function updateSkills(text) {
    const skills = [
        "Graphic Design",
        "Content Writing",
        "Research",
        "Presentation",
        "Debating",
        "Communication",
        "Software Proficiency"
    ];

    const container = document.getElementById("skills-container");
    container.innerHTML = "";

    skills.forEach(s => {
        container.innerHTML += `<div class="skill-card glass">${s}</div>`;
    });
}


/* ==========================================================================
   EXPERIENCE
   ========================================================================== */

function updateExperience(text) {
    const box = document.getElementById("experience-container");

    box.innerHTML = `
        <div class="exp-card glass">
            <h3>Graphic Designer — PPSRF</h3>
            <p>2025 — Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Associate Member — Economics Study Center</h3>
            <p>2024 — Present</p>
        </div>

        <div class="exp-card glass">
            <h3>Talent Acquisition Secretary — ECC</h3>
            <p>2024 — Present</p>
        </div>

        <div class="exp-card glass">
            <h3>Organising Associate — ECA</h3>
            <p>2021 — 2023</p>
        </div>

        <div class="exp-card glass">
            <h3>Joint Co-ordinator — ARANYAK</h3>
            <p>2021 — 2023</p>
        </div>
    `;
}


/* ==========================================================================
   EDUCATION
   ========================================================================== */

function updateEducation(text) {
    const box = document.getElementById("education-container");

    box.innerHTML = `
        <div class="edu-card glass">
            <h3>BSS in Economics</h3>
            <p>University of Dhaka</p>
            <p>2023 — Present</p>
        </div>

        <div class="edu-card glass">
            <h3>Higher Secondary Certificate</h3>
            <p>Amrita Lal Dey College</p>
            
        </div>

        <div class="edu-card glass">
            <h3>Secondary School Certificate</h3>
            <p>Kaunia Govt. Secondary School</p>
            
        </div>
    `;
}


/* ==========================================================================
   LANGUAGES
   ========================================================================== */

function updateLanguages() {
    document.getElementById("languages-container").innerHTML = `
        <h3>Languages</h3>
        <p>Bangla — Native</p>
        <p>English — Fluent</p>
    `;
}


/* ==========================================================================
   HOBBIES
   ========================================================================== */

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


/* ==========================================================================
   CONTACT INFO
   ========================================================================== */

function updateContactInfo(text) {
    const emailMatch = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    const phoneMatch = text.match(/\+?\d[\d\s-]{7,14}\d/);

    document.querySelector(".contact-info").innerHTML = `
        <p>Email: ${emailMatch || "mail.ashikulislam@gmail.com"}</p>
        <p>Phone: ${phoneMatch || "+8801753932582"}</p>
    `;
}


/* ==========================================================================
   MY WORKS
   ========================================================================== */

async function loadMyWorks() {
    if (!gapiLoaded) return;

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

    response.result.files.forEach(file => {
        container.appendChild(createPreviewCard(file));
    });
}


/* ==========================================================================
   CONTENTS VIDEOS
   ========================================================================== */

async function loadContentsVideos() {
    const response = await gapi.client.drive.files.list({
        q: `'${CONTENTS_FOLDER_ID}' in parents and mimeType contains 'video/'`,
        fields: "files(id, name, thumbnailLink, webViewLink)"
    });

    const container = document.getElementById("contents-video-container");

    response.result.files.forEach(video => {
        container.appendChild(createPreviewCard(video));
    });
}


/* ==========================================================================
   PREVIEW CARD BUILDER
   ========================================================================== */

function createPreviewCard(file) {
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
   CURSOR + EFFECTS
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
   PARTICLES ANIMATION
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







