import {
	BoxGeometry,
	Color,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	Vector3,
	WebGLRenderer,
	Geometry,
	Face3,
	Vector2,
	Raycaster,
	Euler,
	CircleGeometry,
	LineBasicMaterial,
	Line,
	EdgesGeometry,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

const scene = new Scene()
scene.background = new Color("#AAA")
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const raycaster = new Raycaster()
renderer.domElement.addEventListener(
	"contextmenu",
	handleMouse.bind(null, "rclick"),
)
renderer.domElement.addEventListener("click", handleMouse.bind(null, "click"))

/**
 * @param {"click"|"move"|"rclick"} type
 * @param {MouseEvent} e
 */
function handleMouse(type, e) {
	const mouse = new Vector2(
		(e.clientX / innerWidth) * 2 - 1,
		-(e.clientY / innerHeight) * 2 + 1,
	)
	raycaster.setFromCamera(mouse, camera)
	const hits = raycaster.intersectObjects(scene.children)
	if (type != "move") {
		hits.forEach(h =>
			h.object.dispatchEvent({
				type: "click",
				rightClick: type == "rclick",
			}),
		)
	}
}

// ----------------------- Shared Geometries & materials -----------------------
const planeGeometry = new PlaneGeometry(0.93, 0.93)
const cubeGeometry = new BoxGeometry()
const arrowGeometry = new Geometry().setFromPoints([
	new Vector3(0, 0, 0.3),
	new Vector3(0.15, 0, 0),
	new Vector3(-0.15, 0, 0),
])
arrowGeometry.faces.push(new Face3(0, 1, 2))
arrowGeometry.computeBoundingSphere()
const circleGeometry = new CircleGeometry(0.15, 32)
const circleEdgesGeometry = new EdgesGeometry(circleGeometry)
const arrowEdgesGeometry = new EdgesGeometry(arrowGeometry)
const materials = {
	black: new MeshBasicMaterial({
		color: "black",
	}),
	white: new MeshBasicMaterial({
		color: "#C45AEC",
	}),
	blue: new MeshBasicMaterial({
		color: "#82CAFA",
	}),
	red: new MeshBasicMaterial({
		color: "#FF7F50",
	}),
	yellow: new MeshBasicMaterial({
		color: "#FFE5B4",
	}),
	pink: new MeshBasicMaterial({
		color: "pink",
	}),
	green: new MeshBasicMaterial({
		color: "#5EFB6E",
	}),
	controls: new MeshBasicMaterial({
		color: "white",
		transparent: true,
	}),
	edges: new LineBasicMaterial({ color: "black", transparent: true }),
}

// ----------------------- Faces -----------------------
/** @type {Mesh[][][]} */
const faces = [[[], [], []], [[], [], []], [[], [], []]]

for (let x = -1; x <= 1; x++) {
	for (let y = -1; y <= 1; y++) {
		for (let z = -1; z <= 1; z++) {
			if (!x && !y && !z) {
				faces[x + 1][y + 1][z + 1] = undefined
				continue
			}

			const colors = []
			const cube = new Mesh(cubeGeometry, materials.black)
			if (x == -1) {
				const plane = new Mesh(planeGeometry, materials.yellow)
				plane.position.x = -0.51
				plane.rotation.y = -Math.PI / 2
				cube.add(plane)
				colors.push("yellow")
			} else if (x == 1) {
				const plane = new Mesh(planeGeometry, materials.red)
				plane.position.x = 0.51
				plane.rotation.y = Math.PI / 2
				cube.add(plane)
				colors.push("red")
			}

			if (y == -1) {
				const plane = new Mesh(planeGeometry, materials.green)
				plane.position.y = -0.51
				plane.rotation.x = Math.PI / 2
				cube.add(plane)
				colors.push("green")
			} else if (y == 1) {
				const plane = new Mesh(planeGeometry, materials.pink)
				plane.position.y = 0.51
				plane.rotation.x = -Math.PI / 2
				cube.add(plane)
				colors.push("pink")
			}

			if (z == -1) {
				const plane = new Mesh(planeGeometry, materials.white)
				plane.position.z = -0.51
				plane.rotation.y = Math.PI
				cube.add(plane)
				colors.push("white")
			} else if (z == 1) {
				const plane = new Mesh(planeGeometry, materials.blue)
				plane.position.z = 0.51
				cube.add(plane)
				colors.push("blue")
			}

			cube.position.set(x, y, z)
			cube.name = colors.join(" ")
			scene.add(cube)

			faces[x + 1][y + 1][z + 1] = cube
		}
	}
}

// ----------------------- Controls -----------------------
const PIOT = Math.PI / 2,
	PI = Math.PI

/**
 * @typedef {Object} UIElementDefinition
 * @property {"arrow"|"circle"} type
 * @property {Vector3} position
 * @property {Euler} rotation
 * @property {Input} input
 */

/** @type {UIElementDefinition[]} */
let uiElementsDefinitions = [
	{
		// red top
		type: "arrow",
		position: new Vector3(1.6, 1.15, 0),
		rotation: new Euler(-PIOT, -PIOT, 0, "YXZ"),
		input: { axis: "z", end: "*", clockwise: false },
	},
	{
		// red bottom
		type: "arrow",
		position: new Vector3(1.6, -1.15, 0),
		rotation: new Euler(PIOT, PIOT, 0, "YXZ"),
		input: { axis: "z", end: "*", clockwise: true },
	},
	{
		// red left
		type: "arrow",
		position: new Vector3(1.6, 0, 1.15),
		rotation: new Euler(0, 0, -PIOT),
		input: { axis: "y", end: "*", clockwise: true },
	},
	{
		//red right
		type: "arrow",
		position: new Vector3(1.6, 0, -1.15),
		rotation: new Euler(0, PI, PIOT),
		input: { axis: "y", end: "*", clockwise: false },
	},
	{
		// red center
		type: "circle",
		position: new Vector3(1.6, 0, 0),
		rotation: new Euler(0, PIOT, 0),
		input: { axis: "x", end: "+", clockwise: true },
	},
	{
		// red top left up
		type: "arrow",
		position: new Vector3(1.6, 1.15, 1),
		rotation: new Euler(-PIOT, -PIOT, 0, "YXZ"),
		input: { axis: "z", end: "+", clockwise: false },
	},
	{
		// red top left left
		type: "arrow",
		position: new Vector3(1.6, 1, 1.15),
		rotation: new Euler(0, 0, -PIOT),
		input: { axis: "y", end: "+", clockwise: true },
	},
	{
		// red top right up
		type: "arrow",
		position: new Vector3(1.6, 1.15, -1),
		rotation: new Euler(-PIOT, -PIOT, 0, "YXZ"),
		input: { axis: "z", end: "-", clockwise: false },
	},
	{
		// red top right right
		type: "arrow",
		position: new Vector3(1.6, 1, -1.15),
		rotation: new Euler(0, PI, PIOT),
		input: { axis: "y", end: "+", clockwise: false },
	},
	{
		// red bottom left down
		type: "arrow",
		position: new Vector3(1.6, -1.15, 1),
		rotation: new Euler(PIOT, PIOT, 0, "YXZ"),
		input: { axis: "z", end: "+", clockwise: true },
	},
	{
		// red bottom left left
		type: "arrow",
		position: new Vector3(1.6, -1, 1.15),
		rotation: new Euler(0, 0, -PIOT),
		input: { axis: "y", end: "-", clockwise: true },
	},
	{
		// red bottom right down
		type: "arrow",
		position: new Vector3(1.6, -1.15, -1),
		rotation: new Euler(PIOT, PIOT, 0, "YXZ"),
		input: { axis: "z", end: "-", clockwise: true },
	},
	{
		// red bottom right right
		type: "arrow",
		position: new Vector3(1.6, -1, -1.15),
		rotation: new Euler(0, PI, PIOT),
		input: { axis: "y", end: "-", clockwise: false },
	},

	{
		// yellow top
		type: "arrow",
		position: new Vector3(-1.6, 1.15, 0),
		rotation: new Euler(-PIOT, PIOT, 0, "YXZ"),
		input: { axis: "z", end: "*", clockwise: true },
	},
	{
		// yellow bottom
		type: "arrow",
		position: new Vector3(-1.6, -1.15, 0),
		rotation: new Euler(PIOT, -PIOT, 0, "YXZ"),
		input: { axis: "z", end: "*", clockwise: false },
	},
	{
		// yellow left
		type: "arrow",
		position: new Vector3(-1.6, 0, 1.15),
		rotation: new Euler(0, 0, PIOT),
		input: { axis: "y", end: "*", clockwise: false },
	},
	{
		//yellow right
		type: "arrow",
		position: new Vector3(-1.6, 0, -1.15),
		rotation: new Euler(0, PI, -PIOT),
		input: { axis: "y", end: "*", clockwise: true },
	},
	{
		// yellow center
		type: "circle",
		position: new Vector3(-1.6, 0, 0),
		rotation: new Euler(0, -PIOT, 0),
		input: { axis: "x", end: "-", clockwise: false },
	},
	{
		// yellow top left up
		type: "arrow",
		position: new Vector3(-1.6, 1.15, -1),
		rotation: new Euler(-PIOT, PIOT, 0, "YXZ"),
		input: { axis: "z", end: "-", clockwise: true },
	},
	{
		// yellow top left left
		type: "arrow",
		position: new Vector3(-1.6, 1, -1.15),
		rotation: new Euler(0, PI, -PIOT),
		input: { axis: "y", end: "+", clockwise: true },
	},
	{
		// yellow top right up
		type: "arrow",
		position: new Vector3(-1.6, 1.15, 1),
		rotation: new Euler(-PIOT, PIOT, 0, "YXZ"),
		input: { axis: "z", end: "+", clockwise: true },
	},
	{
		// yellow top right right
		type: "arrow",
		position: new Vector3(-1.6, 1, 1.15),
		rotation: new Euler(0, 0, PIOT),
		input: { axis: "y", end: "+", clockwise: false },
	},
	{
		// yellow bottom left down
		type: "arrow",
		position: new Vector3(-1.6, -1.15, -1),
		rotation: new Euler(PIOT, -PIOT, 0, "YXZ"),
		input: { axis: "z", end: "-", clockwise: false },
	},
	{
		// yellow bottom left left
		type: "arrow",
		position: new Vector3(-1.6, -1, -1.15),
		rotation: new Euler(0, PI, -PIOT),
		input: { axis: "y", end: "-", clockwise: true },
	},
	{
		// yellow bottom right down
		type: "arrow",
		position: new Vector3(-1.6, -1.15, 1),
		rotation: new Euler(PIOT, -PIOT, 0, "YXZ"),
		input: { axis: "z", end: "+", clockwise: false },
	},
	{
		// yellow bottom right right
		type: "arrow",
		position: new Vector3(-1.6, -1, 1.15),
		rotation: new Euler(0, 0, PIOT),
		input: { axis: "y", end: "-", clockwise: false },
	},

	{
		// pink top
		type: "arrow",
		position: new Vector3(1.15, 1.6, 0),
		rotation: new Euler(0, PIOT, 0),
		input: { axis: "z", end: "*", clockwise: true },
	},
	{
		// pink bottom
		type: "arrow",
		position: new Vector3(-1.15, 1.6, 0),
		rotation: new Euler(0, -PIOT, 0),
		input: { axis: "z", end: "*", clockwise: false },
	},
	{
		// pink right
		type: "arrow",
		position: new Vector3(0, 1.6, 1.15),
		rotation: new Euler(),
		input: { axis: "x", end: "*", clockwise: false },
	},
	{
		//pink left
		type: "arrow",
		position: new Vector3(0, 1.6, -1.15),
		rotation: new Euler(0, PI, 0),
		input: { axis: "x", end: "*", clockwise: true },
	},
	{
		// pink center
		type: "circle",
		position: new Vector3(0, 1.6, 0),
		rotation: new Euler(-PIOT),
		input: { axis: "y", end: "+", clockwise: true },
	},
	{
		// pink top left up
		type: "arrow",
		position: new Vector3(1.15, 1.6, -1),
		rotation: new Euler(0, PIOT, 0),
		input: { axis: "z", end: "-", clockwise: true },
	},
	{
		// pink top left left
		type: "arrow",
		position: new Vector3(1, 1.6, -1.15),
		rotation: new Euler(0, PI, 0),
		input: { axis: "x", end: "+", clockwise: true },
	},
	{
		// pink top right up
		type: "arrow",
		position: new Vector3(1.15, 1.6, 1),
		rotation: new Euler(0, PIOT, 0),
		input: { axis: "z", end: "+", clockwise: true },
	},
	{
		// pink top right right
		type: "arrow",
		position: new Vector3(1, 1.6, 1.15),
		rotation: new Euler(),
		input: { axis: "x", end: "+", clockwise: false },
	},
	{
		// pink bottom left down
		type: "arrow",
		position: new Vector3(-1, 1.6, -1.15),
		rotation: new Euler(0, PI, 0),
		input: { axis: "x", end: "-", clockwise: true },
	},
	{
		// pink bottom left left
		type: "arrow",
		position: new Vector3(-1.15, 1.6, -1),
		rotation: new Euler(0, -PIOT, 0),
		input: { axis: "z", end: "-", clockwise: false },
	},
	{
		// pink bottom right down
		type: "arrow",
		position: new Vector3(-1.15, 1.6, 1),
		rotation: new Euler(0, -PIOT, 0),
		input: { axis: "z", end: "+", clockwise: false },
	},
	{
		// pink bottom right right
		type: "arrow",
		position: new Vector3(-1, 1.6, 1.15),
		rotation: new Euler(),
		input: { axis: "x", end: "-", clockwise: false },
	},

	{
		// green top
		type: "arrow",
		position: new Vector3(1.15, -1.6, 0),
		rotation: new Euler(PI, PIOT, 0),
		input: { axis: "z", end: "*", clockwise: false },
	},
	{
		// green bottom
		type: "arrow",
		position: new Vector3(-1.15, -1.6, 0),
		rotation: new Euler(PI, -PIOT, 0),
		input: { axis: "z", end: "*", clockwise: true },
	},
	{
		// green right
		type: "arrow",
		position: new Vector3(0, -1.6, 1.15),
		rotation: new Euler(0, 0, PI),
		input: { axis: "x", end: "*", clockwise: true },
	},
	{
		//green left
		type: "arrow",
		position: new Vector3(0, -1.6, -1.15),
		rotation: new Euler(0, PI, PI),
		input: { axis: "x", end: "*", clockwise: false },
	},
	{
		// green center
		type: "circle",
		position: new Vector3(0, -1.6, 0),
		rotation: new Euler(PIOT),
		input: { axis: "y", end: "-", clockwise: false },
	},
	{
		// green top left up
		type: "arrow",
		position: new Vector3(1.15, -1.6, -1),
		rotation: new Euler(0, PIOT, PI),
		input: { axis: "z", end: "-", clockwise: false },
	},
	{
		// green top left left
		type: "arrow",
		position: new Vector3(1, -1.6, -1.15),
		rotation: new Euler(0, PI, PI),
		input: { axis: "x", end: "+", clockwise: false },
	},
	{
		// green top right up
		type: "arrow",
		position: new Vector3(1.15, -1.6, 1),
		rotation: new Euler(0, PIOT, PI),
		input: { axis: "z", end: "+", clockwise: false },
	},
	{
		// green top right right
		type: "arrow",
		position: new Vector3(1, -1.6, 1.15),
		rotation: new Euler(0, 0, PI),
		input: { axis: "x", end: "+", clockwise: true },
	},
	{
		// green bottom left down
		type: "arrow",
		position: new Vector3(-1, -1.6, -1.15),
		rotation: new Euler(0, PI, PI),
		input: { axis: "x", end: "-", clockwise: false },
	},
	{
		// green bottom left left
		type: "arrow",
		position: new Vector3(-1.15, -1.6, -1),
		rotation: new Euler(0, -PIOT, PI),
		input: { axis: "z", end: "-", clockwise: true },
	},
	{
		// green bottom right down
		type: "arrow",
		position: new Vector3(-1.15, -1.6, 1),
		rotation: new Euler(0, -PIOT, PI),
		input: { axis: "z", end: "+", clockwise: true },
	},
	{
		// green bottom right right
		type: "arrow",
		position: new Vector3(-1, -1.6, 1.15),
		rotation: new Euler(0, 0, PI),
		input: { axis: "x", end: "-", clockwise: true },
	},

	{
		// blue top
		type: "arrow",
		position: new Vector3(0, 1.15, 1.6),
		rotation: new Euler(-PIOT, 0, PI),
		input: { axis: "x", end: "*", clockwise: true },
	},
	{
		// blue bottom
		type: "arrow",
		position: new Vector3(0, -1.15, 1.6),
		rotation: new Euler(PIOT, 0, 0),
		input: { axis: "x", end: "*", clockwise: false },
	},
	{
		// blue right
		type: "arrow",
		position: new Vector3(1.15, 0, 1.6),
		rotation: new Euler(0, PIOT, PIOT),
		input: { axis: "y", end: "*", clockwise: false },
	},
	{
		//blue left
		type: "arrow",
		position: new Vector3(-1.15, 0, 1.6),
		rotation: new Euler(0, -PIOT, -PIOT),
		input: { axis: "y", end: "*", clockwise: true },
	},
	{
		// blue center
		type: "circle",
		position: new Vector3(0, 0, 1.6),
		rotation: new Euler(),
		input: { axis: "z", end: "+", clockwise: true },
	},
	{
		// blue top left up
		type: "arrow",
		position: new Vector3(-1, 1.15, 1.6),
		rotation: new Euler(PIOT, PI, 0),
		input: { axis: "x", end: "-", clockwise: true },
	},
	{
		// blue top left left
		type: "arrow",
		position: new Vector3(-1.15, 1, 1.6),
		rotation: new Euler(PIOT, -PIOT, 0),
		input: { axis: "y", end: "+", clockwise: true },
	},
	{
		// blue top right up
		type: "arrow",
		position: new Vector3(1, 1.15, 1.6),
		rotation: new Euler(PIOT, -PI, 0),
		input: { axis: "x", end: "+", clockwise: true },
	},
	{
		// blue top right right
		type: "arrow",
		position: new Vector3(1.15, 1, 1.6),
		rotation: new Euler(PIOT, PIOT, 0),
		input: { axis: "y", end: "+", clockwise: false },
	},
	{
		// blue bottom left down
		type: "arrow",
		position: new Vector3(-1, -1.15, 1.6),
		rotation: new Euler(PIOT, 0, 0),
		input: { axis: "x", end: "-", clockwise: false },
	},
	{
		// blue bottom left left
		type: "arrow",
		position: new Vector3(-1.15, -1, 1.6),
		rotation: new Euler(PIOT, -PIOT, 0),
		input: { axis: "y", end: "-", clockwise: true },
	},
	{
		// blue bottom right down
		type: "arrow",
		position: new Vector3(1, -1.15, 1.6),
		rotation: new Euler(PIOT, 0, 0),
		input: { axis: "x", end: "+", clockwise: false },
	},
	{
		// blue bottom right right
		type: "arrow",
		position: new Vector3(1.15, -1, 1.6),
		rotation: new Euler(PIOT, PIOT, 0),
		input: { axis: "y", end: "-", clockwise: false },
	},

	{
		// white top
		type: "arrow",
		position: new Vector3(0, 1.15, -1.6),
		rotation: new Euler(-PIOT, 0, 0),
		input: { axis: "x", end: "*", clockwise: false },
	},
	{
		// white bottom
		type: "arrow",
		position: new Vector3(0, -1.15, -1.6),
		rotation: new Euler(PIOT, 0, PI),
		input: { axis: "x", end: "*", clockwise: true },
	},
	{
		// white right
		type: "arrow",
		position: new Vector3(1.15, 0, -1.6),
		rotation: new Euler(0, PIOT, -PIOT),
		input: { axis: "y", end: "*", clockwise: true },
	},
	{
		//white left
		type: "arrow",
		position: new Vector3(-1.15, 0, -1.6),
		rotation: new Euler(0, -PIOT, PIOT),
		input: { axis: "y", end: "*", clockwise: false },
	},
	{
		// white center
		type: "circle",
		position: new Vector3(0, 0, -1.6),
		rotation: new Euler(0, PI, 0),
		input: { axis: "z", end: "-", clockwise: false },
	},
	{
		// white top right up
		type: "arrow",
		position: new Vector3(-1, 1.15, -1.6),
		rotation: new Euler(PIOT, PI, PI),
		input: { axis: "x", end: "-", clockwise: false },
	},
	{
		// white top right right
		type: "arrow",
		position: new Vector3(-1.15, 1, -1.6),
		rotation: new Euler(PIOT, -PIOT, PI),
		input: { axis: "y", end: "+", clockwise: false },
	},
	{
		// white top left up
		type: "arrow",
		position: new Vector3(1, 1.15, -1.6),
		rotation: new Euler(PIOT, -PI, PI),
		input: { axis: "x", end: "+", clockwise: false },
	},
	{
		// white top left left
		type: "arrow",
		position: new Vector3(1.15, 1, -1.6),
		rotation: new Euler(PIOT, PIOT, PI),
		input: { axis: "y", end: "+", clockwise: true },
	},
	{
		// white bottom right down
		type: "arrow",
		position: new Vector3(-1, -1.15, -1.6),
		rotation: new Euler(PIOT, 0, PI),
		input: { axis: "x", end: "-", clockwise: true },
	},
	{
		// white bottom right right
		type: "arrow",
		position: new Vector3(-1.15, -1, -1.6),
		rotation: new Euler(PIOT, -PIOT, PI),
		input: { axis: "y", end: "-", clockwise: false },
	},
	{
		// white bottom left down
		type: "arrow",
		position: new Vector3(1, -1.15, -1.6),
		rotation: new Euler(PIOT, 0, PI),
		input: { axis: "x", end: "+", clockwise: true },
	},
	{
		// white bottom left left
		type: "arrow",
		position: new Vector3(1.15, -1, -1.6),
		rotation: new Euler(PIOT, PIOT, PI),
		input: { axis: "y", end: "-", clockwise: true },
	},
]
let uiElements = uiElementsDefinitions.map(
	({ position, rotation, input, type }) => {
		const element = new Mesh(
			type == "arrow" ? arrowGeometry : circleGeometry,
			materials.controls,
		)
		const edges = new Line(
			type == "arrow" ? arrowEdgesGeometry : circleEdgesGeometry,
			materials.edges,
		)
		element.position.copy(position)
		element.rotation.copy(rotation)
		element.addEventListener("click", e =>
			inputQueue.push({
				...input,
				clockwise: e.rightClick ? !input.clockwise : input.clockwise,
			}),
		)
		element.name = "UI " + type
		element.add(edges)
		scene.add(element)
		return element
	},
)

camera.position.set(0, 0, -5)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableZoom = true
controls.enablePan = false
controls.minDistance = 4
controls.maxDistance = 10

/**
 * @typedef {Object} Input
 * @property {"x"|"y"|"z"} axis
 * @property {"+"|"*"|"-"} end
 * @property {boolean} clockwise
 */

let rotationData = {
	/** @type {Mesh[]} */
	faces: null,
	clockwise: true,
	time: 0,
	start: 0,
	/** @type {Vector3} */
	axis: null,
	/** @type {Vector3} */
	center: null,
}
const ANIMATION_DURATION = 150
/** @type {Input[]} */
const inputQueue = []
let nbClicks = 0

/**
 * @param {number} now
 */
function raf(now) {
	if (rotationData.time > 0) {
		const { time, faces, clockwise, axis, center, start } = rotationData
		const delta = MathUtils.clamp(now - start, 0, time)
		rotationData.start = now
		rotationData.time -= delta

		const deltaS = delta / ANIMATION_DURATION
		const angle = (clockwise ? -deltaS : deltaS) * (Math.PI / 2)
		faces.forEach(m => {
			m.position.applyAxisAngle(axis, angle)
			m.rotateOnWorldAxis(axis, angle)
		})
	} else if (inputQueue.length) {
		let inpt = inputQueue.shift()
		rotateAround(inpt.axis, inpt.end, inpt.clockwise)
	}

	renderer.render(scene, camera)
	requestAnimationFrame(raf)
}
raf()

/**
 * @param {"x"|"y"|"z"} axis
 * @param {"+"|"*"|"-"} end
 * @param {boolean} clockwise
 */
function rotateAround(axis, end, clockwise = true) {
	const offset = end == "*" ? 1 : end == "+" ? 2 : 0
	/** @type {Mesh[]} */
	let toRotate = []
	let positions = []
	const axisVector = new Vector3(
		+(axis == "x"),
		+(axis == "y"),
		+(axis == "z"),
	)
	switch (axis) {
		case "x":
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					toRotate.push(faces[offset][y][z])
					positions.push(new Vector3(offset, y, z))
				}
			}
			break
		case "y":
			for (let x = 0; x < 3; x++) {
				for (let z = 0; z < 3; z++) {
					toRotate.push(faces[x][offset][z])
					positions.push(new Vector3(x, offset, z))
				}
			}
			break
		case "z":
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					toRotate.push(faces[x][y][offset])
					positions.push(new Vector3(x, y, offset))
				}
			}
			break
	}
	const one = new Vector3(1, 1, 1),
		angle = (clockwise ? -1 : 1) * (Math.PI / 2)
	positions = positions.filter((_, i) => !!toRotate[i])
	toRotate = toRotate.filter(Boolean)
	positions
		.map(p =>
			p
				.sub(one)
				.applyAxisAngle(axisVector, angle)
				.round()
				.add(one),
		)
		.forEach((p, i) => (faces[p.x][p.y][p.z] = toRotate[i]))
	rotationData = {
		axis: axisVector,
		center: axisVector.clone().multiplyScalar(0.33 * Math.sign(offset - 1)),
		clockwise,
		faces: toRotate,
		time: ANIMATION_DURATION,
		start: performance.now(),
	}
	materials.edges.opacity = (30 - nbClicks++) / 30
	materials.controls.opacity = MathUtils.clamp((30 - nbClicks++) / 30, 0.3, 1)
}

window.addEventListener("keydown", e => {
	if (e.key == "1")
		inputQueue.push({ axis: "x", end: "+", clockwise: !e.altKey })
	else if (e.key == "2")
		inputQueue.push({ axis: "x", end: "*", clockwise: !e.altKey })
	else if (e.key == "3")
		inputQueue.push({ axis: "x", end: "-", clockwise: !e.altKey })
	else if (e.key == "4")
		inputQueue.push({ axis: "y", end: "+", clockwise: !e.altKey })
	else if (e.key == "5")
		inputQueue.push({ axis: "y", end: "*", clockwise: !e.altKey })
	else if (e.key == "6")
		inputQueue.push({ axis: "y", end: "-", clockwise: !e.altKey })
	else if (e.key == "7")
		inputQueue.push({ axis: "z", end: "+", clockwise: !e.altKey })
	else if (e.key == "8")
		inputQueue.push({ axis: "z", end: "*", clockwise: !e.altKey })
	else if (e.key == "9")
		inputQueue.push({ axis: "z", end: "-", clockwise: !e.altKey })
})
