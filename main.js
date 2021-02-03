let globalStyle = false;
let selectedEl = {};
let hoveredElement;

let [mouseStartX, mouseStartY] = [0, 0];
let [currentX, currentY] = [0, 0];

const body = document.querySelector("body");

let newObjects = [];
let newElementCounter = 0;

let isScriptActive = false;
let newElementCreationActive = false;
let elementSelectionActive = false;

let snapOnRotation = true;

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

function createNewElement(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains("ELAI-sidebar-ui-button")) {
    return;
  }
  const createdElement = document.createElement("div");
  //this allows the new element text to be editable - empty elements texts can't be edited
  createdElement.textContent = " ";
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
  !newElementCreationActive
    ? enableNewElementCreation()
    : disableCreateNewElement();
  newElementCreationActive = !newElementCreationActive;
}

function enableNewElementCreation() {
  //TODO: newly created element is SELECTED_EL.el
  deselectElement();
  document.addEventListener("mousedown", createNewElement);
  document.addEventListener("mouseup", disableCreateNewElement);
  document.addEventListener("mouseleave", disableCreateNewElement);
  showNotificationBar("success", "Create new object mode enabled");
  newElementCreationActive = true;
}
function disableCreateNewElement(e) {
  selectElement(e, selectedEl.el);
  disableResizeElement();
  document.removeEventListener("mousedown", createNewElement);
  document.removeEventListener("mousemove", resizeElement);
  document.removeEventListener("mouseup", disableCreateNewElement);
  document.removeEventListener("mouseleave", disableCreateNewElement);
  newElementCreationActive = false;
  showNotificationBar("error", "Create new object mode disabled");
}

//TODO: Backup properties function is useless?

//TODO: Create sidebar for actions:
// rotate, change background, resize, move (done), font-size
// TODO: fix the script activation for production

document.addEventListener("keyup", toggleScriptActivation);
setGlobalStyle();
body.appendChild(ELAI);
body.appendChild(ELAI_SIDEBAR);
function toggleScriptActivation(e) {
  // key combination to activate the script;
  // ctrl + shift + a (windows)
  // let ACTIVATION_SHORTCUT = e.ctrlKey && e.shiftKey && e.which === 65;
  //TODO: delete ctrl shortcut for production
  // ACTIVATION_SHORTCUT = "ControlLeft";
  let ACTIVATION_SHORTCUT = e.ctrlKey && e.code === "AltLeft";
  if (ACTIVATION_SHORTCUT) {
    isScriptActive = !isScriptActive;
    if (isScriptActive) {
      setGlobalStyle();
      showNotificationBar("success", "ELAI Activated");
      enableSelectElement();
      document.addEventListener("mouseover", highlightHoveredElement);
    } else {
      showNotificationBar("error", "ELAI Dectivated");
      disableSelectElement();
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
}

function deselectElement() {
  if (selectedEl.el) {
    selectedEl.el.removeChild(ELAI);
    selectedEl.el.setAttribute("contenteditable", false);
    selectedEl.el.classList.remove("ELAI-selected-element");
    selectedEl.el = null;
  }
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

function enableMoveElement(e) {
  e.preventDefault();
  const { m41, m42 } = new WebKitCSSMatrix(
    getComputedStyle(selectedEl.el).transform
  );
  selectedEl.el.currentTransform = deleteDuplicateTransformProperty(
    selectedEl.el,
    "translate"
  );

  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  // regex filters the numbers from the transform string
  [currentX, currentY] = [m41, m42];
  body.addEventListener("mousemove", moveElement);
  body.addEventListener("mouseup", disableMoveElement);
}

function moveElement(e) {
  e.preventDefault();
  e.stopPropagation();
  let translationX = Math.round(Number(currentX) + e.clientX - mouseStartX);
  let translationY = Math.round(Number(currentY) + e.clientY - mouseStartY);
  selectedEl.el.style.transform = `translate(${translationX}px, ${translationY}px) ${selectedEl.el.currentTransform}`;
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
  selectedEl.currentTransform = deleteDuplicateTransformProperty(
    selectedEl.el,
    "rotate"
  );
  document.addEventListener("mousemove", rotateElement);
  document.addEventListener("mouseup", disableRotateElement);
}

function rotateElement(e) {
  e.preventDefault();
  const { top, left, width, height } = selectedEl.el.getBoundingClientRect();
  const [centerX, centerY] = [left + width / 2, top + height / 2];
  let { rotation } = selectedEl;
  rotation = Math.round(
    Math.atan2(e.pageX - centerX, -(e.pageY - centerY)) * (180 / Math.PI)
  );
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
  selectedEl.el.style.transform = `${selectedEl.currentTransform}rotate(${rotation}deg)`;
}

function disableRotateElement() {
  document.removeEventListener("mousemove", rotateElement);
  document.removeEventListener("mouseup", disableRotateElement);
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
}

function showNotificationBar(type, message) {
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
  * {overflow: visible !important;}
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
  isScriptActive = !isScriptActive;
  document.removeEventListener("dblclick", selectElement);

  selectedEl.el.removeEventListener("mousedown", enableMoveElement);
  body.removeChild(ELAI_SIDEBAR);
  body.removeChild(ELAI);
  selectedEl.el = null;
}
