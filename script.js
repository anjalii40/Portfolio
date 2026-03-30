const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const yearStamp = document.getElementById("year-stamp");
const progressBar = document.getElementById("scroll-progress-bar");
const parallaxItems = document.querySelectorAll("[data-parallax]");

if (yearStamp) {
  yearStamp.textContent = `© ${new Date().getFullYear()}`;
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

const updateScrollEffects = () => {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.1);
    const rect = item.getBoundingClientRect();
    const offset = (window.innerHeight * 0.5 - rect.top) * speed;
    item.style.setProperty("--parallax-y", `${offset}px`);
  });
};

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
