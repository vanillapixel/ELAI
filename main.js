// TODO: CURRENT PROBLEMS:
// -second showNotificationBar won't be shown if two of the same type are requested within a 3.5s gap

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

let snapOnRotation = true;

let currentNotificationBarId;
let notificationBarIdCounter = 0;

const ELAI = document.createElement("ELAI");
const ELAI_SIDEBAR = document.createElement("div");
ELAI.setAttribute("contenteditable", false);
ELAI_SIDEBAR.setAttribute("contenteditable", false);
ELAI_SIDEBAR.classList.add("elai-sidebar");

function excludeElaiElementsCondition(e) {
  return (
    e.target.classList.contains("elai-button") ||
    e.target === body ||
    e.target === selectedEl.el ||
    e.target === ELAI
  );
}

function createNewUiButton(id, content, eventListner, callback) {
  const button = document.createElement("div");
  button.classList.add("elai-button");
  button.innerHTML = content;
  button.id = id;
  button.addEventListener(eventListner, callback);
  return button;
}

const sidebarUiButtons = [
  createNewUiButton(
    "select-new-element-button",
    "^",
    "click",
    toggleElementSelection
  ),
  createNewUiButton(
    "create-new-element-button",
    "+",
    "click",
    toggleNewElementCreation
  ),
  createNewUiButton("create-new-element-button", "-", "click", deselectElement),
];

const resizer = createNewUiButton(
  "resizer",
  "♥",
  "mousedown",
  enableResizeElement
);
const rotator = createNewUiButton(
  "rotation-modifier",
  "O",
  "mousedown",
  enableRotateElement
);
const repositioner = createNewUiButton(
  "translation-modifier",
  "T",
  "mousedown",
  enableMoveElement
);

[resizer, rotator, repositioner].forEach((button) => ELAI.appendChild(button));

sidebarUiButtons.forEach((sidebarUiButton) =>
  ELAI_SIDEBAR.appendChild(sidebarUiButton)
);

function createElement(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains("ELAI-sidebar-ui-button")) {
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
  selectedEl.el.textContent = " mirm";
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

document.addEventListener("keyup", toggleScriptActivation);
setGlobalStyle();
function toggleScriptActivation(e) {
  // key combination to activate the script;
  // let ACTIVATION_SHORTCUT = e.ctrlKey && e.shiftKey && e.which === 65;
  //TODO: delete ctrl shortcut for production
  // ACTIVATION_SHORTCUT = "ControlLeft";
  // ctrl + shift + a (windows)
  if (ACTIVATION_SHORTCUT(e)) {
    isScriptActive = !isScriptActive;
    if (isScriptActive) {
      console.log(isScriptActive);
      setGlobalStyle();
      showNotificationBar("success", "ELAI Activated");
      enableSelectElement();
      document.addEventListener("mouseover", highlightHoveredElement);
      body.appendChild(ELAI_SIDEBAR);
    } else {
      console.log(isScriptActive);
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
  console.log(e.target);
  if (selectedEl.el != e.target && !newElement) {
    deselectElement();
  }
  ELAI.style.display = "block";
  selectedEl.el = newElement || e.target;
  e.target.tagName === "SPAN"
    ? (selectedEl.el.style.display = "inline-block")
    : null;
  selectedEl.el.setAttribute("contenteditable", true);
  selectedEl.el.setAttribute("role", "textbox");
  selectedEl.coords = getComputedStyle(selectedEl.el);
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
    } else
      showNotificationBar(
        "warning",
        "To delete the element left-click anywhere but on the selected element"
      );
  }
}

function injectELAI() {
  selectedEl.el.appendChild(ELAI);
}

function getInitialTransformValues() {
  const { m41, m42, a, b } = new WebKitCSSMatrix(
    getComputedStyle(selectedEl.el).transform
  );
  [selectedEl.initialTranslateX, selectedEl.initialTranslateY] = [m41, m42];
  selectedEl.initialRotationX = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  selectedEl.initialScale = Math.sqrt(a * a + b * b);
}

function enableMoveElement(e) {
  e.preventDefault();
  getInitialTransformValues();
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

function enableRotateElement() {
  getInitialTransformValues();
  document.addEventListener("mousemove", rotateElement);
  document.addEventListener("mouseup", disableRotateElement);
}

function rotateElement(e) {
  e.preventDefault();
  const { initialTranslateX, initialTranslateY, initialScale } = selectedEl;
  const { top, left, width, height } = selectedEl.el.getBoundingClientRect();
  const [centerX, centerY] = [left + width / 2, top + height / 2];
  selectedEl.rotation = Math.round(
    Math.atan2(e.pageX - centerX, -(e.pageY - centerY)) * (180 / Math.PI)
  );
  let { rotation } = selectedEl;
  if (snapOnRotation) {
    let snapThreshold = 2;
    [0, 45, 90, 180, -45, -90, -180].forEach((angleSnap) => {
      rotation =
        rotation >= angleSnap - snapThreshold &&
        rotation <= angleSnap + snapThreshold
          ? angleSnap
          : rotation;
    });
  }
  selectedEl.el.style.transform = `translate(${initialTranslateX}px, ${initialTranslateY}px) rotate(${rotation}deg) scale(${initialScale})`;
}

function disableRotateElement() {
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
    hoveredElement.style.outline = "2px dashed yellow";
  } else {
    hoveredElement = undefined;
  }
}

function setGlobalStyle() {
  const css = `
  * {overflow: visible !important; user-select: none !important}
  .ELAI-selected-element {min-width:30px !important;min-height:30px !important; white-space:pre-wrap !important;  outline: 2px dashed red !important;
  };
  `;
  const head = document.head || document.getElementsByTagName("head")[0];
  if (!document.querySelector("#ELAIStyle")) {
    style = document.createElement("style");
    style.id = "ELAIStyle";
    head.appendChild(style);
    style.type = "text/css";
  }
  style.textContent = css;
}

function disableScript() {
  // const ELAICssStyle = document.querySelector("#ELAIStyle");
  // ELAICssStyle.innerHTML = "";
  document.removeEventListener("dblclick", selectElement);
  console.log("ìds");
  body.removeChild(ELAI_SIDEBAR);
  selectedEl.el
    ? selectedEl.el.removeEventListener("mousedown", enableMoveElement)
    : null;
  selectedEl.el = null;
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
