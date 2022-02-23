// TODO: CURRENT PROBLEMS:

// -second showNotificationBar won't be shown if two of the same type are requested within a 3.5s gap
// - change ELAI icons look
// - change sidebar buttons look according to status
// - create script usage instruction:
// -    - add page title
// -    - add list commands

// when rotating or modifying an element, elements selection should be disabled (green dashed borders)

// add shortcut to cancel element selection
// script deactivation should deactivate elements selection

// add opacity element modifier

// clicking outside selected element resets selection

let globalStyle = false;
let selectedEl = {};
let hoveredElement;

let [mouseStartX, mouseStartY] = [0, 0];

let newElements = [];
let newElementCounter = 0;

let isScriptActive = true;
let newElementCreationActive = false;
let elementSelectionActive = false;

const snapAngleDelta = 45;
const snapThreshold = 2;
let snapOnRotation = true;
let snapAngles = [];
for (let i = 0; i <= 360; i += snapAngleDelta) {
	snapAngles = [...snapAngles, i];
}

let currentNotificationBarId;
let notificationBarIdCounter = 0;

const NOTIFICATION_ANIMATION_DURATION = 2500;

// icons

const ICONS = {
	rotateIcon: `<svg
			data-elai-ui="true"
			width="1em"
			height="1em"
			viewBox="0 0 16 16"
		>
			<path data-elai-ui="true" d="M10.5 5a.5.5 0 010-1h2.691a6.5 6.5 0 10.647 8.21.5.5 0 01.821.571 7.5 7.5 0 11-.658-9.379L14 .5a.5.5 0 011 0v4a.5.5 0 01-.41.492L14.5 5h-4z"></path>
		</svg>`,
	resizeIcon: `<svg
	 		data-elai-ui="true"
			width="1em"
			height="1em"
			viewBox="0 0 16 16"
		>
			<path  data-elai-ui="true" d="M6 8a2 2 0 012 2v4a2 2 0 01-2 2H2a2 2 0 01-2-2v-4a2 2 0 012-2h4zm0 1H2a1 1 0 00-.993.883L1 10v4a1 1 0 00.883.993L2 15h4a1 1 0 00.993-.883L7 14v-4a1 1 0 00-.883-.993L6 9zM10 3h3v3zM8 5l3 3H8zM15 14v-1h1v1a2 2 0 01-2 2h-1v-1h1a1 1 0 001-1zM15 2v1h1V2a2 2 0 00-2-2h-1v1h1a1 1 0 011 1zM1 2v1H0V2a2 2 0 012-2h1v1H2a1 1 0 00-1 1zM15 10h1v2h-1v-2zM15 4h1v2h-1V4zM10 0h2v1h-2V0zM10 15h2v1h-2v-1zM7 0h2v1H7V0z"></path>
			<path d="M7 15h2v1H7v-1zM4 0h2v1H4V0zM15 7h1v2h-1V7zM0 7h1v2H0V7zM0 4h1v2H0V4z"></path>
		</svg>`,
	moveIcon: `<svg data-elai-ui="true" width="1em" height="1em" viewBox="0 0 16 16" ><path data-elai-ui="true"d="M9.5 3.5h.012a.42.42 0 01.062.005L9.5 3.5a.52.52 0 01.191.038l.041.019a.471.471 0 01.122.089l-.051-.045a.31.31 0 01.039.033l.012.012 2 2a.5.5 0 01-.707.707l-1.146-1.147v3.793h3.792l-1.146-1.146a.5.5 0 01.707-.707l2.012 2.012a.4.4 0 01.033.039l-.045-.051a.471.471 0 01.108.164l.014.039a.39.39 0 01.018.079.475.475 0 01.005.053v.041c-.001.017-.002.034-.005.051l.005-.072a.52.52 0 01-.038.191l-.019.041a.397.397 0 01-.044.07.31.31 0 01-.033.039l-.012.012-2 2a.5.5 0 01-.707-.707l1.146-1.146H10v3.792l1.146-1.146a.5.5 0 01.707.707l-2.012 2.012a.4.4 0 01-.039.033l.051-.045a.471.471 0 01-.164.108l-.039.014a.39.39 0 01-.046.012l-.033.006-.052.005h-.041a.436.436 0 01-.052-.005l.072.005a.52.52 0 01-.191-.038l-.041-.019a.397.397 0 01-.07-.044.31.31 0 01-.039-.033l-.012-.012-2-2a.5.5 0 01.707-.707l1.146 1.146V10H5.205l1.147 1.146a.5.5 0 01.058.638l-.058.069a.5.5 0 01-.707 0l-2-2-.012-.012c-.011-.012-.023-.025-.033-.039a.758.758 0 01-.045-.07.389.389 0 01-.019-.042l-.014-.039a.39.39 0 01-.018-.077.446.446 0 01-.005-.063v-.023c0-.021.002-.042.005-.063l-.005.074a.52.52 0 01.038-.191l.019-.041a.471.471 0 01.089-.122l-.045.051a.31.31 0 01.033-.039l.012-.012 2-2a.5.5 0 01.707.707L5.205 8.998h3.793V5.205L7.852 6.352a.5.5 0 01-.638.058l-.069-.058a.5.5 0 010-.707l2-2 .012-.012c.012-.011.025-.023.039-.033a.758.758 0 01.07-.045.389.389 0 01.042-.019l.039-.014a.39.39 0 01.077-.018.46.46 0 01.064-.005h.011zm4 11.5a.5.5 0 010-1H15v-1.5a.5.5 0 011 0v2a.5.5 0 01-.41.492L15.5 15h-2z"></path></svg>`,
};

const ELAI = document.createElement("ELAI");
const body = document.querySelector("body");
const ELAI_SIDEBAR = document.createElement("div");
const ELAI_TEXT_MODIFIERS = document.createElement("div");
let ELAItextContent = "";
[...ELAI.children].forEach((child) => (ELAItextContent += child.textContent));
const head = document.head || document.getElementsByTagName("head")[0];
ELAI.setAttribute("contenteditable", false);
ELAI_SIDEBAR.setAttribute("contenteditable", false);
ELAI_TEXT_MODIFIERS.setAttribute("contenteditable", false);
ELAI_SIDEBAR.classList.add("elai-sidebar");
ELAI_TEXT_MODIFIERS.id = "elai-text-modifiers";

function excludeElaiElementsCondition(e) {
	return (
		e.target.classList.contains("elai-button") ||
		e.target === body ||
		e.target === ELAI ||
		e.target === ELAI_SIDEBAR ||
		e.target === ELAI_TEXT_MODIFIERS ||
		e.target === selectedEl.el ||
		e.target === selectedEl.rotationTrack ||
		e.target === selectedEl.rotationTrackCenter ||
		e.target.dataset.elaiUi === "true" ||
		e.target.parentElement === ELAI_TEXT_MODIFIERS
	);
}

function createElaiButton(opts) {
	let button = document.createElement(opts.tagName || "div");
	if (opts.tagName === "input") {
		for (attribute in opts.attributes) {
			button.setAttribute(attribute, opts.attributes[attribute]);
		}
	}
	opts.classes && button.classList.add(...opts.classes);
	button.innerHTML = opts.content;
	button.id = opts.id;
	button.setAttribute(["data-elai-ui"], true);
	button.addEventListener(opts.eventListenerTrigger, opts.callback);
	opts.parent.appendChild(button);
	return button;
}

function createUiTooltip(id, content, eventListner, callback) {}

const ELAI_BUTTONS = {
	// ELAI SIDEBAR BUTTONS

	createNewElementBtn: {
		parent: ELAI_SIDEBAR,
		id: "create-new-element-button",
		classes: ["elai-button"],
		content: "+",
		eventListenerTrigger: "click",
		callback: toggleNewElementCreation,
	},

	deselectElementBtn: {
		parent: ELAI_SIDEBAR,
		classes: ["elai-button"],
		id: "deselect-element-button",
		type: "div",
		content: "-",
		eventListenerTrigger: "click",
		callback: deselectElement,
	},

	// ELAI ELEMENT BUTTONS
	resizeBtn: {
		parent: ELAI,
		id: "resize-btn",
		classes: ["elai-button"],
		content: ICONS.resizeIcon,
		eventListenerTrigger: "mousedown",
		callback: enableResizeElement,
	},
	rotationBtn: {
		parent: ELAI,
		id: "rotation-btn",
		classes: ["elai-button"],
		content: ICONS.rotateIcon,
		eventListenerTrigger: "mousedown",
		callback: enableRotateElement,
	},
	repositionBtn: {
		parent: ELAI,
		id: "reposition-btn",
		classes: ["elai-button"],
		content: ICONS.moveIcon,
		eventListenerTrigger: "mousedown",
		callback: enableMoveElement,
	},
	bgModifier: {
		parent: ELAI_TEXT_MODIFIERS,
		id: "background-modifier",
		tagName: "input",
		eventListenerTrigger: "input",
		callback: changeInputValue,
		attributes: {
			type: "color",
			"elai-input": "backgroundColor",
		},
		// valueDisplayer: bgModifier,
	},
	textColorModifier: {
		parent: ELAI_TEXT_MODIFIERS,
		id: "text-color-modifier",
		tagName: "input",
		eventListenerTrigger: "input",
		callback: changeInputValue,
		attributes: {
			type: "color",
			"elai-input": "color",
		},
		// valueDisplayer: bgModifier,
	},
	fontSizeModifier: {
		parent: ELAI_TEXT_MODIFIERS,
		id: "font-size-modifier",
		tagName: "input",
		eventListenerTrigger: "input",
		callback: changeInputValue,
		attributes: {
			type: "number",
			"elai-input-unit": "px",
			"elai-input": "fontSize",
			min: "10",
		},
		// valueDisplayer: bgModifier,
	},
};

//TODO: whenever you select an element the initial values for the inputs are set
function setInitialElementStylePropertyValue() {
	const textModifierInputs = document.querySelectorAll(
		"elai #elai-text-modifiers input"
	);
	textModifierInputs.forEach((input) => {
		if (input.hasAttribute("elai-input-unit")) {
			input.value = parseInt(
				selectedEl.initialStyle[input.getAttribute("elai-input")]
			);
		} else {
			input.value = rgbToHex(
				selectedEl.initialStyle[input.getAttribute("elai-input")]
			);
		}
	});
}
function changeInputValue(e) {
	const property = e.target.getAttribute("ELAI-input");
	const unit = e.target.getAttribute("ELAI-input-unit");
	unit
		? (selectedEl.el.style[property] = e.target.value + unit)
		: (selectedEl.el.style[property] = e.target.value);
}

selectedEl.rotationTrack = document.createElement("div");

selectedEl.rotationTrack.classList.add("rotation-track");
ELAI.appendChild(selectedEl.rotationTrack);

selectedEl.rotationTrackCenter = document.createElement("div");
selectedEl.rotationTrackCenter.classList.add("rotation-track-center");
selectedEl.rotationTrack.appendChild(selectedEl.rotationTrackCenter);

Object.keys(ELAI_BUTTONS).forEach((button) =>
	createElaiButton(ELAI_BUTTONS[button])
);

// TODO: extract function from selectElement
function setInputsDefaultValue() {}

const topLeftUIComponentsContainer = document.createElement("div");

function createElement(e) {
	e.preventDefault();
	e.stopPropagation();
	if (e.target.classList.contains("elai-button")) {
		return;
	}
	const createdElement = document.createElement("div");
	selectedEl.el = createdElement;
	body.appendChild(createdElement);
	createdElement.classList.add("new-object");
	createdElement.id = `new-object-${newElementCounter}`;
	newElements.push({
		name: createdElement.id,
		width: 0,
		height: 0,
		mouseStartY: e.clientY,
		mouseStartX: e.clientX,
		left: e.clientX + window.scrollX,
		top: e.clientY + window.scrollY,
	});
	createdElement.style.left = e.clientX + window.scrollX + "px";
	createdElement.style.top = e.clientY + window.scrollY + "px";
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
	if (newElementCreationActive === true) return;
	newElementCreationActive = true;
	document.addEventListener("mousedown", createElement);
	document.addEventListener("mouseup", disableCreateElement);
	document.addEventListener("mouseleave", disableCreateElement);
	showNotificationBar("success", "Create new object mode enabled");
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

function activateElai() {
	const links = document.querySelectorAll("a");
	links.forEach((link) => {
		link.removeAttribute("href");
		link.removeAttribute("target");
		link.removeAttribute("rel");
	});
	injectGlobalStyle();
	showNotificationBar("success", "ELAI Activated");
	enableSelectElement();
	document.addEventListener("mouseover", highlightHoveredElement);
	body.appendChild(ELAI_SIDEBAR);
	ELAI.appendChild(ELAI_TEXT_MODIFIERS);
}
function deactivateElai() {
	document.removeEventListener("mouseover", highlightHoveredElement);
	showNotificationBar("error", "ELAI Dectivated");
	disableSelectElement();
	disableScript();
	hoveredElement ? (hoveredElement.style.outline = "none") : null;
}
document.addEventListener("keydown", toggleScriptActivation);
function toggleScriptActivation(e) {
	// key combination to activate the script;
	console.log(isScriptActive);

	if (e) {
		let ACTIVATION_SHORTCUT = e.ctrlKey && e.altKey && e.which === 65;
		//TODO: delete ctrl shortcut for production
		// ACTIVATION_SHORTCUT = "ControlLeft";
		// ctrl + shift + a (windows)
		if (ACTIVATION_SHORTCUT) {
			// deactivate all Links

			//TODO: bundle functions in one
			if (!isScriptActive) {
				activateElai();
			} else {
				deactivateElai();
			}
			isScriptActive = !isScriptActive;
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
	selectedEl.el.addEventListener("input", () => {
		if (selectedEl.el.innerHTML === "") {
			injectELAI();
		}
	});
	ELAI.style.display = "block";
	e.target.tagName === "SPAN"
		? (selectedEl.el.style.display = "inline-block")
		: null;
	selectedEl.initialStyle = { ...getComputedStyle(selectedEl.el) };
	selectedEl.el.setAttribute("contenteditable", true);
	selectedEl.el.style.transition = "all 0s";
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
		[...selectedEl.el.children].includes(ELAI)
			? selectedEl.el.removeChild(ELAI)
			: null;
		selectedEl.el.setAttribute("contenteditable", false);
		selectedEl.el.classList.remove("ELAI-selected-element");
		selectedEl.el.style.transition = selectedEl.initialStyle.transition;
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
				"Element deleted"
				// TODO: IMPLEMENT history - Press ctrl + Z to restore it
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
	setInitialElementStylePropertyValue();
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
	selectedEl.centerY = Math.round(top + window.scrollY + height / 2);
	const { centerX, centerY } = selectedEl;
	createElement(e);
	selectedEl.rotation = Math.round(
		Math.atan2(
			e.pageX - window.scrollX + centerX,
			e.pageY - (window.scrollY + centerY)
		) *
			(180 / Math.PI) *
			-1 +
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
		newMessage.classList.add("elai-notification-bar");
		currentNotificationBarId = newMessage.id;
		newMessage.textContent = message;
		let style = {
			background: background[type],
		};
		newMessage.style.background = background[type];
		body.appendChild(newMessage);
		setTimeout(() => {
			newMessage.style.opacity = 1;
			newMessage.style.top = "20px";
		}, 50);
		setTimeout(() => {
			newMessage.style.opacity = 0;
			newMessage.style.top = 0;
		}, 1500);
		setTimeout(() => {
			body.removeChild(newMessage);
			notificationBarIdCounter++;
		}, NOTIFICATION_ANIMATION_DURATION);
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
  .ELAI-selected-element {min-width:30px !important;min-height:30px !important; white-space:unset !important;  outline: 2px dashed #ff7272 !important;
  }

  .elai-notification-bar {
      min-width: 50%;
      text-align: center;
      padding: 20px 40px;
      box-sizing: content-box;
      font-size: 20px;
      color: white;
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: 1s;
      z-index: 99999999999999;
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
  margin-bottom: 10px;
  color: white;
	font-size: 25px;
}

.new-object {
  box-shadow: inset 0px 0px 0px 1px black !important;
  box-sizing: border-box;
  position: absolute;
  display:flex;
  justify-content: center;
  align-items: center;
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
	display: flex;
	justify-content: center;
	align-items: center;
  height: 25px;
  width: 25px;
  border: 1px solid #f05050;
  background: white;
  color: #f05050;
  text-align: center;
  line-height: 30px;
  font-size: 15px;
	fill: #1a1e1f;
}
ELAI .elai-button svg, ELAI .elai-button svg path {
	fill: inherit!important;
	pointer-events: none!important;
	width: auto!important;
}

ELAI #elai-text-modifiers {
  top: -40px;
  left: -40px;
  display:flex;
  flex-direction: row;
  max-width:80px;
  max-height: 80px;
  flex-wrap: wrap;
}
ELAI #elai-text-modifiers * {
  position: relative;
  color: black;
  max-width: 42%;
  height: 40px;
}

ELAI #reposition-btn {
  width: 100% !important;
  top: -15px;
  left: 0;
  height: 20px;
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
  transform: translate(80%, 80%);
  cursor: se-resize;
}
  `;

const ELAI_CSS_NEWOBJECT = `
	.new-object {
  box-shadow: inset 0px 0px 0px 0px black;
  box-sizing: border-box;
  position: absolute;
  display:flex;
  justify-content: center;
  align-items: center;
}`;

function injectGlobalStyle() {
	if (!document.querySelector("#ELAIStyle")) {
		style = document.createElement("style");
		style.id = "ELAIStyle";
		head.appendChild(style);
		style.type = "text/css";
	}
	if (!document.querySelector("#ELAI-newObject-style")) {
		newObjectStyle = document.createElement("style");
		newObjectStyle.id = "ELAI-newObject-style";
		head.appendChild(newObjectStyle);
		newObjectStyle.type = "text/css";
	}
	style.textContent = ELAI_CSS;
	newObjectStyle.textContent = ELAI_CSS_NEWOBJECT;
}

function disableScript() {
	document.removeEventListener("dblclick", selectElement);
	body.removeChild(ELAI_SIDEBAR);
	selectedEl.el ? selectedEl.el.removeChild(ELAI) : null;
	selectedEl.el
		? selectedEl.el.removeEventListener("mousedown", enableMoveElement)
		: null;
	selectedEl.el = null;
	if (document.querySelector("#ELAIStyle")) {
		setTimeout(() => {
			!isScriptActive
				? head.removeChild(document.querySelector("#ELAIStyle"))
				: null;
		}, NOTIFICATION_ANIMATION_DURATION);
	}
}

function rgbToHex(orig) {
	let rgb = orig.replace(/\s/g, "").match(/^rgba?\((\d+),(\d+),(\d+)/i);
	return rgb && rgb.length === 4
		? "#" +
				("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[3], 10).toString(16)).slice(-2)
		: orig;
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
activateElai();
