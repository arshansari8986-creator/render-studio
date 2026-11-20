import bpy, math, random, sys, os
from mathutils import Vector

B = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = argv[0] if argv else "still"

# ---------- clean ----------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for coll in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
    pass

def mat(name, color, rough=0.85, metallic=0.0, emission=None, estr=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = estr
    return m

def tex_mat(name, path, emission_strength=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = emission_strength
    bsdf.inputs["Roughness"].default_value = 0.9
    return m

def box(name, loc, scale, material):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    if material: o.data.materials.append(material)
    return o

def cyl(name, loc, radius, depth, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    if material: o.data.materials.append(material)
    return o

def sph(name, loc, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    if material: o.data.materials.append(material)
    return o

def plane(name, loc, size, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = (size[0], size[1], 1)
    if material: o.data.materials.append(material)
    return o

def key(obj, frame, prop="location", idx=None):
    if idx is None:
        obj.keyframe_insert(data_path=prop, frame=frame)
    else:
        obj.keyframe_insert(data_path=prop, index=idx, frame=frame)

# ---------- world / render ----------
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 64
sc.cycles.use_denoising = False
sc.cycles.device = 'CPU'
sc.render.resolution_x = 540
sc.render.resolution_y = 960
sc.render.fps = 24
sc.frame_start, sc.frame_end = 1, 240
world = bpy.data.worlds['World']
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.012, 0.004, 0.045, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
sc.view_settings.view_transform = 'Filmic'
sc.view_settings.look = 'Medium High Contrast'

# ---------- ground ----------
ground_m = mat("Ground", (0.03, 0.02, 0.08), rough=0.35, metallic=0.1)
g = plane("Ground", (0, 6, 0), (30, 30), ground_m)
# road glow strip
strip_m = mat("Strip", (0.9, 0.1, 0.45), emission=(1, 0.1, 0.5), estr=2.0)
plane("GlowStrip", (0, -3.2, 0.01), (7.5, 0.12), strip_m)

# ---------- buildings ----------
blds = [tex_mat("B1", f"{B}/bld1.png"), tex_mat("B2", f"{B}/bld2.png"), tex_mat("B3", f"{B}/bld3.png")]
random.seed(7)
for i in range(16):
    side = -1 if i % 2 == 0 else 1
    x = side * random.uniform(2.2, 7.5)
    y = random.uniform(3.0, 11.0)
    h = random.uniform(2.2, 5.2)
    wdt = random.uniform(0.9, 1.7)
    box(f"Bld{i}", (x, y, h / 2), (wdt, wdt, h), blds[i % 3])
# back center towers
for i, (x, h) in enumerate([(-1.8, 6.4), (0.4, 7.4), (2.4, 5.8)]):
    box(f"Tower{i}", (x, 12.5, h / 2), (1.5, 1.5, h), blds[i % 3])

# neon signs
sign1 = mat("NeonPink", (1, 0.15, 0.55), emission=(1, 0.15, 0.55), estr=5.0)
sign2 = mat("NeonCyan", (0.1, 0.8, 1), emission=(0.1, 0.8, 1), estr=5.0)
plane("SignP", (-2.9, 4.2, 2.6), (0.16, 1.5), sign1, rot=(math.radians(90), 0, math.radians(18)))
plane("SignC", (3.2, 5.0, 3.1), (0.16, 1.2), sign2, rot=(math.radians(90), 0, math.radians(-14)))

# lights
def point(name, loc, color, energy, size=2.0):
    ld = bpy.data.lights.new(name, 'POINT')
    ld.color = color; ld.energy = energy; ld.shadow_soft_size = size
    o = bpy.data.objects.new(name, ld); bpy.context.collection.objects.link(o); o.location = loc
    return o
point("KeyLight", (2.5, -4, 5), (1, 0.85, 0.7), 900)
point("PinkLight", (-5, 2, 3), (1, 0.2, 0.55), 500)
point("FaceLight", (0, -6.5, 3.2), (1, 0.9, 0.8), 380, size=3.0)
point("CyanLight", (5, 2, 3), (0.15, 0.7, 1), 450)
sun = bpy.data.lights.new("Fill", 'SUN'); sun.energy = 0.35; sun.color = (0.6, 0.6, 1)
so = bpy.data.objects.new("Fill", sun); bpy.context.collection.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(20))

# ---------- character ----------
char = bpy.data.objects.new("Char", None); bpy.context.collection.objects.link(char)
skin = mat("Skin", (0.72, 0.47, 0.30), rough=0.65)
kurta = mat("Kurta", (0.98, 0.72, 0.05), rough=0.8)
pants = mat("Pants", (0.42, 0.33, 0.26), rough=0.9)
dark = mat("Dark", (0.05, 0.05, 0.07), rough=0.6)
white = mat("White", (0.95, 0.95, 0.95), rough=0.4)

def parent(o, p):
    o.parent = p

# legs + shoes
for s in (-1, 1):
    leg = cyl(f"Leg{s}", (0.17 * s, 0, 0.55), 0.085, 1.1, pants); parent(leg, char)
    shoe = sph(f"Shoe{s}", (0.17 * s, -0.07, 0.06), (0.11, 0.19, 0.07), dark); parent(shoe, char)
# kurta body (cone-ish): cylinder tapered via cone
bpy.ops.mesh.primitive_cone_add(radius1=0.46, radius2=0.30, depth=1.15, location=(0, 0, 1.62))
body = bpy.context.object; body.name = "Kurta"; body.data.materials.append(kurta); parent(body, char)
# arms: pivot empties at shoulders
arms = {}
for s in (-1, 1):
    piv = bpy.data.objects.new(f"ArmPiv{s}", None); bpy.context.collection.objects.link(piv)
    piv.location = (0.40 * s, 0, 2.05); parent(piv, char)
    sleeve = cyl(f"Sleeve{s}", (0, 0, 0), 0.105, 0.42, kurta); sleeve.location = (0.40 * s, 0, 1.86); parent(sleeve, piv); sleeve.location = (0, 0, -0.19)
    arm = cyl(f"Arm{s}", (0, 0, 0), 0.075, 0.62, skin); parent(arm, piv); arm.location = (0, 0, -0.68)
    hand = sph(f"Hand{s}", (0, 0, 0), (0.09, 0.09, 0.10), skin); parent(hand, piv); hand.location = (0, 0, -1.02)
    piv.rotation_euler = (0, math.radians(10 * s), 0)
    arms[s] = piv
# head group
head_g = bpy.data.objects.new("HeadG", None); bpy.context.collection.objects.link(head_g)
head_g.location = (0, 0, 2.42); parent(head_g, char)
head = sph("Head", (0, 0, 0), (0.335, 0.315, 0.36), skin); parent(head, head_g); head.location = (0, 0, 0.18)
hair = sph("Hair", (0, 0, 0), (0.345, 0.325, 0.30), dark); parent(hair, head_g); hair.location = (0, 0.015, 0.315)
for s in (-1, 1):
    eye = sph(f"Eye{s}", (0, 0, 0), (0.052, 0.03, 0.062), white); parent(eye, head_g); eye.location = (0.115 * s, -0.295, 0.26)
    pup = sph(f"Pup{s}", (0, 0, 0), (0.026, 0.016, 0.032), dark); parent(pup, head_g); pup.location = (0.115 * s, -0.318, 0.265)
    brow = box(f"Brow{s}", (0, 0, 0), (0.085, 0.02, 0.016), dark); parent(brow, head_g); brow.location = (0.115 * s, -0.30, 0.375); brow.rotation_euler = (0, 0, math.radians(-8 * s))
mouth = sph("Mouth", (0, 0, 0), (0.075, 0.02, 0.038), mat("MouthM", (0.35, 0.08, 0.08))); parent(mouth, head_g); mouth.location = (0, -0.315, 0.085)
char.location = (0, -1.6, 0)
char.scale = (1.25, 1.25, 1.25)

# char animation: bob + arm raise + head tilt
for f in range(1, 241, 12):
    char.location.z = 0.045 * math.sin(f / 12.0 * math.pi)
    key(char, f, "location", 2)
char.location.z = 0; key(char, 240, "location", 2)
ra = arms[1]
ra.rotation_euler = (0, math.radians(10), 0); key(ra, 30, "rotation_euler")
ra.rotation_euler = (math.radians(-140), math.radians(10), 0); key(ra, 52, "rotation_euler")
ra.rotation_euler = (math.radians(-140), math.radians(10), 0); key(ra, 150, "rotation_euler")
ra.rotation_euler = (0, math.radians(10), 0); key(ra, 175, "rotation_euler")
la = arms[-1]
for f, rz in [(1, -0.12), (60, 0.10), (120, -0.12), (180, 0.10), (240, -0.12)]:
    la.rotation_euler = (0, math.radians(-10), rz); key(la, f, "rotation_euler")
for f, rz in [(1, 0.0), (50, -0.10), (90, 0.07), (160, -0.05), (240, 0.0)]:
    head_g.rotation_euler = (0, 0, rz); key(head_g, f, "rotation_euler")
for ob in [char, ra, la, head_g]:
    if ob.animation_data and ob.animation_data.action:
        for fc in ob.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'SINE'

# ---------- board ----------
board_m = tex_mat("BoardM", f"{B}/board.png", emission_strength=0.35)
board = plane("Board", (0, 0.4, 4.85), (1.9, 0.83), board_m, rot=(math.radians(90), 0, 0))
board.scale = (0.02, 0.009, 0.009); key(board, 40, "scale")
board.scale = (1.55, 0.68, 0.68); key(board, 46, "scale")
board.scale = (1.32, 0.58, 0.58); key(board, 51, "scale")
board.scale = (1.38, 0.606, 0.606); key(board, 56, "scale")
if board.animation_data and board.animation_data.action:
    for fc in board.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'BACK' if kp.co.x <= 46 else 'SINE'

# impact light burst (no occluding plane)
key_ld = bpy.data.lights["KeyLight"]
key_ld.energy = 900;  key_ld.keyframe_insert("energy", frame=42)
key_ld.energy = 3200; key_ld.keyframe_insert("energy", frame=44)
key_ld.energy = 900;  key_ld.keyframe_insert("energy", frame=49)

# ---------- falling notes ----------
note_m = tex_mat("NoteM", f"{B}/note.png", emission_strength=0.12)
random.seed(11)
for i in range(7):
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    n = bpy.context.object; n.name = f"Note{i}"; n.dimensions = (0.34, 0.008, 0.18)
    n.data.materials.append(note_m)
    x0 = random.uniform(-1.6, 1.6); y0 = random.uniform(-1.4, 0.0)
    f0 = 52 + i * 16
    n.location = (x0, y0, 5.6); n.rotation_euler = (0.4, 0.2, random.uniform(0, 3))
    key(n, f0, "location"); key(n, f0, "rotation_euler")
    n.location = (x0 + random.uniform(-0.4, 0.4), y0, 0.25); n.rotation_euler = (1.2, 0.8, random.uniform(3, 7))
    key(n, min(f0 + 95, 240), "location"); key(n, min(f0 + 95, 240), "rotation_euler")
    n.location = (x0, y0, 5.6)
    # hide before spawn via scale (relative to the note's real base scale)
    bs = n.scale.copy()
    n.scale = (bs.x * 0.001, bs.y * 0.001, bs.z * 0.001); key(n, f0 - 1, "scale")
    n.scale = bs; key(n, f0, "scale")

# ---------- palms ----------
palm_m = mat("Palm", (0.02, 0.05, 0.03), rough=1)
for s in (-1, 1):
    trunk = cyl(f"Trunk{s}", (2.6 * s, 0.6, 1.5), 0.07, 3.0, palm_m, rot=(math.radians(8), 0, math.radians(6 * s)))
    for k in range(5):
        ang = (k / 5) * math.pi * 2
        fr = plane(f"Frond{s}_{k}", (2.6 * s + 0.55 * math.cos(ang), 0.6 + 0.55 * math.sin(ang), 3.05), (0.62, 0.13), palm_m,
                   rot=(math.radians(90), 0, ang))
# ---------- camera ----------
cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 26
cam = bpy.data.objects.new("Cam", cam_d); bpy.context.collection.objects.link(cam)
sc.camera = cam
cam.location = (0, -12.6, 2.3); cam.rotation_euler = (math.radians(86.5), 0, 0)
key(cam, 1, "location"); key(cam, 1, "rotation_euler")
cam.location = (0.25, -10.6, 2.45); cam.rotation_euler = (math.radians(86), 0, math.radians(1.5))
key(cam, 240, "location"); key(cam, 240, "rotation_euler")
# impact shake
for f, dx in [(43, 0.0), (44, 0.05), (46, -0.045), (48, 0.03), (50, 0.0)]:
    base_y = -12.6 + (2.0 * (f / 240))
    cam.location = (dx, base_y, 2.3 + 0.15 * (f / 240))
    key(cam, f, "location")
if cam.animation_data and cam.animation_data.action:
    for fc in cam.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'SINE'

bpy.ops.wm.save_as_mainfile(filepath=f"{B}/scene.blend")
if len(argv) >= 3:
    sc.frame_start, sc.frame_end = int(argv[1]), int(argv[2])

if MODE.endswith("eevee"):
    try:
        sc.render.engine = 'BLENDER_EEVEE_NEXT'
    except Exception:
        sc.render.engine = 'BLENDER_EEVEE'
    try:
        sc.eevee.taa_render_samples = 8 if MODE.startswith('anim') else 16
    except Exception:
        pass

if MODE.startswith("still"):
    sc.frame_set(60)
    sc.render.filepath = f"{B}/still_eevee.png" if MODE.endswith("eevee") else f"{B}/still.png"
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = f"{B}/frames/f_"
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(animation=True)
print("DONE", MODE)
