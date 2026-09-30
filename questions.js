document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("surprise-question");
  if (!button) return;

  const targets = [
    "god-hidden",
    "resurrection-evidence",
    "geography",
    "honest-unbelief",
    "hell-finite-life",
    "created-for-hell",
    "why-create",
    "old-testament-violence",
    "gospel-differences",
    "why-die",
    "atonement-justice",
    "jesus-prays",
    "jesus-doesnt-know",
    "jesus-wrote-nothing",
    "slavery",
    "free-will",
    "morality",
    "christian-disagreement"
  ];

  button.addEventListener("click", () => {
    const id = targets[Math.floor(Math.random() * targets.length)];
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    history.replaceState(null, "", "#" + id);
  });
});
