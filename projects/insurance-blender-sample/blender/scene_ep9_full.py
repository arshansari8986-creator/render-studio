import bpy, math, random, sys, os
from mathutils import Vector, Quaternion

# EP9 FULL — Blender 3D, 1888 frames @30fps. Zack D. Films style: har ~2s CUT,
# har shot me camera move, angles rotate (low/top/OTS/POV/macro/dutch).
# Rig/set v2 sample se reuse. Scenes: office, policy cards, dream house,
# calendar flip, buddha customer, contract macro, shikayat letters, mirror, tease.
B = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = argv[0] if argv else "still"           # still | anim
def _int(i, d=None):
    try: return int(argv[i])
    except Exception: return d
SF = _int(1, 60)                              # still frame
F0 = _int(1); F1 = _int(2)                    # anim range
TOTAL = 1888

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
random.seed(11)

# ---------- helpers ----------
def mat(name, color, rough=0.85, metallic=0.0, emission=None, estr=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metallic
    if emission:
        b.inputs["Emission Color"].default_value = (*emission, 1)
        b.inputs["Emission Strength"].default_value = estr
    return m

def tex_mat(name, path, es=0.15):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path)
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.9
    return m

def smooth(o):
    if o.type == 'MESH':
        for p in o.data.polygons: p.use_smooth = True
    return o

def bevel(o, w=0.02):
    if o.type == 'MESH':
        md = o.modifiers.new("bev", 'BEVEL'); md.width = w; md.segments = 2
    return o

def box(name, loc, dims, material, rot=(0, 0, 0), bev=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.dimensions = dims
    if material: o.data.materials.append(material)
    if bev: bevel(o, bev)
    return o

def cyl(name, loc, r, depth, material, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; o.name = name
    if material: o.data.materials.append(material)
    return smooth(o)

def sph(name, loc, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, segments=32, ring_count=24)
    o = bpy.context.object; o.name = name; o.scale = scale
    if material: o.data.materials.append(material)
    return smooth(o)

def plane(name, loc, size, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = (size[0], size[1], 1)
    if material: o.data.materials.append(material)
    return o

def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(e)
    e.location = loc
    if parent: e.parent = parent
    return e

def key(obj, frame, prop="location", idx=None):
    if idx is None: obj.keyframe_insert(data_path=prop, frame=frame)
    else: obj.keyframe_insert(data_path=prop, index=idx, frame=frame)

def keyrot(obj, frame, xyz):
    obj.rotation_euler = xyz
    for i in range(3): key(obj, frame, "rotation_euler", i)

def key_energy(ld, frame, v):
    ld.energy = v
    ld.keyframe_insert(data_path="energy", frame=frame)

def point(name, loc, color, energy, size=2.0):
    ld = bpy.data.lights.new(name, 'POINT'); ld.color = color; ld.energy = energy; ld.shadow_soft_size = size
    try: ld.use_shadow = False
    except Exception: pass
    o = bpy.data.objects.new(name, ld); bpy.context.collection.objects.link(o); o.location = loc
    return o

def spot(name, loc, target, color, energy, angle=0.7):
    ld = bpy.data.lights.new(name, 'SPOT'); ld.color = color; ld.energy = energy
    ld.spot_size = angle; ld.spot_blend = 0.6; ld.shadow_soft_size = 1.5
    o = bpy.data.objects.new(name, ld); bpy.context.collection.objects.link(o); o.location = loc
    tc = bpy.data.objects.new(name + "Tgt", None); bpy.context.collection.objects.link(tc); tc.location = target
    con = o.constraints.new('TRACK_TO'); con.target = tc; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
    return o

def smile_curve(name, loc, material):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = 0.012; cu.bevel_resolution = 3; cu.resolution_u = 12
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
    pts = [(-0.105, 0.010, 0.018), (0.0, 0.0, -0.030), (0.105, 0.010, 0.018)]
    for bp, co in zip(sp.bezier_points, pts):
        bp.co = co; bp.handle_left_type = 'AUTO'; bp.handle_right_type = 'AUTO'
    cu.materials.append(material)
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.location = loc
    return o

# ---------- text (FONT objects, DejaVu Bold — ₹ glyph hai) ----------
FONT = None
for _fp in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"):
    if os.path.exists(_fp):
        try: FONT = bpy.data.fonts.load(_fp)
        except Exception: FONT = None
        if FONT: break

def text_obj(name, body, loc, size, material, rot=(math.radians(90), 0, 0), parent=None, extrude=0.012):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    o.data.body = body; o.data.size = size
    o.data.align_x = 'CENTER'; o.data.align_y = 'CENTER'
    o.data.extrude = extrude
    if FONT: o.data.font = FONT
    if material: o.data.materials.append(material)
    if parent: o.parent = parent; o.location = loc
    return o

# ---------- character builder (v2 rig, reuse) ----------
def build_character(prefix, skin_c, shirt_c, pants_c, hair_c, pos, rotz=0.0,
                    tie_c=None, moustache=False, hair_grey=False):
    char = empty(prefix, pos); char.rotation_euler = (0, 0, rotz)
    skin = mat(prefix + "Skin", skin_c, rough=0.55)
    skin_d = mat(prefix + "SkinD", tuple(c * 0.85 for c in skin_c), rough=0.6)
    shirt = mat(prefix + "Shirt", shirt_c, rough=0.8)
    pants = mat(prefix + "Pants", pants_c, rough=0.9)
    hairm = mat(prefix + "Hair", hair_c, rough=0.55)
    dark = mat(prefix + "Dark", (0.04, 0.04, 0.05), rough=0.5)
    white = mat(prefix + "White", (0.97, 0.97, 0.97), rough=0.35)
    blush_m = mat(prefix + "Blush", (0.88, 0.48, 0.38), rough=1.0)
    mouthline_m = mat(prefix + "MouthLine", (0.16, 0.07, 0.05), rough=0.6)
    mouthopen_m = mat(prefix + "MouthOpen", (0.34, 0.10, 0.09), rough=0.45)
    def P(o, parent=None):
        o.parent = parent or char; return o
    legs = {}
    for s in (-1, 1):
        lg = cyl(f"{prefix}Leg{s}", (0.20 * s, 0, 0.52), 0.095, 1.04, pants); P(lg); legs[s] = lg
        sh = sph(f"{prefix}Shoe{s}", (0.20 * s, -0.08, 0.07), (0.115, 0.20, 0.075), dark); P(sh)
    P(sph(prefix + "Hips", (0, 0, 1.08), (0.40, 0.30, 0.30), pants))
    P(sph(prefix + "Torso", (0, 0, 1.48), (0.47, 0.34, 0.52), shirt))
    P(cyl(prefix + "Neck", (0, 0, 1.98), 0.11, 0.18, skin))
    if tie_c:
        tiem = mat(prefix + "Tie", tie_c, rough=0.6)
        kn = box(f"{prefix}TieKnot", (0, -0.315, 1.90), (0.11, 0.05, 0.13), tiem, bev=0.015); P(kn)
        tb = box(f"{prefix}TieBody", (0, -0.325, 1.58), (0.13, 0.04, 0.52), tiem, bev=0.015); P(tb)
        tb.rotation_euler = (math.radians(3), 0, 0)
    arms = {}
    for s in (-1, 1):
        piv = empty(f"{prefix}ArmPiv{s}", (0.46 * s, 0, 1.86), char)
        ua = cyl(f"{prefix}UpArm{s}", (0, 0, 0), 0.105, 0.46, shirt); ua.parent = piv; ua.location = (0, 0, -0.21)
        el = empty(f"{prefix}Elb{s}", (0, 0, -0.44), piv)
        fa = cyl(f"{prefix}FoArm{s}", (0, 0, 0), 0.082, 0.44, skin); fa.parent = el; fa.location = (0, 0, -0.20)
        hd = sph(f"{prefix}Hand{s}", (0, 0, 0), (0.095, 0.095, 0.105), skin); hd.parent = el; hd.location = (0, 0, -0.46)
        piv.rotation_euler = (math.radians(-6), 0, math.radians(7 * s))
        el.rotation_euler = (math.radians(-18), 0, 0)
        arms[s] = (piv, el)
    hg = empty(prefix + "HeadG", (0, 0, 2.06), char)
    def HP(o): o.parent = hg; return o
    HP(sph(prefix + "Head", (0, 0, 0.30), (0.42, 0.395, 0.455), skin))
    HP(sph(prefix + "Nose", (0, -0.385, 0.26), (0.075, 0.07, 0.085), skin_d))
    brows = {}
    for s in (-1, 1):
        HP(sph(f"{prefix}Ear{s}", (0.415 * s, 0, 0.28), (0.07, 0.09, 0.11), skin))
        HP(sph(f"{prefix}Blush{s}", (0.235 * s, -0.322, 0.215), (0.080, 0.018, 0.052), blush_m))
        HP(sph(f"{prefix}Eye{s}", (0.148 * s, -0.358, 0.405), (0.078, 0.036, 0.094), white))
        HP(sph(f"{prefix}Pup{s}", (0.148 * s, -0.390, 0.408), (0.040, 0.020, 0.050), dark))
        HP(sph(f"{prefix}Hi{s}", (0.128 * s, -0.402, 0.452), (0.017, 0.009, 0.020), white))
        br = HP(box(f"{prefix}Brow{s}", (0.148 * s, -0.325, 0.552), (0.20, 0.038, 0.048), hairm))
        br.rotation_euler = (0, 0, math.radians(-7 * s))
        brows[s] = br
    HP(sph(prefix + "HairTop", (0, 0.05, 0.50), (0.43, 0.405, 0.385), hairm))
    HP(sph(prefix + "HairFr", (0, -0.27, 0.615), (0.385, 0.13, 0.115), hairm))
    if hair_grey:
        for s in (-1, 1):
            HP(sph(f"{prefix}Grey{s}", (0.40 * s, 0.10, 0.55), (0.045, 0.11, 0.10), mat(prefix + "GreyM", (0.50, 0.50, 0.53), rough=0.7)))
    smile = smile_curve(prefix + "Smile", (0, -0.378, 0.135), mouthline_m); smile.parent = hg
    mouth = HP(sph(prefix + "Mouth", (0, -0.352, 0.088), (0.046, 0.016, 0.008), mouthopen_m))
    if moustache:
        mm = mat(prefix + "MousM", (0.14, 0.13, 0.14), rough=0.7)
        for s in (-1, 1):
            mo = HP(sph(f"{prefix}Mous{s}", (0.088 * s, -0.378, 0.172), (0.115, 0.048, 0.040), mm))
            mo.rotation_euler = (0, 0, math.radians(12 * s))
    return char, arms, hg, mouth, brows

def osc_keys(obj, prop, idx, frames_vals):
    for f, v in frames_vals:
        if prop == "location": obj.location[idx] = v
        elif prop == "rotation_euler": obj.rotation_euler[idx] = v
        elif prop == "scale": obj.scale[idx] = v
        key(obj, f, prop, idx)

def blink(prefix, frames):
    for bf in frames:
        for nm in (f"{prefix}Eye-1", f"{prefix}Eye1"):
            e = bpy.data.objects[nm]
            e.scale = (0.078, 0.036, 0.094); key(e, bf - 2, "scale", 2)
            e.scale = (0.078, 0.036, 0.014); key(e, bf, "scale", 2)
            e.scale = (0.078, 0.036, 0.094); key(e, bf + 2, "scale", 2)

def talk(mouth, f0, f1, seed=3, amp=0.046):
    # bolne par muh khulta-band hota hai (open-mouth ellipse ki z-scale)
    rnd = random.Random(seed)
    f = f0
    mouth.scale = (0.046, 0.016, 0.008); key(mouth, max(1, f0 - 2), "scale", 2)
    while f < f1:
        mouth.scale = (0.046, 0.016, amp * rnd.uniform(0.55, 1.0)); key(mouth, f, "scale", 2)
        mouth.scale = (0.046, 0.016, 0.010); key(mouth, f + 3, "scale", 2)
        f += rnd.choice((6, 7, 8))
    mouth.scale = (0.046, 0.016, 0.008); key(mouth, f1, "scale", 2)

def head_talk(hg, f0, f1, seed=5, ax=0.07, az=0.05):
    rnd = random.Random(seed)
    xs, zs, f = [], [], f0
    while f <= f1:
        xs.append((f, rnd.uniform(-ax, ax) + 0.05)); zs.append((f, rnd.uniform(-az, az)))
        f += rnd.choice((16, 20, 24))
    xs.append((f1, 0.05)); zs.append((f1, 0.0))
    osc_keys(hg, "rotation_euler", 0, xs)
    osc_keys(hg, "rotation_euler", 2, zs)

def brow_keys(brows, frames_vals):
    for s in (-1, 1):
        osc_keys(brows[s], "location", 2, frames_vals)

# ---------- scene setup ----------
sc = bpy.context.scene
try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
except Exception: sc.render.engine = 'BLENDER_EEVEE'
sc.render.fps = 30
sc.frame_start, sc.frame_end = 1, TOTAL
w = bpy.data.worlds['World']; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.06, 0.045, 0.035, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 0.30
sc.view_settings.view_transform = 'Filmic'; sc.view_settings.look = 'Medium High Contrast'
sc.view_settings.exposure = 1.05
cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 36
cam = bpy.data.objects.new("Cam", cam_d); bpy.context.collection.objects.link(cam); sc.camera = cam
cam.rotation_mode = 'QUATERNION'

def cam_key(f, pos, tgt, roll=0.0, lens=None):
    cam.location = pos; key(cam, f, "location")
    q = (Vector(tgt) - Vector(pos)).to_track_quat('-Z', 'Y')
    if roll: q = q @ Quaternion((0, 0, 1), roll)
    cam.rotation_quaternion = q; key(cam, f, "rotation_quaternion")
    if lens:
        cam_d.lens = lens; cam_d.keyframe_insert(data_path="lens", frame=f)

# ---------- OFFICE SET (v2 se) ----------
floor_m = mat("Floor", (0.27, 0.155, 0.075), rough=0.6)
plane("Floor", (0, 1.0, 0), (7.0, 8.0), floor_m)
wall_m = mat("Wall", (0.95, 0.68, 0.30), rough=0.95)
plane("WallBack", (0, 3.6, 4.2), (7.0, 4.2), wall_m, rot=(math.radians(90), 0, 0))
wallL_m = mat("WallL", (0.92, 0.62, 0.27), rough=0.95)
plane("WallL", (-3.6, 1.2, 3.4), (3.4, 3.4), wallL_m, rot=(math.radians(90), 0, math.radians(90)))
rug_m = mat("Rug", (0.42, 0.08, 0.07), rough=0.95)
box("Rug", (-0.1, -0.45, 0.012), (3.6, 2.6, 0.024), rug_m, bev=0.01)

sky_m = mat("Sky", (0.40, 0.68, 0.96), rough=1.0, emission=(0.40, 0.68, 0.96), estr=0.55)
plane("Sky", (2.30, 3.58, 2.55), (0.85, 0.95), sky_m, rot=(math.radians(90), 0, 0))
cloud_m = mat("Cloud", (1.0, 1.0, 1.0), rough=1.0, emission=(1, 1, 1), estr=0.25)
clouds = []
for i, (cx, cz, cs) in enumerate([(2.00, 2.85, 0.16), (2.60, 2.35, 0.13)]):
    c = sph(f"Cloud{i}", (cx, 3.55, cz), (cs * 1.5, 0.05, cs), cloud_m); clouds.append(c)
frame_m = mat("WinFrame", (0.26, 0.16, 0.09), rough=0.7)
box("WinF_T", (2.30, 3.60, 3.55), (1.85, 0.08, 0.10), frame_m)
box("WinF_B", (2.30, 3.60, 1.55), (1.85, 0.08, 0.10), frame_m)
box("WinF_L", (1.41, 3.60, 2.55), (0.10, 0.08, 2.05), frame_m)
box("WinF_R", (3.19, 3.60, 2.55), (0.10, 0.08, 2.05), frame_m)
box("WinF_MV", (2.30, 3.60, 2.55), (0.06, 0.08, 2.0), frame_m)
box("WinF_MH", (2.30, 3.60, 2.55), (1.8, 0.08, 0.06), frame_m)

poster_m = tex_mat("PosterM", f"{B}/poster.png", es=0.1)
plane("Poster", (-0.45, 3.57, 3.02), (0.62, 0.50), poster_m, rot=(math.radians(90), 0, 0))
cal_m = tex_mat("CalM", f"{B}/calendar.png", es=0.1)
plane("Calendar", (-1.60, 3.57, 2.42), (0.44, 0.54), cal_m, rot=(math.radians(90), 0, 0))
# calendar flip pages (L9) — upar wale kine se ghumti hain
calpage_m = mat("CalPage", (0.94, 0.90, 0.78), rough=0.9)
calpages = []
for i in range(5):
    piv = empty(f"CalPiv{i}", (-1.60, 3.545 - i * 0.004, 2.685))
    pg = plane(f"CalPage{i}", (0, 0, 0), (0.205, 0.255), calpage_m)
    pg.parent = piv; pg.location = (0, 0, -0.262)
    calpages.append(piv)

shelf_m = mat("Shelf", (0.28, 0.16, 0.07), rough=0.75)
box("ShelfBack", (-2.45, 3.42, 1.95), (1.7, 0.08, 3.3), shelf_m, bev=0.015)
file_cols = [(0.80, 0.16, 0.12), (0.10, 0.32, 0.85), (0.12, 0.58, 0.22), (0.95, 0.62, 0.05),
             (0.52, 0.20, 0.68), (0.88, 0.38, 0.08), (0.08, 0.62, 0.62), (0.75, 0.20, 0.38)]
for lvl, z in enumerate((0.85, 1.75, 2.65)):
    box(f"ShelfLvl{lvl}", (-2.45, 3.30, z), (1.75, 0.34, 0.07), shelf_m, bev=0.01)
    for i in range(5):
        fc = file_cols[(lvl * 5 + i) % len(file_cols)]
        fm = mat(f"File{lvl}_{i}", fc, rough=0.8)
        fb = box(f"File{lvl}_{i}", (-3.05 + i * 0.30, 3.28, z + 0.36), (0.24, 0.26, 0.66), fm, bev=0.012)
        fb.rotation_euler = (0, 0, math.radians(random.uniform(-2.5, 2.5)))
box("ShelfTop", (-2.45, 3.30, 3.32), (1.75, 0.34, 0.07), shelf_m, bev=0.01)

# wall clock — suiyaan pivot par (L9 me tez ghumengi)
CX, CY, CZ = 1.18, 3.56, 3.12
clock_m = mat("ClockRim", (0.22, 0.13, 0.08), rough=0.6)
cyl("ClockRim", (CX, CY, CZ), 0.37, 0.06, clock_m, rot=(math.radians(90), 0, 0))
face_m = mat("ClockFace", (0.97, 0.95, 0.88), rough=0.5)
cyl("ClockFace", (CX, CY - 0.03, CZ), 0.33, 0.03, face_m, rot=(math.radians(90), 0, 0))
hand_m = mat("HandM", (0.07, 0.07, 0.09), rough=0.5)
hourpiv = empty("HourPiv", (CX, CY - 0.055, CZ))
hh = box("ClockH", (0, 0, 0), (0.055, 0.02, 0.19), hand_m); hh.parent = hourpiv; hh.location = (0, 0, 0.075)
hourpiv.rotation_euler = (0, math.radians(-55), 0)
minpiv = empty("MinPiv", (CX, CY - 0.055, CZ))
mh = box("ClockM", (0, 0, 0), (0.040, 0.02, 0.27), hand_m); mh.parent = minpiv; mh.location = (0, 0, 0.115)
secpiv = empty("SecPiv", (CX, CY - 0.055, CZ))
sh2 = box("ClockS", (0, 0, 0), (0.018, 0.015, 0.29), mat("SecM", (0.82, 0.14, 0.10), rough=0.5)); sh2.parent = secpiv; sh2.location = (0, 0, 0.12)
cyl("ClockPin", (CX, CY - 0.065, CZ), 0.028, 0.03, hand_m, rot=(math.radians(90), 0, 0))

# desk
desk_m = mat("Desk", (0.22, 0.115, 0.05), rough=0.55)
deskTop_m = mat("DeskTop", (0.28, 0.15, 0.06), rough=0.4)
box("DeskBody", (-0.35, 1.30, 0.50), (3.3, 0.95, 1.0), desk_m, bev=0.03)
box("DeskTop", (-0.35, 1.30, 1.04), (3.5, 1.05, 0.09), deskTop_m, bev=0.03)
for sx in (-1, 1):
    box(f"DeskPanel{sx}", (-0.35 + 1.45 * sx, 1.30, 0.52), (0.35, 0.7, 0.85), desk_m, bev=0.02)

brass = mat("Brass", (0.88, 0.64, 0.16), rough=0.28, metallic=0.85)
cyl("BellBase", (-1.30, 1.05, 1.10), 0.13, 0.03, brass)
sph("BellDome", (-1.30, 1.05, 1.16), (0.115, 0.115, 0.10), brass)
sph("BellKnob", (-1.30, 1.05, 1.28), (0.032, 0.032, 0.032), brass)
paper_m = mat("Paper", (0.96, 0.93, 0.84), rough=0.9)
paper2_m = mat("Paper2", (0.90, 0.84, 0.70), rough=0.9)
for i, (px, py, rz) in enumerate([(-1.85, 1.45, 4), (-1.82, 1.42, -3), (0.30, 1.60, 7), (0.33, 1.57, 2)]):
    pb = box(f"Paper{i}", (px, py, 1.115 + (i % 2) * 0.035), (0.52, 0.38, 0.028), paper_m if i % 2 == 0 else paper2_m, bev=0.006)
    pb.rotation_euler = (0, 0, math.radians(rz))
fold_m = mat("Folder", (0.72, 0.10, 0.10), rough=0.6)
fb2 = box("RedFolder", (0.52, 1.28, 1.115), (0.56, 0.40, 0.030), fold_m, bev=0.008)
fb2.rotation_euler = (0, 0, math.radians(12))
fp = box("FolderPaper", (0.52, 1.28, 1.135), (0.48, 0.33, 0.012), paper_m, bev=0.004)
fp.rotation_euler = (0, 0, math.radians(12))
cyl("PenStand", (-0.15, 1.62, 1.16), 0.07, 0.15, mat("PenStandM", (0.12, 0.22, 0.50), rough=0.5))
for i, pc in enumerate([(0.85, 0.2, 0.1), (0.1, 0.2, 0.7), (0.9, 0.75, 0.1)]):
    pn = cyl(f"Pen{i}", (-0.17 + i * 0.035, 1.62, 1.30), 0.013, 0.24, mat(f"PenM{i}", pc, rough=0.4))
    pn.rotation_euler = (math.radians(10 + i * 4), 0, math.radians(i * 6 - 6))
cyl("Pot", (-2.0, 3.05, 0.28), 0.20, 0.34, mat("PotM", (0.62, 0.28, 0.14), rough=0.8))
leaf_m = mat("Leaf", (0.16, 0.52, 0.20), rough=0.8)
for i, (lx, lz, ls) in enumerate([(-2.0, 0.62, 0.20), (-2.14, 0.52, 0.15), (-1.86, 0.54, 0.16)]):
    sph(f"Leaf{i}", (lx, 3.05, lz), (ls, ls * 0.8, ls), leaf_m)
box("Phone", (1.15, 1.60, 1.115), (0.34, 0.20, 0.035), mat("PhoneM", (0.09, 0.09, 0.11), rough=0.35), bev=0.012)
cyl("Pot2", (3.05, 2.45, 0.30), 0.24, 0.42, mat("Pot2M", (0.52, 0.24, 0.13), rough=0.8))
for i, (lx, ly, lz, ls) in enumerate([(3.05, 2.45, 0.72, 0.24), (2.88, 2.40, 0.60, 0.17), (3.22, 2.50, 0.62, 0.18)]):
    sph(f"LeafB{i}", (lx, ly, lz), (ls, ls * 0.85, ls), leaf_m)

chair_m = mat("Chair", (0.30, 0.18, 0.09), rough=0.7)
box("AgentChairBack", (-0.50, 2.15, 1.55), (1.0, 0.09, 1.1), chair_m, bev=0.03)
CUST_POS = (1.05, 0.15)
CUST_ROTZ = math.pi + 0.95
chg = empty("CustChairG", (CUST_POS[0], CUST_POS[1], 0)); chg.rotation_euler = (0, 0, CUST_ROTZ)
_cseat = box("CustChairSeat", (0, 0, 0), (0.95, 0.85, 0.08), chair_m, bev=0.02); _cseat.parent = chg; _cseat.location = (0, 0, 0.62)
_cback = box("CustChairBack", (0, 0, 0), (0.95, 0.09, 0.90), chair_m, bev=0.03); _cback.parent = chg; _cback.location = (0, 0.47, 1.02)
for sx in (-1, 1):
    for sy in (-1, 1):
        _lg = cyl(f"CustLegC{sx}{sy}", (0, 0, 0), 0.035, 0.58, chair_m)
        _lg.parent = chg; _lg.location = (0.40 * sx, 0.34 * sy, 0.29)

# ---------- POLICY CARDS (L3) — desk par khade bade cards, FONT text ----------
card_txt_w = mat("CardTxtW", (0.98, 0.97, 0.92), rough=0.5, emission=(0.98, 0.97, 0.92), estr=0.25)
card_txt_y = mat("CardTxtY", (1.0, 0.80, 0.10), rough=0.5, emission=(1.0, 0.80, 0.10), estr=0.35)
card_txt_d = mat("CardTxtD", (0.10, 0.10, 0.14), rough=0.6)
def make_card(name, x, body_c, title, sub, comm, title_m, comm_m):
    g = empty(name, (x, 1.52, 1.085)); g.rotation_euler = (math.radians(-9), 0, 0)
    bd = box(name + "Board", (0, 0, 0), (1.15, 0.05, 1.35), body_c, bev=0.02); bd.parent = g; bd.location = (0, 0, 0.675)
    t1 = text_obj(name + "T1", title, (0, 0, 0), 0.34, title_m, parent=g); t1.location = (0, -0.045, 0.98)
    t2 = text_obj(name + "T2", sub, (0, 0, 0), 0.17, card_txt_d, parent=g); t2.location = (0, -0.045, 0.66)
    t3 = text_obj(name + "T3", comm, (0, 0, 0), 0.155, comm_m, parent=g); t3.location = (0, -0.045, 0.34)
    return g
cardL_m = mat("CardL", (0.10, 0.42, 0.85), rough=0.55)
cardR_m = mat("CardR", (0.85, 0.45, 0.06), rough=0.55)
cardL = make_card("CardL", -1.02, cardL_m, "₹1 CRORE", "COVER", "₹4,000", card_txt_w, card_txt_w)
cardR = make_card("CardR", 0.62, cardR_m, "₹7 LAKH", "COVER", "₹15,000", card_txt_d, mat("CardCommR", (0.55, 0.05, 0.05), rough=0.5, emission=(0.55, 0.05, 0.05), estr=0.3))
# 7-lakh card ke peeche glow plane (L5 pick par chamkega)
glow_m = mat("GlowM", (1.0, 0.75, 0.15), rough=1.0, emission=(1.0, 0.72, 0.12), estr=0.0)
glow = plane("CardGlow", (0.62, 1.60, 1.78), (0.85, 1.0), glow_m, rot=(math.radians(90 - 9), 0, 0))
_glow_sock = glow_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]

# ---------- MONEY PILES (L10) — pehle farsh ke neeche, 998 par upar ----------
moneyG = empty("MoneyG", (0, 0, -4.0))
note_m = mat("Note", (0.16, 0.55, 0.22), rough=0.7)
note2_m = mat("Note2", (0.20, 0.62, 0.26), rough=0.7)
for i in range(5):
    nb = box(f"PileA{i}", (0, 0, 0), (0.46, 0.30, 0.055), note_m if i % 2 == 0 else note2_m, bev=0.008)
    nb.parent = moneyG; nb.location = (-0.95, 0.92, 1.12 + i * 0.058); nb.rotation_euler = (0, 0, math.radians(random.uniform(-5, 5)))
for i in range(3):
    nb = box(f"PileB{i}", (0, 0, 0), (0.46, 0.30, 0.055), note_m if i % 2 == 0 else note2_m, bev=0.008)
    nb.parent = moneyG; nb.location = (1.00, 0.92, 1.12 + i * 0.058); nb.rotation_euler = (0, 0, math.radians(random.uniform(-5, 5)))
mt1 = text_obj("MoneyT1", "₹5 LAKH", (0, 0, 0), 0.16, card_txt_d, parent=moneyG); mt1.location = (-0.95, 0.86, 1.52)
mt2 = text_obj("MoneyT2", "₹3 LAKH", (0, 0, 0), 0.16, mat("MoneyT2M", (0.60, 0.06, 0.06), rough=0.5), parent=moneyG); mt2.location = (1.00, 0.86, 1.38)

# ---------- CONTRACT BOARD (L12) — desk ke saamne bada kagaz, chhupi line highlight ----------
contractG = empty("ContractG", (0.05, 0.80, -4.0)); contractG.rotation_euler = (math.radians(-13), 0, 0)
cb = box("ContractBoard", (0, 0, 0), (1.25, 0.05, 1.55), paper_m, bev=0.015); cb.parent = contractG; cb.location = (0, 0, 0.78)
ct = text_obj("ContractTitle", "POLICY", (0, 0, 0), 0.17, card_txt_d, parent=contractG); ct.location = (0, -0.045, 1.38)
line_m = mat("FakeLine", (0.45, 0.45, 0.48), rough=0.8)
for i in range(7):
    ln = box(f"CLine{i}", (0, 0, 0), (0.95 - (i % 3) * 0.14, 0.012, 0.035), line_m)
    ln.parent = contractG; ln.location = (-0.05, -0.048, 1.14 - i * 0.115)
hl_m = mat("HL", (1.0, 0.85, 0.10), rough=0.4, emission=(1.0, 0.82, 0.08), estr=0.0)
hl = box("Highlight", (0, 0, 0), (1.04, 0.02, 0.11), hl_m); hl.parent = contractG; hl.location = (-0.05, -0.055, 1.14 - 4 * 0.115)
_hl_sock = hl_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
ft = text_obj("FreeLookT", "30 DIN FREE-LOOK", (0, 0, 0), 0.115, mat("FreeLookM", (0.62, 0.05, 0.05), rough=0.5, emission=(0.62, 0.05, 0.05), estr=0.4), parent=contractG)
ft.location = (0, -0.05, 0.30)

# ---------- SHIKAYAT LETTERS (L13) — farsh ke neeche se upar, phir girte hain ----------
letters = []
for i in range(12):
    lp = box(f"Letter{i}", (0, 0, 0), (0.46, 0.012, 0.62), paper_m if i % 2 == 0 else paper2_m, bev=0.004)
    lp.location = (-1.6 + (i % 4) * 0.85, 0.9 + (i // 4) * 0.5, -3.0)
    letters.append(lp)
big_num = text_obj("BigNum", "26,667", (0.1, 2.2, 3.35), 0.62, mat("BigNumM", (0.90, 0.10, 0.08), rough=0.45, emission=(0.90, 0.10, 0.08), estr=0.35))
big_num.scale = (0.001, 0.001, 0.001)
big_sub = text_obj("BigSub", "SHIKAYATEIN", (0.1, 2.2, 2.62), 0.30, card_txt_d)
big_sub.scale = (0.001, 0.001, 0.001)

# ---------- MIRROR (L14) — kone me khada bada frame, andar agent ka duplicate ----------
mirrorG = empty("MirrorG", (-2.55, 2.30, 0))
mirback_m = mat("MirBack", (0.35, 0.48, 0.62), rough=0.25, metallic=0.55)
mb = plane("MirBack", (0, 0, 0), (0.53, 1.06), mirback_m, rot=(math.radians(90), 0, 0)); mb.parent = mirrorG; mb.location = (0, 0.30, 1.65)
mirfr_m = mat("MirFrame", (0.55, 0.38, 0.10), rough=0.35, metallic=0.6)
for nm, lx, lz, dx, dz in (("T", 0, 2.74, 1.19, 0.10), ("B", 0, 0.56, 1.19, 0.10), ("L", -0.55, 1.65, 0.10, 2.28), ("R", 0.55, 1.65, 0.10, 2.28)):
    fb3 = box("MirF" + nm, (0, 0, 0), (dx, 0.07, dz), mirfr_m, bev=0.015); fb3.parent = mirrorG; fb3.location = (lx, -0.38, lz)

# ---------- DOOR + FILE (L17 tease) — dayein deewar ke paas ----------
door_m = mat("Door", (0.30, 0.16, 0.07), rough=0.6)
door = box("Door", (3.30, 2.60, 1.45), (0.10, 1.15, 2.9), door_m, bev=0.02)
box("DoorPostL", (3.30, 1.97, 1.48), (0.16, 0.12, 3.0), frame_m, bev=0.015)
box("DoorPostR", (3.30, 3.23, 1.48), (0.16, 0.12, 3.0), frame_m, bev=0.015)
box("DoorLintel", (3.30, 2.60, 3.02), (0.16, 1.38, 0.14), frame_m, bev=0.015)
sph("DoorKnob", (3.22, 2.15, 1.35), (0.055, 0.055, 0.055), brass)
qmark = text_obj("QMark", "?", (3.18, 2.60, 2.15), 0.85, mat("QM", (1.0, 0.80, 0.10), rough=0.4, emission=(1.0, 0.78, 0.08), estr=0.0), rot=(math.radians(90), 0, math.radians(-90)))
_q_sock = qmark.data.materials[0].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
tease_file = box("TeaseFile", (0.9, 1.45, 1.13), (0.55, 0.42, 0.07), mat("TeaseFileM", (0.12, 0.12, 0.16), rough=0.5), bev=0.01)
tease_file.rotation_euler = (0, 0, math.radians(-8))

# ---------- DREAM HOUSE SET (L7) — x=60 par, golden ----------
DX = 60.0
dfloor_m = mat("DFloor", (0.45, 0.28, 0.13), rough=0.55)
plane("DFloor", (DX, 0.5, 0), (6.0, 7.0), dfloor_m)
dwall_m = mat("DWall", (1.0, 0.80, 0.45), rough=0.95)
plane("DWall", (DX, 3.4, 3.6), (6.0, 3.6), dwall_m, rot=(math.radians(90), 0, 0))
drug_m = mat("DRug", (0.75, 0.25, 0.20), rough=0.95)
box("DRug", (DX, 0.2, 0.015), (3.4, 2.6, 0.03), drug_m, bev=0.01)
dsky_m = mat("DSky", (1.0, 0.85, 0.55), rough=1.0, emission=(1.0, 0.82, 0.45), estr=0.9)
plane("DWin", (DX + 1.6, 3.38, 2.4), (0.95, 1.05), dsky_m, rot=(math.radians(90), 0, 0))
box("DWinF_T", (DX + 1.6, 3.40, 3.42), (2.0, 0.08, 0.10), frame_m)
box("DWinF_B", (DX + 1.6, 3.40, 1.38), (2.0, 0.08, 0.10), frame_m)
box("DWinF_L", (DX + 0.65, 3.40, 2.4), (0.10, 0.08, 2.1), frame_m)
box("DWinF_R", (DX + 2.55, 3.40, 2.4), (0.10, 0.08, 2.1), frame_m)
sofa_m = mat("Sofa", (0.62, 0.14, 0.22), rough=0.85)
box("SofaBase", (DX - 1.7, 2.2, 0.45), (2.0, 0.8, 0.5), sofa_m, bev=0.05)
box("SofaBack", (DX - 1.7, 2.62, 1.05), (2.0, 0.22, 1.15), sofa_m, bev=0.05)
box("SofaArmL", (DX - 2.62, 2.2, 0.72), (0.22, 0.8, 0.85), sofa_m, bev=0.04)
box("SofaArmR", (DX - 0.78, 2.2, 0.72), (0.22, 0.8, 0.85), sofa_m, bev=0.04)
box("DTable", (DX + 0.4, 1.6, 0.42), (1.1, 0.7, 0.07), deskTop_m, bev=0.02)
for sx in (-1, 1):
    for sy in (-1, 1):
        cyl(f"DTableLeg{sx}{sy}", (DX + 0.4 + 0.45 * sx, 1.6 + 0.26 * sy, 0.20), 0.035, 0.40, desk_m)
dframe = box("DPic", (DX - 1.3, 3.38, 2.7), (0.95, 0.06, 0.75), frame_m, bev=0.015)
dhouse = box("DPicHouse", (DX - 1.3, 3.34, 2.7), (0.80, 0.03, 0.60), mat("DPicM", (0.95, 0.75, 0.35), rough=0.8, emission=(0.95, 0.75, 0.35), estr=0.2))
cyl("DPot", (DX + 2.6, 2.9, 0.30), 0.22, 0.44, mat("DPotM", (0.62, 0.28, 0.14), rough=0.8))
for i, (lx, lz, ls) in enumerate([(DX + 2.6, 0.78, 0.26), (DX + 2.44, 0.64, 0.19), (DX + 2.76, 0.66, 0.20)]):
    sph(f"DLeaf{i}", (lx, 2.9, lz), (ls, ls * 0.8, ls), leaf_m)
spark_m = mat("Spark", (1.0, 0.85, 0.40), rough=1.0, emission=(1.0, 0.82, 0.35), estr=1.6)
sparks = []
for i in range(8):
    sp3 = sph(f"Spark{i}", (DX - 1.8 + (i % 4) * 1.1, 0.6 + (i // 4) * 0.9, 1.6 + (i % 3) * 0.55), (0.045, 0.045, 0.045), spark_m)
    sparks.append(sp3)

# ---------- CHARACTERS ----------
agent, a_arms, a_hg, a_mouth, a_brows = build_character(
    "Agent", (0.50, 0.295, 0.165), (0.045, 0.17, 0.72), (0.17, 0.17, 0.22), (0.05, 0.05, 0.06),
    (-0.50, 1.95, 0.06), rotz=0.0, tie_c=(0.40, 0.03, 0.05))

cust, c_arms, c_hg, c_mouth, c_brows = build_character(
    "Cust", (0.42, 0.25, 0.13), (0.80, 0.16, 0.005), (0.40, 0.32, 0.24), (0.16, 0.15, 0.17),
    (CUST_POS[0], CUST_POS[1], 0.02), rotz=CUST_ROTZ, moustache=True, hair_grey=True)
cust.location = (CUST_POS[0], CUST_POS[1], -0.40)
cust_pants = mat("CustPants2", (0.40, 0.32, 0.24), rough=0.9)
for s in (-1, 1):
    lg = bpy.data.objects[f"CustLeg{s}"]
    lg.rotation_euler = (math.radians(90), 0, 0); lg.location = (0.20 * s, -0.27, 1.00); lg.scale = (1, 1, 0.55)
    shin = cyl(f"CustShin{s}", (0.20 * s, -0.52, 0.70), 0.082, 0.58, cust_pants); shin.parent = cust
    sh = bpy.data.objects[f"CustShoe{s}"]; sh.location = (0.20 * s, -0.60, 0.475)

# buddha customer (L10+) — safed baal, jhuka hua, gussa
old, o_arms, o_hg, o_mouth, o_brows = build_character(
    "Old", (0.44, 0.27, 0.15), (0.55, 0.42, 0.30), (0.30, 0.26, 0.22), (0.75, 0.74, 0.72),
    (CUST_POS[0], CUST_POS[1], -60.0), rotz=CUST_ROTZ, moustache=True)
old.rotation_euler = (math.radians(7), 0, CUST_ROTZ)
old_pants = mat("OldPants2", (0.30, 0.26, 0.22), rough=0.9)
for s in (-1, 1):
    lg = bpy.data.objects[f"OldLeg{s}"]
    lg.rotation_euler = (math.radians(90), 0, 0); lg.location = (0.20 * s, -0.27, 1.00); lg.scale = (1, 1, 0.55)
    shin = cyl(f"OldShin{s}", (0.20 * s, -0.52, 0.70), 0.082, 0.58, old_pants); shin.parent = old
    sh = bpy.data.objects[f"OldShoe{s}"]; sh.location = (0.20 * s, -0.60, 0.475)

# mirror ke andar agent ka duplicate (L14) — pehle farsh ke neeche
magent, m_arms, m_hg, m_mouth, m_brows = build_character(
    "MAgent", (0.50, 0.295, 0.165), (0.06, 0.20, 0.62), (0.17, 0.17, 0.22), (0.05, 0.05, 0.06),
    (-2.55, 2.02, -60.0), rotz=0.0, tie_c=(0.40, 0.03, 0.05))
magent.scale = (0.88, 0.88, 0.88)   # frame ke andar pura fit ho

# dream family (L7) — papa (cust jaisa), maa, beti
dad, d_arms, d_hg, d_mouth, d_brows = build_character(
    "Dad", (0.42, 0.25, 0.13), (0.80, 0.16, 0.005), (0.40, 0.32, 0.24), (0.16, 0.15, 0.17),
    (DX - 0.85, 1.05, 0.0), rotz=0.0, moustache=True)
mom, mo_arms, mo_hg, mo_mouth, mo_brows = build_character(
    "Mom", (0.46, 0.28, 0.15), (0.72, 0.12, 0.42), (0.30, 0.10, 0.35), (0.10, 0.06, 0.04),
    (DX + 0.75, 1.05, 0.0), rotz=0.0)
mom.scale = (0.95, 0.95, 0.95)
beti, b_arms, b_hg, b_mouth, b_brows = build_character(
    "Beti", (0.48, 0.30, 0.17), (0.95, 0.55, 0.10), (0.15, 0.25, 0.55), (0.08, 0.05, 0.04),
    (DX + 0.0, 0.55, 0.0), rotz=0.0)
beti.scale = (0.55, 0.55, 0.55)
book = box("Book", (DX + 0.0, 0.22, 0.62), (0.34, 0.05, 0.44), mat("BookM", (0.10, 0.35, 0.80), rough=0.6), bev=0.01)
bookpg = box("BookPg", (DX + 0.0, 0.19, 0.63), (0.30, 0.055, 0.40), paper_m, bev=0.005)

# ---------- LIGHTS ----------
key_spot = spot("Key", (-2.6, -3.2, 5.2), (-0.2, 1.2, 1.2), (1.0, 0.82, 0.62), 1500, angle=0.8)
key_ld = key_spot.data
sund = bpy.data.lights.new("Sun", 'SUN'); sund.energy = 1.5; sund.color = (1.0, 0.85, 0.62); sund.angle = 6
sun = bpy.data.objects.new("Sun", sund); bpy.context.collection.objects.link(sun)
sun.location = (2.3, 2.0, 4.5); sun.rotation_euler = (math.radians(52), math.radians(12), math.radians(-28))
fill_o = point("Fill", (3.2, -2.4, 3.0), (0.75, 0.85, 1.0), 160, size=3.0); fill_ld = fill_o.data
win_o = point("WinGlow", (2.3, 2.6, 2.6), (1.0, 0.9, 0.7), 450, size=2.0); win_ld = win_o.data
warm_o = point("Warm", (-2.8, 0.5, 2.2), (1.0, 0.6, 0.35), 150, size=2.5); warm_ld = warm_o.data
top_o = point("TopWash", (0.3, 0.6, 5.6), (1.0, 0.9, 0.75), 200, size=4.0); top_ld = top_o.data
# dream lights (golden)
dspot = spot("DKey", (DX - 2.5, -3.0, 5.0), (DX, 0.8, 1.1), (1.0, 0.76, 0.45), 1700, angle=0.85); dkey_ld = dspot.data
dpoint = point("DWarm", (DX + 1.8, 0.4, 2.6), (1.0, 0.72, 0.40), 320, size=3.0); dwarm_ld = dpoint.data
# tease spot (door par) — pehle band
tspot = spot("TSpot", (1.6, -0.6, 3.4), (3.25, 2.60, 1.9), (1.0, 0.85, 0.55), 0, angle=0.5); tspot_ld = tspot.data

# ---------- ANIMATION ----------
D = math.radians
# agent body bob (poori film)
for f in range(1, TOTAL + 1, 30):
    agent.location.z = 0.06 + 0.018 * math.sin(f * 0.21)
    key(agent, f, "location", 2)
agent.location.z = 0.06
# agent bolna + sir ki harkat (line segments)
for (f0, f1, sd) in [(1, 99, 3), (100, 199, 7), (200, 274, 11), (275, 376, 13), (377, 485, 17),
                     (486, 572, 19), (692, 780, 23), (781, 865, 29), (1187, 1279, 31),
                     (1280, 1408, 37), (1503, 1608, 41), (1609, 1699, 43), (1700, 1806, 47)]:
    talk(a_mouth, f0, f1, seed=sd)
    head_talk(a_hg, f0, f1, seed=sd + 100)
# agent bhaunvein: hook par uthti, L5 smug, L16 punchline
brow_keys(a_brows, [(1, 0.566), (60, 0.552), (200, 0.560), (377, 0.556), (436, 0.574), (486, 0.556),
                    (692, 0.562), (1187, 0.558), (1503, 0.552), (1700, 0.576), (1806, 0.556), (1888, 0.556)])
# blinks
blink("Agent", list(range(40, TOTAL, 95)))
blink("Cust", list(range(70, 925, 110)))
blink("Old", list(range(1010, 1800, 105)))
blink("MAgent", [1530, 1585])
blink("Dad", [600, 665]); blink("Mom", [615, 680]); blink("Beti", [640, 672])
# agent right arm gestures
ra_p, ra_e = a_arms[1]; la_p, la_e = a_arms[-1]
for f, r in [(1, (-100, 0, 12)), (30, (-80, 0, 20)), (99, (-55, 0, 35)), (160, (-70, 0, 10)),
             (199, (-60, 0, 45)), (246, (-75, -28, 20)), (275, (-105, 0, 8)), (376, (-65, 0, 30)),
             (420, (-85, 0, 15)), (436, (-40, 0, 10)), (486, (-55, 0, 40)), (692, (-58, 0, 5)),
             (760, (-45, 0, 20)), (866, (-52, 0, 10)), (1187, (-60, 0, 25)), (1215, (-75, 0, 40)),
             (1240, (-55, 0, 20)), (1280, (-95, 0, 5)), (1408, (-60, 0, 30)), (1503, (-70, -20, 15)),
             (1609, (-62, 0, 35)), (1700, (-102, 0, 10)), (1756, (-35, 0, -15)), (1888, (-38, 0, -10))]:
    keyrot(ra_p, f, (D(r[0]), D(r[1]), D(r[2])))
for f, r in [(1, -15), (99, -40), (199, -30), (275, -10), (420, -35), (436, -70), (692, -25),
             (1187, -30), (1280, -15), (1700, -8), (1756, -85), (1888, -80)]:
    keyrot(ra_e, f, (D(r), 0, 0))
for f, r in [(1, (-52, 0, -10)), (199, (-58, 0, -30)), (486, (-52, 0, -10)), (1700, (-50, 0, -12)), (1756, (-38, 0, 14)), (1888, (-40, 0, 10))]:
    keyrot(la_p, f, (D(r[0]), D(r[1]), D(r[2])))
keyrot(la_e, 1, (D(-38), 0, 0)); keyrot(la_e, 1888, (D(-38), 0, 0))

# customer: aaram ki mudra, phir L8 me SIGN karta hai
keyrot(c_arms[1][0], 1, (D(-30), 0, D(8))); keyrot(c_arms[-1][0], 1, (D(-30), 0, D(-8)))
keyrot(c_arms[1][1], 1, (D(-50), 0, 0)); keyrot(c_arms[-1][1], 1, (D(-50), 0, 0))
keyrot(c_arms[1][0], 692, (D(-30), 0, D(8)))
keyrot(c_arms[1][0], 715, (D(-72), 0, D(2)))
for f, zz in [(730, 6), (745, -2), (760, 6), (775, -2), (790, 4)]:
    keyrot(c_arms[1][0], f, (D(-71), 0, D(zz)))
keyrot(c_arms[1][0], 820, (D(-35), 0, D(8)))
keyrot(c_arms[1][0], 1888, (D(-35), 0, D(8)))
keyrot(c_arms[1][1], 692, (D(-50), 0, 0)); keyrot(c_arms[1][1], 715, (D(-18), 0, 0))
keyrot(c_arms[1][1], 820, (D(-45), 0, 0)); keyrot(c_arms[1][1], 1888, (D(-45), 0, 0))
keyrot(c_arms[-1][0], 1888, (D(-30), 0, D(-8))); keyrot(c_arms[-1][1], 1888, (D(-50), 0, 0))
# customer nods (L6 sun raha hai, L8 ke ant me khush)
osc_keys(c_hg, "rotation_euler", 0, [(1, 0.06), (275, 0.06), (300, 0.16), (330, 0.06), (486, 0.06),
                                     (500, 0.28), (512, 0.08), (524, 0.26), (536, 0.06), (692, 0.06),
                                     (826, 0.06), (838, 0.27), (850, 0.08), (862, 0.24), (925, 0.06)])
osc_keys(c_hg, "rotation_euler", 2, [(1, 0.03), (460, -0.03), (925, 0.03)])
for f in range(1, 926, 42):
    cust.location.z = -0.40 + 0.012 * math.sin(f * 0.30)
    key(cust, f, "location", 2)
# SWAP: 931 par jawan customer neeche, buddha customer upar (camera calendar par hai)
cust.location = (CUST_POS[0], CUST_POS[1], -0.40); key(cust, 930, "location")
cust.location = (CUST_POS[0], CUST_POS[1], -60.0); key(cust, 931, "location")
old.location = (CUST_POS[0], CUST_POS[1], -60.0); key(old, 930, "location")
old.location = (CUST_POS[0], CUST_POS[1], -0.40); key(old, 931, "location")
for f in range(940, 1800, 48):
    old.location.z = -0.40 + 0.008 * math.sin(f * 0.3)
    key(old, f, "location", 2)
# buddha customer: gussa — desk par haath, agent ki taraf ishara
keyrot(o_arms[1][0], 931, (D(-30), 0, D(8)))
keyrot(o_arms[1][0], 999, (D(-30), 0, D(8)))
keyrot(o_arms[1][0], 1008, (D(-95), 0, D(5)))
keyrot(o_arms[1][0], 1016, (D(-48), 0, D(8)))
keyrot(o_arms[1][0], 1061, (D(-80), D(-25), D(10)))
keyrot(o_arms[1][0], 1120, (D(-75), D(-20), D(12)))
keyrot(o_arms[1][0], 1186, (D(-70), D(-18), D(10)))
keyrot(o_arms[1][0], 1888, (D(-40), 0, D(6)))
keyrot(o_arms[1][1], 931, (D(-50), 0, 0)); keyrot(o_arms[1][1], 1008, (D(-20), 0, 0))
keyrot(o_arms[1][1], 1016, (D(-35), 0, 0)); keyrot(o_arms[1][1], 1888, (D(-40), 0, 0))
keyrot(o_arms[-1][0], 931, (D(-45), 0, D(-10))); keyrot(o_arms[-1][0], 1888, (D(-45), 0, D(-10)))
keyrot(o_arms[-1][1], 931, (D(-30), 0, 0)); keyrot(o_arms[-1][1], 1888, (D(-30), 0, 0))
talk(o_mouth, 999, 1120, seed=53, amp=0.05)
head_talk(o_hg, 999, 1186, seed=59, ax=0.12, az=0.09)
brow_keys(o_brows, [(931, 0.532), (999, 0.520), (1186, 0.526), (1408, 0.534), (1888, 0.534)])

# mirror duplicate: 1502 par upar aata hai, camera ki taraf ishara, bolta hai
magent.location = (-2.55, 2.02, -60.0); key(magent, 1501, "location")
magent.location = (-2.55, 2.02, 0.0); key(magent, 1502, "location")
keyrot(m_arms[1][0], 1502, (D(-95), 0, D(10))); keyrot(m_arms[1][0], 1560, (D(-100), 0, D(8))); keyrot(m_arms[1][0], 1608, (D(-95), 0, D(10)))
keyrot(m_arms[1][1], 1502, (D(-12), 0, 0)); keyrot(m_arms[1][1], 1608, (D(-12), 0, 0))
keyrot(m_arms[-1][0], 1502, (D(-30), 0, D(-10))); keyrot(m_arms[-1][0], 1608, (D(-30), 0, D(-10)))
talk(m_mouth, 1503, 1608, seed=61)
head_talk(m_hg, 1503, 1608, seed=67, ax=0.06, az=0.05)

# dream family poses + harkat
keyrot(d_arms[1][0], 573, (D(-25), 0, D(15))); keyrot(d_arms[1][0], 691, (D(-25), 0, D(15)))
keyrot(d_arms[-1][0], 573, (D(-25), 0, D(-15))); keyrot(d_arms[-1][0], 691, (D(-25), 0, D(-15)))
keyrot(d_arms[1][1], 573, (D(-30), 0, 0)); keyrot(d_arms[1][1], 691, (D(-30), 0, 0))
keyrot(d_arms[-1][1], 573, (D(-30), 0, 0)); keyrot(d_arms[-1][1], 691, (D(-30), 0, 0))
keyrot(mo_arms[1][0], 573, (D(-25), 0, D(12))); keyrot(mo_arms[1][0], 691, (D(-25), 0, D(12)))
keyrot(mo_arms[-1][0], 573, (D(-25), 0, D(-12))); keyrot(mo_arms[-1][0], 691, (D(-25), 0, D(-12)))
keyrot(mo_arms[1][1], 573, (D(-35), 0, 0)); keyrot(mo_arms[1][1], 691, (D(-35), 0, 0))
keyrot(mo_arms[-1][1], 573, (D(-35), 0, 0)); keyrot(mo_arms[-1][1], 691, (D(-35), 0, 0))
for s in (-1, 1):
    keyrot(b_arms[s][0], 573, (D(-78), 0, D(6 * s))); keyrot(b_arms[s][0], 691, (D(-78), 0, D(6 * s)))
    keyrot(b_arms[s][1], 573, (D(-12), 0, 0)); keyrot(b_arms[s][1], 691, (D(-12), 0, 0))
talk(d_mouth, 573, 630, seed=71)
talk(b_mouth, 640, 685, seed=73, amp=0.034)
osc_keys(b_hg, "rotation_euler", 0, [(631, 0.02), (655, 0.14), (675, 0.04), (691, 0.10)])
osc_keys(d_hg, "rotation_euler", 2, [(573, 0.0), (610, 0.06), (650, -0.05), (691, 0.0)])
for i, sp3 in enumerate(sparks):
    z0 = sp3.location.z
    osc_keys(sp3, "location", 2, [(573, z0), (610, z0 + 0.09), (650, z0 - 0.05), (691, z0 + 0.04)])

# cards L3 se pehle desk ke andar chhupe hain, 198-203 par upar aate hain
for _cg, _cx in ((cardL, -1.02), (cardR, 0.62)):
    _cg.location = (_cx, 1.52, -1.30); key(_cg, 1, "location"); key(_cg, 197, "location")
    _cg.location = (_cx, 1.52, 1.085); key(_cg, 203, "location")
glow.location = (0.62, 1.60, -1.20); key(glow, 1, "location"); key(glow, 197, "location")
glow.location = (0.62, 1.60, 1.78); key(glow, 203, "location")
# cards: 7-lakh pick par glow + pulse (L5)
_glow_sock.default_value = 0.0; _glow_sock.keyframe_insert("default_value", frame=376)
_glow_sock.default_value = 2.4; _glow_sock.keyframe_insert("default_value", frame=420)
_glow_sock.default_value = 1.2; _glow_sock.keyframe_insert("default_value", frame=436)
_glow_sock.default_value = 0.0; _glow_sock.keyframe_insert("default_value", frame=485)
cardR.scale = (1, 1, 1); key(cardR, 376, "scale")
cardR.scale = (1.07, 1.07, 1.07); key(cardR, 420, "scale")
cardR.scale = (1, 1, 1); key(cardR, 436, "scale")

# money piles 998 par, contract 1280 par
moneyG.location = (0, 0, -4.0); key(moneyG, 997, "location")
moneyG.location = (0, 0, 0.0); key(moneyG, 998, "location")
contractG.location = (0.05, 0.80, -4.0); key(contractG, 1279, "location")
contractG.location = (0.05, 0.80, 0.15); key(contractG, 1280, "location")
_hl_sock.default_value = 0.0; _hl_sock.keyframe_insert("default_value", frame=1279)
_hl_sock.default_value = 3.2; _hl_sock.keyframe_insert("default_value", frame=1340)
_hl_sock.default_value = 2.2; _hl_sock.keyframe_insert("default_value", frame=1408)

# calendar pages flip (L9) + ghadi tez
for i, piv in enumerate(calpages):
    f0 = 872 + i * 16
    keyrot(piv, f0, (0, 0, 0))
    keyrot(piv, f0 + 13, (D(-105), 0, 0))
osc_keys(secpiv, "rotation_euler", 1, [(1, 0.0), (865, D(360 * 4)), (998, D(360 * 10)), (1888, D(360 * 14))])
osc_keys(minpiv, "rotation_euler", 1, [(1, D(58)), (865, D(70)), (998, D(790)), (1888, D(830))])
osc_keys(hourpiv, "rotation_euler", 1, [(1, D(-55)), (865, D(-48)), (998, D(312)), (1888, D(330))])
for i, c in enumerate(clouds):
    x0 = c.location.x
    osc_keys(c, "location", 0, [(1, x0 - 0.05), (471, x0 + 0.06), (942, x0 - 0.04), (1413, x0 + 0.06), (1888, x0)])

# shikayat letters girte hain (L13)
rndL = random.Random(99)
for i, lp in enumerate(letters):
    x0, y0 = lp.location.x, lp.location.y
    fs = 1412 + (i % 6) * 7 + (i // 6) * 4
    fe = fs + 38
    lp.location = (x0, y0, -3.0); key(lp, fs - 1, "location")
    lp.location = (x0 + rndL.uniform(-0.2, 0.2), y0, 5.6); key(lp, fs, "location")
    if i % 3 == 0:
        lp.location = (x0 + rndL.uniform(-0.4, 0.4), -0.5 + rndL.uniform(0, 0.5), 0.03); key(lp, fe, "location")
    else:
        lp.location = (x0 + rndL.uniform(-0.3, 0.3), min(y0, 1.7), 1.13 + (i % 3) * 0.02); key(lp, fe, "location")
    keyrot(lp, fs, (0, 0, 0))
    keyrot(lp, fe, (D(rndL.uniform(-25, 25)), D(rndL.uniform(-15, 15)), D(rndL.uniform(-50, 50))))
# bada number ubhartaa hai
for f, s in [(1455, 0.001), (1468, 1.15), (1478, 1.0), (1502, 1.0)]:
    big_num.scale = (s, s, s); key(big_num, f, "scale")
for f, s in [(1455, 0.001), (1470, 1.0), (1502, 1.0)]:
    big_sub.scale = (s, s, s); key(big_sub, f, "scale")

# L17 tease: lights bujhti hain, door par spot + "?" chamakta hai
key_energy(key_ld, 1806, 1500); key_energy(key_ld, 1820, 120)
key_energy(sund, 1806, 1.5); key_energy(sund, 1820, 0.15)
key_energy(fill_ld, 1806, 160); key_energy(fill_ld, 1820, 25)
key_energy(win_ld, 1806, 450); key_energy(win_ld, 1820, 40)
key_energy(warm_ld, 1806, 150); key_energy(warm_ld, 1820, 20)
key_energy(top_ld, 1806, 200); key_energy(top_ld, 1820, 25)
key_energy(tspot_ld, 1806, 0); key_energy(tspot_ld, 1825, 950)
_q_sock.default_value = 0.0; _q_sock.keyframe_insert("default_value", frame=1806)
_q_sock.default_value = 1.8; _q_sock.keyframe_insert("default_value", frame=1852)
_q_sock.default_value = 2.3; _q_sock.keyframe_insert("default_value", frame=1888)

# ---------- CAMERA SHOTS (har shot ≤66 frames, har shot me move) ----------
# (f0, f1, pos0, pos1, tgt0, tgt1, lens, roll_deg)
SHOTS = [
    (1, 54, (-1.5, -1.9, 0.75), (-1.1, -1.2, 0.95), (-0.5, 1.95, 2.35), (-0.5, 1.95, 2.35), 40, 0),
    (55, 99, (-1.35, -0.1, 2.3), (-0.1, -0.35, 2.45), (-0.5, 1.95, 2.38), (-0.5, 1.95, 2.38), 50, 0),
    (100, 160, (1.85, -1.15, 2.05), (1.6, -0.9, 1.95), (-0.5, 1.9, 1.9), (-0.5, 1.9, 1.95), 38, 0),
    (161, 199, (-1.7, -0.5, 1.6), (-1.35, -0.25, 1.35), (-1.2, 1.3, 1.1), (-1.25, 1.35, 1.08), 45, 0),
    (200, 245, (-0.3, -0.55, 5.6), (-0.3, -0.35, 5.15), (-0.3, 1.5, 1.1), (-0.3, 1.5, 1.1), 30, 0),
    (246, 274, (0.55, -0.5, 2.2), (0.6, -0.15, 1.95), (0.62, 1.52, 1.75), (0.62, 1.52, 1.78), 48, 0),
    (275, 330, (0.75, -0.75, 2.15), (0.45, -0.35, 2.1), (-0.5, 1.95, 2.3), (-0.5, 1.95, 2.32), 44, 0),
    (331, 376, (-3.6, -0.9, 1.9), (-3.3, -0.7, 1.8), (0.3, 1.1, 1.5), (0.3, 1.1, 1.5), 34, 0),
    (377, 435, (0.3, -0.4, 5.3), (0.35, -0.2, 4.85), (0.4, 1.45, 1.1), (0.4, 1.45, 1.1), 30, 0),
    (436, 485, (-0.2, -0.5, 2.5), (-0.35, -0.2, 2.4), (-0.5, 1.95, 2.4), (-0.5, 1.95, 2.4), 52, 0),
    (486, 535, (-2.9, -3.6, 2.6), (-2.6, -3.2, 2.4), (0.2, 1.2, 1.4), (0.2, 1.2, 1.4), 30, 0),
    (536, 572, (-0.4, -1.9, 2.0), (-0.25, -1.7, 1.95), (1.05, 0.25, 1.9), (1.05, 0.25, 1.9), 40, 0),
    (573, 630, (DX - 2.9, -3.9, 2.3), (DX - 2.5, -3.3, 2.1), (DX, 0.9, 1.3), (DX, 0.9, 1.3), 32, 0),
    (631, 691, (DX + 0.9, -1.7, 1.35), (DX + 0.6, -1.3, 1.25), (DX, 0.6, 1.0), (DX, 0.55, 1.0), 44, 0),
    (692, 755, (1.35, -0.75, 1.7), (1.15, -0.5, 1.5), (0.6, 1.15, 1.1), (0.55, 1.2, 1.1), 46, 0),
    (756, 820, (-1.2, -0.3, 2.35), (-0.9, -0.1, 2.3), (-0.5, 1.95, 2.35), (-0.5, 1.95, 2.35), 50, 0),
    (821, 865, (3.4, -1.2, 2.0), (3.15, -1.0, 1.9), (0.2, 1.1, 1.5), (0.2, 1.1, 1.5), 34, 0),
    (866, 925, (-0.6, -3.4, 2.5), (-0.8, -3.0, 2.4), (-0.7, 3.2, 2.6), (-0.7, 3.2, 2.6), 32, 0),
    (926, 985, (-1.5, -0.7, 4.2), (-1.45, -0.5, 3.9), (-1.3, 2.2, 1.6), (-1.35, 2.2, 1.6), 36, 0),
    (986, 998, (0.5, 1.6, 3.3), (0.6, 1.8, 3.25), (1.18, 3.56, 3.12), (1.18, 3.56, 3.12), 55, 0),
    (999, 1060, (-2.06, 1.51, 2.30), (-1.88, 1.43, 2.24), (0.73, 0.38, 1.82), (0.73, 0.38, 1.82), 40, 0),
    (1061, 1120, (0.4, -1.1, 1.9), (0.3, -0.85, 1.7), (0.0, 0.95, 1.25), (0.0, 0.95, 1.25), 44, 0),
    (1121, 1186, (-3.5, -0.8, 1.95), (-3.25, -0.6, 1.85), (0.3, 1.1, 1.6), (0.3, 1.1, 1.6), 34, 0),
    (1187, 1240, (-0.15, -0.55, 2.45), (-0.3, -0.3, 2.38), (-0.5, 1.95, 2.38), (-0.5, 1.95, 2.38), 52, 0),
    (1241, 1279, (0.85, -0.6, 2.2), (0.6, -0.35, 2.12), (-0.5, 1.95, 2.3), (-0.5, 1.95, 2.3), 44, 0),
    (1280, 1345, (0.1, -1.3, 1.5), (0.08, -0.95, 1.3), (0.05, 0.95, 1.05), (0.05, 0.95, 1.05), 48, 0),
    (1346, 1408, (-0.7, -1.1, 1.7), (0.55, -1.15, 1.55), (0.05, 0.95, 1.0), (0.05, 0.95, 1.0), 44, 0),
    (1409, 1455, (-2.7, -3.3, 2.7), (-2.4, -2.9, 2.5), (0.0, 1.3, 1.6), (0.0, 1.3, 1.6), 30, 0),
    (1456, 1502, (0.2, -2.2, 2.6), (0.15, -1.5, 2.5), (0.1, 2.2, 3.0), (0.1, 2.2, 3.0), 40, 0),
    (1503, 1560, (-1.3, -1.7, 1.9), (-1.9, -0.7, 1.85), (-2.55, 2.3, 1.75), (-2.55, 2.3, 1.75), 36, 0),
    (1561, 1608, (-2.15, -0.15, 1.8), (-2.3, 0.45, 1.75), (-2.55, 2.05, 1.9), (-2.55, 2.05, 1.9), 46, 0),
    (1609, 1660, (-0.3, -0.5, 5.6), (-0.3, -0.3, 5.15), (-0.3, 1.5, 1.1), (-0.3, 1.5, 1.1), 30, 0),
    (1661, 1699, (-0.9, -0.7, 2.3), (-0.6, -0.45, 2.25), (-0.5, 1.95, 2.35), (-0.5, 1.95, 2.35), 50, 3.5),
    (1700, 1755, (-0.25, -0.45, 2.5), (-0.4, -0.25, 2.42), (-0.5, 1.95, 2.4), (-0.5, 1.95, 2.4), 54, 0),
    (1756, 1806, (-1.6, -1.6, 0.9), (-1.3, -1.3, 1.0), (-0.5, 1.95, 2.2), (-0.5, 1.95, 2.2), 40, -3.0),
    (1807, 1852, (0.4, -2.6, 2.2), (0.7, -2.1, 2.05), (3.1, 2.5, 1.9), (3.1, 2.5, 1.9), 34, 0),
    (1853, 1888, (1.5, -0.7, 2.2), (2.0, -0.1, 2.15), (3.2, 2.6, 2.1), (3.2, 2.6, 2.1), 46, 0),
]
for (f0, f1, p0, p1, t0, t1, lens, roll) in SHOTS:
    cam_key(f0, p0, t0, roll=D(roll), lens=lens)
    cam_key(f1, p1, t1, roll=D(roll), lens=lens)

# ---------- render ----------
if MODE == "still":
    try: sc.eevee.taa_render_samples = 32
    except Exception: pass
    sc.render.resolution_x = 720; sc.render.resolution_y = 1280
    sc.frame_set(SF)
    sc.render.filepath = f"{B}/stillF_{SF}.png"
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
else:
    try: sc.eevee.taa_render_samples = 8
    except Exception: pass
    sc.render.resolution_x = 1080; sc.render.resolution_y = 1920
    if F0 is not None: sc.frame_start = F0
    if F1 is not None: sc.frame_end = F1
    os.makedirs(f"{B}/frames", exist_ok=True)
    sc.render.filepath = f"{B}/frames/f_"
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(animation=True)
print("TOTAL=1888")
print("DONE EP9 FULL", MODE)
