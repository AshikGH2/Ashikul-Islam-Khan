/* ==========================================================================
   GOOGLE DRIVE API CONFIG
   ========================================================================== */

const API_KEY = "AIzaSyDenRHJmnv7_AJviKmMUcu1M6SFY6OAC7E";
const CLIENT_ID = "933969038608-s5kuf61bdlbp49jf729fppjiabel9sce.apps.googleusercontent.com";

const MY_WORKS_FOLDER_ID = "1_H5wCZbyc8LMhcmb2wK3MkIBdf4hrjEd";
const CONTENTS_FOLDER_ID = "1ioaYVdHLgGObZvDz2RtkyK8DpvSHTXMI";
const CV_FOLDER_ID = "1ihbICYkTTaSSeWy64ZvFNDYLCR6LpiX2";   // Folder containing CV + profile.jpg

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
   LOAD LATEST CV FILE
   ========================================================================== */

async function loadLatestCV() {
    const response = await gapi.client.drive.files.list({
        q: `'${CV_FOLDER_ID}' in parents and mimeType='application/pdf'`,
        orderBy: "modifiedTime desc",
        fields: "files(id, name, webViewLink)"
    });

    if (!response.result.files.length) return;

    const cv = response.result.files[0];
    document.getElementById("cv-download-btn").href = cv.webViewLink;

    fetchAndExtractCV(cv.id);
}

/* ==========================================================================
   LOAD profile.jpg DYNAMICALLY (auto-update)
   ========================================================================== */

async function loadProfileImage() {
    const response = await gapi.client.drive.files.list({
        q: `'${CV_FOLDER_ID}' in parents and mimeType contains 'image/'`,
        fields: "files(id, name)"
    });

    if (!response.result.files.length) {
        console.warn("No images found in CV folder.");
        return;
    }

    // Pick file with "profile" in name
    const file = response.result.files.find(f => f.name.toLowerCase().includes("profile"));

    if (!file) {
        console.warn("profile.jpg not found.");
        return;
    }

    const heroImg = document.getElementById("hero-profile");

    // Direct image link (never expires)
    heroImg.src = `https://drive.google.com/uc?export=view&id=${file.id}`;
}

/* ==========================================================================
   PDF TEXT EXTRACTION
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
   CV PARSING (placeholder)
   ========================================================================== */

function parseCVText(text) {
    // Keep your static CV parsing logic for now
    updateAbout();
    updateSkills();
    updateExperience();
    updateEducation();
    updateLanguages();
    updateHobbies();
}

/* ==========================================================================
   MY WORKS — LOAD SUBFOLDERS
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
        q: `'${folderId}' in parents`,
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
    const response = await gapi.client.drive.files.list({
        q: `'${CONTENTS_FOLDER_ID}' in parents and mimeType contains 'video/'`,
        fields: "files(id, name, thumbnailLink, webViewLink)"
    });

    const container = document.getElementById("contents-video-container");
    container.innerHTML = "";

    response.result.files.forEach(video => {
        container.appendChild(createPreviewCard(video));
    });
}

/* ==========================================================================
   PREVIEW CARD GENERATOR (FULLY FIXED)
   ========================================================================== */

function createPreviewCard(file) {
    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");

    // Google's thumbnailLink is unreliable now → use hard direct thumbnail endpoint
    if (file.thumbnailLink) {
        img.src = `https://drive.google.com/thumbnail?authuser=0&sz=w1000&id=${file.id}`;
    } else if (file.mimeType === "application/pdf") {
        img.src = `https://drive.google.com/thumbnail?authuser=0&sz=w1000&id=${file.id}`;
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

    img.onerror = () => {
        img.src = "https://via.placeholder.com/300x200?text=Preview+Unavailable";
        label.style.color = "white";
    };

    card.appendChild(img);
    card.appendChild(label);
    card.onclick = () => window.open(file.webViewLink, "_blank");

    return card;
}

/* ==========================================================================
   BRIGHTNESS DETECTION
   ========================================================================== */

function detectBrightness(image, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    try {
        ctx.drawImage(image, 0, 0);
    } catch {
        callback(200);  // Assume bright to make text black
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
   UI EFFECTS
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
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.8)";

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
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

