import * as THREE from './three-runtime.js';
const radians = (value) => (Number(value || 0) * Math.PI) / 180;
function disposeModel(root) {
  root?.traverse((object) => {
    object.geometry?.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material) continue;
      for (const value of Object.values(material))
        if (value?.isTexture) {
          value.source?.data?.close?.();
          value.dispose();
        }
      material.dispose();
    }
  });
}
export async function createScene(host, signal) {
  const container = host.querySelector('.scene-canvas');
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: innerWidth >= 768,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(
    Math.min(
      devicePixelRatio,
      document.body.dataset.quality === 'high' && innerWidth >= 768 ? 2 : 1.5,
    ),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x4a5148,
    host.dataset.lighting === 'edge' ? 0.7 : 1.6,
  );
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd5fa95, 1.5);
  rim.position.set(-3, 1, -2);
  scene.add(rim);
  let model,
    raf = 0,
    active = false,
    disposed = false,
    previous = 0,
    dragging = false,
    pointerX = 0,
    velocity = 0,
    progress = 0;
  let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initial = {
    rotation: radians(host.dataset.rotation),
    camera: Number(host.dataset.camera) || 4,
    scale: Number(host.dataset.scale) / 100 || 1,
    x: Number(host.dataset.positionX) / 100 || 0,
    y: Number(host.dataset.positionY) / 100 || 0,
  };
  const current = { ...initial },
    target = { ...initial };
  const parts = [];
  const local = new AbortController();
  const options = { signal: local.signal };
  let resize;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    local.abort();
    resize?.disconnect();
    disposeModel(model);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
  signal.addEventListener('abort', dispose, { once: true });
  try {
    // GLB only: bound transfer size and time before decoding merchant-supplied binary data.
    const url = new URL(host.dataset.model, location.href);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported model URL');
    const fetchSignal = AbortSignal.any([signal, local.signal, AbortSignal.timeout(20000)]);
    const response = await fetch(url, { signal: fetchSignal });
    if (!response.ok || Number(response.headers.get('content-length')) > 20 * 1024 * 1024)
      throw new Error('Model exceeds budget');
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 20 * 1024 * 1024) {
        await reader.cancel();
        throw new Error('Model exceeds budget');
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (new DataView(buffer.buffer).getUint32(0, true) !== 0x46546c67)
      throw new Error('GLB required');
    // Reject external resources: prevents unbounded subsidiary texture and buffer transfers.
    const jsonLength = new DataView(buffer.buffer).getUint32(12, true);
    const metadata = JSON.parse(new TextDecoder().decode(buffer.slice(20, 20 + jsonLength)).trim());
    if (
      [...(metadata.images || []), ...(metadata.buffers || [])].some(
        (entry) => entry.uri && !entry.uri.startsWith('data:'),
      )
    )
      throw new Error('Self-contained GLB required');
    const gltf = await new THREE.GLTFLoader().parseAsync(buffer.buffer, '');
    model = gltf.scene;
    if (disposed || signal.aborted) {
      disposeModel(model);
      throw new Error('Scene removed');
    }
    let triangles = 0;
    model.traverse((object) => {
      if (object.isMesh) {
        triangles +=
          (object.geometry.index?.count || object.geometry.attributes.position.count) / 3;
        if (object.name.startsWith('explode_'))
          parts.push({ object, origin: object.position.clone(), index: parts.length });
      }
    });
    if (triangles > 250000) throw new Error('Geometry exceeds budget');
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const normalization = 2 / Math.max(size.x, size.y, size.z, 0.001);
    const group = new THREE.Group();
    model.position.sub(center);
    group.add(model);
    group.scale.setScalar(normalization);
    const pivot = new THREE.Group();
    pivot.add(group);
    scene.add(pivot);
    container.append(renderer.domElement);
    const draw = (time) => {
      raf = 0;
      if (disposed || !active) return;
      const dt = Math.min((time - (previous || time)) / 1000, 0.05);
      previous = time;
      if (motion && host.dataset.auto === 'true' && !dragging)
        target.rotation += dt * Number(host.dataset.speed || 10) * 0.01;
      if (motion && !dragging && Math.abs(velocity) > 0.0001) {
        target.rotation += velocity;
        velocity *= 0.92;
      }
      let transitioning = false;
      for (const field of Object.keys(current)) {
        const difference = target[field] - current[field];
        current[field] += motion ? difference * 0.12 : difference;
        if (Math.abs(difference) > 0.0005) transitioning = true;
      }
      pivot.rotation.y = current.rotation;
      pivot.scale.setScalar(current.scale);
      pivot.position.set(current.x, current.y, 0);
      camera.position.set(
        0,
        Math.sin(radians(host.dataset.cameraAngle)) * current.camera,
        current.camera,
      );
      camera.lookAt(0, 0, 0);
      const explode = Number(host.dataset.explode || 0) * progress;
      // Only explicitly named nodes move; ordinary GLBs remain intact.
      for (const part of parts) {
        part.object.position.copy(part.origin);
        part.object.position[host.dataset.direction || 'y'] +=
          (explode * (part.index + 1) * 0.15) / normalization;
      }
      renderer.render(scene, camera);
      if (
        transitioning ||
        (motion && (host.dataset.auto === 'true' || Math.abs(velocity) > 0.0001))
      )
        schedule();
    };
    const schedule = () => {
      if (!raf && active && !disposed) raf = requestAnimationFrame(draw);
    };
    resize = new ResizeObserver(() => {
      const width = Math.max(1, host.clientWidth),
        height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      schedule();
    });
    resize.observe(host);
    renderer.domElement.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        host.fallback();
      },
      options,
    );
    renderer.domElement.addEventListener(
      'pointerdown',
      (event) => {
        if (event.button !== 0) return;
        dragging = true;
        pointerX = event.clientX;
        velocity = 0;
      },
      options,
    );
    renderer.domElement.addEventListener(
      'pointermove',
      (event) => {
        if (dragging) {
          velocity = (event.clientX - pointerX) * 0.006;
          target.rotation += velocity;
          pointerX = event.clientX;
          schedule();
        } else if (motion && host.dataset.pointer === 'true' && event.pointerType === 'mouse') {
          const box = host.getBoundingClientRect();
          target.rotation =
            initial.rotation + ((event.clientX - box.left) / box.width - 0.5) * 0.25;
          schedule();
        }
      },
      options,
    );
    const release = () => {
      dragging = false;
      schedule();
    };
    window.addEventListener('pointerup', release, options);
    renderer.domElement.addEventListener('pointercancel', release, options);
    renderer.domElement.addEventListener(
      'pointerleave',
      () => {
        dragging = false;
        if (host.dataset.pointer === 'true') target.rotation = initial.rotation;
        schedule();
      },
      options,
    );
    const scroll = () => {
      if (!active || !motion) return;
      const rect = host.getBoundingClientRect();
      progress = THREE.MathUtils.clamp(
        (innerHeight - rect.top) / (innerHeight + rect.height),
        0,
        1,
      );
      if (host.dataset.scroll === 'true' && !host.closest('.story-layout'))
        target.rotation = initial.rotation + progress * 0.7;
      schedule();
    };
    window.addEventListener('scroll', scroll, { ...options, passive: true });
    return {
      setActive(value) {
        active = value;
        previous = 0;
        if (active) {
          scroll();
          schedule();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      setMotion(value) {
        motion = value;
        velocity = 0;
        schedule();
      },
      rotate(delta) {
        target.rotation += delta;
        schedule();
      },
      reset() {
        Object.assign(target, initial);
        velocity = 0;
        schedule();
      },
      setFrame(frame) {
        target.rotation = radians(frame.rotation);
        target.camera = Number(frame.camera) || initial.camera;
        target.scale = Number(frame.scale) / 100 || initial.scale;
        target.x = Number(frame.positionX) / 100 || 0;
        target.y = Number(frame.positionY) / 100 || 0;
        schedule();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
