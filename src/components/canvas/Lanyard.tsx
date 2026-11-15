"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { stepSpring, stretchTo, swingTo } from "@/lib/lanyard";

// Interactive 3D ID badge for the About photo, from the Blender model public/media/pbs-lanyard.glb (card photo
// re-encoded to JPEG from art/assets/Lanyard/pbs_lanyard.glb). The strap is stiff: the whole badge swings as one
// damped pendulum around the top of the strap, and the card twists a little on its swivel. Motion: src/lib/lanyard.ts.
// The real <img> with alt stays in the page (PhotoLanyard). Nothing allocates inside the frame loop.

// frame: the photo box; the camera is fitted so the card at rest covers it, whatever the canvas size.
type Props = { frame: RefObject<HTMLElement | null>; onReady: () => void };

const MODEL = "/media/pbs-lanyard.glb";
const CARD_H = 1.12; // Card_Body height in the model (metres)
const SCALE = 0.575; // card height relative to the photo frame (0.5 + 15%); small enough for the strap to show
const DROP = 0.22; // card centre sits this far (× frame height) below the frame centre, leaving room for the strap
const SWING = { k: 40, c: 3.5, drag: 120, limit: 0.45 }; // stiff + well damped: swings, settles in ~2 s
const TWIST = { k: 30, c: 4, gain: 0.35, limit: 0.6 };
const STRETCH = { k: 90, c: 7, drag: 220, max: 0.9 }; // pull down: the strap gives, then springs back

export default function Lanyard({ frame, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    new GLTFLoader().load(MODEL, (gltf) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // The canvas reaches into the text column but sits behind it and takes no pointer events, so the About text
      // and buttons stay readable and clickable. Drags are picked up on the window and raycast against the card.
      renderer.domElement.style.pointerEvents = "none";
      renderer.domElement.setAttribute("aria-hidden", "true");
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // reflections for chrome + clearcoat
      scene.environment = env;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      const rig = gltf.scene;
      const card = rig.getObjectByName("Card_Root")!;
      const cardBase = card.quaternion.clone(); // the model's resting tilt
      const strap = rig.getObjectByName("Strap") as THREE.Mesh;
      strap.geometry.computeBoundingBox();
      const sb = strap.geometry.boundingBox!; // strap extent in its own space (bottom at the clip, top at the anchor)
      const strapY = strap.position.y,
        strapLen = sb.max.y - sb.min.y;
      // pivot = top of the strap
      const box = new THREE.Box3().setFromObject(strap);
      const anchor = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, 0);
      const swing = new THREE.Group();
      swing.position.copy(anchor);
      rig.position.copy(anchor).negate();
      swing.add(rig);
      scene.add(swing);
      const cardCentre = new THREE.Vector3(); // rest position of the card centre (world)
      new THREE.Box3().setFromObject(rig.getObjectByName("Card_Body")!).getCenter(cardCentre);

      // drag
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const hit = new THREE.Vector3();
      const root = document.documentElement;
      let dragging = false;
      let target = 0,
        stretchTarget = 0,
        grabDist = 0;
      const onCard = (clientX: number, clientY: number) => {
        const r = renderer.domElement.getBoundingClientRect();
        if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return false;
        ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        raycaster.ray.intersectPlane(plane, hit);
        return raycaster.intersectObject(rig, true).length > 0; // card, clip or strap: grab the lanyard anywhere
      };
      // text and controls sit in front of the badge: they keep the pointer
      const overText = (t: EventTarget | null) => t instanceof Element && !!t.closest("a, button, p, h2, dl, li");
      const onDown = (e: PointerEvent) => {
        if (overText(e.target) || !onCard(e.clientX, e.clientY)) return;
        e.preventDefault();
        dragging = true;
        grabDist = Math.hypot(hit.x - anchor.x, hit.y - anchor.y) - st.x; // current stretch counts as rest
        root.style.cursor = "grabbing";
      };
      const onMove = (e: PointerEvent) => {
        const over = onCard(e.clientX, e.clientY);
        if (dragging) {
          target = swingTo(anchor.x, anchor.y, hit.x, hit.y, SWING.limit);
          stretchTarget = stretchTo(anchor.x, anchor.y, hit.x, hit.y, grabDist, STRETCH.max);
        } else root.style.cursor = over && !overText(e.target) ? "grab" : "";
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        target = 0;
        stretchTarget = 0;
        root.style.cursor = "";
      };
      // phones: only a touch that starts on the card stops the page from scrolling
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t && !overText(e.target) && onCard(t.clientX, t.clientY)) e.preventDefault();
      };
      addEventListener("pointerdown", onDown);
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerup", onUp);
      addEventListener("pointercancel", onUp);
      addEventListener("touchstart", onTouch, { passive: false });

      const resize = () => {
        const w = el.clientWidth,
          h = el.clientHeight;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        // fit: the card at rest is SCALE × the photo frame, centred on it horizontally and dropped by DROP
        const f = frame.current?.getBoundingClientRect(),
          r = el.getBoundingClientRect();
        const view = (CARD_H * h) / ((f?.height || h * 0.7) * SCALE); // visible world height at the card plane
        const fx = f ? (f.left + f.width / 2 - r.left) / r.width : 0.5;
        const fy = f ? (f.top + f.height * (0.5 + DROP) - r.top) / r.height : 0.5;
        camera.position.set(
          cardCentre.x - (fx - 0.5) * view * camera.aspect,
          cardCentre.y + (fy - 0.5) * view,
          view / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)),
        );
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const s = { x: 0, v: 0 }; // swing angle
      const st = { x: 0, v: 0 }; // stretch (pulled down)
      const tw = { x: 0, v: 0 }; // card twist on the swivel
      const twistQ = new THREE.Quaternion();
      const yAxis = new THREE.Vector3(0, 1, 0);
      let raf = 0,
        visible = true,
        prev = performance.now(),
        time = 0;
      const tick = (now: number) => {
        const dt = Math.min(0.033, (now - prev) / 1000);
        prev = now;
        time += dt;
        const rest = dragging ? target : Math.sin(time * 0.8) * 0.012; // idle sway
        stepSpring(s, rest, dt, dragging ? SWING.drag : SWING.k, SWING.c);
        stepSpring(tw, THREE.MathUtils.clamp(-s.v * TWIST.gain, -TWIST.limit, TWIST.limit), dt, TWIST.k, TWIST.c);
        stepSpring(st, stretchTarget, dt, dragging ? STRETCH.drag : STRETCH.k, STRETCH.c);
        const d = Math.max(0, st.x);
        swing.rotation.z = s.x;
        // badge slides down the strap axis; the strap stretches so its top stays on the anchor and its bottom
        // stays on the clip (scale about the bottom: shift by -bottom·(scale−1))
        rig.position.set(-anchor.x, -anchor.y - d, -anchor.z);
        const k = 1 + d / strapLen;
        strap.scale.y = k;
        strap.position.y = strapY - sb.min.y * (k - 1);
        card.quaternion.copy(cardBase).multiply(twistQ.setFromAxisAngle(yAxis, tw.x));
        renderer.render(scene, camera);
        raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
      };
      const start = () => {
        if (raf) return;
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
      });
      io.observe(el);
      const onVisibility = () => !document.hidden && visible && start();
      document.addEventListener("visibilitychange", onVisibility);
      start();
      onReady();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        removeEventListener("pointerdown", onDown);
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerup", onUp);
        removeEventListener("pointercancel", onUp);
        removeEventListener("touchstart", onTouch);
        root.style.cursor = "";
        rig.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          o.geometry.dispose();
          for (const m of [o.material].flat() as THREE.MeshStandardMaterial[]) {
            for (const t of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap]) t?.dispose();
            m.dispose();
          }
        });
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [frame, onReady]);

  return <div ref={host} className="absolute inset-0" />;
}
