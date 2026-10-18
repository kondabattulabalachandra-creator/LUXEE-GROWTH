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

    const intro = document.getElementById("intro-screen");
    if (intro) {
        const root = document.documentElement;
        const finishIntro = () => {
            try {
                sessionStorage.setItem("luxee-intro-seen", "1");
            } catch (error) {
                // Storage can be unavailable in private browsing; the intro simply plays again.
            }
            window.setTimeout(() => {
                intro.remove();
                root.classList.remove("intro-on");
                root.classList.add("intro-off");
            }, 700);
        };

        if (root.classList.contains("intro-on")) {
            const skipIntro = () => {
                intro.classList.add("intro-leave");
                root.classList.remove("intro-on");
                finishIntro();
            };
            intro.addEventListener("click", skipIntro, { once: true });
            document.addEventListener("keydown", skipIntro, { once: true });
            intro.addEventListener("animationend", event => {
                if (event.target === intro && event.animationName === "intro-out") {
                    finishIntro();
                }
            });
        } else {
            intro.remove();
        }
    }

    const navbar = document.querySelector(".navbar");
    const progress = document.querySelector(".scroll-progress");
    const backToTop = document.querySelector(".back-to-top");
    let scrollFrame = 0;
    const onScroll = () => {
        scrollFrame = 0;
        const scrollTop = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) {
            progress.style.setProperty("--progress", maxScroll > 0 ? (scrollTop / maxScroll).toFixed(4) : "0");
        }
        if (navbar) {
            navbar.classList.toggle("is-scrolled", scrollTop > 40);
        }
        if (backToTop) {
            backToTop.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.8);
        }
    };
    window.addEventListener("scroll", () => {
        if (!scrollFrame) {
            scrollFrame = window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const heroVisual = document.getElementById("hero-visual");
    if (heroVisual && finePointer && !reducedMotion) {
        const layers = heroVisual.querySelectorAll("[data-depth]");
        const hero = document.querySelector(".home-hero");
        hero.addEventListener("pointermove", event => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            layers.forEach(layer => {
                const depth = Number(layer.dataset.depth) || 1;
                layer.style.setProperty("--px", `${(x * depth * 18).toFixed(1)}px`);
                layer.style.setProperty("--py", `${(y * depth * 18).toFixed(1)}px`);
            });
        });
        hero.addEventListener("pointerleave", () => {
            layers.forEach(layer => {
                layer.style.setProperty("--px", "0px");
                layer.style.setProperty("--py", "0px");
            });
        });
    }

    if (finePointer) {
        document.querySelectorAll(".feature-card, .journal-grid a, .service-detail").forEach(card => {
            const canTilt = !reducedMotion && !card.classList.contains("service-detail");
            if (canTilt) {
                card.dataset.tilt = "";
            }
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
                card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
                if (canTilt) {
                    card.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
                    card.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
                }
            });
            card.addEventListener("pointerleave", () => {
                card.style.setProperty("--rx", "0deg");
                card.style.setProperty("--ry", "0deg");
            });
        });
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