const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const yearStamp = document.getElementById("year-stamp");

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
