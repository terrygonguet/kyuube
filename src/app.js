import {
	BoxGeometry,
	Color,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderer,
	Vector3,
	BackSide,
	Quaternion,
	MathUtils,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

const scene = new Scene()
scene.background = new Color("#AAA")
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)

const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)

document.body.appendChild(renderer.domElement)
const planeGeometry = new PlaneGeometry(0.93, 0.93)
const cubeGeometry = new BoxGeometry()
const materials = {
	black: new MeshBasicMaterial({
		color: "black",
	}),
	white: new MeshBasicMaterial({
		color: "white",
	}),
	blue: new MeshBasicMaterial({
		color: "blue",
	}),
	red: new MeshBasicMaterial({
		color: "red",
	}),
	yellow: new MeshBasicMaterial({
		color: "yellow",
	}),
	pink: new MeshBasicMaterial({
		color: "pink",
	}),
	green: new MeshBasicMaterial({
		color: "green",
	}),
}
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

camera.position.set(5, 4, 5)
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
	const one = new Vector3(1, 1, 1)
	positions = positions.filter((_, i) => !!toRotate[i])
	toRotate = toRotate.filter(Boolean)
	positions.forEach(p =>
		p
			.sub(one)
			.applyAxisAngle(axisVector, (clockwise ? -1 : 1) * (Math.PI / 2))
			.round()
			.add(one),
	)
	positions.forEach((p, i) => (faces[p.x][p.y][p.z] = toRotate[i]))
	rotationData = {
		axis: axisVector,
		center: axisVector.clone().multiplyScalar(0.33 * Math.sign(offset - 1)),
		clockwise,
		faces: toRotate,
		time: ANIMATION_DURATION,
		start: performance.now(),
	}
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
