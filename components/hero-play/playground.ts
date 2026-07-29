import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  ARENA,
  BALLS,
  BALL_R,
  BLOCK,
  BLOCKS,
  BLOCK_PITCH,
  MAT,
  PALETTE,
  SETTLED_OFFSET,
  SETTLED_ROTATION,
  SETTLED_TIPPED,
  dropHeight,
  jitter,
} from "./scene-config";
import { createFaceTexture, type FaceTexture } from "./letter-texture";

/**
 * The /3 PLAYGROUND toy, driven imperatively.
 *
 * Why no react-three-fiber: Next 15 aliases client `react` to its own React 19
 * build, and fiber v8 sits on react-reconciler 0.27, which reads the React 18
 * shared internals and throws on import. Vanilla three plus rapier costs less
 * anyway (no reconciler, no drei) and gives exact control over the drag, which
 * is the entire point of this hero.
 *
 * Everything here is procedural. One rounded-box geometry, one sphere, eleven
 * canvas-drawn letter textures. No model, no HDRI, no texture request.
 */

type RapierNS = typeof import("@dimforge/rapier3d-compat");
type RWorld = import("@dimforge/rapier3d-compat").World;
type RBody = import("@dimforge/rapier3d-compat").RigidBody;

export type PlaygroundOptions = {
  reduced: boolean;
  fontFamily: string;
  onGrab: () => void;
  onReady: () => void;
  /** Physics could not be loaded, so nothing is throwable. */
  onNoPhysics: () => void;
};

export type PlaygroundHandle = {
  reset: () => void;
  dispose: () => void;
};

type Piece = {
  id: string;
  mesh: THREE.Mesh;
  kind: "block" | "ball";
  beat: number;
  home: { x: number; z: number };
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
const REST_Y = MAT.h + BLOCK / 2;
/** Half the width of the longer word, which is what portrait has to fit. */
const WORD_HALF_W = (5 * BLOCK_PITCH + BLOCK) / 2;

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
  canvas.style.touchAction = "none";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 1, 80);

  /* ----------------------------------------------------------------- light */

  scene.add(new THREE.AmbientLight(new THREE.Color("#FFEDC6"), 1.18));

  const key = new THREE.DirectionalLight(new THREE.Color("#FFFBF2"), 2.35);
  key.position.set(-5.5, 10.5, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7.5;
  key.shadow.camera.right = 7.5;
  key.shadow.camera.top = 7.5;
  key.shadow.camera.bottom = -7.5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 32;
  key.shadow.bias = -0.0007;
  key.shadow.normalBias = 0.028;
  scene.add(key);

  const fill = new THREE.DirectionalLight(new THREE.Color("#FFE4AE"), 0.48);
  fill.position.set(7, 4.5, -5);
  scene.add(fill);

  /* ------------------------------------------------------------------ set */

  const disposables: { dispose: () => void }[] = [];
  const faces: FaceTexture[] = [];

  const floorGeo = new THREE.PlaneGeometry(70, 70);
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.floor),
    roughness: 0.98,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  disposables.push(floorGeo, floorMat);

  const matGeo = new RoundedBoxGeometry(MAT.w, MAT.h, MAT.d, 2, 0.07);
  const matMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.cream),
    roughness: 0.85,
  });
  const mat = new THREE.Mesh(matGeo, matMat);
  mat.position.y = MAT.h / 2;
  mat.castShadow = true;
  mat.receiveShadow = true;
  scene.add(mat);
  disposables.push(matGeo, matMat);

  /* --------------------------------------------------------------- pieces */

  const blockGeo = new RoundedBoxGeometry(BLOCK, BLOCK, BLOCK, 3, 0.085);
  const ballGeo = new THREE.SphereGeometry(BALL_R, 24, 16);
  disposables.push(blockGeo, ballGeo);

  const pieces: Piece[] = [];
  const grabbables: THREE.Mesh[] = [];

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
    grabbables.push(mesh);
    pieces.push({ id: b.id, mesh, kind: "block", beat: b.beat, home: { x: b.x, z: b.z } });
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
    grabbables.push(mesh);
    pieces.push({ id: s.id, mesh, kind: "ball", beat: s.beat, home: { x: s.x, z: s.z } });
  }

  const byId = new Map(pieces.map((p) => [p.mesh.uuid, p]));

  /** Where a piece hangs before gravity is switched on. */
  function poise(p: Piece) {
    const j = jitter(p.beat);
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
    if (p.kind === "ball") {
      p.mesh.position.set(p.home.x, MAT.h + BALL_R, p.home.z);
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

  function frame() {
    width = Math.max(host.clientWidth, 1);
    height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height, false);

    const aspect = width / height;
    const portrait = aspect < 1.05;
    camera.aspect = aspect;
    camera.fov = portrait ? 40 : 34;
    const pitch = THREE.MathUtils.degToRad(portrait ? 72 : 60);
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
    const halfH = Math.atan(Math.tan(halfV) * aspect);
    // Portrait crops the mat a little so the letters stay big; landscape keeps
    // marigold margin all round so the corner type never sits on the cream.
    const needed = portrait ? WORD_HALF_W + 0.34 : MAT.w / 2 + 1.9;
    const dist = THREE.MathUtils.clamp(needed / Math.tan(halfH), 7, 30);
    const focus = 0.35;
    // Aim a touch nearer than centre so the toy sits above the mid-line and
    // the copy at the foot of the page has clear ground under it.
    const bias = portrait ? 0.85 : 0.42;
    camera.position.set(0, focus + Math.sin(pitch) * dist, Math.cos(pitch) * dist);
    camera.lookAt(0, focus, bias);
    camera.far = dist + 45;
    camera.updateProjectionMatrix();
  }

  frame();

  const ro = new ResizeObserver(() => {
    frame();
    if (!running) renderer.render(scene, camera);
  });
  ro.observe(host);

  /* --------------------------------------------------------------- physics */

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
    const j = jitter(p.beat);
    const x = p.kind === "block" ? p.home.x + j.dx : p.home.x;
    const z = p.kind === "block" ? p.home.z + j.dz : p.home.z;
    p.body.setTranslation({ x, y: dropHeight(p.beat), z }, true);
    _e.set(
      p.kind === "block" ? j.tilt : 0,
      p.kind === "block" ? j.spin : 0,
      p.kind === "block" ? j.tilt * 0.6 : 0
    );
    _q.setFromEuler(_e);
    p.body.setRotation({ x: _q.x, y: _q.y, z: _q.z, w: _q.w }, true);
    p.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    p.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    p.body.setGravityScale(0, false);
  }

  /**
   * The drop. Pieces hang for a beat, then release one at a time from the M
   * outward, so the name assembles itself instead of dumping all at once.
   */
  function choreograph() {
    clearTimers();
    for (const p of pieces) {
      if (!p.body) continue;
      const body = p.body;
      timers.push(
        window.setTimeout(() => {
          body.setGravityScale(1, true);
          if (p.kind === "ball") {
            body.setLinvel(
              { x: p.home.x > 0 ? -0.85 : 0.85, y: 0, z: -0.55 },
              true
            );
          }
          body.wakeUp();
        }, 320 + p.beat * 74)
      );
    }
  }

  function buildWorld(R: RapierNS) {
    const w = new R.World({ x: 0, y: GRAVITY, z: 0 });
    w.timestep = 1 / 60;

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
    // table, then the mat sitting proud of it
    addBox(40, 1, 40, 0, -1, 0);
    addBox(MAT.w / 2, MAT.h / 2, MAT.d / 2, 0, MAT.h / 2, 0);
    // invisible walls, far enough out that you never see a piece hit one
    addBox(0.5, ARENA.height, ARENA.halfZ + 1, -ARENA.halfX - 0.5, ARENA.height, 0);
    addBox(0.5, ARENA.height, ARENA.halfZ + 1, ARENA.halfX + 0.5, ARENA.height, 0);
    addBox(ARENA.halfX + 1, ARENA.height, 0.5, 0, ARENA.height, -ARENA.halfZ - 0.5);
    addBox(ARENA.halfX + 1, ARENA.height, 0.5, 0, ARENA.height, ARENA.halfZ + 0.5);

    for (const p of pieces) {
      const desc = R.RigidBodyDesc.dynamic()
        .setTranslation(p.mesh.position.x, p.mesh.position.y, p.mesh.position.z)
        .setLinearDamping(p.kind === "block" ? 0.14 : 0.55)
        .setAngularDamping(p.kind === "block" ? 0.62 : 0.22)
        // If the tween already started the fall, physics picks the pieces up
        // in flight rather than freezing them back in the air.
        .setGravityScale(tween ? 1 : 0);
      const q = p.mesh.quaternion;
      desc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      const body = w.createRigidBody(desc);
      const col =
        p.kind === "block"
          ? R.ColliderDesc.cuboid(BLOCK / 2, BLOCK / 2, BLOCK / 2)
              .setRestitution(0.13)
              .setFriction(0.9)
          : R.ColliderDesc.ball(BALL_R).setRestitution(0.55).setFriction(0.4);
      w.createCollider(col, body);
      p.body = body;
    }

    return w;
  }

  /**
   * Rapier is the one heavy thing on this page, so it is never allowed to be
   * the reason nothing happens. If it has not landed shortly after the scene
   * is up, a plain tween drops the pieces into the composed arrangement, and
   * physics takes over from wherever they are the moment it arrives. Slow
   * connection, blocked chunk, ancient device: the name still falls.
   */
  const TWEEN_AFTER = 900;
  const TWEEN_FALL = 560;
  let tween = false;
  const started = performance.now();
  const poisedQ = pieces.map((p) => p.mesh.quaternion.clone());
  const landedQ = pieces.map((p) => {
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
    pieces.forEach((p, i) => {
      const t = THREE.MathUtils.clamp(
        (elapsed - p.beat * 74) / TWEEN_FALL,
        0,
        1
      );
      if (t <= 0) return;
      const e = bounceOut(t);
      const restY = p.kind === "ball" ? MAT.h + BALL_R : REST_Y;
      p.mesh.position.y = THREE.MathUtils.lerp(dropHeight(p.beat), restY, e);
      p.mesh.quaternion.slerpQuaternions(poisedQ[i], landedQ[i], e);
    });
  }

  if (!opts.reduced) {
    import("@dimforge/rapier3d-compat")
      .then(async (R) => {
        await R.init();
        if (disposed) return;
        world = buildWorld(R);
        if (!tween) choreograph();
      })
      .catch(() => {
        // Physics never arrives. The tween has already landed the pieces, and
        // the page is told so it can stop inviting a throw it cannot honour.
        if (!disposed) opts.onNoPhysics();
      });
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

  function toNdc(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
  }

  function pick() {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(grabbables, false);
    return hits.length ? hits[0] : null;
  }

  function onDown(e: PointerEvent) {
    if (opts.reduced || !world) return;
    toNdc(e);
    const hit = pick();
    if (!hit) return;
    const piece = byId.get(hit.object.uuid);
    if (!piece || !piece.body) return;

    e.preventDefault();
    camera.getWorldDirection(normal).negate();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      piece.mesh.position
    );
    drag = {
      piece,
      plane,
      offset: piece.mesh.position.clone().sub(hit.point),
      pointerId: e.pointerId,
    };
    piece.body.setGravityScale(0, true);
    piece.body.wakeUp();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
    canvas.style.cursor = "grabbing";
    opts.onGrab();
  }

  function onMove(e: PointerEvent) {
    toNdc(e);
    if (drag) return;
    if (opts.reduced || !world) return;
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

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  window.addEventListener("blur", onUp as unknown as EventListener);

  function steerHeldPiece() {
    if (!drag) return;
    const body = drag.piece.body!;
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(drag.plane, hitPoint)) return;
    target.copy(hitPoint).add(drag.offset);
    // never let a held piece be dragged down through the table
    target.y = Math.max(target.y, MAT.h + BLOCK * 0.55);

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

  /* ------------------------------------------------------------------ loop */

  let running = !opts.reduced;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let announced = false;

  function render() {
    renderer.render(scene, camera);
    if (!announced) {
      announced = true;
      opts.onReady();
    }
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;

    if (world) {
      acc += dt;
      let steps = 0;
      while (acc >= 1 / 60 && steps < 3) {
        steerHeldPiece();
        world.step();
        acc -= 1 / 60;
        steps += 1;
      }
      for (const p of pieces) {
        if (!p.body) continue;
        const t = p.body.translation();
        const r = p.body.rotation();
        p.mesh.position.set(t.x, t.y, t.z);
        p.mesh.quaternion.set(r.x, r.y, r.z, r.w);
      }
    } else if (!opts.reduced && now - started > TWEEN_AFTER) {
      tween = true;
      tweenFall(now);
    }

    render();
  }

  if (running) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  } else {
    render();
  }

  /* ---------------------------------------------------------------- handle */

  // Repaint the glyphs once the webfont is actually resident, so no block
  // ships a fallback letter on a cold load.
  (async () => {
    try {
      await document.fonts.load(`800 152px ${opts.fontFamily}`, "MANUELDAVID");
      await document.fonts.ready;
    } catch {
      /* no font loading API */
    }
    if (disposed) return;
    faces.forEach((f) => f.paint());
    if (!running) render();
  })();

  return {
    reset() {
      if (!world || opts.reduced) return;
      drag = null;
      canvas.style.cursor = "";
      pieces.forEach(placeBody);
      choreograph();
    },
    dispose() {
      disposed = true;
      running = false;
      clearTimers();
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
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
