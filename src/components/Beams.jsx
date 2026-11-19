/* eslint-disable react/no-unknown-property */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { degToRad } from 'three/src/math/MathUtils.js'
import './Beams.css'

const noise = `
float randomNoise(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}
float smoothNoise(vec2 st) {
  vec2 i = floor(st); vec2 f = fract(st);
  f = f * f * (3.0 - 2.0 * f);
  float a = randomNoise(i); float b = randomNoise(i + vec2(1.0, 0.0));
  float c = randomNoise(i + vec2(0.0, 1.0)); float d = randomNoise(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P) {
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0); vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1); vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x); vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z); vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x); vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z); vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000), dot(g010,g010), dot(g100,g100), dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001), dot(g011,g011), dot(g101,g101), dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0); float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  return mix(n_yz.x, n_yz.y, fade_xyz.x) * 2.2;
}
`

function extendMaterial(BaseMaterial, config) {
  const physical = THREE.ShaderLib.physical
  const uniforms = THREE.UniformsUtils.clone(physical.uniforms)
  const defaults = new BaseMaterial(config.material || {})

  if (defaults.color) uniforms.diffuse.value = defaults.color
  if ('roughness' in defaults) uniforms.roughness.value = defaults.roughness
  if ('metalness' in defaults) uniforms.metalness.value = defaults.metalness
  Object.entries(config.uniforms || {}).forEach(([key, value]) => {
    uniforms[key] = value && typeof value === 'object' && 'value' in value ? value : { value }
  })

  let vertexShader = `${config.header}\n${config.vertexHeader || ''}\n${physical.vertexShader}`
  let fragmentShader = `${config.header}\n${config.fragmentHeader || ''}\n${physical.fragmentShader}`
  Object.entries(config.vertex || {}).forEach(([needle, code]) => {
    vertexShader = vertexShader.replace(needle, `${needle}\n${code}`)
  })
  Object.entries(config.fragment || {}).forEach(([needle, code]) => {
    fragmentShader = fragmentShader.replace(needle, `${needle}\n${code}`)
  })

  return new THREE.ShaderMaterial({
    defines: { ...(physical.defines || {}) },
    uniforms,
    vertexShader,
    fragmentShader,
    lights: true,
    fog: Boolean(config.material && config.material.fog),
    transparent: false,
    depthWrite: true,
  })
}

function createStackedPlanes(count, width, height, heightSegments) {
  const verticesPerPlane = (heightSegments + 1) * 2
  const positions = new Float32Array(count * verticesPerPlane * 3)
  const indices = new Uint32Array(count * heightSegments * 6)
  const uvs = new Float32Array(count * verticesPerPlane * 2)
  const planePhases = new Float32Array(count * verticesPerPlane)
  const planeDrifts = new Float32Array(count * verticesPerPlane)
  const planeOffsets = new Float32Array(count * verticesPerPlane * 2)
  const totalWidth = count * width
  const xOffsetBase = -totalWidth / 2
  let vertexOffset = 0
  let indexOffset = 0
  let uvOffset = 0

  for (let plane = 0; plane < count; plane += 1) {
    const xOffset = xOffsetBase + plane * width
    const uvXOffset = Math.random() * 300
    const uvYOffset = Math.random() * 300
    const planePhase = Math.random() * 40.0
    const planeDrift = 0.35 + Math.random() * 0.9
    const planeY = (Math.random() - 0.5) * 1.8
    const planeZ = (Math.random() - 0.5) * 0.5
    for (let row = 0; row <= heightSegments; row += 1) {
      const y = height * (row / heightSegments - 0.5)
      positions.set([xOffset, y, 0, xOffset + width, y, 0], vertexOffset * 3)
      const uvY = row / heightSegments
      uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset)
      planePhases[vertexOffset] = planePhase
      planePhases[vertexOffset + 1] = planePhase
      planeDrifts[vertexOffset] = planeDrift
      planeDrifts[vertexOffset + 1] = planeDrift
      planeOffsets[vertexOffset * 2] = planeY
      planeOffsets[vertexOffset * 2 + 1] = planeZ
      planeOffsets[(vertexOffset + 1) * 2] = planeY
      planeOffsets[(vertexOffset + 1) * 2 + 1] = planeZ
      if (row < heightSegments) {
        const a = vertexOffset; const b = vertexOffset + 1
        const c = vertexOffset + 2; const d = vertexOffset + 3
        indices.set([a, b, c, c, b, d], indexOffset)
        indexOffset += 6
      }
      vertexOffset += 2
      uvOffset += 4
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setAttribute('planePhase', new THREE.BufferAttribute(planePhases, 1))
  geometry.setAttribute('planeDrift', new THREE.BufferAttribute(planeDrifts, 1))
  geometry.setAttribute('planeOffset', new THREE.BufferAttribute(planeOffsets, 2))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()
  return geometry
}

const MergedPlanes = forwardRef(function MergedPlanes({ material, width, count, height }, ref) {
  const mesh = useRef(null)
  useImperativeHandle(ref, () => mesh.current)
  const geometry = useMemo(() => createStackedPlanes(count, width, height, 100), [count, height, width])

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.material.uniforms.time.value += 0.1 * delta
  })

  return <mesh ref={mesh} geometry={geometry} material={material} />
})

function DirectionalLight({ position, color, intensity = 1 }) {
  const light = useRef(null)
  useEffect(() => {
    if (!light.current) return
    light.current.shadow.bias = -0.004
  }, [])
  return <directionalLight ref={light} color={color} intensity={intensity} position={position} />
}

function Scene({ beamWidth, beamHeight, beamNumber, lightColor, beamColor, backgroundColor, speed, noiseIntensity, scale, rotation }) {
  const material = useMemo(() => extendMaterial(THREE.MeshStandardMaterial, {
    header: `varying vec3 vEye; varying float vNoise; varying vec2 vUv; varying vec3 vPosition; uniform float time; uniform float uSpeed; uniform float uNoiseIntensity; uniform float uScale; ${noise}`,
    vertexHeader: `
      attribute float planePhase;
      attribute float planeDrift;
      attribute vec2 planeOffset;
      float getPos(vec3 pos) {
        float independentTime = time * uSpeed * planeDrift * 3.0 + planePhase;
        vec3 noisePos = vec3(pos.x * 0.0, pos.y - uv.y, pos.z + independentTime) * uScale;
        return cnoise(noisePos);
      }
      vec3 getCurrentPos(vec3 pos) { vec3 next = pos; next.z += getPos(pos); return next; }
      vec3 getNormal(vec3 pos) {
        vec3 current = getCurrentPos(pos);
        vec3 nextX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
        vec3 nextZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
        return normalize(cross(normalize(nextZ - current), normalize(nextX - current)));
      }
    `,
    vertex: {
      '#include <begin_vertex>': 'transformed.y += planeOffset.x + sin(planePhase + time * uSpeed * planeDrift * 0.35) * 0.22; transformed.z += planeOffset.y + getPos(transformed.xyz);',
      '#include <beginnormal_vertex>': 'objectNormal = getNormal(position.xyz);',
    },
    fragment: {
      '#include <dithering_fragment>': 'float grain = randomNoise(gl_FragCoord.xy); gl_FragColor.rgb -= grain / 15.0 * uNoiseIntensity;',
    },
    material: { fog: true },
    uniforms: {
      diffuse: new THREE.Color(beamColor),
      time: { value: 0 },
      roughness: 0.3,
      metalness: 0.3,
      envMapIntensity: 10,
      uSpeed: { value: speed },
      uNoiseIntensity: noiseIntensity,
      uScale: scale,
    },
  }), [beamColor, noiseIntensity, scale, speed])

  useEffect(() => () => material.dispose(), [material])

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={[backgroundColor, 9, 30]} />
      <group rotation={[0, 0, degToRad(rotation)]}>
        <MergedPlanes material={material} width={beamWidth} count={beamNumber} height={beamHeight} />
        <DirectionalLight color={lightColor} position={[0, 3, 10]} intensity={0.9} />
        <DirectionalLight color={lightColor} position={[-7, -2, 9]} intensity={0.45} />
        <DirectionalLight color={lightColor} position={[8, 1, 8]} intensity={0.4} />
      </group>
      <ambientLight intensity={1} />
      <perspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
    </>
  )
}

export default function Beams({ beamWidth = 2, beamHeight = 15, beamNumber = 12, lightColor = '#ffffff', beamColor = '#000000', backgroundColor = '#000000', speed = 2, noiseIntensity = 1.75, scale = 0.2, rotation = 0 }) {
  return (
    <div className="beams-container" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} frameloop="always" gl={{ antialias: true, powerPreference: 'low-power' }}>
        <Scene beamWidth={beamWidth} beamHeight={beamHeight} beamNumber={beamNumber} lightColor={lightColor} beamColor={beamColor} backgroundColor={backgroundColor} speed={speed} noiseIntensity={noiseIntensity} scale={scale} rotation={rotation} />
      </Canvas>
    </div>
  )
}
