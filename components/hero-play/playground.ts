import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  ARENA,
  BALLS,
  BALL_R,
  BLOCK,
  BLOCKS,
  MAT,
  MATS,
  PALETTE,
  PLATE_DROP,
  PROJECTS_TALL,
  PROJECTS_WIDE,
  SETTLED_OFFSET,
  SETTLED_ROTATION,
  SETTLED_TIPPED,
  SLAB,
  STOPS_TALL,
  STOPS_WIDE,
  TILE,
  WORK_TALL,
  WORK_WIDE,
  dropHeight,
  jitter,
  type CamStop,
  type PlateSpec,
} from "./scene-config";
import { createFaceTexture, createLabelTexture, type FaceTexture } from "./letter-texture";

/**
 * The /3 PLAYGROUND world, driven imperatively.
 *
 * Why no react-three-fiber: Next 15 aliases client `react` to its own React 19
 * build, and fiber v8 sits on react-reconciler 0.27, which reads the React 18
 * shared internals and throws on import. Vanilla three plus rapier costs less
 * anyway (no reconciler, no drei) and gives exact control over the drag, which
 * is the entire point of this page.
 *
 * The world is ONE table. Scroll walks the camera down it. Crossing a section
 * hands that section's objects to gravity for the first time, and they fall
 * into the same rapier world the name blocks live in, so everything that lands
 * is throwable for the rest of the visit.
 *
 * Everything here is procedural. Two rounded-box geometries, one sphere,
 * canvas-drawn labels. No model, no HDRI, no texture request.
 */

type RapierNS = typeof import("@dimforge/rapier3d");
type RWorld = import("@dimforge/rapier3d").World;
type RBody = import("@dimforge/rapier3d").RigidBody;

export type PlaygroundOptions = {
  reduced: boolean;
  /** Display face, used for the block letters and the object labels. */
  fontFamily: string;
  onGrab: () => void;
  onReady: () => void;
  /** Physics could not be loaded, so nothing is throwable. */
  onNoPhysics: () => void;
  /** Scroll offsets (px) at which each camera stop is composed. */
  stops: () => number[];
};

export type PlaygroundHandle = {
  /** Re-drop everything that has landed so far. */
  reset: () => void;
  /** Re-read the scroll stops after the document height changed. */
  measure: () => void;
  dispose: () => void;
};

type PieceKind = "block" | "ball" | "plate";

type Piece = {
  id: string;
  mesh: THREE.Mesh;
  kind: PieceKind;
  section: number;
  beat: number;
  home: { x: number; y: number; z: number };
  yaw: number;
  half: { x: number; y: number; z: number };
  body?: RBody;
};

const OBJECT_COLOR: Record<string, string> = {
  ink: PALETTE.ink,
  vermilion: PALETTE.vermilion,
  spruce: PALETTE.spruce,
  cream: PALETTE.cream,
};

const GRAVITY = -19;
const GRAB_STIFFNESS = 19;
const MAX_DRAG_SPEED = 27;
const THROW_BOOST = 1.16;
const MAX_THROW = 23;
const STEP = 1 / 60;
const REST_Y = MAT.h + BLOCK / 2;
/** Sections this far behind the camera are frozen and stop being simulated. */
const SLEEP_RANGE = 1.35;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Quintic, so the camera sits still at each stop for most of the section and
 * crosses the bare stretch of table between mats quickly. A gentler curve
 * spends the middle of every section staring at an empty tabletop.
 */
function easeInOut(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

/** How far ahead of a stop a section hands its objects to gravity. */
const ARM_LEAD = 0.62;

function mixStop(a: CamStop, b: CamStop, t: number): CamStop {
  return {
    off: lerp(a.off, b.off, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    bias: lerp(a.bias, b.bias, t),
    pitch: lerp(a.pitch, b.pitch, t),
    fit: lerp(a.fit, b.fit, t),
    sy: lerp(a.sy, b.sy, t),
  };
}

export function createPlayground(
  host: HTMLElement,
  opts: PlaygroundOptions
): PlaygroundHandle {
  /* ------------------------------------------------------------------ core */

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(new THREE.Color(PALETTE.marigold), 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  // NOT `none`: this canvas is fixed behind a scrolling document, so the
  // browser has to keep owning the page scroll. A touch that actually lands on
  // an object cancels the gesture itself, in the touchstart handler below.
  canvas.style.touchAction = "manipulation";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 1, 90);

  /** Set whenever something on screen actually changed. See the loop. */
  let dirty = true;

  /* ----------------------------------------------------------------- light */

  scene.add(new THREE.AmbientLight(new THREE.Color("#FFEDC6"), 1.18));

  const shadowSize = window.innerWidth < 720 ? 1024 : 2048;
  const key = new THREE.DirectionalLight(new THREE.Color("#FFFBF2"), 2.35);
  key.castShadow = true;
  key.shadow.mapSize.set(shadowSize, shadowSize);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 44;
  key.shadow.bias = -0.0007;
  key.shadow.normalBias = 0.028;
  scene.add(key);
  scene.add(key.target);

  const fill = new THREE.DirectionalLight(new THREE.Color("#FFE4AE"), 0.48);
  fill.position.set(7, 4.5, -5);
  scene.add(fill);

  /** The shadow frustum walks down the table with the camera. */
  let shadowSpan = 0;
  function aimLight(fx: number, fz: number, fit: number) {
    key.position.set(fx - 5.5, 10.5, fz + 6);
    key.target.position.set(fx, 0, fz);
    key.target.updateMatrixWorld();
    const want = THREE.MathUtils.clamp(fit * 1.75, 7.5, 21);
    if (Math.abs(want - shadowSpan) > 0.3) {
      shadowSpan = want;
      const c = key.shadow.camera;
      c.left = -want;
      c.right = want;
      c.top = want;
      c.bottom = -want;
      c.updateProjectionMatrix();
    }
  }

  /* ------------------------------------------------------------------ set */

  const disposables: { dispose: () => void }[] = [];
  const faces: FaceTexture[] = [];

  const floorGeo = new THREE.PlaneGeometry(140, 140);
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.floor),
    roughness: 0.98,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -11;
  floor.receiveShadow = true;
  scene.add(floor);
  disposables.push(floorGeo, floorMat);

  const matMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.cream),
    roughness: 0.85,
  });
  disposables.push(matMat);
  for (const m of MATS) {
    const geo = new RoundedBoxGeometry(m.w, MAT.h, m.d, 2, 0.07);
    const mesh = new THREE.Mesh(geo, matMat);
    mesh.position.set(m.x, MAT.h / 2, m.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    disposables.push(geo);
  }

  /* --------------------------------------------------------------- pieces */

  const blockGeo = new RoundedBoxGeometry(BLOCK, BLOCK, BLOCK, 3, 0.085);
  const ballGeo = new THREE.SphereGeometry(BALL_R, 24, 16);
  disposables.push(blockGeo, ballGeo);

  const pieces: Piece[] = [];
  const grabbables: THREE.Mesh[] = [];
  const byMesh = new Map<string, Piece>();

  function register(p: Piece) {
    pieces.push(p);
    grabbables.push(p.mesh);
    byMesh.set(p.mesh.uuid, p);
  }

  for (const b of BLOCKS) {
    const face = createFaceTexture(
      b.char,
      OBJECT_COLOR[b.color],
      PALETTE.cream,
      opts.fontFamily
    );
    faces.push(face);
    const material = new THREE.MeshStandardMaterial({
      map: face.texture,
      roughness: 0.62,
      metalness: 0,
    });
    disposables.push(material, face.texture);
    const mesh = new THREE.Mesh(blockGeo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    register({
      id: b.id,
      mesh,
      kind: "block",
      section: 0,
      beat: b.beat,
      home: { x: b.x, y: REST_Y, z: b.z },
      yaw: 0,
      half: { x: BLOCK / 2, y: BLOCK / 2, z: BLOCK / 2 },
    });
  }

  for (const s of BALLS) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(OBJECT_COLOR[s.color]),
      roughness: 0.4,
      metalness: 0,
    });
    disposables.push(material);
    const mesh = new THREE.Mesh(ballGeo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    register({
      id: s.id,
      mesh,
      kind: "ball",
      section: 0,
      beat: s.beat,
      home: { x: s.x, y: MAT.h + BALL_R, z: s.z },
      yaw: 0,
      half: { x: BALL_R, y: BALL_R, z: BALL_R },
    });
  }

  /* ---------------------------------------------------------- the sections */

  type Section = {
    index: number;
    size: { w: number; h: number; d: number };
    specs: readonly PlateSpec[];
    pieces: Piece[];
    built: boolean;
    armed: boolean;
    frozen: boolean;
  };

  let portrait = false;

  const sections: Section[] = [
    { index: 0, size: SLAB, specs: [], pieces, built: true, armed: false, frozen: false },
    { index: 1, size: SLAB, specs: WORK_WIDE, pieces: [], built: false, armed: false, frozen: false },
    { index: 2, size: TILE, specs: PROJECTS_WIDE, pieces: [], built: false, armed: false, frozen: false },
  ];
  // Section 0 owns the name blocks and balls; the array above aliases `pieces`
  // before the plates exist, so give it its own list.
  sections[0].pieces = pieces.slice();

  const plateGeo = new Map<number, THREE.BufferGeometry>();
  const labelGeo = new Map<number, THREE.BufferGeometry>();

  function specsFor(index: number): readonly PlateSpec[] {
    if (index === 1) return portrait ? WORK_TALL : WORK_WIDE;
    return portrait ? PROJECTS_TALL : PROJECTS_WIDE;
  }

  function buildSection(sec: Section) {
    if (sec.built) return;
    sec.built = true;
    sec.specs = specsFor(sec.index);
    const { w, h, d } = sec.size;

    let body = plateGeo.get(sec.index);
    if (!body) {
      body = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.07, h / 2.2));
      plateGeo.set(sec.index, body);
      disposables.push(body);
    }
    let plate = labelGeo.get(sec.index);
    if (!plate) {
      plate = new THREE.PlaneGeometry(w * 0.9, d * 0.86);
      labelGeo.set(sec.index, plate);
      disposables.push(plate);
    }
    const aspect = (w * 0.9) / (d * 0.86);

    sec.specs.forEach((spec, i) => {
      const tone = OBJECT_COLOR[spec.color];
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(tone),
        roughness: 0.58,
        metalness: 0,
      });
      disposables.push(material);
      const mesh = new THREE.Mesh(body!, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const face = createLabelTexture(
        spec.label,
        tone,
        PALETTE.cream,
        opts.fontFamily,
        aspect
      );
      faces.push(face);
      const labelMat = new THREE.MeshStandardMaterial({
        map: face.texture,
        roughness: 0.55,
        metalness: 0,
      });
      disposables.push(labelMat, face.texture);

      // Printed on the top AND the underside, so a slab that gets flipped over
      // still says what it is.
      const top = new THREE.Mesh(plate!, labelMat);
      top.rotation.x = -Math.PI / 2;
      top.position.y = h / 2 + 0.004;
      top.receiveShadow = true;
      const under = new THREE.Mesh(plate!, labelMat);
      under.rotation.x = Math.PI / 2;
      under.position.y = -h / 2 - 0.004;
      mesh.add(top, under);

      scene.add(mesh);
      const piece: Piece = {
        id: spec.id,
        mesh,
        kind: "plate",
        section: sec.index,
        beat: i,
        home: { x: spec.x, y: MAT.h + h / 2, z: spec.z },
        yaw: spec.yaw,
        half: { x: w / 2, y: h / 2, z: d / 2 },
      };
      sec.pieces.push(piece);
      register(piece);

      if (opts.reduced) {
        settle(piece);
      } else {
        poise(piece);
        mesh.visible = false;
      }
    });

    if (world && RAPIER) for (const p of sec.pieces) addBody(RAPIER, p);
  }

  /** Where a piece hangs before gravity is switched on. */
  function poise(p: Piece) {
    const j = jitter(p.beat + p.section * 7);
    if (p.kind === "plate") {
      p.mesh.position.set(
        p.home.x + j.dx * 3,
        MAT.h + PLATE_DROP + p.beat * 0.34,
        p.home.z + j.dz * 3
      );
      p.mesh.rotation.set(j.tilt * 1.6, p.yaw + j.spin * 0.5, j.tilt);
      return;
    }
    if (p.kind === "block") {
      p.mesh.position.set(p.home.x + j.dx, dropHeight(p.beat), p.home.z + j.dz);
      p.mesh.rotation.set(j.tilt, j.spin, j.tilt * 0.6);
    } else {
      p.mesh.position.set(p.home.x, dropHeight(p.beat), p.home.z);
      p.mesh.rotation.set(0, 0, 0);
    }
  }

  /** The composed, already-landed arrangement used for reduced motion. */
  function settle(p: Piece) {
    p.mesh.visible = true;
    if (p.kind === "plate") {
      p.mesh.position.set(p.home.x, p.home.y, p.home.z);
      p.mesh.rotation.set(0, p.yaw, 0);
      return;
    }
    if (p.kind === "ball") {
      p.mesh.position.set(p.home.x, p.home.y, p.home.z);
      p.mesh.rotation.set(0, 0, 0);
      return;
    }
    const off = SETTLED_OFFSET[p.id] ?? [0, 0, 0];
    const rot = SETTLED_TIPPED[p.id] ?? SETTLED_ROTATION[p.id] ?? [0, 0, 0];
    p.mesh.position.set(p.home.x + off[0], REST_Y, p.home.z + off[2]);
    p.mesh.rotation.set(rot[0], rot[1], rot[2]);
  }

  pieces.forEach(opts.reduced ? settle : poise);

  /* ------------------------------------------------------------------ rig */

  let width = 1;
  let height = 1;
  let stops: readonly CamStop[] = STOPS_WIDE;
  let scrollStops: number[] = [0];

  function measure() {
    const raw = opts.stops();
    if (raw.length < 2) {
      scrollStops = [0, 1];
      return;
    }
    // Has to be strictly increasing or the piecewise read below misbehaves.
    const out = [Math.max(0, raw[0])];
    for (let i = 1; i < raw.length; i += 1) out.push(Math.max(raw[i], out[i - 1] + 1));
    scrollStops = out;
  }

  function layout() {
    width = Math.max(host.clientWidth, 1);
    height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height, false);

    const wasPortrait = portrait;
    portrait = width / height < 1.05;
    stops = portrait ? STOPS_TALL : STOPS_WIDE;
    camera.fov = portrait ? 40 : 34;
    camera.aspect = width / height;

    // A rotation swaps the composed layout of the plates, so anything already
    // on the table is picked up and re-dropped into the new arrangement.
    if (wasPortrait !== portrait) {
      for (const sec of sections) {
        if (sec.index === 0 || !sec.built) continue;
        const next = specsFor(sec.index);
        sec.pieces.forEach((p, i) => {
          const spec = next[i] ?? next[next.length - 1];
          p.home.x = spec.x;
          p.home.z = spec.z;
          p.yaw = spec.yaw;
        });
        sec.specs = next;
        if (sec.armed) redrop(sec);
      }
    }
    measure();
  }

  /** Interpolated camera + light for a fractional stop index. */
  function applyCamera(p: number) {
    const i = Math.max(0, Math.min(stops.length - 1, Math.floor(p)));
    const j = Math.min(stops.length - 1, i + 1);
    const stop = i === j ? stops[i] : mixStop(stops[i], stops[j], p - i);

    const aspect = width / height;
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
    const halfH = Math.atan(Math.tan(halfV) * aspect);
    const dist = THREE.MathUtils.clamp(stop.fit / Math.tan(halfH), 7, 46);
    const pitch = THREE.MathUtils.degToRad(stop.pitch);

    camera.position.set(
      stop.off,
      stop.y + Math.sin(pitch) * dist,
      stop.z + Math.cos(pitch) * dist
    );
    camera.lookAt(stop.off, stop.y, stop.z + stop.bias);
    camera.far = dist + 62;
    camera.updateProjectionMatrix();
    if (Math.abs(stop.sy) > 0.0005) {
      camera.setViewOffset(width, height, 0, stop.sy * height, width, height);
    } else if (camera.view) {
      camera.clearViewOffset();
    }

    aimLight(stop.off, stop.z, stop.fit);
  }

  layout();
  applyCamera(0);

  const ro = new ResizeObserver(() => {
    layout();
    dirty = true;
    if (!running) requestRender();
  });
  ro.observe(host);

  /* --------------------------------------------------------------- physics */

  let RAPIER: RapierNS | null = null;
  let world: RWorld | null = null;
  const timers: number[] = [];
  let disposed = false;

  function clearTimers() {
    while (timers.length) window.clearTimeout(timers.pop()!);
  }

  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();

  function placeBody(p: Piece) {
    if (!p.body) return;
    poise(p);
    const m = p.mesh;
    p.body.setTranslation({ x: m.position.x, y: m.position.y, z: m.position.z }, true);
    const q = m.quaternion;
    p.body.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);
    p.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    p.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    p.body.setGravityScale(0, false);
  }

  /**
   * The drop. Objects hang for a beat, then release one at a time, so a
   * section assembles itself instead of dumping all at once.
   */
  function choreograph(list: Piece[], gap: number, lead: number) {
    for (const p of list) {
      const body = p.body;
      p.mesh.visible = true;
      if (!body) continue;
      timers.push(
        window.setTimeout(() => {
          if (disposed) return;
          body.setGravityScale(1, true);
          if (p.kind === "ball") {
            body.setLinvel({ x: p.home.x > 0 ? -0.85 : 0.85, y: 0, z: -0.55 }, true);
          }
          if (p.kind === "plate") {
            const j = jitter(p.beat + p.section * 5);
            body.setAngvel({ x: j.tilt * 2.4, y: j.spin * 1.2, z: j.dz * 6 }, true);
          }
          body.wakeUp();
          dirty = true;
        }, lead + p.beat * gap)
      );
    }
  }

  function addBody(R: RapierNS, p: Piece) {
    if (!world || p.body) return;
    const heavy = p.kind === "plate";
    const desc = R.RigidBodyDesc.dynamic()
      .setTranslation(p.mesh.position.x, p.mesh.position.y, p.mesh.position.z)
      .setLinearDamping(p.kind === "ball" ? 0.55 : heavy ? 0.2 : 0.14)
      .setAngularDamping(p.kind === "ball" ? 0.22 : heavy ? 0.85 : 0.62)
      // If the tween already started the fall, physics picks the pieces up in
      // flight rather than freezing them back in the air.
      .setGravityScale(p.section === 0 && tween ? 1 : 0);
    const q = p.mesh.quaternion;
    desc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    const rb = world.createRigidBody(desc);
    const col =
      p.kind === "ball"
        ? R.ColliderDesc.ball(BALL_R).setRestitution(0.55).setFriction(0.4)
        : R.ColliderDesc.cuboid(p.half.x, p.half.y, p.half.z)
            .setRestitution(heavy ? 0.06 : 0.13)
            .setFriction(heavy ? 1.05 : 0.9)
            .setDensity(heavy ? 2.4 : 1);
    world.createCollider(col, rb);
    p.body = rb;
  }

  function buildWorld(R: RapierNS) {
    const w = new R.World({ x: 0, y: GRAVITY, z: 0 });
    w.timestep = STEP;

    const statics = w.createRigidBody(R.RigidBodyDesc.fixed());
    const addBox = (
      hx: number,
      hy: number,
      hz: number,
      x: number,
      y: number,
      z: number
    ) => {
      w.createCollider(
        R.ColliderDesc.cuboid(hx, hy, hz)
          .setTranslation(x, y, z)
          .setFriction(0.9)
          .setRestitution(0.2),
        statics
      );
    };

    // the table, then each mat sitting proud of it
    addBox(60, 1, 60, 0, -1, -11);
    for (const m of MATS) addBox(m.w / 2, MAT.h / 2, m.d / 2, m.x, MAT.h / 2, m.z);

    // invisible walls, far enough out that you never see a piece hit one
    const cx = (ARENA.minX + ARENA.maxX) / 2;
    const cz = (ARENA.minZ + ARENA.maxZ) / 2;
    const hx = (ARENA.maxX - ARENA.minX) / 2;
    const hz = (ARENA.maxZ - ARENA.minZ) / 2;
    addBox(0.5, ARENA.height, hz + 1, ARENA.minX - 0.5, ARENA.height, cz);
    addBox(0.5, ARENA.height, hz + 1, ARENA.maxX + 0.5, ARENA.height, cz);
    addBox(hx + 1, ARENA.height, 0.5, cx, ARENA.height, ARENA.minZ - 0.5);
    addBox(hx + 1, ARENA.height, 0.5, cx, ARENA.height, ARENA.maxZ + 0.5);

    return w;
  }

  /**
   * Rapier is the one heavy thing on this page, so it is never allowed to be
   * the reason nothing happens. If it has not landed shortly after the scene
   * is up, a plain tween drops the name into the composed arrangement, and
   * physics takes over from wherever the blocks are the moment it arrives.
   * Slow connection, blocked chunk, ancient device: the name still falls.
   */
  const TWEEN_AFTER = 900;
  const TWEEN_FALL = 560;
  let tween = false;
  const started = performance.now();
  const heroPieces = pieces.slice();
  const poisedQ = heroPieces.map((p) => p.mesh.quaternion.clone());
  const landedQ = heroPieces.map((p) => {
    const rot = SETTLED_TIPPED[p.id] ?? SETTLED_ROTATION[p.id] ?? [0, 0, 0];
    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rot[0], rot[1], rot[2])
    );
  });

  function bounceOut(t: number) {
    if (t < 0.7) return 1 - Math.pow(1 - t / 0.7, 2.1);
    const b = (t - 0.7) / 0.3;
    return 1 - 0.085 * Math.sin(b * Math.PI) * (1 - b * 0.5);
  }

  function tweenFall(now: number) {
    const elapsed = now - started - TWEEN_AFTER;
    heroPieces.forEach((p, i) => {
      const t = THREE.MathUtils.clamp((elapsed - p.beat * 74) / TWEEN_FALL, 0, 1);
      if (t <= 0) return;
      const e = bounceOut(t);
      const restY = p.kind === "ball" ? MAT.h + BALL_R : REST_Y;
      p.mesh.position.y = THREE.MathUtils.lerp(dropHeight(p.beat), restY, e);
      p.mesh.quaternion.slerpQuaternions(poisedQ[i], landedQ[i], e);
    });
  }

  if (!opts.reduced) {
    import("@dimforge/rapier3d")
      .then(async (R) => {
        // The streaming build is ready as soon as its wasm import resolves;
        // the base64 `-compat` build needs an explicit init() first.
        const boot = (R as unknown as { init?: () => Promise<void> }).init;
        if (typeof boot === "function") await boot();
        if (disposed) return;
        RAPIER = R;
        world = buildWorld(R);
        for (const p of pieces) addBody(R, p);
        for (const sec of sections) {
          if (sec.index === 0) {
            if (!tween) armSection(sec);
            continue;
          }
          if (sec.armed) {
            // Armed while we waited: hand it straight to gravity.
            for (const p of sec.pieces) p.body?.setGravityScale(1, true);
          }
        }
        dirty = true;
      })
      .catch(() => {
        // Physics never arrives. The tween has already landed the name, and
        // the page is told so it can stop inviting a throw it cannot honour.
        if (!disposed) opts.onNoPhysics();
      });
  }

  /* ----------------------------------------------------------- the release */

  function armSection(sec: Section) {
    if (sec.armed) return;
    sec.armed = true;
    sec.frozen = false;
    if (!sec.built) buildSection(sec);

    if (opts.reduced) {
      sec.pieces.forEach(settle);
      dirty = true;
      return;
    }
    if (!world) {
      // No physics yet. Show them; gravity is handed over on arrival, and if
      // rapier never arrives they simply stay composed where they belong.
      for (const p of sec.pieces) {
        p.mesh.visible = true;
        if (!RAPIER && sec.index > 0 && !world) settle(p);
      }
      dirty = true;
      return;
    }
    choreograph(sec.pieces, sec.index === 0 ? 74 : 148, sec.index === 0 ? 320 : 90);
    dirty = true;
  }

  function redrop(sec: Section) {
    if (!sec.armed || opts.reduced) return;
    if (!world) {
      sec.pieces.forEach(settle);
      return;
    }
    sec.pieces.forEach(placeBody);
    choreograph(sec.pieces, sec.index === 0 ? 74 : 148, sec.index === 0 ? 260 : 90);
  }

  /* ------------------------------------------------------------- dragging */

  type Drag = {
    piece: Piece;
    plane: THREE.Plane;
    offset: THREE.Vector3;
    pointerId: number;
  };

  let drag: Drag | null = null;
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const hitPoint = new THREE.Vector3();
  const target = new THREE.Vector3();
  const normal = new THREE.Vector3();

  function setNdc(clientX: number, clientY: number) {
    const r = canvas.getBoundingClientRect();
    ndc.set(
      ((clientX - r.left) / r.width) * 2 - 1,
      -((clientY - r.top) / r.height) * 2 + 1
    );
  }

  function pick() {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(grabbables, false);
    for (const hit of hits) {
      const piece = byMesh.get(hit.object.uuid);
      if (piece && piece.mesh.visible) return { hit, piece };
    }
    return null;
  }

  function onDown(e: PointerEvent) {
    if (opts.reduced || !world) return;
    setNdc(e.clientX, e.clientY);
    const found = pick();
    if (!found || !found.piece.body) return;

    e.preventDefault();
    const piece = found.piece;
    const body = found.piece.body;
    camera.getWorldDirection(normal).negate();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      piece.mesh.position
    );
    drag = {
      piece,
      plane,
      offset: piece.mesh.position.clone().sub(found.hit.point),
      pointerId: e.pointerId,
    };
    body.setGravityScale(0, true);
    body.wakeUp();
    sections[piece.section].frozen = false;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
    canvas.style.cursor = "grabbing";
    opts.onGrab();
  }

  function onMove(e: PointerEvent) {
    setNdc(e.clientX, e.clientY);
    if (drag) return;
    if (opts.reduced || !world || e.pointerType !== "mouse") return;
    canvas.style.cursor = pick() ? "grab" : "";
  }

  function onUp(e: PointerEvent) {
    if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.pointerId)) return;
    const body = drag.piece.body!;
    body.setGravityScale(1, true);
    const v = body.linvel();
    let vx = v.x * THROW_BOOST;
    let vy = v.y * THROW_BOOST;
    let vz = v.z * THROW_BOOST;
    const m = Math.hypot(vx, vy, vz);
    if (m > MAX_THROW) {
      const s = MAX_THROW / m;
      vx *= s;
      vy *= s;
      vz *= s;
    }
    body.setLinvel({ x: vx, y: vy, z: vz }, true);
    drag = null;
    canvas.style.cursor = "";
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already gone */
    }
  }

  /**
   * Touch has to share this canvas with the page scroll. The gesture is only
   * stolen when a finger actually lands on an object; anywhere else it falls
   * through and the document scrolls exactly as it would with no canvas here.
   */
  function onTouchStart(e: TouchEvent) {
    if (opts.reduced || !world || !e.cancelable) return;
    const t = e.touches[0];
    if (!t) return;
    setNdc(t.clientX, t.clientY);
    if (pick()) e.preventDefault();
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  window.addEventListener("blur", onUp as unknown as EventListener);

  function steerHeldPiece() {
    if (!drag) return;
    const body = drag.piece.body!;
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(drag.plane, hitPoint)) return;
    target.copy(hitPoint).add(drag.offset);
    // never let a held piece be dragged down through the table
    target.y = Math.max(target.y, MAT.h + drag.piece.half.y * 1.1);

    const t = body.translation();
    let vx = (target.x - t.x) * GRAB_STIFFNESS;
    let vy = (target.y - t.y) * GRAB_STIFFNESS;
    let vz = (target.z - t.z) * GRAB_STIFFNESS;
    const m = Math.hypot(vx, vy, vz);
    if (m > MAX_DRAG_SPEED) {
      const s = MAX_DRAG_SPEED / m;
      vx *= s;
      vy *= s;
      vz *= s;
    }
    body.setLinvel({ x: vx, y: vy, z: vz }, true);
    const a = body.angvel();
    body.setAngvel({ x: a.x * 0.85, y: a.y * 0.85, z: a.z * 0.85 }, true);
  }

  /* ---------------------------------------------------------- scroll drive */

  /** Fractional stop index, eased so the camera lingers at each stop. */
  function readScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    const s = scrollStops;
    if (s.length < 2) return 0;
    if (y <= s[0]) return 0;
    for (let i = 0; i < s.length - 1; i += 1) {
      if (y < s[i + 1]) {
        const span = Math.max(s[i + 1] - s[i], 1);
        return i + easeInOut(THREE.MathUtils.clamp((y - s[i]) / span, 0, 1));
      }
    }
    return s.length - 1;
  }

  /* ------------------------------------------------------------------ loop */

  let running = !opts.reduced;
  let raf = 0;
  let pending = 0;
  let last = 0;
  let acc = 0;
  let announced = false;
  let shown = 0;
  let awake = 0;

  function render() {
    renderer.render(scene, camera);
    if (!announced) {
      announced = true;
      opts.onReady();
    }
  }

  function requestRender() {
    if (pending || running || disposed) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      const p = readScroll();
      shown = p;
      applyCamera(p);
      for (let i = 1; i < sections.length; i += 1) {
        if (p >= i - ARM_LEAD) armSection(sections[i]);
      }
      render();
    });
  }

  /**
   * Body discipline. Sections behind the camera are put to sleep outright and
   * skipped when meshes are synced, so the cost of the page does not grow as
   * more objects land. Rapier already sleeps settled islands on its own; this
   * catches the ones that are technically still jittering off screen.
   */
  function policeSections(p: number) {
    for (const sec of sections) {
      if (!sec.armed || !sec.built) continue;
      const far = Math.abs(p - sec.index) > SLEEP_RANGE;
      if (far === sec.frozen) continue;
      sec.frozen = far;
      if (!far) continue;
      for (const piece of sec.pieces) {
        if (drag && drag.piece === piece) continue;
        piece.body?.sleep();
      }
    }
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;

    const p = readScroll();
    for (let i = 1; i < sections.length; i += 1) {
      if (p >= i - ARM_LEAD) armSection(sections[i]);
    }
    // A touch of lag so a flicked scroll wheel does not snap the camera.
    const k = 1 - Math.exp(-dt / 0.085);
    const next = shown + (p - shown) * k;
    if (Math.abs(next - shown) > 0.00012) {
      shown = next;
      dirty = true;
    } else if (Math.abs(p - shown) < 0.00012) {
      shown = p;
    }
    applyCamera(shown);
    policeSections(shown);

    if (world) {
      awake = 0;
      for (const piece of pieces) {
        if (piece.body && !piece.body.isSleeping()) awake += 1;
      }
      if (awake > 0 || drag) {
        acc += dt;
        let steps = 0;
        while (acc >= STEP && steps < 3) {
          steerHeldPiece();
          world.step();
          acc -= STEP;
          steps += 1;
        }
        for (const piece of pieces) {
          const b = piece.body;
          if (!b || b.isSleeping()) continue;
          const t = b.translation();
          const r = b.rotation();
          piece.mesh.position.set(t.x, t.y, t.z);
          piece.mesh.quaternion.set(r.x, r.y, r.z, r.w);
        }
        dirty = true;
      } else {
        acc = 0;
      }
    } else if (!opts.reduced && now - started > TWEEN_AFTER) {
      tween = true;
      tweenFall(now);
      dirty = true;
    }

    if (!dirty && announced) return;
    dirty = false;
    render();
  }

  const onScroll = () => {
    if (!running) requestRender();
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  if (running) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  } else {
    // Reduced motion: nothing simulates and nothing animates on its own. The
    // camera framing is a direct function of scroll position, the same way a
    // background image would be, and a frame is drawn only when it changes.
    for (const sec of sections) armSection(sec);
    applyCamera(readScroll());
    render();
  }

  /* ---------------------------------------------------------------- handle */

  // Repaint the glyphs once the webfont is actually resident, so nothing ships
  // a fallback letter on a cold load.
  (async () => {
    try {
      await document.fonts.load(`800 152px ${opts.fontFamily}`, "MANUELDAVID");
      await document.fonts.ready;
    } catch {
      /* no font loading API */
    }
    if (disposed) return;
    faces.forEach((f) => f.paint());
    dirty = true;
    if (!running) requestRender();
  })();

  return {
    reset() {
      if (!world || opts.reduced) return;
      drag = null;
      canvas.style.cursor = "";
      clearTimers();
      for (const sec of sections) redrop(sec);
      dirty = true;
    },
    measure,
    dispose() {
      disposed = true;
      running = false;
      clearTimers();
      cancelAnimationFrame(raf);
      if (pending) cancelAnimationFrame(pending);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("blur", onUp as unknown as EventListener);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (world) {
        world.free();
        world = null;
      }
    },
  };
}
