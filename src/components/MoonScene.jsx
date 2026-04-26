import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  BackSide,
  Clock,
  Color,
  DirectionalLight,
  HemisphereLight,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from 'three';

const NASA_TEXTURES = {
  moon: '/textures/nasa-moon/lroc_color_poles_1k.jpg',
  displacement: '/textures/nasa-moon/ldem_3_8bit.jpg',
  sky: '/textures/nasa-moon/hipp8_s.jpg',
};

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  Object.values(material).forEach((value) => {
    if (value?.isTexture) value.dispose();
  });
  material.dispose();
}

export default function MoonScene({ phase, label }) {
  const mountRef = useRef(null);
  const lightRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let width = mount.clientWidth;
    let height = mount.clientHeight;
    let frameId;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new Scene();
    const camera = new PerspectiveCamera(55, width / height, 0.1, 2000);
    camera.position.set(0, 0, 5);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const loader = new TextureLoader();
    const moonTexture = loader.load(NASA_TEXTURES.moon);
    const displacementMap = loader.load(NASA_TEXTURES.displacement);
    const skyTexture = loader.load(NASA_TEXTURES.sky);

    moonTexture.colorSpace = SRGBColorSpace;
    moonTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    moonTexture.minFilter = LinearMipmapLinearFilter;
    moonTexture.magFilter = LinearFilter;
    moonTexture.wrapS = RepeatWrapping;
    skyTexture.colorSpace = SRGBColorSpace;

    const moon = new Mesh(
      new SphereGeometry(2, 80, 80),
      new MeshPhongMaterial({
        color: 0xffffff,
        map: moonTexture,
        displacementMap,
        displacementScale: 0.06,
        bumpMap: displacementMap,
        bumpScale: 0.04,
        reflectivity: 0,
        shininess: 0,
        specular: new Color(0x000000),
      })
    );
    moon.rotation.x = Math.PI * 0.02;
    moon.rotation.y = Math.PI * 1.54;
    scene.add(moon);

    const directionalLight = new DirectionalLight(0xfff8e8, 2.25);
    lightRef.current = directionalLight;
    scene.add(directionalLight);

    scene.add(new AmbientLight(0x10152a, 0.52));
    const rimLight = new HemisphereLight(0x0a1030, 0x000000, 0.25);
    rimLight.position.set(0, 0, 0);
    scene.add(rimLight);

    const sky = new Mesh(
      new SphereGeometry(900, 48, 48),
      new MeshBasicMaterial({ color: 0xffffff, map: skyTexture, side: BackSide })
    );
    scene.add(sky);

    let rotationY = Math.PI * 1.54;
    let rotationX = Math.PI * 0.02;
    let targetRotationY = rotationY;
    let targetRotationX = rotationX;
    let zoom = 5;
    let targetZoom = 5;
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let autoSpin = !prefersReducedMotion;

    const setLight = (p) => {
      const angle = Math.PI * (1 - 2 * p);
      directionalLight.position.set(Math.sin(angle) * 120, 15, Math.cos(angle) * 120);
    };
    setLight(phase);

    const startDrag = (x, y) => {
      mount.focus({ preventScroll: true });
      isDragging = true;
      previousX = x;
      previousY = y;
      autoSpin = false;
      mount.classList.add('is-dragging');
    };
    const moveDrag = (x, y) => {
      if (!isDragging) return;
      targetRotationY += (x - previousX) * 0.007;
      targetRotationX = Math.max(-1.3, Math.min(1.3, targetRotationX + (y - previousY) * 0.007));
      previousX = x;
      previousY = y;
    };
    const endDrag = () => {
      isDragging = false;
      mount.classList.remove('is-dragging');
    };

    const onMouseDown = (event) => startDrag(event.clientX, event.clientY);
    const onMouseMove = (event) => moveDrag(event.clientX, event.clientY);
    const onWheel = (event) => {
      event.preventDefault();
      targetZoom = Math.max(2.8, Math.min(14, targetZoom + event.deltaY * 0.009));
    };
    const onTouchStart = (event) => {
      event.preventDefault();
      startDrag(event.touches[0].clientX, event.touches[0].clientY);
    };
    const onTouchMove = (event) => {
      if (!isDragging) return;
      moveDrag(event.touches[0].clientX, event.touches[0].clientY);
    };
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const handledKeys = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', '+', '=', '-', '_', 'home'];
      if (!handledKeys.includes(key)) return;

      event.preventDefault();
      event.stopPropagation();
      autoSpin = false;

      if (key === 'arrowleft') targetRotationY -= 0.16;
      if (key === 'arrowright') targetRotationY += 0.16;
      if (key === 'arrowup') targetRotationX = Math.max(-1.3, targetRotationX - 0.14);
      if (key === 'arrowdown') targetRotationX = Math.min(1.3, targetRotationX + 0.14);
      if (key === '+' || key === '=') targetZoom = Math.max(2.8, targetZoom - 0.5);
      if (key === '-' || key === '_') targetZoom = Math.min(14, targetZoom + 0.5);
      if (key === 'home') {
        targetRotationY = Math.PI * 1.54;
        targetRotationX = Math.PI * 0.02;
        targetZoom = 5;
      }
    };
    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    mount.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', endDrag);
    window.addEventListener('resize', onResize);

    const clock = new Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (autoSpin) targetRotationY += 0.0018 + delta * 0.005;
      rotationY += (targetRotationY - rotationY) * 0.07;
      rotationX += (targetRotationX - rotationX) * 0.07;
      zoom += (targetZoom - zoom) * 0.07;
      moon.rotation.y = rotationY;
      moon.rotation.x = rotationX;
      sky.rotation.y += prefersReducedMotion ? 0 : 0.0001;
      sky.rotation.x += prefersReducedMotion ? 0 : 0.00004;
      camera.position.z = zoom;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      mount.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', endDrag);
      window.removeEventListener('resize', onResize);

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) disposeMaterial(object.material);
      });

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.forceContextLoss();
      lightRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lightRef.current) return;
    const angle = Math.PI * (1 - 2 * phase);
    lightRef.current.position.set(Math.sin(angle) * 120, 15, Math.cos(angle) * 120);
  }, [phase]);

  return (
    <div
      ref={mountRef}
      className="moon-scene"
      role="application"
      tabIndex={0}
      aria-label={`Interactive 3D moon: ${label}. Drag to rotate, use the mouse wheel or plus and minus keys to zoom.`}
    />
  );
}
