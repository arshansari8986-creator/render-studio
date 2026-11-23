import bpy, math, random, sys, os

# EP9 Blender 3D sample v2 — sudhaar: natural muh (smile curve + chhota open-mouth),
# ghane rang, bhara composition (desk-corner 3/4 camera), customer ka chehra side se,
# ghadi ki sahi suiyaan (Y-axis pivot rotation), gehre shadows ke liye kam fill + sun.
B = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = argv[0] if argv else "still"           # still | anim
def _int(i, d=None):
    try: return int(argv[i])
    except Exception: return d
SF = _int(1, 60)                              # still frame
F0 = _int(1); F1 = _int(2)                    # anim range

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
    # halki muskaan wali curved line: bezier arc, kone upar, beech neeche (U shape)
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

# ---------- character builder (stylized, big head, two-segment arms) ----------
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
    # legs + shoes
    legs = {}
    for s in (-1, 1):
        lg = cyl(f"{prefix}Leg{s}", (0.20 * s, 0, 0.52), 0.095, 1.04, pants); P(lg); legs[s] = lg
        sh = sph(f"{prefix}Shoe{s}", (0.20 * s, -0.08, 0.07), (0.115, 0.20, 0.075), dark); P(sh)
    # torso
    P(sph(prefix + "Hips", (0, 0, 1.08), (0.40, 0.30, 0.30), pants))
    P(sph(prefix + "Torso", (0, 0, 1.48), (0.47, 0.34, 0.52), shirt))
    P(cyl(prefix + "Neck", (0, 0, 1.98), 0.11, 0.18, skin))
    if tie_c:
        tiem = mat(prefix + "Tie", tie_c, rough=0.6)
        kn = box(f"{prefix}TieKnot", (0, -0.315, 1.90), (0.11, 0.05, 0.13), tiem, bev=0.015); P(kn)
        tb = box(f"{prefix}TieBody", (0, -0.325, 1.58), (0.13, 0.04, 0.52), tiem, bev=0.015); P(tb)
        tb.rotation_euler = (math.radians(3), 0, 0)
    # arms
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
    # head group
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
    # hair: cap + fringe
    HP(sph(prefix + "HairTop", (0, 0.05, 0.50), (0.43, 0.405, 0.385), hairm))
    HP(sph(prefix + "HairFr", (0, -0.27, 0.615), (0.385, 0.13, 0.115), hairm))
    if hair_grey:
        for s in (-1, 1):
            HP(sph(f"{prefix}Grey{s}", (0.40 * s, 0.10, 0.55), (0.045, 0.11, 0.10), mat(prefix + "GreyM", (0.50, 0.50, 0.53), rough=0.7)))
    # muh: smile line (curve) + uske neeche chhota open-mouth ellipse (bolte time khulta hai)
    smile = smile_curve(prefix + "Smile", (0, -0.378, 0.135), mouthline_m); smile.parent = hg
    mouth = HP(sph(prefix + "Mouth", (0, -0.352, 0.088), (0.046, 0.016, 0.008), mouthopen_m))
    if moustache:
        mm = mat(prefix + "MousM", (0.14, 0.13, 0.14), rough=0.7)
        for s in (-1, 1):
            mo = HP(sph(f"{prefix}Mous{s}", (0.088 * s, -0.378, 0.172), (0.115, 0.048, 0.040), mm))
            mo.rotation_euler = (0, 0, math.radians(12 * s))
    return char, arms, hg, mouth, brows

# ---------- scene setup ----------
sc = bpy.context.scene
try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
except Exception: sc.render.engine = 'BLENDER_EEVEE'
sc.render.fps = 30
sc.frame_start, sc.frame_end = 1, 210
w = bpy.data.worlds['World']; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.06, 0.045, 0.035, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 0.30
sc.view_settings.view_transform = 'Filmic'; sc.view_settings.look = 'Medium High Contrast'
sc.view_settings.exposure = 1.05
cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 36
cam = bpy.data.objects.new("Cam", cam_d); bpy.context.collection.objects.link(cam); sc.camera = cam
cam_tgt = empty("CamTgt", (0.15, 1.25, 1.42))
_ccon = cam.constraints.new('TRACK_TO'); _ccon.target = cam_tgt
_ccon.track_axis = 'TRACK_NEGATIVE_Z'; _ccon.up_axis = 'UP_Y'

# room — ghane, garam rang
floor_m = mat("Floor", (0.27, 0.155, 0.075), rough=0.6)
plane("Floor", (0, 1.0, 0), (7.0, 8.0), floor_m)
wall_m = mat("Wall", (0.95, 0.68, 0.30), rough=0.95)
plane("WallBack", (0, 3.6, 4.2), (7.0, 4.2), wall_m, rot=(math.radians(90), 0, 0))
wallL_m = mat("WallL", (0.92, 0.62, 0.27), rough=0.95)
plane("WallL", (-3.6, 1.2, 3.4), (3.4, 3.4), wallL_m, rot=(math.radians(90), 0, math.radians(90)))
rug_m = mat("Rug", (0.42, 0.08, 0.07), rough=0.95)
box("Rug", (-0.1, -0.45, 0.012), (3.6, 2.6, 0.024), rug_m, bev=0.01)

# window on back wall (right side)
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

# poster + calendar — characters ke peeche frame ke andar
poster_m = tex_mat("PosterM", f"{B}/poster.png", es=0.1)
plane("Poster", (-0.45, 3.57, 3.02), (0.62, 0.50), poster_m, rot=(math.radians(90), 0, 0))
cal_m = tex_mat("CalM", f"{B}/calendar.png", es=0.1)
plane("Calendar", (-1.60, 3.57, 2.42), (0.44, 0.54), cal_m, rot=(math.radians(90), 0, 0))

# almari / shelf unit back-left, ghane rang ki files
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

# wall clock — dono suiyaan pivot par, sahi size, Y-axis par ghumti hain
CX, CY, CZ = 1.18, 3.56, 3.12
clock_m = mat("ClockRim", (0.22, 0.13, 0.08), rough=0.6)
cyl("ClockRim", (CX, CY, CZ), 0.37, 0.06, clock_m, rot=(math.radians(90), 0, 0))
face_m = mat("ClockFace", (0.97, 0.95, 0.88), rough=0.5)
cyl("ClockFace", (CX, CY - 0.03, CZ), 0.33, 0.03, face_m, rot=(math.radians(90), 0, 0))
hand_m = mat("HandM", (0.07, 0.07, 0.09), rough=0.5)
hourpiv = empty("HourPiv", (CX, CY - 0.055, CZ))
hh = box("ClockH", (0, 0, 0), (0.055, 0.02, 0.19), hand_m); hh.parent = hourpiv; hh.location = (0, 0, 0.075)
hourpiv.rotation_euler = (0, math.radians(-55), 0)   # ~10 bajkar
minpiv = empty("MinPiv", (CX, CY - 0.055, CZ))
mh = box("ClockM", (0, 0, 0), (0.040, 0.02, 0.27), hand_m); mh.parent = minpiv; mh.location = (0, 0, 0.115)
secpiv = empty("SecPiv", (CX, CY - 0.055, CZ))
sh2 = box("ClockS", (0, 0, 0), (0.018, 0.015, 0.29), mat("SecM", (0.82, 0.14, 0.10), rough=0.5)); sh2.parent = secpiv; sh2.location = (0, 0, 0.12)
cyl("ClockPin", (CX, CY - 0.065, CZ), 0.028, 0.03, hand_m, rot=(math.radians(90), 0, 0))

# desk — gehri lakdi
desk_m = mat("Desk", (0.22, 0.115, 0.05), rough=0.55)
deskTop_m = mat("DeskTop", (0.28, 0.15, 0.06), rough=0.4)
box("DeskBody", (-0.35, 1.30, 0.50), (3.3, 0.95, 1.0), desk_m, bev=0.03)
box("DeskTop", (-0.35, 1.30, 1.04), (3.5, 1.05, 0.09), deskTop_m, bev=0.03)
for sx in (-1, 1):
    box(f"DeskPanel{sx}", (-0.35 + 1.45 * sx, 1.30, 0.52), (0.35, 0.7, 0.85), desk_m, bev=0.02)

# desk props
brass = mat("Brass", (0.88, 0.64, 0.16), rough=0.28, metallic=0.85)
cyl("BellBase", (-1.30, 1.05, 1.10), 0.13, 0.03, brass)
sph("BellDome", (-1.30, 1.05, 1.16), (0.115, 0.115, 0.10), brass)
sph("BellKnob", (-1.30, 1.05, 1.28), (0.032, 0.032, 0.032), brass)
paper_m = mat("Paper", (0.96, 0.93, 0.84), rough=0.9)
paper2_m = mat("Paper2", (0.90, 0.84, 0.70), rough=0.9)
for i, (px, py, rz) in enumerate([(-1.85, 1.45, 4), (-1.82, 1.42, -3), (0.30, 1.60, 7), (0.33, 1.57, 2)]):
    pb = box(f"Paper{i}", (px, py, 1.115 + (i % 2) * 0.035), (0.52, 0.38, 0.028), paper_m if i % 2 == 0 else paper2_m, bev=0.006)
    pb.rotation_euler = (0, 0, math.radians(rz))
# laal policy folder customer ke saamne
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

# chairs
chair_m = mat("Chair", (0.30, 0.18, 0.09), rough=0.7)
box("AgentChairBack", (-0.50, 2.15, 1.55), (1.0, 0.09, 1.1), chair_m, bev=0.03)
# customer chair: group customer ke saath ghumta hai (3/4 angle)
CUST_POS = (1.05, 0.15)
CUST_ROTZ = math.pi + 0.95
chg = empty("CustChairG", (CUST_POS[0], CUST_POS[1], 0)); chg.rotation_euler = (0, 0, CUST_ROTZ)
_cseat = box("CustChairSeat", (0, 0, 0), (0.95, 0.85, 0.08), chair_m, bev=0.02); _cseat.parent = chg; _cseat.location = (0, 0, 0.62)
_cback = box("CustChairBack", (0, 0, 0), (0.95, 0.09, 0.90), chair_m, bev=0.03); _cback.parent = chg; _cback.location = (0, 0.47, 1.02)
for sx in (-1, 1):
    for sy in (-1, 1):
        _lg = cyl(f"CustLegC{sx}{sy}", (0, 0, 0), 0.035, 0.58, chair_m)
        _lg.parent = chg; _lg.location = (0.40 * sx, 0.34 * sy, 0.29)

# ---------- characters ----------
agent, a_arms, a_hg, a_mouth, a_brows = build_character(
    "Agent", (0.50, 0.295, 0.165), (0.045, 0.17, 0.72), (0.17, 0.17, 0.22), (0.05, 0.05, 0.06),
    (-0.50, 1.95, 0.06), rotz=0.0, tie_c=(0.40, 0.03, 0.05))

cust, c_arms, c_hg, c_mouth, c_brows = build_character(
    "Cust", (0.42, 0.25, 0.13), (0.80, 0.16, 0.005), (0.40, 0.32, 0.24), (0.16, 0.15, 0.17),
    (CUST_POS[0], CUST_POS[1], 0.02), rotz=CUST_ROTZ, moustache=True, hair_grey=True)
# customer baitha hai: jaanghen aage, pindli neeche, jute farsh par
cust.location = (CUST_POS[0], CUST_POS[1], -0.40)
cust_pants = mat("CustPants2", (0.40, 0.32, 0.24), rough=0.9)
for s in (-1, 1):
    lg = bpy.data.objects[f"CustLeg{s}"]
    lg.rotation_euler = (math.radians(90), 0, 0); lg.location = (0.20 * s, -0.27, 1.00); lg.scale = (1, 1, 0.55)
    shin = cyl(f"CustShin{s}", (0.20 * s, -0.52, 0.70), 0.082, 0.58, cust_pants); shin.parent = cust
    sh = bpy.data.objects[f"CustShoe{s}"]; sh.location = (0.20 * s, -0.60, 0.475)

# ---------- lights (warm key + kam fill = gehre shadows, 3D depth) ----------
spot("Key", (-2.6, -3.2, 5.2), (-0.2, 1.2, 1.2), (1.0, 0.82, 0.62), 1500, angle=0.8)
sund = bpy.data.lights.new("Sun", 'SUN'); sund.energy = 1.5; sund.color = (1.0, 0.85, 0.62); sund.angle = 6
sun = bpy.data.objects.new("Sun", sund); bpy.context.collection.objects.link(sun)
sun.location = (2.3, 2.0, 4.5); sun.rotation_euler = (math.radians(52), math.radians(12), math.radians(-28))
point("Fill", (3.2, -2.4, 3.0), (0.75, 0.85, 1.0), 160, size=3.0)
point("WinGlow", (2.3, 2.6, 2.6), (1.0, 0.9, 0.7), 450, size=2.0)
point("Warm", (-2.8, 0.5, 2.2), (1.0, 0.6, 0.35), 150, size=2.5)
point("TopWash", (0.3, 0.6, 5.6), (1.0, 0.9, 0.75), 200, size=4.0)

# ---------- animation ----------
def osc_keys(obj, prop, idx, frames_vals):
    for f, v in frames_vals:
        if prop == "location": obj.location[idx] = v
        elif prop == "rotation_euler": obj.rotation_euler[idx] = v
        elif prop == "scale": obj.scale[idx] = v
        key(obj, f, prop, idx)

# camera: desk ke kone se slow push-in (TrackTo target se rotation apne aap)
cam.location = (-2.35, -5.05, 1.98); key(cam, 1, "location")
cam.location = (-1.80, -4.05, 1.74); key(cam, 210, "location")

# agent body bob + head talk motion
for f in range(1, 211, 15):
    agent.location.z = 0.06 + 0.018 * math.sin(f / 15.0 * math.pi)
    key(agent, f, "location", 2)
agent.location.z = 0.06
osc_keys(a_hg, "rotation_euler", 0, [(1, 0.02), (35, 0.10), (70, 0.03), (105, 0.11), (140, 0.04), (175, 0.10), (210, 0.03)])
osc_keys(a_hg, "rotation_euler", 2, [(1, 0.0), (50, 0.07), (100, -0.05), (150, 0.06), (210, 0.0)])
osc_keys(a_hg, "rotation_euler", 1, [(1, 0.0), (60, -0.08), (120, 0.06), (180, -0.05), (210, 0.0)])
# agent ka muh bolte time halka khulta hai (open-mouth ellipse ki z-scale)
mv = [(1, 0.008), (8, 0.042), (14, 0.010), (20, 0.046), (27, 0.008), (45, 0.010), (52, 0.044), (59, 0.010),
      (66, 0.046), (73, 0.008), (95, 0.010), (102, 0.044), (109, 0.010), (116, 0.046), (123, 0.008),
      (145, 0.010), (152, 0.044), (159, 0.010), (166, 0.046), (173, 0.008), (195, 0.010), (202, 0.040), (210, 0.008)]
for f, v in mv:
    a_mouth.scale = (0.046, 0.016, v); key(a_mouth, f, "scale", 2)
# agent ki bhaunvein expression ke saath halki uthti hain
for s in (-1, 1):
    osc_keys(a_brows[s], "location", 2, [(1, 0.552), (40, 0.568), (80, 0.552), (120, 0.572), (160, 0.554), (210, 0.562)])
# blinks (agent + customer, alag samay par)
def blink(prefix, frames):
    for bf in frames:
        for nm in (f"{prefix}Eye-1", f"{prefix}Eye1"):
            e = bpy.data.objects[nm]
            e.scale = (0.078, 0.036, 0.094); key(e, bf - 2, "scale", 2)
            e.scale = (0.078, 0.036, 0.014); key(e, bf, "scale", 2)
            e.scale = (0.078, 0.036, 0.094); key(e, bf + 2, "scale", 2)
blink("Agent", (55, 140, 195))
blink("Cust", (85, 175))
# agent right arm gestures, left arm desk par
ra_p, ra_e = a_arms[1]; la_p, la_e = a_arms[-1]
keyrot(ra_p, 1, (math.radians(-38), 0, math.radians(10)))
keyrot(ra_p, 30, (math.radians(-78), 0, math.radians(16)))
keyrot(ra_p, 62, (math.radians(-55), 0, math.radians(26)))
keyrot(ra_p, 95, (math.radians(-95), 0, math.radians(8)))
keyrot(ra_p, 128, (math.radians(-60), 0, math.radians(30)))
keyrot(ra_p, 162, (math.radians(-85), 0, math.radians(14)))
keyrot(ra_p, 210, (math.radians(-42), 0, math.radians(10)))
keyrot(ra_e, 1, (math.radians(-25), 0, 0))
keyrot(ra_e, 45, (math.radians(-55), 0, 0))
keyrot(ra_e, 95, (math.radians(-20), 0, 0))
keyrot(ra_e, 150, (math.radians(-60), 0, 0))
keyrot(ra_e, 210, (math.radians(-28), 0, 0))
keyrot(la_p, 1, (math.radians(-52), 0, math.radians(-10)))
keyrot(la_p, 80, (math.radians(-58), 0, math.radians(-12)))
keyrot(la_p, 160, (math.radians(-50), 0, math.radians(-9)))
keyrot(la_p, 210, (math.radians(-52), 0, math.radians(-10)))
keyrot(la_e, 1, (math.radians(-38), 0, 0)); keyrot(la_e, 210, (math.radians(-38), 0, 0))
# customer: haath god me, sir hilata hai (nod)
keyrot(c_arms[1][0], 1, (math.radians(-30), 0, math.radians(8))); keyrot(c_arms[1][0], 210, (math.radians(-30), 0, math.radians(8)))
keyrot(c_arms[-1][0], 1, (math.radians(-30), 0, math.radians(-8))); keyrot(c_arms[-1][0], 210, (math.radians(-30), 0, math.radians(-8)))
keyrot(c_arms[1][1], 1, (math.radians(-50), 0, 0)); keyrot(c_arms[1][1], 210, (math.radians(-50), 0, 0))
keyrot(c_arms[-1][1], 1, (math.radians(-50), 0, 0)); keyrot(c_arms[-1][1], 210, (math.radians(-50), 0, 0))
osc_keys(c_hg, "rotation_euler", 0, [(1, 0.06), (55, 0.06), (66, 0.30), (76, 0.08), (84, 0.26), (94, 0.06),
                                     (138, 0.06), (149, 0.30), (159, 0.08), (167, 0.26), (177, 0.06), (210, 0.06)])
osc_keys(c_hg, "rotation_euler", 2, [(1, 0.03), (105, -0.03), (210, 0.03)])
for f in range(1, 211, 21):
    cust.location.z = -0.40 + 0.012 * math.sin(f / 21.0 * math.pi)
    key(cust, f, "location", 2)
cust.location.z = -0.40
# ghadi: second ki sui 3 chakkar (clockwise = +Y rotation), minute ki sui halki badhti hai
secpiv.rotation_euler = (0, 0, 0); key(secpiv, 1, "rotation_euler", 1)
secpiv.rotation_euler = (0, math.radians(360 * 3), 0); key(secpiv, 210, "rotation_euler", 1)
minpiv.rotation_euler = (0, math.radians(58), 0); key(minpiv, 1, "rotation_euler", 1)
minpiv.rotation_euler = (0, math.radians(62), 0); key(minpiv, 210, "rotation_euler", 1)
for i, c in enumerate(clouds):
    x0 = c.location.x
    c.location.x = x0 - 0.05; key(c, 1, "location", 0)
    c.location.x = x0 + 0.07; key(c, 210, "location", 0)

# ---------- render ----------
if MODE == "still":
    try: sc.eevee.taa_render_samples = 32
    except Exception: pass
    sc.render.resolution_x = 720; sc.render.resolution_y = 1280
    sc.frame_set(SF)
    sc.render.filepath = f"{B}/still2_f{SF}.png"
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
print("DONE EP9 v2", MODE)
