import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
} from "three"

const scene = new Scene()
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)

const renderer = new WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new BoxGeometry()
const material = new MeshBasicMaterial({ color: 0xff0000 })
const cube = new Mesh(geometry, material)
scene.add(cube)

camera.position.set(2, 2, 3)
camera.lookAt(0, 0, 0)

function raf() {
	cube.rotateY(0.007)
	renderer.render(scene, camera)
	requestAnimationFrame(raf)
}
raf()
