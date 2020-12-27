javascript: (function () {
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

  document.addEventListener("mousedown", initiateMove);
  document.addEventListener("contextmenu", deactivateScript);

  function toggleHighlightElement(
    e,
    propertiesToChange = { boxShadow: "0px 0px 0px 3px red", cursor: "pointer" }
  ) {
    e.preventDefault();
    e.stopPropagation();
    highlightedElement.el = e.target;
    const { el } = highlightedElement;
    const properties = Object.keys(propertiesToChange);
    /* if mouse ENTERS the element area - ADD highlight to element */
    if (e.type === "mouseover") {
      backupItemCssProperties(
        el,
        properties,
        (backupDestination = highlightedElement)
      );
      setItemCssProperties(el, propertiesToChange);
    }
    /* if mouse LEAVES the element area - REMOVE highlight to element */
    if (e.type === "mouseout") {
      restoreItemCssProperties(el, highlightedElement.props);
    }
  }
  function backupItemCssProperties(el, props, dest) {
    console.log(el, dest, props);
    props.forEach((prop) => (dest[prop] = el.style[prop]));
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

  function initiateMove(e) {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      if (!globalStyle) {
        setGlobalStyle();
      }
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
    console.log(left);
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
})();
