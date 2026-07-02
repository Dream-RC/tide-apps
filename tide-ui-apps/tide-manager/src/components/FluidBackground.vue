<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement>()

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let mesh: THREE.Mesh
let animationId: number
let clock: THREE.Clock
let uniforms: {
    u_time: { value: number }
    u_resolution: { value: THREE.Vector2 }
    u_color1: { value: THREE.Color }
    u_color2: { value: THREE.Color }
    u_color3: { value: THREE.Color }
}

const vertexShader = /* glsl */ `
    varying vec2 v_uv;
    void main() {
        v_uv = uv;
        gl_Position = vec4(position, 1.0);
    }
`

const fragmentShader = /* glsl */ `
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,
                            0.366025403784439,
                           -0.577350269189626,
                            0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
               + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                                dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = v_uv;
        vec2 st = uv * 2.0 - 1.0;
        st.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.6;

        // 3 orbiting centers (cream-based)
        vec2 b1 = vec2(0.6 + 0.7 * sin(t * 0.4), 0.55 + 0.7 * cos(t * 0.35));
        vec2 b2 = vec2(-0.55 + 0.75 * sin(t * 0.45 + 2.0), -0.5 + 0.75 * cos(t * 0.4 + 2.0));
        vec2 b3 = vec2(-0.5 + 0.75 * sin(t * 0.42 + 4.0), 0.5 + 0.75 * cos(t * 0.37 + 4.0));

        // Pink warm blobs (warm highlight blobs)
        float n1 = snoise(st * 2.5 + t * 0.3) * 0.25;
        float n2 = snoise(st * 3.0 - t * 0.35) * 0.25;
        float n3 = snoise(st * 2.2 + t * 0.28) * 0.25;

        float d1 = length(st - b1) + n1;
        float d2 = length(st - b2) + n2;
        float d3 = length(st - b3) + n3;

        float blob1 = exp(-d1 * d1 * 3.5);
        float blob2 = exp(-d2 * d2 * 3.0);
        float blob3 = exp(-d3 * d3 * 3.8);

        float warmBlobs = blob1 * 0.4 + blob2 * 0.35 + blob3 * 0.35;
        warmBlobs = clamp(warmBlobs, 0.0, 1.0);

        // Cool gray-blue mist (15-25%)
        float mistNoise = snoise(st * 1.3 + vec2(t * 0.15, -t * 0.1));
        mistNoise += snoise(st * 2.4 + vec2(-t * 0.2, t * 0.15)) * 0.5;
        float coolMist = smoothstep(-0.3, 0.7, mistNoise) * 0.4;

        float edgeFade = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x)
                       * smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
        warmBlobs *= edgeFade;
        coolMist *= smoothstep(0.0, 0.4, uv.x) * smoothstep(1.0, 0.7, uv.x)
                  * smoothstep(0.0, 0.4, uv.y) * smoothstep(1.0, 0.7, uv.y);

        // cream base
        vec3 color = u_color1;
        // pink warm highlight
        color = mix(color, u_color2, warmBlobs * 0.45);
        // gray-blue mist shadow
        color = mix(color, u_color3, coolMist * 0.4);

        gl_FragColor = vec4(color, 0.9);
    }
`

function init() {
    if (!containerRef.value) return

    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.value.appendChild(renderer.domElement)

    scene = new THREE.Scene()
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    clock = new THREE.Clock()

    uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_color1: { value: new THREE.Color('#FBF3ED') },
        u_color2: { value: new THREE.Color('#F5E2DC') },
        u_color3: { value: new THREE.Color('#C0CDD1') },
    }

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    })

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    animate()
}

function animate() {
    animationId = requestAnimationFrame(animate)
    uniforms.u_time.value += clock.getDelta()
    renderer.render(scene, camera)
}

function onResize() {
    if (!containerRef.value) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    renderer.setSize(width, height)
    uniforms.u_resolution.value.set(width, height)
}

onMounted(() => {
    init()
    window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
    renderer?.dispose()
    mesh?.geometry?.dispose()
    ;(mesh?.material as THREE.ShaderMaterial)?.dispose()
})
</script>

<template>
    <div ref="containerRef" class="fluid-bg">
        <div class="fluid-overlay"></div>
        <div class="fluid-grain"></div>
    </div>
</template>

<style scoped lang="scss">
.fluid-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    background-color: var(--background);

    // :deep(canvas) {
    //     filter: blur(2px) saturate(1.05) brightness(1.02);
    // }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        pointer-events: none;
    }
}

.fluid-overlay {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 30% 30%, transparent 30%, rgba(120, 120, 130, 0.06) 70%, rgba(255, 255, 255, 0.12) 100%),
        radial-gradient(circle at 70% 70%, transparent 35%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.08) 100%);
    pointer-events: none;
}

.fluid-grain {
    position: absolute;
    inset: -50%;
    background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.8  0 0 0 0 0.78  0 0 0 0 0.75  0 0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    background-size: 200px 200px;
    opacity: 0.4;
    mix-blend-mode: soft-light;
    pointer-events: none;
}
</style>