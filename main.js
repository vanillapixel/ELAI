let scriptActive = false;

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
      showNotificationBar("success", "ELUI Activated");
      document.addEventListener("mousedown", initiateMove);
    } else {
      showNotificationBar("error", "ELUI Dectivated");
      deactivateScript(e);
    }
  }
}

document.addEventListener("mousedown", pito);
const miscione = [];

class element {
  constructor(el) {
    this.el = el;
    this.el.style.color = "red";
    this.marma = () => console.log(this.el);
  }
}

function pito(e) {
  miscione.push(new element(e.target));
  console.log(miscione);
}

//TODO: Change activation listener

let startingX;
const peto = document.querySelector("h1");
const body = document.querySelector("body");

function stopRotation(e) {
  body.removeEventListener("mousemove", rotateElement);
  startingX = e.clientX;
}

function rotateElement(e) {
  console.log("rotating");
  let rotation = Math.round((e.clientX - startingX) / 0.7);
  peto.style.transform = `rotate(${rotation}deg)`;
}

peto.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startingX = e.clientX;
  body.addEventListener("mousemove", rotateElement);
  body.addEventListener("mouseup", stopRotation);
});

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
    zIndex: 9999999999999999999,
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
let mouseStartX;
let mouseStartY;
let left;
let topp;
let globalStyle = false;
let originalElShadow;
let originalElTransition;
let positionString;

function backupItemCssProperties(el, props, dest) {
  props.forEach(
    (prop) => (dest[prop] = getComputedStyle(el).getPropertyValue(prop))
  );
  console.log(el, dest, props);
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
  if (e.type === "mouseout") {
    restoreItemCssProperties(el, highlightedElement.props);
  }
}

function initiateMove(
  e,
  propertiesToChange = { boxShadow: "0px 0px 0px 3px red", cursor: "pointer" }
) {
  if (e.button === 0) {
    e.preventDefault();
    e.stopPropagation();
    if (!globalStyle) {
      setGlobalStyle();
    }
    highlightedElement.el = e.target;
    const { el } = highlightedElement;
    const properties = Object.keys(propertiesToChange);
    backupItemCssProperties(
      el,
      properties,
      (backupDestination = highlightedElement)
    );
    globalStyle = true;
    SELECTED_EL.el = e.target;
    originalElShadow = SELECTED_EL.el.style.boxShadow;
    originalElTransition = SELECTED_EL.el.style.transition;
    SELECTED_EL.x = +SELECTED_EL.el.style.left.slice(0, -2);
    SELECTED_EL.y = +SELECTED_EL.el.style.top.slice(0, -2);
    SELECTED_EL.el.style.cssText = `box-shadow: 0px 0px 0px 3px red !important;  position: relative !important;  transition: all 0s 0s !important;  cursor: pointer !important;  top: ${SELECTED_EL.el.style.top};;  left: ${SELECTED_EL.el.style.left};`;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    document.addEventListener("mousemove", moveEl);
    document.addEventListener("mouseup", endMove);
  }
}

function moveEl(e) {
  e.preventDefault();
  e.stopPropagation();
  left = SELECTED_EL.x + e.clientX - mouseStartX;
  topp = SELECTED_EL.y + e.clientY - mouseStartY;
  positionString = `left: ${left}px !important;
  top:${topp}px !important`;
  SELECTED_EL.el.style.cssText += positionString;
}

function endMove(e) {
  e.preventDefault();
  e.stopPropagation();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  SELECTED_EL.el.style.cursor = "pointer";
  SELECTED_EL.el.style.boxShadow = originalElShadow;
  SELECTED_EL.el.style.transition = originalElTransition;
  document.removeEventListener("mousemove", moveEl);
  document.removeEventListener("mouseup", endMove);
}

function setGlobalStyle() {
  const css = "* {overflow: visible !important; cursor: pointer !important};";
  head = document.head || document.getElementsByTagName("head")[0];
  if (!document.querySelector("#eluiStyle")) {
    style = document.createElement("style");
    style.id = "eluiStyle";
    head.appendChild(style);
    style.type = "text/css";
  }
  style.textContent = css;
}

function deactivateScript(e) {
  e.preventDefault();
  const eluiCssStyle = document.querySelector("#eluiStyle");
  eluiCssStyle.textContent = "";
  globalStyle = false;
  eluiCssStyle.innerHTML = "";
  document.removeEventListener("mousedown", initiateMove);
  document.removeEventListener("contextmenu", deactivateScript);
  document.removeEventListener("mouseenter", toggleHighlightElement);
  document.removeEventListener("mouseleave", toggleHighlightElement);
}
