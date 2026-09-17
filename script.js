const leadForm = document.querySelector("#leadForm");

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty("--header-height", siteHeader.offsetHeight + "px");
  };
  new ResizeObserver(updateHeaderHeight).observe(siteHeader);
  updateHeaderHeight();
}

const reviewsSection = document.querySelector(".reviews-refresh");
if (reviewsSection) {
  const slides = [...reviewsSection.querySelectorAll(".review-slide")];
  const stage = reviewsSection.querySelector(".review-slides");
  const counter = reviewsSection.querySelector(".review-counter");
  let currentReview = 0;
  const showReview = (index) => {
    currentReview = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === currentReview;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
      slide.setAttribute("aria-label", `${i + 1} из ${slides.length}`);
    });
    counter.textContent = `${String(currentReview + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };
  reviewsSection.querySelectorAll("[data-review-direction]").forEach((button) => {
    button.addEventListener("click", () => showReview(currentReview + Number(button.dataset.reviewDirection)));
    button.disabled = slides.length < 2;
  });
  stage.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showReview(currentReview + (event.key === "ArrowRight" ? 1 : -1));
  });
  let touchStart;
  stage.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showReview(currentReview + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  showReview(0);
}

const requestDialog = document.querySelector("#request-dialog");
let requestTrigger;
document.querySelectorAll("[data-open-request]").forEach((button) => {
  button.addEventListener("click", () => {
    requestTrigger = button;
    requestDialog.showModal();
    document.body.classList.add("request-open");
    document.querySelector("#request-name").focus();
  });
});
requestDialog.querySelector(".request-close").addEventListener("click", () => requestDialog.close());
requestDialog.addEventListener("click", (event) => {
  const rect = requestDialog.getBoundingClientRect();
  if (event.target === requestDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) requestDialog.close();
});
requestDialog.addEventListener("close", () => {
  document.body.classList.remove("request-open");
  requestTrigger?.focus();
});
document.querySelector("#request-form").addEventListener("submit", (event) => event.preventDefault());


document.querySelectorAll(".comparison-range").forEach((range) => {
  const updateComparison = () => {
    const value = Number(range.value);
    range.closest(".comparison-slider").style.setProperty("--reveal", value + "%");
    range.setAttribute("aria-valuetext", `До: ${value}%, после: ${100 - value}%`);
  };
  range.addEventListener("input", updateComparison);
  updateComparison();
});

document.querySelectorAll(".package-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".package-disclosure");
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    card.classList.toggle("is-open", open);
    document.getElementById(button.getAttribute("aria-controls")).inert = !open;
  });
});

leadForm.addEventListener("submit", (event) => event.preventDefault());

const systemPanels = [...document.querySelectorAll(".system-panel")];
const systemTitle = document.querySelector("#system-title");
const systemList = document.querySelector(".system-panels");

if (systemTitle && systemPanels.length) {
  let scheduled = false;
  function updateSystemStack() {
    scheduled = false;
    const titleRect = systemTitle.getBoundingClientRect();
    const marker = titleRect.top + titleRect.height / 5;
    let active = 0;
    systemPanels.forEach((panel, index) => {
      if (panel.getBoundingClientRect().top <= marker) active = index;
    });
    systemPanels.forEach((panel, index) => {
      panel.classList.toggle("is-active", index === active);
    });
    systemList.style.setProperty("--stack-opacity", String(1 / (active + 1)));
  }
  function requestSystemUpdate() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateSystemStack);
    }
  }
  window.addEventListener("scroll", requestSystemUpdate, { passive: true });
  window.addEventListener("resize", requestSystemUpdate);
  window.addEventListener("pageshow", requestSystemUpdate);
  document.fonts.ready.then(requestSystemUpdate);
  updateSystemStack();
}
