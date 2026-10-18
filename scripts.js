document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const mobileNavQuery = window.matchMedia("(max-width: 960px)");

    if (menuToggle && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
            navMenu.inert = mobileNavQuery.matches;
        };

        navMenu.inert = mobileNavQuery.matches;

        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
            navMenu.classList.toggle("active", !isOpen);
            menuToggle.setAttribute("aria-expanded", String(!isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
            navMenu.inert = isOpen;
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        document.addEventListener("click", event => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                closeMenu();
            }
        });

        mobileNavQuery.addEventListener("change", event => {
            closeMenu();
            navMenu.inert = event.matches;
        });
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll(".reveal");

    if (!reducedMotion && "IntersectionObserver" in window && revealItems.length) {
        document.body.classList.add("motion-ready");
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

        revealItems.forEach(item => revealObserver.observe(item));
    }

    const heroImage = document.querySelector(".home-hero .hero-image");
    if (heroImage && !reducedMotion && window.matchMedia("(min-width: 961px)").matches) {
        let parallaxFrame = 0;
        window.addEventListener("scroll", () => {
            if (parallaxFrame) {
                return;
            }

            parallaxFrame = window.requestAnimationFrame(() => {
                const heroBottom = document.querySelector(".home-hero").getBoundingClientRect().bottom;
                heroImage.style.setProperty("--hero-shift", `${Math.min(0, heroBottom) * -0.025}px`);
                parallaxFrame = 0;
            });
        }, { passive: true });
    }

    const contactForm = document.getElementById("contactForm");
    const statusBox = document.getElementById("form-status");
    const serviceSelect = document.getElementById("service");

    if (serviceSelect) {
        const requestedService = new URLSearchParams(window.location.search).get("service");
        if (requestedService && [...serviceSelect.options].some(option => option.value === requestedService)) {
            serviceSelect.value = requestedService;
        }
    }

    if (contactForm && statusBox) {
        contactForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                statusBox.textContent = "Please complete all required fields and enter a valid email address.";
                return;
            }

            const blankRequiredField = [...contactForm.querySelectorAll("[required]")]
                .find(field => !field.value.trim());
            if (blankRequiredField) {
                blankRequiredField.focus();
                statusBox.textContent = "Please do not leave required fields blank.";
                return;
            }

            const formData = new FormData(contactForm);
            const valueFor = name => String(formData.get(name) || "").trim();
            const message = [
                "New inquiry for LUXEE GROWTH",
                `Name: ${valueFor("name")}`,
                `Email: ${valueFor("email")}`,
                `Phone: ${valueFor("phone")}`,
                `Service: ${valueFor("service")}`,
                `Enquiry: ${valueFor("message")}`
            ].join("\n");
            const whatsappUrl = `https://wa.me/917732018632?text=${encodeURIComponent(message)}`;

            const whatsappWindow = window.open(whatsappUrl, "_blank");
            if (whatsappWindow) {
                whatsappWindow.opener = null;
            } else {
                const fallbackLink = document.createElement("a");
                fallbackLink.href = whatsappUrl;
                fallbackLink.target = "_blank";
                fallbackLink.rel = "noopener noreferrer";
                fallbackLink.textContent = "Open your prepared WhatsApp message";
                statusBox.replaceChildren(
                    document.createTextNode("If WhatsApp did not open automatically, "),
                    fallbackLink,
                    document.createTextNode(". Press Send in WhatsApp to deliver your enquiry.")
                );
                return;
            }
            statusBox.textContent = "Your inquiry is ready in WhatsApp. Press Send in WhatsApp to deliver your message.";
        });

        contactForm.addEventListener("input", () => {
            statusBox.replaceChildren();
        });

        contactForm.addEventListener("change", () => {
            statusBox.replaceChildren();
        });
    }
});