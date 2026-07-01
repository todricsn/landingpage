const packages = {
  basic: { name: "Базовый", price: 280000, finish: "Плитка до 60×60 см" },
  comfort: { name: "Комфорт", price: 420000, finish: "Крупноформатная плитка" },
  premium: { name: "Премиум", price: 680000, finish: "Микроцемент или камень" },
};

const quiz = [
  { key: "area", label: "Площадь", question: "Какая площадь санузла?", options: ["До 3 м²", "3–5 м²", "5–7 м²", "Более 7 м²"] },
  { key: "finish", label: "Тип отделки", question: "Какая отделка ближе?", options: ["Керамогранит", "Крупный формат", "Микроцемент", "Камень"] },
  { key: "plumbing", label: "Сантехника", question: "Что нужно предусмотреть?", options: ["Стандарт", "Инсталляция", "Ванна и душ", "Дизайнерская"] },
  { key: "time", label: "Сроки", question: "Когда планируете начать?", options: ["В этом месяце", "Через 1–2 месяца", "После проекта", "Пока выбираю"] },
  { key: "budget", label: "Бюджет", question: "Какой ориентир по бюджету?", options: ["до 300 тыс.", "300–500 тыс.", "500–800 тыс.", "обсудить"] },
];

let activePackage = "comfort";
let activeStep = 0;
const answers = {
  area: "3–5 м²",
  finish: "Крупный формат",
  plumbing: "Инсталляция",
  time: "Через 1–2 месяца",
  budget: "300–500 тыс.",
};

const money = (value) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

function getProjectSummary() {
  const price = estimatePrice();
  const budget = answers.budget.endsWith(".") ? answers.budget.toLowerCase() : answers.budget.toLowerCase() + ".";
  return {
    title: `${packages[activePackage].name}, ${answers.area}`,
    details: `${answers.plumbing}, ${answers.finish.toLowerCase()}, бюджет ${budget}`,
    priceText: "от " + money(price),
  };
}

function estimatePrice() {
  let price = packages[activePackage].price;
  if (answers.area === "5–7 м²") price += 80000;
  if (answers.area === "Более 7 м²") price += 160000;
  if (answers.finish === "Микроцемент" || answers.finish === "Камень") price += 120000;
  if (answers.plumbing === "Ванна и душ") price += 90000;
  if (answers.plumbing === "Дизайнерская") price += 140000;
  return price;
}

function updateSummary() {
  const project = getProjectSummary();
  document.querySelector("#summary-area").textContent = answers.area;
  document.querySelector("#summary-finish").textContent = packages[activePackage].name;
  document.querySelector("#summary-plumbing").textContent = answers.plumbing;
  document.querySelector("#summary-time").textContent = answers.time === "В этом месяце" ? "от 14 дней" : "от 20 дней";
  document.querySelector("#summary-price").textContent = project.priceText;
  document.querySelector("#quizPrice").textContent = project.priceText;
  document.querySelector("#quizSummary").textContent = `${project.title}. ${project.details}`;
  document.querySelector("#formProjectTitle").textContent = project.title;
  document.querySelector("#formProjectDetails").textContent = `${project.details} ${project.priceText}`;

  const form = document.querySelector("#leadForm");
  if (form) {
    form.elements.area.value = answers.area;
    form.elements.package.value = packages[activePackage].name;
  }
}

function renderQuiz() {
  const steps = document.querySelector("#quizSteps");
  const answerBox = document.querySelector("#answers");
  const current = quiz[activeStep];

  steps.innerHTML = quiz.map((step, index) => `
    <button type="button" class="${index === activeStep ? "active" : ""}" data-step="${index}">
      <span class="step-dot">${index + 1}</span>
      <span>${step.label}</span>
    </button>
  `).join("");

  document.querySelector("#questionCount").textContent = `${activeStep + 1} из ${quiz.length}`;
  document.querySelector("#questionTitle").textContent = current.question;
  document.querySelector(".question").dataset.step = current.key;
  answerBox.innerHTML = current.options.map((option, index) => `
    <button type="button" class="${answers[current.key] === option ? "selected" : ""}" data-answer="${option}">
      ${current.key === "area" ? `<span class="plan-thumb plan-${index}"></span>` : ""}
      <span>${option}</span>
    </button>
  `).join("");

  document.querySelector("#prevQuestion").disabled = activeStep === 0;
  document.querySelector("#nextQuestion").disabled = activeStep === quiz.length - 1;
}

document.querySelectorAll(".package-card").forEach((card) => {
  card.addEventListener("click", () => {
    activePackage = card.dataset.package;
    document.querySelectorAll(".package-card").forEach((item) => item.classList.toggle("active", item === card));
    updateSummary();
  });
});

document.querySelector("#quizSteps").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-step]");
  if (!button) return;
  activeStep = Number(button.dataset.step);
  renderQuiz();
});

document.querySelector("#answers").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;
  answers[quiz[activeStep].key] = button.dataset.answer;
  renderQuiz();
  updateSummary();
});

document.querySelector("#prevQuestion").addEventListener("click", () => {
  activeStep = Math.max(0, activeStep - 1);
  renderQuiz();
});

document.querySelector("#nextQuestion").addEventListener("click", () => {
  activeStep = Math.min(quiz.length - 1, activeStep + 1);
  renderQuiz();
});

document.querySelector("#leadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const project = getProjectSummary();
  const lines = [
    "Заявка на расчет ремонта от РомРемонт Красноярск",
    "",
    `Имя: ${formData.get("name")}`,
    `Телефон: ${formData.get("phone")}`,
    `Email: ${formData.get("email") || "не указан"}`,
    `Способ связи: ${formData.get("contactMethod")}`,
    "",
    `Пакет: ${packages[activePackage].name}`,
    `Площадь: ${answers.area}`,
    `Отделка: ${answers.finish}`,
    `Сантехника: ${answers.plumbing}`,
    `Сроки: ${answers.time}`,
    `Бюджет клиента: ${answers.budget}`,
    `Предварительный расчет: ${project.priceText}`,
    "",
    `Комментарий: ${formData.get("comment") || "без комментария"}`,
  ];

  const subject = encodeURIComponent(`РомРемонт: расчет ${project.title}`);
  const body = encodeURIComponent(lines.join("\n"));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  document.querySelector("#formStatus").textContent = "Письмо подготовлено в почтовом клиенте. В рабочей версии можно добавить почту РомРемонт или CRM.";
});

document.querySelector("#leadForm").elements.area.addEventListener("change", (event) => {
  answers.area = event.target.value;
  renderQuiz();
  updateSummary();
});

document.querySelector("#leadForm").elements.package.addEventListener("change", (event) => {
  activePackage = Object.keys(packages).find((key) => packages[key].name === event.target.value) || activePackage;
  document.querySelectorAll(".package-card").forEach((item) => {
    item.classList.toggle("active", item.dataset.package === activePackage);
  });
  updateSummary();
});

renderQuiz();
updateSummary();
