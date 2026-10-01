(() => {
  "use strict";
  const tasks = {
    formula: {
      title: "Make an equation<br>that equals 12.",
      name: "Semantic Formula Assembly",
      description: "Select operands and an operator, then bind them to the three expression slots. Success requires both a valid equation and correct physical placement.",
      assignment: "<strong>4</strong> → A <span>·</span> <strong>×</strong> → B <span>·</span> <strong>3</strong> → C",
      note: "Example outcome: 4 × 3 = 12.",
      finalAlt: "Completed formula assembly: cubes 4, multiplication, and 3 placed on regions A, B, and C to form 4 × 3 = 12.",
      number: "01 / 02"
    },
    retrieval: {
      title: "Below 4 goes left.<br>Above 4 goes right.",
      name: "Constraint Retrieval",
      description: "Evaluate a condition for each object and assign the matching objects to their destinations. The same learned policy executes the resulting transfers.",
      assignment: "<strong>2, 3</strong> → left <span>·</span> <strong>5</strong> → right",
      note: "The cube 4 satisfies neither selection condition.",
      finalAlt: "Completed constraint retrieval: cubes 2 and 3 are on the left, cube 5 is on the right, and cube 4 remains in the center.",
      number: "02 / 02"
    }
  };
  const asset = (name) => (window.ACE_ASSETS && window.ACE_ASSETS[name]) || `assets/${name}`;
  let selectedTask = "formula";
  let selectedFrame = 3;
  const tabs = [...document.querySelectorAll("[data-task]")];
  const frames = [...document.querySelectorAll("[data-frame]")];
  const image = document.getElementById("task-image");
  function updateFrame(announce = true) {
    image.src = asset(`${selectedTask}-${selectedFrame + 1}.webp`);
    image.alt = selectedFrame === 3 ? tasks[selectedTask].finalAlt : `${tasks[selectedTask].name}, recorded frame ${selectedFrame + 1} of 4, showing tabletop cubes during execution.`;
    image.width = selectedTask === "formula" ? 1101 : 825;
    image.height = selectedTask === "formula" ? 618 : 619;
    frames.forEach((button, i) => button.setAttribute("aria-pressed", String(i === selectedFrame)));
    if (announce) document.getElementById("frame-status").textContent = `${tasks[selectedTask].name}. Frame ${selectedFrame + 1} of 4.`;
  }
  function selectTask(name) {
    selectedTask = name;
    selectedFrame = 3;
    tabs.forEach(button => {
      const selected = button.dataset.task === name;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    document.getElementById("task-panel").setAttribute("aria-labelledby", `tab-${name}`);
    document.getElementById("task-title").innerHTML = tasks[name].title;
    document.getElementById("task-description").textContent = tasks[name].description;
    document.getElementById("task-assignment").querySelector("p").innerHTML = tasks[name].assignment;
    document.getElementById("task-note").textContent = tasks[name].note;
    document.getElementById("task-number").textContent = tasks[name].number;
    updateFrame();
  }
  tabs.forEach((button, index) => {
    button.addEventListener("click", () => selectTask(button.dataset.task));
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      selectTask(tabs[next].dataset.task);
    });
  });
  frames.forEach((button, index) => button.addEventListener("click", () => { selectedFrame = index; updateFrame(); }));

  const dialog = document.getElementById("figure-dialog");
  const dialogImage = document.getElementById("dialog-image");
  const zoomButton = document.getElementById("zoom-figure");
  const imageWrap = document.getElementById("dialog-image-wrap");
  let figureZoomed = false;
  function setFigureZoom(zoomed) {
    figureZoomed = zoomed;
    dialogImage.style.width = zoomed ? `${dialogImage.naturalWidth || 1800}px` : "100%";
    dialogImage.style.maxWidth = zoomed ? "none" : "100%";
    zoomButton.setAttribute("aria-pressed", String(zoomed));
    zoomButton.textContent = zoomed ? "Fit to screen −" : "Zoom in +";
    imageWrap.scrollTo(0, 0);
  }
  zoomButton.addEventListener("click", () => setFigureZoom(!figureZoomed));
  document.querySelectorAll("[data-enlarge]").forEach(button => button.addEventListener("click", () => {
    document.getElementById("dialog-title").textContent = button.dataset.figureTitle;
    dialogImage.src = asset(button.dataset.enlarge.split("/").pop());
    dialogImage.alt = button.querySelector("img").alt;
    setFigureZoom(false);
    dialog.showModal();
    document.body.classList.add("figure-open");
  }));
  dialog.addEventListener("close", () => document.body.classList.remove("figure-open"));
  document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });

  const copyButton = document.getElementById("copy-citation");
  copyButton.addEventListener("click", async () => {
    const text = document.getElementById("bibtex").textContent;
    let success = false;
    try { await navigator.clipboard.writeText(text); success = true; } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;left:-9999px;top:0;";
      document.body.appendChild(textarea);
      textarea.select();
      try { success = document.execCommand("copy"); } catch (_) {}
      textarea.remove();
      copyButton.focus();
    }
    document.getElementById("copy-status").textContent = success ? "BibTeX copied to clipboard." : "Please select and copy the citation text below.";
    if (success) {
      copyButton.textContent = "Copied ✓";
      window.setTimeout(() => { copyButton.innerHTML = 'Copy BibTeX <span aria-hidden="true">⧉</span>'; }, 2200);
    }
  });

  const config = window.ACE_CONFIG || {};
  if (config.codeUrl && /^https?:\/\//.test(config.codeUrl)) {
    const link = document.getElementById("code-link");
    link.href = config.codeUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.hidden = false;
  }
  if (config.videoSrc) {
    const video = document.getElementById("demo-video");
    video.src = config.videoSrc;
    if (config.videoPoster) video.poster = config.videoPoster;
    if (config.videoCaptions) {
      const track = document.createElement("track");
      Object.assign(track, {kind: "captions", label: "English", srclang: "en", src: config.videoCaptions, default: true});
      video.appendChild(track);
    }
    document.getElementById("demo").hidden = false;
    document.getElementById("video-link").hidden = false;
  }
})();
