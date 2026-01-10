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
   PROFILE PICTURE LOADING
   ========================================================================== */

async function loadProfileImage() {
    const query = `'${CV_FOLDER_ID}' in parents and mimeType contains 'image/'`;

    const response = await gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name)"
    });

    if (!response.result.files.length) return;

    const file = response.result.files[0];
    const heroImg = document.getElementById("hero-profile");

    const directURL = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
    heroImg.src = directURL;
}

/* ==========================================================================
   LOAD LATEST CV
   ========================================================================== */

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
   FETCH & PARSE PDF
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

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(t => t.str).join(" ") + "\n";
    }

    parseCVText(text);
}

/* ==========================================================================
   UPDATE SECTIONS (STATIC FOR NOW)
   ========================================================================== */

function parseCVText(text) {
    updateAbout();
    updateSkills();
    updateExperience();
    updateEducation();
    updateLanguages();
    updateHobbies();
}

function updateAbout() {
    document.getElementById("about-content").innerHTML = `
        <p>
            Graphic Designer & Aspiring Economist with strong analytical and communication skills.
            Experience in policy research, academic writing & creative design.
        </p>
    `;

    document.getElementById("about-tags").innerHTML = `
        <div class="about-card glass">Graphic Designer</div>
        <div class="about-card glass">Economics Student</div>
        <div class="about-card glass">Researcher</div>
        <div class="about-card glass">Content Writer</div>
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

    const container = document.getElementById("skills-container");
    container.innerHTML = skills.map(skill =>
        `<div class="skill-card glass">${skill}</div>`).join("");
}

function updateExperience() {
    document.getElementById("experience-container").innerHTML = `
        <div class="exp-card glass">
            <h3>Graphic Designer — Political & Policy Science Research Foundation</h3>
            <p>2025 – Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Associate Member — Economics Study Center, DU</h3>
            <p>2024 – Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Talent Acquisition Secretary — ECC DU</h3>
            <p>2024 – Present</p>
        </div>
        <div class="exp-card glass">
            <h3>Organising Associate — ECA DU</h3>
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
   MY WORKS — FOLDERS
   ========================================================================== */

async function loadMyWorks() {
    if (!gapiLoaded) return;

    const response = await gapi.client.drive.files.list({
        q: `'${MY_WORKS_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
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
        q: `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder'`,
        fields: "files(id, name, webViewLink)"
    });

    const container = document.getElementById(`folder-${folderId}`);
    response.result.files.forEach(file => {
        container.appendChild(createPreviewCard(file));
    });
}

/* ==========================================================================
   CONTENTS — VIDEOS
   ========================================================================== */

async function loadContentsVideos() {
    const response = await gapi.client.drive.files.list({
        q: `'${CONTENTS_FOLDER_ID}' in parents and mimeType contains 'video/'`,
        fields: "files(id, name, webViewLink)"
    });

    const container = document.getElementById("contents-video-container");
    container.innerHTML = "";
    response.result.files.forEach(video => {
        container.appendChild(createPreviewCard(video));
    });
}

/* ==========================================================================
   PREVIEW CARD + BRIGHTNESS DETECTION
   ========================================================================== */

function createPreviewCard(file) {
    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";

    // Direct Drive image
    img.src = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;

    const label = document.createElement("div");
    label.className = "preview-label";
    label.innerText = file.name;

    img.onload = () => {
        detectBrightness(img, brightness => {
            if (brightness > 150) {
                label.style.color = "black";
                label.style.textShadow = "0 0 6px rgba(0,0,0,0.5)";
            } else {
                label.style.color = "white";
                label.style.textShadow = "0 0 6px rgba(255,255,255,0.5)";
            }
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

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    try {
        ctx.drawImage(image, 0, 0);
    } catch {
        callback(0); // fallback
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
   CURSOR + SCROLL + PARALLAX + PARTICLES
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

