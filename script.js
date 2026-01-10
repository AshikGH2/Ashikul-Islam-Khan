/* ==========================================================================
   GOOGLE DRIVE API CONFIG
=========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com";

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
        loadProfileImage();

    } catch (err) {
        console.error("Drive init error:", err);
    }
}

/* ==========================================================================
   LOAD PROFILE IMAGE (DYNAMIC)
=========================================================================== */

async function loadProfileImage() {
    const query = `'${CV_FOLDER_ID}' in parents and name='profile.jpg'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name)"
    });

    if (!response.result.files.length) return;

    const file = response.result.files[0];
    const imgElement = document.getElementById("hero-profile");

    imgElement.src = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
}

/* ==========================================================================
   LOAD LATEST CV
=========================================================================== */

async function loadLatestCV() {
    const query = `'${CV_FOLDER_ID}' in parents and mimeType='application/pdf'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        orderBy: "modifiedTime desc",
        fields: "files(id, name, webViewLink)"
    });

    if (!response.result.files.length) return;

    const cv = response.result.files[0];
    document.getElementById("cv-download-btn").href = cv.webViewLink;

    fetchAndExtractCV(cv.id);
}

/* ==========================================================================
   PDF TEXT EXTRACTION
=========================================================================== */

async function fetchAndExtractCV(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
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
        text += content.items.map(x => x.str).join(" ") + "\n";
    }

    parseCVText(text);
}

/* ==========================================================================
   UPDATE SECTIONS FROM CV TEXT
=========================================================================== */

function parseCVText(text) {
    updateAbout(text);
    updateSkills(text);
    updateExperience(text);
    updateEducation(text);
    updateLanguages(text);
    updateHobbies(text);
}

function updateAbout(text) {
    document.getElementById("about-content").innerHTML = `
        <p>
            Graphic Designer & Aspiring Economist with strong analytical and communication skills.
            Experience in policy research, content writing, and presentation design.
        </p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card glass">Graphic Designer</div>
        <div class="about-card glass">Researcher</div>
        <div class="about-card glass">Content Writer</div>
        <div class="about-card glass">Economics Student</div>
    `;
}

function updateSkills() {
    const skills = [
        "Graphic Designing",
        "Content Writing",
        "Presentation",
        "Debating",
        "Communication",
        "Software Proficiency"
    ];

    const box = document.getElementById("skills-container");
    box.innerHTML = "";
    skills.forEach(skill => {
        box.innerHTML += `<div class="skill-card glass">${skill}</div>`;
    });
}

function updateExperience() {
    document.getElementById("experience-container").innerHTML = `
        <div class="exp-card glass">
            <h3>Graphic Designer — PPSRF</h3>
            <p>2025 – Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Associate Member — ESC, DU</h3>
            <p>2024 – Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Talent Acquisition Secretary — ECC, DU</h3>
            <p>2024 – Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Organising Associate — ECA, DU</h3>
            <p>2024 – Present</p>
        </div>
    `;
}

function updateEducation() {
    document.getElementById("education-container").innerHTML = `
        <div class="edu-card glass">
            <h3>Bachelor of Social Sciences</h3>
            <p>Economics, University of Dhaka</p>
            <p>2023 – Present</p>
        </div>

        <div class="edu-card glass">
            <h3>Higher Secondary Certificate</h3>
            <p>Amrita Lal Dey College</p>
            <p>2022</p>
        </div>

        <div class="edu-card glass">
            <h3>Secondary School Certificate</h3>
            <p>Kaunia Govt. Secondary School</p>
            <p>2020</p>
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
        <p>Designing</p>
        <p>Debating</p>
        <p>Photography</p>
        <p>Writing</p>
    `;
}

/* ==========================================================================
   MY WORKS — LOAD SUBFOLDERS + THUMBNAILS
=========================================================================== */

async function loadMyWorks() {
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
    const query = `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name, webViewLink)"
    });

    const container = document.getElementById(`folder-${folderId}`);
    response.result.files.forEach(file => {
        container.appendChild(createPreviewCard(file));
    });
}

/* ==========================================================================
   CREATE PREVIEW CARD — CANVAS THUMBNAIL + BRIGHTNESS DETECTION
=========================================================================== */

function createPreviewCard(file) {
    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");

    // Local thumbnail (no permissions needed)
    img.src = `https://drive.google.com/uc?export=view&id=${file.id}`;

    const label = document.createElement("div");
    label.className = "preview-label";
    label.innerText = file.name;

    img.onload = () => detectBrightness(img, b => {
        label.style.color = b > 160 ? "#000" : "#fff";
    });

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

    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let total = 0;

    for (let i = 0; i < data.length; i += 4) {
        total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    callback(total / (data.length / 4));
}

/* ==========================================================================
   CURSOR, SCROLL EFFECTS, PARALLAX, PARTICLES, LOADER
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

function initScrollReveal() {
    const els = document.querySelectorAll(".reveal");
    const check = () => {
        els.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 100) {
                el.classList.add("visible");
            }
        });
    };
    window.addEventListener("scroll", check);
    check();
}

function initParallax() {
    const hero = document.querySelector(".hero-content");
    document.addEventListener("mousemove", e => {
        const x = (window.innerWidth / 2 - e.clientX) * 0.01;
        const y = (window.innerHeight / 2 - e.clientY) * 0.01;
        hero.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
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

function fadeOutLoader() {
    const loader = document.getElementById("loading-screen");
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 600);
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

