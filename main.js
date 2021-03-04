// TODO: CURRENT PROBLEMS:
// -second showNotificationBar won't be shown if two of the same type are requested within a 3.5s gap
// - change ELAI icons look
// - change sidebar buttons look according to status
// - create script usage instruction:
// -    - add page title
// -    - add list commands
// fix bug rotation feature (bottom left tilts weirdly)

let ACTIVATION_SHORTCUT = (e) => e.ctrlKey && e.code === "AltLeft";

let globalStyle = false;
let selectedEl = {};
let hoveredElement;

let [mouseStartX, mouseStartY] = [0, 0];

const body = document.querySelector("body");

let newObjects = [];
let newElementCounter = 0;

let isScriptActive = false;
let newElementCreationActive = false;
let elementSelectionActive = false;

const snapAngleDelta = 45;
const snapThreshold = 2;
let snapOnRotation = true;
let snapAngles = [];
for (let i = 0; i <= 180; i += snapAngleDelta) {
  snapAngles = [...snapAngles, i];
}

let currentNotificationBarId;
let notificationBarIdCounter = 0;

const ELAI = document.createElement("ELAI");
const ELAI_SIDEBAR = document.createElement("div");
const head = document.head || document.getElementsByTagName("head")[0];
ELAI.setAttribute("contenteditable", false);
ELAI_SIDEBAR.setAttribute("contenteditable", false);
ELAI_SIDEBAR.classList.add("elai-sidebar");

function excludeElaiElementsCondition(e) {
  return (
    e.target.classList.contains("elai-button") ||
    e.target === body ||
    e.target === selectedEl.el ||
    e.target === ELAI ||
    e.target === selectedEl.rotationTrack ||
    e.target === selectedEl.rotationTrackCenter ||
    e.target === ELAI_SIDEBAR
  );
}

function createElaiButton(opts) {
  const button = document.createElement(opts.type || "div");
  button.classList.add("elai-button");
  button.innerHTML = opts.content;
  button.id = opts.id;
  button.addEventListener(opts.eventListenerTrigger, opts.callback);
  opts.parent.appendChild(button);
  return button;
}

function createUiLabel(id, content, eventListner, callback) {}

const ELAI_BUTTONS = {
  // ELAI SIDEBAR BUTTONS

  createNewElementBtn: {
    parent: ELAI_SIDEBAR,
    id: "deselect-element-button",
    type: "div",
    content: "+",
    eventListenerTrigger: "click",
    callback: toggleNewElementCreation,
  },

  deselectElementBtn: {
    parent: ELAI_SIDEBAR,
    id: "create-new-element-button",
    type: "div",
    content: "-",
    eventListenerTrigger: "click",
    callback: deselectElement,
  },

  // ELAI ELEMENT BUTTONS
  resizeBtn: {
    parent: ELAI,
    id: "resize-btn",
    type: "div",
    content: "♥",
    eventListenerTrigger: "mousedown",
    callback: enableResizeElement,
  },
  rotationBtn: {
    parent: ELAI,
    id: "rotation-btn",
    type: "div",
    content: "○",
    eventListenerTrigger: "mousedown",
    callback: enableRotateElement,
  },
  repositionBtn: {
    parent: ELAI,
    id: "reposition-btn",
    type: "div",
    content: "♥",
    eventListenerTrigger: "mousedown",
    callback: enableMoveElement,
  },
};

selectedEl.rotationTrack = document.createElement("div");

selectedEl.rotationTrack.classList.add("rotation-track");
ELAI.appendChild(selectedEl.rotationTrack);

selectedEl.rotationTrackCenter = document.createElement("div");

selectedEl.rotationTrackCenter.classList.add("rotation-track-center");
selectedEl.rotationTrack.appendChild(selectedEl.rotationTrackCenter);

Object.keys(ELAI_BUTTONS).forEach((button) =>
  createElaiButton(ELAI_BUTTONS[button])
);

// bgModifier = {
//   id: "background-modifier",
//   type: "input",
//   content: "■",
//   callback: callback,
//   valueDisplayer: bgModifier,
// };
// textColorModifier = {
//   id: "text-color-modifier",
//   type: "input",
//   content: "■",
//   callback: callback,
//   valueDisplayer: bgModifier,
// };
// fontSizeModifier = {
//   id: "font-size-modifier",
//   type: "input",
//   content: "■",
//   callback: callback,
//   valueDisplayer: bgModifier,
// };

const topLeftUIComponentsContainer = document.createElement("div");

function createElement(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains("elai-button")) {
    return;
  }
  const createdElement = document.createElement("div");
  //this allows the new element text to be editable - empty elements texts can't be edited
  selectedEl.el = createdElement;
  body.appendChild(createdElement);
  createdElement.classList.add("newObject");
  createdElement.id = `newObject-${newElementCounter}`;
  newObjects.push({
    name: createdElement.id,
    width: 0,
    height: 0,
    mouseStartY: e.clientY,
    mouseStartX: e.clientX,
    left: e.clientX,
    top: e.clientY,
  });
  createdElement.style.left = e.clientX + "px";
  createdElement.style.top = e.clientY + "px";
  enableResizeElement(e);
  newElementCounter++;
  selectedEl.el.textContent = "change/remove text";
}

function disableResizeElement() {
  document.removeEventListener("mousemove", resizeElement);
  document.removeEventListener("mouseup", disableResizeElement);
}

function enableResizeElement(e) {
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  selectedEl.el.initialWidth = parseInt(getComputedStyle(selectedEl.el).width);
  selectedEl.el.initialHeight = parseInt(
    getComputedStyle(selectedEl.el).height
  );
  document.addEventListener("mousemove", resizeElement);
  document.addEventListener("mouseup", disableResizeElement);
}

function resizeElement(e) {
  e.preventDefault();
  e.stopPropagation();
  const updatedWidth = selectedEl.el.initialWidth + e.clientX - mouseStartX;
  const updatedHeight = selectedEl.el.initialHeight + e.clientY - mouseStartY;
  selectedEl.el.style.width = updatedWidth + "px";
  selectedEl.el.style.height = updatedHeight + "px";
}

function toggleNewElementCreation() {
  !newElementCreationActive ? enableCreateElement() : disableCreateElement();
  newElementCreationActive = !newElementCreationActive;
}

function enableCreateElement() {
  //TODO: newly created element is SELECTED_EL.el
  selectedEl.el ? deselectElement() : null;
  document.addEventListener("mousedown", createElement);
  document.addEventListener("mouseup", disableCreateElement);
  document.addEventListener("mouseleave", disableCreateElement);
  showNotificationBar("success", "Create new object mode enabled");
  newElementCreationActive = true;
}
function disableCreateElement(e) {
  selectElement(e, selectedEl.el);
  disableResizeElement();
  document.removeEventListener("mousedown", createElement);
  document.removeEventListener("mousemove", resizeElement);
  document.removeEventListener("mouseup", disableCreateElement);
  document.removeEventListener("mouseleave", disableCreateElement);
  newElementCreationActive = false;
  showNotificationBar("error", "Create new object mode disabled");
}

//TODO: Backup properties function is useless?

//TODO: Create sidebar for actions:
// rotate, change background, resize, move (done), font-size
// TODO: fix the script activation for production

document.addEventListener("keydown", toggleScriptActivation);
function toggleScriptActivation(e) {
  // key combination to activate the script;
  // let ACTIVATION_SHORTCUT = e.ctrlKey && e.shiftKey && e.which === 65;
  //TODO: delete ctrl shortcut for production
  // ACTIVATION_SHORTCUT = "ControlLeft";
  // ctrl + shift + a (windows)
  if (ACTIVATION_SHORTCUT(e)) {
    isScriptActive = !isScriptActive;
    if (isScriptActive) {
      injectGlobalStyle();
      showNotificationBar("success", "ELAI Activated");
      enableSelectElement();
      document.addEventListener("mouseover", highlightHoveredElement);
      body.appendChild(ELAI_SIDEBAR);
    } else {
      document.removeEventListener("mouseover", highlightHoveredElement);
      showNotificationBar("error", "ELAI Dectivated");
      disableSelectElement();
      disableScript();
    }
  }
}

function enableSelectElement() {
  showNotificationBar("success", "Element Selection enabled");
  document.addEventListener("dblclick", selectElement);
  elementSelectionActive = true;
}
function disableSelectElement() {
  showNotificationBar("error", "Element Selection Disabled");
  document.removeEventListener("dblclick", selectElement);
  elementSelectionActive = false;
}
//TODO: implement functionality?
function toggleElementSelection() {
  if (!elementSelectionActive) {
  } else {
  }
  elementSelectionActive = !elementSelectionActive;
}

function selectElement(e, newElement) {
  e.preventDefault();
  if (excludeElaiElementsCondition(e)) {
    if (!newElement) return;
  }
  if (selectedEl.el != e.target && !newElement) {
    deselectElement();
  }
  if (e.target.tagName === "img" || e.target.tagName === "svg") {
    selectedEl.el = e.target.parentElement;
  } else {
    selectedEl.el = newElement || e.target;
  }
  ELAI.style.display = "block";
  e.target.tagName === "SPAN"
    ? (selectedEl.el.style.display = "inline-block")
    : null;
  selectedEl.el.setAttribute("contenteditable", true);
  selectedEl.rotation = 0;
  injectELAI();
  selectedEl.el.style.zIndex = !selectedEl.el.style.zIndex
    ? 1
    : selectedEl.el.style.zIndex;
  selectedEl.el.classList.add("ELAI-selected-element");
  document.addEventListener("keydown", deleteElement);
}

function deselectElement() {
  if (selectedEl.el) {
    selectedEl.el.removeChild(ELAI);
    selectedEl.el.setAttribute("contenteditable", false);
    selectedEl.el.classList.remove("ELAI-selected-element");
    selectedEl.el = null;
  }
}

function deleteElement(e) {
  if (e.keyCode === 46) {
    if (document.activeElement !== selectedEl.el) {
      document.removeEventListener("keydown", deleteElement);
      selectedEl.el.parentElement.removeChild(selectedEl.el);
      showNotificationBar(
        "success",
        "Element deleted - Press ctrl + Z to restore it"
      );
      selectedEl.el = null;
    } else
      showNotificationBar(
        "warning",
        "To delete the element left-click anywhere but on the selected element"
      );
  }
}

function injectELAI() {
  selectedEl.el.appendChild(ELAI);
  const rotationPath = ELAI.addEventListener("click", () => {
    selectedEl.el.activeElement;
  });
}

function getInitialTransformValues() {
  const { m41, m42, a, b } = new WebKitCSSMatrix(
    getComputedStyle(selectedEl.el).transform
  );
  return [
    m41,
    m42,
    Math.round(Math.atan2(b, a) * (180 / Math.PI)),
    Math.sqrt(a * a + b * b),
  ];
}

function enableMoveElement(e) {
  e.preventDefault();
  [
    selectedEl.initialTranslateX,
    selectedEl.initialTranslateY,
    selectedEl.initialRotationX,
    selectedEl.initialScale,
  ] = getInitialTransformValues();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  // regex filters the numbers from the transform string
  body.addEventListener("mousemove", moveElement);
  body.addEventListener("mouseup", disableMoveElement);
}

function moveElement(e) {
  e.preventDefault();
  e.stopPropagation();
  const {
    initialTranslateX,
    initialTranslateY,
    initialRotationX,
    initialScale,
  } = selectedEl;
  let translationX = Math.round(
    Number(initialTranslateX) + e.clientX - mouseStartX
  );
  let translationY = Math.round(
    Number(initialTranslateY) + e.clientY - mouseStartY
  );
  selectedEl.el.style.transform = `translate(${translationX}px, ${translationY}px) rotate(${initialRotationX}deg) scale(${initialScale})`;
}

function disableMoveElement(e) {
  e.preventDefault();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  body.removeEventListener("mousemove", moveElement);
  body.removeEventListener("mouseup", disableMoveElement);
}

// TODO: element rotation

function getOffsetTop(elem) {
  let offsetTop = 0;
  do {
    if (!isNaN(elem.offsetLeft)) {
      offsetTop += elem.offsetTop;
    }
  } while ((elem = elem.offsetParent));
  return offsetTop;
}
function getOffsetLeft(elem) {
  let offsetLeft = 0;
  do {
    if (!isNaN(elem.offsetLeft)) {
      offsetLeft += elem.offsetLeft;
    }
  } while ((elem = elem.offsetParent));
  return offsetLeft;
}

// TODO: cleanup pito - rotation center reference

function enableRotateElement(e) {
  const { width, height, left, top } = selectedEl.el.getBoundingClientRect();

  [
    selectedEl.initialTranslateX,
    selectedEl.initialTranslateY,
    selectedEl.initialRotationX,
    selectedEl.initialScale,
  ] = getInitialTransformValues();
  selectedEl.centerX = Math.round(left + width / 2);
  selectedEl.centerY = Math.round(top + height / 2);
  const { centerX, centerY } = selectedEl;
  selectedEl.rotation = Math.round(
    Math.atan2(e.pageX - centerX, e.pageY - centerY) * (180 / Math.PI) * -1 +
      180
  );
  selectedEl.rotationTrack.style.width = Math.max(width, height) + "px";
  selectedEl.rotationTrack.style.height = Math.max(width, height) + "px";
  selectedEl.rotationTrack.style.opacity = 0.7;
  // TODO: create reference element to calculate perfect center

  // create reference element that is always at 0 degrees or counters the rotation of the element selectedEl
  // if selectedEl.el rotation is 45 deg, then reference el would be -45deg to be perfectly straight
  // that way the center is always center

  getInitialTransformValues();
  document.addEventListener("mousemove", rotateElement);
  document.addEventListener("mouseup", disableRotateElement);
}

function rotateElement(e) {
  e.preventDefault();
  const { initialTranslateX, initialTranslateY, initialScale } = selectedEl;
  const { centerX, centerY } = selectedEl;
  selectedEl.rotation = Math.round(
    Math.atan2(e.pageX - centerX, e.pageY - centerY) * (180 / Math.PI) * -1 +
      180
  );
  let { rotation } = selectedEl;
  if (snapOnRotation) {
    snapAngles.forEach((snapAngle) => {
      rotation =
        rotation >= snapAngle - snapThreshold &&
        rotation <= snapAngle + snapThreshold
          ? snapAngle
          : rotation <= -snapAngle + snapThreshold &&
            rotation >= -snapAngle - snapThreshold
          ? -snapAngle
          : rotation;
    });
  }
  selectedEl.el.style.transform = `translate(${initialTranslateX}px, ${initialTranslateY}px) rotate(${rotation}deg) scale(${initialScale})`;
}

function disableRotateElement() {
  selectedEl.rotationTrack.style.opacity = 0;
  document.removeEventListener("mousemove", rotateElement);
  document.removeEventListener("mouseup", disableRotateElement);
}

function showNotificationBar(type, message) {
  if (
    currentNotificationBarId !==
    `${type}-notification-bar-id-${notificationBarIdCounter}`
  ) {
    const background = {
      success: "#51bb51",
      warning: "#f19f0b",
      error: "#ff3a3a",
    };
    const newMessage = document.createElement("div");
    newMessage.id = `${type}-notification-bar-id-${notificationBarIdCounter}`;
    currentNotificationBarId = newMessage.id;
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
      notificationBarIdCounter++;
    }, 3500);
  }
}

function highlightHoveredElement(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  hoveredElement ? (hoveredElement.style.outline = "") : null;
  if (!excludeElaiElementsCondition(e)) {
    hoveredElement = e.target;
    hoveredElement.style.outline = "2px dashed #8cff72";
  } else {
    hoveredElement = undefined;
  }
}

const ELAI_CSS = `
  * {overflow: visible !important; user-select: none !important; position: relative}
  .ELAI-selected-element {min-width:30px !important;min-height:30px !important; white-space:pre-wrap !important;  outline: 2px dashed #ff7272 !important;
  }
.elai-sidebar {
    position: fixed;
    top: 50vh;
    left: 0;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    user-select: none;
    z-index: 9999;
}
.elai-sidebar * {
  user-select: none;
}
.elai-sidebar .elai-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  background: #2d2d2d;
  border-bottom: 5px solid white;
  color: white;
}

.newObject {
  box-shadow: inset 0px 0px 0px 1px black;
  box-sizing: border-box;
  position: absolute;
}

ELAI {
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  user-select: none;
  display: none;
  z-index: -1;
}

ELAI * {
  position: absolute;
  user-select: none;
}

ELAI .rotation-track, ELAI .rotation-track-center {
  top: 50%;
  left: 50%;
  transform : translate(-50%, -50%);
  border-radius: 50%;
}
ELAI .rotation-track {
  border: 2px dashed #00b7ff;
  opacity: 0;
}

ELAI .rotation-track-center {
  width: 5px;
  height: 5px;
  background: #00b7ff;
}

ELAI .elai-button {
  height: 25px;
  width: 25px;
  border: 1px solid #f05050;
  background: white;
  color: #f05050;
  text-align: center;
  line-height: 30px;
  font-size: 15px;
}

ELAI #text-modifier {
  top: -75%;
  left: -20%;
}

ELAI #reposition-btn {
  width: 100% !important;
  top: -5px;
  left: 0;
  height: 10px;
  cursor: move;
  z-index: 0;
}

ELAI #rotation-btn {
  top: -50px;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
}

ELAI #rotation-btn:after {
  content: "";
  position: absolute;
  bottom: -200%;
  height: 200%;
  left: 50%;
  transform: translate(-50%);
  background: #ff7272;
  width: 1px;
}

ELAI #resize-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translate(50%, 50%);
  cursor: se-resize;
}
  `;

function injectGlobalStyle() {
  if (!document.querySelector("#ELAIStyle")) {
    style = document.createElement("style");
    style.id = "ELAIStyle";
    head.appendChild(style);
    style.type = "text/css";
  }
  style.textContent = ELAI_CSS;
}

function disableScript() {
  document.removeEventListener("dblclick", selectElement);
  body.removeChild(ELAI_SIDEBAR);
  selectedEl.el.removeChild(ELAI);
  selectedEl.el
    ? selectedEl.el.removeEventListener("mousedown", enableMoveElement)
    : null;
  selectedEl.el = null;
  if (document.querySelector("#ELAIStyle")) {
    head.removeChild(document.querySelector("#ELAIStyle"));
  }
}

// functions that could be still somehow useful
/*

function changeCSSProperties(array_of_elements, cssPropertiesObject) {
  array_of_elements.forEach(el => {
    Object.keys(cssPropertiesObject).forEach(key => {
      el[key] =!
    })
  })
}
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

function extractTransformPropertyValue(element, property) {
  if (
    property !== "translate" &&
    property !== "rotate" &&
    property !== "skew" &&
    property !== "scale"
  ) {
    throw Error(
      `The 2nd argument MUST be either translate, rotate, skew or scale, instead it's ${property}`
    );
  }
  let propertyValue = element.style.transform
    .split(") ")
    .filter((x) => x.includes(property))
    .toString()
    .split(" ")
    .map((x) => Number(x.replace(/[^-.0-9]/g, "")));
  return propertyValue == false ? 0 : propertyValue;
}

function deleteDuplicateTransformProperty(element, property) {
  let arrayOfTransformProps = element.style.transform.split(") ");
  //adds a parenthesis back as it gets removed by the split method (except for the last element of the array)
  arrayOfTransformProps = arrayOfTransformProps.map((prop, id) => {
    if (id != arrayOfTransformProps.length - 1) {
      prop += ")";
    }
    return prop;
  });
  let newTransformProps = arrayOfTransformProps.filter(
    (x) => !x.includes(property)
  );
  return newTransformProps.join(" ");
}*/
