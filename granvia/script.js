/**
 * Café Restaurant Carré d'Or - Supabase MVP JavaScript
 * Mobile Menu, Theme Toggle, Menu Filters, Lightbox, and Real-Time Supabase Reservation Engine
 */

// ==========================================================================
// 1. SUPABASE DATABASE CONFIGURATION - PUT YOUR KEYS HERE!
// ==========================================================================
// Copy your real "anon / public" API Key from your Supabase Dashboard 
// (Project Settings -> API) and paste it inside the quotes below!
const SUPABASE_URL = "https://jwzpkxldgctwchdhsdyj.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3enBreGxkZ2N0d2NoZGhzZHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODM2NDIsImV4cCI6MjA5NTU1OTY0Mn0.am18oyEI3CnmeId23Tw5lR5ouD0PfA40uoE49dqhbh0";

// Helper state to prevent double-submissions
let isSubmitting = false;

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Initialize Page Interactivities
    initTheme();
    initMobileNav();
    initNavbarScroll();
    initScrollspy();
    initMenuFilter();
    initGalleryLightbox();
    initReservationForm();
});

/* ==========================================================================
   2. GLOBAL THEME MANAGER (LIGHT/DARK MODE)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById("dark-mode-toggle");
    const themeIcon = document.getElementById("theme-icon");
    
    // Check local storage or fallback to system preference
    const savedTheme = localStorage.getItem("carre_dor_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute("data-theme", "dark");
        updateThemeIcon("dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        updateThemeIcon("light");
    }

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("carre_dor_theme", newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        themeIcon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
}

/* ==========================================================================
   3. MOBILE HAMBURGER MENU NAVIGATION
   ========================================================================== */
function initMobileNav() {
    const hamburger = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu-list");
    const navLinks = document.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Close side-navigation menu when clicking a page link
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });
}

/* ==========================================================================
   4. STICKY NAVBAR SCROLL BACKGROUND BLUR
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById("main-navbar");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

/* ==========================================================================
   5. SCROLLSPY (ACTIVE HEADER LINK ON PAGE SCROLL)
   ========================================================================== */
function initScrollspy() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });
}

/* ==========================================================================
   6. INTERACTIVE FILTERABLE MENU TABS
   ========================================================================== */
function initMenuFilter() {
    const filterButtons = document.querySelectorAll("#menu-category-tabs .filter-btn");
    const menuCards = document.querySelectorAll("#menu-items-grid .menu-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const selectedCategory = button.getAttribute("data-category");

            menuCards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");
                
                if (selectedCategory === "all" || cardCategory === selectedCategory) {
                    card.style.display = "flex";
                    card.style.animation = "cardFadeIn 0.5s ease forwards";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

/* ==========================================================================
   7. DYNAMIC GALLERY PICTURE ZOOM (LIGHTBOX)
   ========================================================================== */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll("#photo-gallery-grid .gallery-item");
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close-btn");

    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            const imageSrc = item.getAttribute("data-src");
            lightboxImg.setAttribute("src", imageSrc);
            lightbox.style.display = "flex";
            setTimeout(() => {
                lightbox.classList.add("active");
            }, 10);
        });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove("active");
        setTimeout(() => {
            lightbox.style.display = "none";
        }, 300);
    }
}

/* ==========================================================================
   8. SUPABASE ONLINE DATABASE RESERVATION ENGINE
   ========================================================================== */
function initReservationForm() {
    const bookingForm = document.getElementById("booking-form");
    const submitBtn = document.getElementById("booking-submit-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");
    
    // Success Ticket modal components
    const successModal = document.getElementById("success-modal");
    const closeTicketBtn = document.getElementById("ticket-close-btn");
    const waConfirmBtn = document.getElementById("ticket-whatsapp-confirm");
    
    // Lock calendar past dates
    const dateInput = document.getElementById("booking-date");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.setAttribute("min", today);
    }

    if (!bookingForm) return;

    // Create an inline error feedback container inside the form to display error details dynamically
    const errorContainer = document.createElement("div");
    errorContainer.style.gridColumn = "span 2";
    errorContainer.style.color = "#C62828";
    errorContainer.style.fontSize = "0.9rem";
    errorContainer.style.marginTop = "10px";
    errorContainer.style.textAlign = "center";
    errorContainer.style.fontWeight = "600";
    errorContainer.style.display = "none";
    bookingForm.appendChild(errorContainer);

    // --- FORM SUBMIT HANDLER ---
    bookingForm.addEventListener("submit", async (e) => {
        // PREVENT PAGE REFRESH ON SUBMIT (Standard AJAX form behavior)
        e.preventDefault();
        
        // --- PREVENTION OF DUPLICATE SUBMISSIONS ---
        // If form is already transmitting data, exit immediately to prevent duplicate database rows
        if (isSubmitting) return;
        isSubmitting = true;
        
        // Update button text to loading state and disable clicking
        btnText.style.display = "none";
        btnSpinner.style.display = "inline-block";
        submitBtn.disabled = true;
        errorContainer.style.display = "none";

        // Read field values from the HTML input elements
        const name = document.getElementById("booking-name").value.trim();
        const phone = document.getElementById("booking-phone").value.trim();
        const date = document.getElementById("booking-date").value;
        const time = document.getElementById("booking-time").value;
        const guests = document.getElementById("booking-guests").value;
        const locationPref = document.getElementById("booking-location").value;
        const message = document.getElementById("booking-message").value.trim();
        
        // Generate a localized unique booking ticket receipt ID for customer verification
        const reservationId = "CO-" + Math.floor(100000 + Math.random() * 900000);

        // Fallback checks: If Anon Key placeholder is not replaced, fallback to local sandbox mode gracefully
        const isCredentialsPlaceholder = SUPABASE_URL.includes("YOUR_SUPABASE") || SUPABASE_ANON_KEY.includes("PUT_YOUR_ANON_KEY");

        if (isCredentialsPlaceholder || typeof supabase === "undefined") {
            console.warn("Supabase Anon Key is currently placeholder. Operating in local sandbox mode.");
            
            setTimeout(() => {
                const fallbackData = {
                    full_name: name,
                    phone: phone,
                    guests: parseInt(guests),
                    reservation_datetime: `${date}T${time}:00`,
                    notes: `Preference: ${locationPref}. Notes: ${message || 'None'}`
                };
                
                // Trigger client modal ticket success display
                showSuccessModal(fallbackData, reservationId, locationPref, message);
                restoreSubmitState();
                bookingForm.reset();
            }, 800);
            return;
        }

        // --- SUBMIT RESERVATION TO SUPABASE ---
        try {
            // Sanitize URL: Strip trailing "/rest/v1/" or "/rest/v1" or slashes if copy-pasted
            let cleanUrl = SUPABASE_URL.trim();
            if (cleanUrl.endsWith("/rest/v1/")) {
                cleanUrl = cleanUrl.slice(0, -9);
            } else if (cleanUrl.endsWith("/rest/v1")) {
                cleanUrl = cleanUrl.slice(0, -8);
            }
            if (cleanUrl.endsWith("/")) {
                cleanUrl = cleanUrl.slice(0, -1);
            }

            // Initialize Supabase Client
            const supabaseClient = supabase.createClient(cleanUrl, SUPABASE_ANON_KEY);

            // Construct payload matching the exact columns requested by the user
            const supabasePayload = {
                full_name: name, // maps to "full_name" column
                phone: phone, // maps to "phone" column
                guests: parseInt(guests), // maps to "guests" column
                reservation_datetime: `${date}T${time}:00`, // maps to "reservation_datetime" column (ISO format)
                notes: `Seating: ${locationPref}. Requests: ${message || 'None'}` // maps to optional "notes" column
            };

            // Insert data into table "reservations"
            const { data, error } = await supabaseClient
                .from("reservations")
                .insert([supabasePayload]);

            if (error) {
                throw error; // throw error directly to be caught by the catch block below
            }

            console.log("Successfully saved reservation to Supabase table!", data);

            // DISPLAY SUCCESS RECEIPT MODAL (Zero design changes, maintains beautiful layout)
            showSuccessModal(supabasePayload, reservationId, locationPref, message);
            bookingForm.reset(); // clear input forms

        } catch (err) {
            console.error("Supabase cloud insertion failed:", err);
            
            // SHOW ERROR MESSAGE ON PAGE (Elegant inline block)
            errorContainer.innerText = `Error: ${err.message || 'Unable to connect to database. Please try again or call +212 628 322 414.'}`;
            errorContainer.style.display = "block";
            
            // Scroll smoothly down to the error container
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } finally {
            restoreSubmitState();
        }
    });

    // Restore buttons and locks to normal active state
    function restoreSubmitState() {
        btnText.style.display = "inline";
        btnSpinner.style.display = "none";
        submitBtn.disabled = false;
        isSubmitting = false;
    }

    // Close success ticket
    closeTicketBtn.addEventListener("click", () => {
        successModal.classList.remove("active");
    });
    
    successModal.addEventListener("click", (e) => {
        if (e.target === successModal) {
            successModal.classList.remove("active");
        }
    });

    // Populate data values into receipt and open confirmation modal
    function showSuccessModal(data, reservationId, locationPref, originalMessage) {
        document.getElementById("ticket-client-name").innerText = data.full_name.split(" ")[0];
        document.getElementById("ticket-id").innerText = `#${reservationId}`;
        document.getElementById("ticket-name").innerText = data.full_name;
        document.getElementById("ticket-phone").innerText = data.phone;
        
        // Format Date beautifully
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const rawDate = data.reservation_datetime.split("T")[0];
        const prettyDate = new Date(rawDate).toLocaleDateString('en-US', dateOptions);
        
        // Format Time beautifully (12-hour format)
        const rawTime = data.reservation_datetime.split("T")[1].substring(0, 5);
        const [hours, minutes] = rawTime.split(":");
        const isPm = parseInt(hours) >= 12;
        const prettyTime = `${parseInt(hours) % 12 || 12}:${minutes} ${isPm ? 'PM' : 'AM'}`;

        document.getElementById("ticket-datetime").innerText = `${prettyDate} at ${prettyTime}`;
        document.getElementById("ticket-guests").innerText = `${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}`;
        document.getElementById("ticket-pref").innerText = locationPref;
        document.getElementById("ticket-notes").innerText = originalMessage || "None";

        // Pre-fill WhatsApp verification details
        const waText = `السلام عليكم Café Restaurant Carré d'Or! ✨\n\nI would like to verify my table reservation booking:\n\n*Reservation ID:* #${reservationId}\n*Name:* ${data.full_name}\n*Date:* ${prettyDate}\n*Time:* ${prettyTime}\n*Guests:* ${data.guests}\n*Seating Choice:* ${locationPref}\n*Notes:* ${originalMessage || 'None'}\n\nThank you! ☕️🇲🇦`;
        
        const encodedText = encodeURIComponent(waText);
        waConfirmBtn.setAttribute("href", `https://wa.me/212628322414?text=${encodedText}`);

        // Open modal
        successModal.classList.add("active");
    }
}
