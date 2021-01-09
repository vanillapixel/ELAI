let scriptActive = false;
let globalStyle = false;
let selectedEl = {};

let mouseStartX = 0;
let mouseStartY = 0;

let [currentX, currentY] = "00";

const body = document.querySelector("body");

const resizeObserver = new ResizeObserver(enablingResizing);

let newObjects = [];
let newElementCounter = 0;
let newElementCreation = "disabled";
let newestCreatedElement;

//TODO: injected ELAI CSS style
// const ELAICssStyle

const ELAI = document.createElement("ELAI");
ELAI.innerHTML = `<div class="icon" id="text-modifier">M
                      <div class="icon">S</div>
                      <div class="icon">C</div>
                    </div>
                    <div class="icon" id="rotation-modifier">R</div>
                    <div class="icon" id="translation-modifier">T</div>
                    <textarea
                      id="resize-text-modifier">
                    </textarea>`;

// const ELAI_SIDEBAR = document.createElement('ELAI-sidebar')
// ELAI_SIDEBAR.innerHTML = `    <div id="sidebar-wrapper">
// <div class="sidebar-button" id="create-new-element-button" alt="Select new element">■</div>
// <div class="sidebar-button">+</div>
// <div class="sidebar-button"></div>
// </div>`

function createNewUiButton(id, content, trigger, parent, callback) {
  const button = document.createElement("div");
  button.classList.add("sidebar-button");
  button.textContent = content;
  button.id = id;
  button.addEventListener(trigger, callback);
  parent.appendChild(button);
  return button;
}

const ELAI_SIDEBAR = document.createElement("div");
ELAI_SIDEBAR.classList.add("elai-sidebar");

const sidebarUiButtons = [
  createNewUiButton(
    "select-new-element-button",
    "^",
    "click",
    ELAI_SIDEBAR,
    enableSelectElement
  ),
  createNewUiButton(
    "create-new-element-button",
    "+",
    "click",
    ELAI_SIDEBAR,
    toggleNewElementCreation
  ),
];
sidebarUiButtons.forEach((sidebarUiButton) =>
  ELAI_SIDEBAR.appendChild(sidebarUiButton)
);

function createNewElement(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains("sidebar-button")) {
    console.log("pito");
    return;
  }
  newestCreatedElement = document.createElement("div");
  body.appendChild(newestCreatedElement);
  newestCreatedElement.classList.add("newObject");
  newestCreatedElement.id = `newObject-${newElementCounter}`;
  newObjects.push({
    name: newestCreatedElement.id,
    width: 0,
    height: 0,
    initialPosY: e.clientY,
    initialPosX: e.clientX,
    left: e.clientX,
    top: e.clientY,
  });
  newestCreatedElement.style.left = e.clientX + "px";
  newestCreatedElement.style.top = e.clientY + "px";
  document.addEventListener("mousemove", updateSize);
  newElementCounter++;
}

function updateSize(e) {
  e.preventDefault();
  e.stopPropagation();
  const lastElementCreated = newObjects[newObjects.length - 1];
  let { left, top, width, height, initialPosX, initialPosY } = newObjects[
    newObjects.length - 1
  ];
  lastElementCreated.width = Math.abs(e.clientX - initialPosX);
  console.log(lastElementCreated.width, newObjects[newObjects.length - 1]);
  width = Math.abs(e.clientX - initialPosX);
  if (initialPosX > e.clientX) {
    left -= initialPosX - e.clientX;
    newestCreatedElement.style.left = left + "px";
  } else {
    newestCreatedElement.style.left = left + "px";
  }
  height = Math.abs(e.clientY - initialPosY);
  if (initialPosY > e.clientY) {
    top -= initialPosY - e.clientY;
    newestCreatedElement.style.top = top + "px";
  } else {
    newestCreatedElement.style.top = top + "px";
  }
  newestCreatedElement.style.height = height + "px";
  newestCreatedElement.style.width = width + "px";
  console.log(newObjects[newObjects.length - 1]);
}

function stopUpdateSize(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log(newObjects[newObjects.length - 1]);
  document.removeEventListener("mousemove", updateSize);
  body.addEventListener("mouseleave", stopUpdateSize);
  toggleNewElementCreation();
  selectElement(e);
  newestCreatedElement = null;
}

function toggleNewElementCreation() {
  newElementCreation === "disabled"
    ? enableNewElementCreation()
    : disableNewObjectCreation();
}

function enableNewElementCreation() {
  newElementCreation = "enabled";
  //TODO: newly created element is SELECTED_EL.el
  body.addEventListener("mousedown", createNewElement);
  body.addEventListener("mouseup", stopUpdateSize);
  body.addEventListener("mouseleave", stopUpdateSize);
  showNotificationBar("success", "Create new object mode enabled");
  newestCreatedElement = null;
}
function disableNewObjectCreation() {
  newElementCreation = "disabled";
  body.removeEventListener("mousedown", createNewElement);
  body.removeEventListener("mouseup", stopUpdateSize);
  body.removeEventListener("mouseleave", stopUpdateSize);
  showNotificationBar("error", "Create new object mode disabled");
}

// key combination to activate the script;
// ctrl + shift + a (windows)

//TODO: Backup properties function is useless?

//TODO: Create sidebar for actions:
// rotate, change background, resize, move (done), font-size

document.addEventListener("keyup", toggleScriptActivation);

function toggleScriptActivation(e) {
  // ctrl + shift + a
  const ACTIVATION_SHORTCUT = e.ctrlKey && e.shiftKey && e.which === 65;
  if (ACTIVATION_SHORTCUT) {
    scriptActive = !scriptActive;
    if (scriptActive) {
      // setGlobalStyle();
      showNotificationBar("success", "ELAI Activated");
      body.appendChild(ELAI_SIDEBAR);
      enableSelectElement();
    } else {
      showNotificationBar("error", "ELAI Dectivated");
      disableElementSelection(e);
    }
  }
}

function enableSelectElement() {
  document.addEventListener("click", selectElement);
}

function selectElement(e) {
  if (e.target.classList.contains("sidebar-button")) {
    console.log("pito");
    return;
  }
  document.removeEventListener("click", selectElement);
  console.log(newestCreatedElement);
  selectedEl.el = newestCreatedElement || e.target;
  newestCreatedElement
    ? selectedEl.el.appendChild(document.createElement("text"))
    : null;
  selectedEl.specs = getComputedStyle(selectedEl.el);
  const { specs } = selectedEl;
  selectedEl.el.style.minWidth = "30px";
  selectedEl.el.style.minHeight = "30px";
  selectedEl.el.style.whiteSpace = "pre-wrap";
  console.log(specs.width);
  injectELAI();
  setTimeout(() => {
    ELAI.style.display = "block";
  }, 200);

  const textModifier = document.querySelector("#resize-text-modifier");

  const translationModifier = document.querySelector("#translation-modifier");
  textModifier.value = selectedEl.el.childNodes[0].textContent;
  textModifier.style.font = specs.font;
  textModifier.style.paddingLeft = specs.paddingLeft;
  textModifier.style.paddingRight = specs.paddingRight;
  textModifier.style.paddingTop = specs.paddingTop;
  textModifier.style.paddingBottom = specs.paddingBottom;

  textModifier.addEventListener("input", changeText);
  enablingResizing(selectedEl);
  resizeObserver.observe(textModifier);
  translationModifier.addEventListener("mousedown", enableRepositioning);
}

function injectELAI() {
  selectedEl.el.appendChild(ELAI);
}

// function changeCSSProperties(array_of_elements, cssPropertiesObject) {
//   array_of_elements.forEach(el => {
//     Object.keys(cssPropertiesObject).forEach(key => {
//       el[key] =!
//     })
//   })
// }

function changeText(e) {
  selectedEl.el.childNodes[0].textContent = e.target.value;
}

//TODO: Change activation listener

function startRepositioning(e) {
  e.preventDefault();
  e.stopPropagation();
  let translationX = Math.round(Number(currentX) + e.clientX - mouseStartX);
  let translationY = Math.round(Number(currentY) + e.clientY - mouseStartY);
  selectedEl.el.style.transform = `translate(${translationX}px, ${translationY}px)`;
}

function stopRepositioning(e) {
  e.preventDefault();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  body.removeEventListener("mousemove", startRepositioning);
  body.removeEventListener("mouseup", stopRepositioning);
}

// TODO: element rotation

// let rotation = Math.round((e.clientX - mouseStartX) / 0.7);
// selectedEl.el.style.transform = `rotate(${rotation}deg)`;

function enableRepositioning(e) {
  e.preventDefault();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  // regex filters the numbers from the transform string
  const currentTranslation = selectedEl.el.style.transform || "0 0";
  //
  [currentX, currentY] = currentTranslation
    .split(" ")
    .map((x) => x.replace(/[^-.0-9]/g, ""));
  body.addEventListener("mousemove", startRepositioning);
  body.addEventListener("mouseup", stopRepositioning);
}

function enablingResizing() {
  const resizer = document.querySelector("#resize-text-modifier");
  const paddingLR =
    Number(selectedEl.specs.paddingLeft.slice(0, -2)) +
    Number(selectedEl.specs.paddingRight.slice(0, -2));
  const paddingTB =
    Number(selectedEl.specs.paddingTop.slice(0, -2)) +
    Number(selectedEl.specs.paddingBottom.slice(0, -2));
  let width = resizer.style.width.slice(0, -2) - paddingLR;

  let height = resizer.style.height.slice(0, -2) - paddingTB;

  selectedEl.el.style.width = width + "px";
  selectedEl.el.style.height = height + "px";
}

function showNotificationBar(type, message) {
  const body = document.querySelector("body");
  const background = {
    success: "#51bb51",
    warning: "#f19f0b",
    error: "#ff3a3a",
  };
  const newMessage = document.createElement("div");
  newMessage.textContent = message;
  let style = {
    minWidth: "50%",
    textAlign: "center",
    background: background[type],
    padding: "20px 40px",
    boxSizing: "content-box",
    fontSize: "20px",
    color: "white",
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    opacity: 0,
    transition: "1s",
    zIndex: 99999999999999,
  };
  Object.assign(newMessage.style, style);
  body.appendChild(newMessage);
  setTimeout(() => {
    newMessage.style.opacity = 1;
    newMessage.style.top = "20px";
  }, 50);
  setTimeout(() => {
    newMessage.style.opacity = style.opacity;
    newMessage.style.top = style.top;
  }, 2500);
  setTimeout(() => {
    body.removeChild(newMessage);
  }, 3500);
}

let SELECTED_EL = { el: null, x: 0, y: 0 };
let highlightedElement = { el: null, props: {} };
let originalElShadow;
let originalElTransition;
let positionString;

function backupItemCssProperties(props, dest) {
  props.forEach(
    (prop) => (dest[prop] = getComputedStyle(el).getPropertyValue(prop))
  );
}

function setItemCssProperties(el, props) {
  let propKeys = Object.keys(props);
  propKeys.forEach((prop) => {
    el.style[prop] = props[prop];
  });
}

function restoreItemCssProperties(el, props) {
  let propKeys = Object.keys(props);
  propKeys.forEach((prop) => (el.style[prop] = props[prop]));
}

function toggleHighlightElement(
  e,
  propertiesToChange = { boxShadow: "0px 0px 0px 3px red", cursor: "pointer" }
) {
  e.preventDefault();
  e.stopPropagation();

  /* if mouse ENTERS the element area - ADD highlight to element */
  if (e.type === "mouseover") {
    setItemCssProperties(el, propertiesToChange);
  }
  /* if mouse LEAVES the element area - REMOVE highlight to element */
  if (e.type === "mouseleave") {
    restoreItemCssProperties(el, highlightedElement.props);
  }
}

function setGlobalStyle() {
  const css = "* {overflow: visible !important; cursor: pointer !important};";
  head = document.head || document.getElementsByTagName("head")[0];
  if (!document.querySelector("#ELAIStyle")) {
    style = document.createElement("style");
    style.id = "ELAIStyle";
    head.appendChild(style);
    style.type = "text/css";
  }
  style.textContent = css;
}

function disableElementSelection(e) {
  e.preventDefault();
  // const ELAICssStyle = document.querySelector("#ELAIStyle");
  // ELAICssStyle.innerHTML = "";
  const resizer = document.querySelector("#resize-text-modifier");
  resizeObserver.unobserve(resizer);
  selectedEl.el.removeChild(ELAI);
  body.removeChild(ELAI_SIDEBAR);
  document.removeEventListener("click", selectElement);
  selectedEl.el.removeEventListener("mousedown", enableRepositioning);
  document.removeEventListener("contextmenu", disableElementSelection);
  document.removeEventListener("mouseenter", toggleHighlightElement);
  document.removeEventListener("mouseleave", toggleHighlightElement);
}
