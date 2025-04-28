// Game constants
const BLOCK_SIZE = 1;
const WORLD_SIZE = 8; // 모바일에서는 월드 크기를 줄임
const MOVEMENT_SPEED = 0.1;
const MOUSE_SENSITIVITY = 0.002;
const TOUCH_SENSITIVITY = 0.01;

// Game variables
let scene, camera, renderer;
let world = [];
let player = {
    position: new THREE.Vector3(0, 10, 0),
    velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(0, 0, 0, 'YXZ')
};
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isPointerLocked = false;
let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let touchControls = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
};

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(player.position);
    
    // Create renderer with mobile optimizations
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false;
    document.body.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Generate world
    generateWorld();
    
    // Initialize mobile controls if on mobile
    if (isMobile) {
        initMobileControls();
    } else {
        // Desktop controls
        document.addEventListener('click', () => {
            if (!isPointerLocked) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            isPointerLocked = document.pointerLockElement === document.body;
        });
        
        document.addEventListener('mousemove', onMouseMove);
    }
    
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onWindowResize);
    
    // Start game loop
    animate();
}

// Initialize mobile controls
function initMobileControls() {
    const mobileControls = document.getElementById('mobileControls');
    const jumpButton = document.getElementById('jumpButton');
    
    mobileControls.style.display = 'block';
    jumpButton.style.display = 'block';
    
    // Movement controls
    mobileControls.addEventListener('touchstart', (e) => {
        touchControls.active = true;
        touchControls.startX = e.touches[0].clientX;
        touchControls.startY = e.touches[0].clientY;
    });
    
    mobileControls.addEventListener('touchmove', (e) => {
        if (!touchControls.active) return;
        
        touchControls.currentX = e.touches[0].clientX;
        touchControls.currentY = e.touches[0].clientY;
        
        const deltaX = touchControls.currentX - touchControls.startX;
        const deltaY = touchControls.currentY - touchControls.startY;
        
        // Update player position based on touch movement
        const direction = new THREE.Vector3();
        direction.x = deltaX * TOUCH_SENSITIVITY;
        direction.z = deltaY * TOUCH_SENSITIVITY;
        direction.normalize();
        direction.applyEuler(player.rotation);
        player.position.add(direction.multiplyScalar(MOVEMENT_SPEED));
    });
    
    mobileControls.addEventListener('touchend', () => {
        touchControls.active = false;
    });
    
    // Jump button
    jumpButton.addEventListener('touchstart', () => {
        player.position.y += 1;
    });
    
    // Look around by touching and dragging anywhere on screen
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    document.addEventListener('touchstart', (e) => {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchmove', (e) => {
        const deltaX = e.touches[0].clientX - lastTouchX;
        const deltaY = e.touches[0].clientY - lastTouchY;
        
        player.rotation.y -= deltaX * TOUCH_SENSITIVITY;
        player.rotation.x -= deltaY * TOUCH_SENSITIVITY;
        player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, player.rotation.x));
        
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    });
}

// Generate the world
function generateWorld() {
    // Create ground
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            createBlock(x, 0, z, 0x00ff00); // Grass
            createBlock(x, -1, z, 0x8B4513); // Dirt
        }
    }
    
    // Add some random blocks (fewer on mobile)
    const blockCount = isMobile ? 20 : 50;
    for (let i = 0; i < blockCount; i++) {
        const x = Math.floor(Math.random() * WORLD_SIZE);
        const z = Math.floor(Math.random() * WORLD_SIZE);
        const y = Math.floor(Math.random() * 5) + 1;
        createBlock(x, y, z, 0x808080); // Stone
    }
}

// Create a block at the specified position
function createBlock(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const block = new THREE.Mesh(geometry, material);
    
    block.position.set(x, y, z);
    scene.add(block);
    
    if (!world[x]) world[x] = [];
    if (!world[x][y]) world[x][y] = [];
    world[x][y][z] = block;
}

// Handle mouse movement
function onMouseMove(event) {
    if (!isPointerLocked) return;
    
    player.rotation.y -= event.movementX * MOUSE_SENSITIVITY;
    player.rotation.x -= event.movementY * MOUSE_SENSITIVITY;
    player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, player.rotation.x));
}

// Handle keyboard input
function onKeyDown(event) {
    if (!isPointerLocked && !isMobile) return;
    
    const direction = new THREE.Vector3();
    
    if (event.key === 'w') direction.z -= 1;
    if (event.key === 's') direction.z += 1;
    if (event.key === 'a') direction.x -= 1;
    if (event.key === 'd') direction.x += 1;
    if (event.key === ' ') direction.y += 1; // Jump
    if (event.key === 'Shift') direction.y -= 1; // Crouch
    
    direction.normalize();
    direction.applyEuler(player.rotation);
    player.position.add(direction.multiplyScalar(MOVEMENT_SPEED));
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update camera position and rotation
    camera.position.copy(player.position);
    camera.rotation.copy(player.rotation);
    
    // Mobile performance optimization
    if (isMobile) {
        const distance = camera.position.distanceTo(player.position);
        if (distance > 20) {
            renderer.setPixelRatio(1);
        } else {
            renderer.setPixelRatio(window.devicePixelRatio);
        }
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Start the game
init(); 