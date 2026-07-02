import * as THREE from "three";

export class LoadingScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;
  private animationId: number | null = null;
  private container: HTMLElement;
  private clock: THREE.Clock;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 8;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.particles = this.createParticles();
    this.scene.add(this.particles);

    this.bindEvents();
  }

  private createParticles(): THREE.Points {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const color1 = new THREE.Color(0xffffff);
    const color2 = new THREE.Color(0xdddddd);
    const color3 = new THREE.Color(0xaaaaaa);
    const color4 = new THREE.Color(0x888888);
    const color5 = new THREE.Color(0x666666);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3.5 + Math.random() * 8.5;

      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.7;
      positions[i * 3 + 2] = Math.cos(phi) * radius;

      const mixColor = Math.random();
      let color: THREE.Color;
      if (mixColor < 0.3) color = color1;
      else if (mixColor < 0.5) color = color2;
      else if (mixColor < 0.7) color = color3;
      else if (mixColor < 0.85) color = color4;
      else color = color5;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 0.015 + Math.random() * 0.04;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
  }

  private bindEvents(): void {
    const onMouseMove = (e: MouseEvent) => {
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
  }

  public animate(): void {
    const delta = this.clock.getDelta();

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.particles.rotation.x += delta * 0.08;
    this.particles.rotation.y += delta * 0.12;
    this.particles.rotation.z += delta * 0.05;

    this.camera.position.x += (this.mouseX * 1.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseY * 1.0 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  public start(): void {
    this.animate();
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Points || obj instanceof THREE.Line) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}