import bpy, math, random, sys, os

B = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SCENE = argv[0] if argv else "shop"          # shop | phone
MODE = argv[1] if len(argv) > 1 else "still" # still | anim
def _int(i, d=None):
    try: return int(argv[i])
    except Exception: return d
F0 = _int(2); F1 = _int(3); SF = _int(4, 45)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

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

def tex_mat(name, path, es=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path)
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(t.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = es
    b.inputs["Roughness"].default_value = 0.9
    return m

def box(name, loc, dims, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.dimensions = dims
    if material: o.data.materials.append(material)
    return o

def cyl(name, loc, r, depth, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot)
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
    if idx is None: obj.keyframe_insert(data_path=prop, frame=frame)
    else: obj.keyframe_insert(data_path=prop, index=idx, frame=frame)

def point(name, loc, color, energy, size=2.0):
    ld = bpy.data.lights.new(name, 'POINT'); ld.color = color; ld.energy = energy; ld.shadow_soft_size = size
    o = bpy.data.objects.new(name, ld); bpy.context.collection.objects.link(o); o.location = loc
    return o

def build_character(prefix, kurta_color, pos, rotz=0.0, scale=1.25):
    char = bpy.data.objects.new(prefix, None); bpy.context.collection.objects.link(char)
    skin = mat(prefix + "Skin", (0.72, 0.47, 0.30), rough=0.65)
    kurta = mat(prefix + "Kurta", kurta_color, rough=0.8)
    pants = mat(prefix + "Pants", (0.42, 0.33, 0.26), rough=0.9)
    dark = mat(prefix + "Dark", (0.05, 0.05, 0.07), rough=0.6)
    white = mat(prefix + "White", (0.95, 0.95, 0.95), rough=0.4)
    def P(o): o.parent = char; return o
    for s in (-1, 1):
        P(cyl(f"{prefix}Leg{s}", (0.17 * s, 0, 0.55), 0.085, 1.1, pants))
        P(sph(f"{prefix}Shoe{s}", (0.17 * s, -0.07, 0.06), (0.11, 0.19, 0.07), dark))
    bpy.ops.mesh.primitive_cone_add(radius1=0.46, radius2=0.30, depth=1.15, location=(0, 0, 1.62))
    bd = bpy.context.object; bd.name = prefix + "Body"; bd.data.materials.append(kurta); P(bd)
    arms = {}
    for s in (-1, 1):
        piv = bpy.data.objects.new(f"{prefix}ArmPiv{s}", None); bpy.context.collection.objects.link(piv)
        piv.location = (0.40 * s, 0, 2.05); piv.parent = char
        sl = cyl(f"{prefix}Sleeve{s}", (0, 0, 0), 0.105, 0.42, kurta); sl.parent = piv; sl.location = (0, 0, -0.19)
        ar = cyl(f"{prefix}Arm{s}", (0, 0, 0), 0.075, 0.62, skin); ar.parent = piv; ar.location = (0, 0, -0.68)
        hd = sph(f"{prefix}Hand{s}", (0, 0, 0), (0.09, 0.09, 0.10), skin); hd.parent = piv; hd.location = (0, 0, -1.02)
        piv.rotation_euler = (0, math.radians(10 * s), 0)
        arms[s] = piv
    hg = bpy.data.objects.new(prefix + "HeadG", None); bpy.context.collection.objects.link(hg)
    hg.location = (0, 0, 2.42); hg.parent = char
    def HP(o): o.parent = hg; return o
    h = HP(sph(prefix + "Head", (0, 0, 0), (0.335, 0.315, 0.36), skin)); h.location = (0, 0, 0.18)
    hr = HP(sph(prefix + "Hair", (0, 0, 0), (0.345, 0.325, 0.30), dark)); hr.location = (0, 0.015, 0.315)
    for s in (-1, 1):
        e = HP(sph(f"{prefix}Eye{s}", (0, 0, 0), (0.052, 0.03, 0.062), white)); e.location = (0.115 * s, -0.295, 0.26)
        p = HP(sph(f"{prefix}Pup{s}", (0, 0, 0), (0.026, 0.016, 0.032), dark)); p.location = (0.115 * s, -0.318, 0.265)
        br = HP(box(f"{prefix}Brow{s}", (0, 0, 0), (0.17, 0.04, 0.03), dark)); br.location = (0.115 * s, -0.30, 0.375); br.rotation_euler = (0, 0, math.radians(-8 * s))
    mo = HP(sph(prefix + "Mouth", (0, 0, 0), (0.075, 0.02, 0.038), mat(prefix + "MouthM", (0.35, 0.08, 0.08)))); mo.location = (0, -0.315, 0.085)
    char.location = pos; char.rotation_euler = (0, 0, rotz); char.scale = (scale, scale, scale)
    return char, arms, hg

def text_obj(name, body, loc, size, color, es=0.7, rot=(math.radians(90), 0, 0)):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    o.data.body = body; o.data.size = size; o.data.align_x = 'CENTER'; o.data.align_y = 'CENTER'
    try: o.data.font = bpy.data.fonts.load("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    except Exception: pass
    m = mat(name + "M", color, emission=color, estr=es)
    o.data.materials.append(m)
    return o

sc = bpy.context.scene
try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
except Exception: sc.render.engine = 'BLENDER_EEVEE'
try: sc.eevee.taa_render_samples = 8
except Exception: pass
sc.render.resolution_x = 540; sc.render.resolution_y = 960
sc.render.fps = 24
w = bpy.data.worlds['World']; w.use_nodes = True
sc.view_settings.view_transform = 'Filmic'; sc.view_settings.look = 'Medium High Contrast'
cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 30
cam = bpy.data.objects.new("Cam", cam_d); bpy.context.collection.objects.link(cam); sc.camera = cam

if SCENE == "shop":
    sc.frame_start, sc.frame_end = 1, 91
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.03, 0.015, 0.05, 1)
    floor_m = mat("Floor", (0.10, 0.06, 0.10), rough=0.5)
    plane("Floor", (0, 3, 0), (16, 16), floor_m)
    wall_m = mat("Wall", (0.13, 0.07, 0.16), rough=0.95)
    plane("Wall", (0, 6.2, 3.4), (16, 3.4), wall_m, rot=(math.radians(90), 0, 0))
    sign_m = tex_mat("SignM", f"{B}/shop_sign.png", es=0.9)
    plane("Sign", (-1.95, 6.05, 5.5), (2.6, 0.65), sign_m, rot=(math.radians(90), 0, 0))
    shelf_m = mat("Shelf", (0.16, 0.10, 0.20), rough=0.8)
    gb_m = tex_mat("GBM", f"{B}/gamebox.png", es=0.25)
    sb_m = tex_mat("SBM", f"{B}/shelfbox.png", es=0.25)
    for lvl, z in enumerate((2.2, 3.1)):
        box(f"Shelf{lvl}", (0, 5.9, z), (6.4, 0.5, 0.09), shelf_m)
        for i in range(7):
            bx = box(f"GB{lvl}_{i}", (-2.55 + i * 0.85, 5.82, z + 0.34), (0.62, 0.4, 0.78), sb_m)
    counter_m = mat("Counter", (0.20, 0.12, 0.24), rough=0.6)
    box("Counter", (0, 1.15, 0.55), (5.2, 0.9, 1.1), counter_m)
    top_m = mat("CTop", (0.55, 0.35, 0.15), rough=0.35)
    box("CTop", (0, 1.15, 1.13), (5.4, 1.1, 0.07), top_m)
    hero, arms, hg = build_character("Hero", (0.98, 0.72, 0.05), (0, 2.1, 0), scale=1.35)
    # hero slides boxes: right arm sweeps
    ra = arms[1]
    for f, rx in [(1, -0.5), (20, -1.15), (38, -0.5), (56, -1.15), (74, -0.5), (91, -1.15)]:
        ra.rotation_euler = (math.radians(rx * 57.3 / 1.0) * 0 + rx, math.radians(10), 0)
        key(ra, f, "rotation_euler")
    for f in range(1, 92, 10):
        hero.location.z = 0.04 * math.sin(f / 10.0 * math.pi); key(hero, f, "location", 2)
    hero.location.z = 0
    # customers (backs to camera)
    cust_colors = [(0.2, 0.5, 0.9), (0.3, 0.75, 0.4)]
    for i, (cx, cc) in enumerate(zip((-2.35, 2.35), cust_colors)):
        cst, _, _ = build_character(f"C{i}", cc, (cx, -0.55, 0), rotz=math.pi, scale=1.05)
        for f in range(1, 92, 8):
            cst.location.z = 0.05 * abs(math.sin((f + i * 3) / 8.0 * math.pi)); key(cst, f, "location", 2)
        cst.location.z = 0
    # growing box stack on counter
    for i in range(5):
        bx = box(f"Stack{i}", (-1.7 + (i % 3) * 0.55, 1.15, 1.17 + (i // 3) * 0.36), (0.5, 0.34, 0.34), gb_m)
        bs = bx.scale.copy()
        f_on = 8 + i * 15
        bx.scale = (bs.x * 0.001, bs.y * 0.001, bs.z * 0.001); key(bx, max(f_on - 3, 1), "scale")
        bx.scale = (bs.x * 1.12, bs.y * 1.12, bs.z * 1.12); key(bx, f_on + 2, "scale")
        bx.scale = bs; key(bx, f_on + 5, "scale")
    # counter number (keyframed text)
    t1 = text_obj("CntLabel", "COPIES BIK GAYI", (2.05, 3.35, 5.55), 0.30, (0.6, 0.9, 1.0), es=0.5)
    vals = [(1, "0.4 CRORE"), (28, "0.9 CRORE"), (46, "1.5 CRORE"), (64, "1.9 CRORE"), (80, "2.4 CRORE")]
    for vi, (vf, txt) in enumerate(vals):
        tn = text_obj(f"CntNum{vi}", txt, (2.05, 3.35, 4.90), 0.52, (1.0, 0.77, 0.0), es=0.8)
        nxt = vals[vi + 1][0] if vi + 1 < len(vals) else 92
        if vf > 1:
            tn.scale = (0.001, 0.001, 0.001); key(tn, vf - 1, "scale")
        tn.scale = (1, 1, 1); key(tn, vf, "scale")
        if nxt <= 91:
            if nxt - 1 > vf:
                tn.scale = (1, 1, 1); key(tn, nxt - 1, "scale")
            tn.scale = (0.001, 0.001, 0.001); key(tn, nxt, "scale")
    bd_m = mat("BoardBack", (0.04, 0.03, 0.10), rough=0.7)
    box("BoardBack", (2.05, 3.52, 5.05), (3.6, 0.12, 1.6), bd_m)
    point("Key", (2.5, -3.5, 5), (1, 0.85, 0.7), 700)
    point("SignGlow", (-1.95, 4.2, 5.3), (0.2, 0.8, 1), 350)
    point("Warm", (-4, 0, 3), (1, 0.5, 0.25), 300)
    # camera: wide push-in, then fast push to board
    cam.location = (0, -8.2, 2.3); cam.rotation_euler = (math.radians(88), 0, 0)
    key(cam, 1, "location"); key(cam, 1, "rotation_euler")
    cam.location = (0.4, -6.2, 2.35); cam.rotation_euler = (math.radians(87), 0, math.radians(1))
    key(cam, 68, "location"); key(cam, 68, "rotation_euler")
    cam.location = (1.5, -4.4, 3.4); cam.rotation_euler = (math.radians(80), 0, math.radians(-3))
    key(cam, 91, "location"); key(cam, 91, "rotation_euler")

else:  # phone scene
    sc.frame_start, sc.frame_end = 1, 65
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.008, 0.004, 0.035, 1)
    glow_m = mat("Glow", (0.10, 0.02, 0.16), emission=(0.22, 0.04, 0.34), estr=0.45)
    plane("GlowBG", (0, 4.5, 2.2), (7, 7), glow_m, rot=(math.radians(90), 0, 0))
    floor_m = mat("FloorP", (0.03, 0.02, 0.07), rough=0.4)
    plane("FloorP", (0, 2, 0), (16, 16), floor_m)
    hero, arms, hg = build_character("Hero", (0.98, 0.72, 0.05), (-0.80, -0.4, 0), scale=1.38)
    # wide eyes + open mouth for the close-up look
    for nm, scv in [("HeroEye-1", (0.062, 0.034, 0.074)), ("HeroEye1", (0.062, 0.034, 0.074)),
                    ("HeroPup-1", (0.032, 0.02, 0.04)), ("HeroPup1", (0.032, 0.02, 0.04)),
                    ("HeroMouth", (0.085, 0.022, 0.062))]:
        ob = bpy.data.objects.get(nm)
        if ob: ob.scale = scv
    # left arm raised holding phone
    la = arms[-1]
    la.rotation_euler = (math.radians(-20), math.radians(-10), 0)
    ra = arms[1]
    ra.rotation_euler = (math.radians(-20), math.radians(10), 0)
    for f in range(1, 66, 8):
        hero.location.z = 0.05 * math.sin(f / 8.0 * math.pi); key(hero, f, "location", 2)
    hero.location.z = 0
    for f, rz in [(1, -0.06), (30, 0.05), (65, -0.03)]:
        hg.rotation_euler = (0, 0, rz); key(hg, f, "rotation_euler")
    # phone in left hand area
    ph = bpy.data.objects.new("Phone", None); bpy.context.collection.objects.link(ph)
    ph.location = (0.22, -1.05, 1.55); ph.rotation_euler = (math.radians(-8), math.radians(6), math.radians(10))
    body_m = mat("PhoneBody", (0.02, 0.02, 0.03), rough=0.35, metallic=0.4)
    bd = box("PhBody", (0, 0, 0), (0.78, 0.07, 1.6), body_m); bd.parent = ph
    scr_m = tex_mat("ScrM", f"{B}/phone_screen.png", es=0.75)
    sp = plane("PhScreen", (0, 0, 0), (0.36, 0.78), scr_m, rot=(math.radians(90), 0, 0)); sp.parent = ph; sp.location = (0, -0.045, 0)
    for f, esv in [(1, 0.75), (16, 1.05), (32, 0.75), (48, 1.05), (65, 0.85)]:
        scr_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = esv
        scr_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].keyframe_insert("default_value", frame=f)
    # order popups
    tick_m = tex_mat("TickM", f"{B}/order_tick.png", es=0.6)
    for i, (px, pz, f_on) in enumerate([(0.95, 2.95, 14), (0.98, 2.15, 30), (0.88, 3.60, 46)]):
        pp = plane(f"Tick{i}", (px, -1.0, pz), (0.52, 0.16), tick_m, rot=(math.radians(90), 0, math.radians(-6)))
        bs = pp.scale.copy()
        pp.scale = (bs.x * 0.001, bs.y * 0.001, bs.z * 0.001); key(pp, f_on - 2, "scale")
        pp.scale = (bs.x * 1.15, bs.y * 1.15, bs.z * 1.15); key(pp, f_on + 2, "scale")
        pp.scale = bs; key(pp, f_on + 5, "scale")
        f_out = (48, 50, 56)[i]
        pp.scale = bs; key(pp, f_out, "scale")
        pp.scale = (bs.x * 0.001, bs.y * 0.001, bs.z * 0.001); key(pp, f_out + 4, "scale")
    point("FaceKey", (-0.5, -4.5, 3.5), (1, 0.9, 0.8), 500, size=3.0)
    point("PhoneGlow", (0.8, -2.2, 2.0), (1, 0.25, 0.6), 260)
    point("Rim", (3.5, 1.5, 3), (0.2, 0.7, 1), 320)
    # camera: medium -> push into phone screen
    cam.location = (0.0, -7.2, 2.25); cam.rotation_euler = (math.radians(87.5), 0, 0)
    key(cam, 1, "location"); key(cam, 1, "rotation_euler")
    cam.location = (0.28, -4.0, 1.9); cam.rotation_euler = (math.radians(85), 0, math.radians(2))
    key(cam, 65, "location"); key(cam, 65, "rotation_euler")

if F0 is not None: sc.frame_start = F0
if F1 is not None: sc.frame_end = F1
bpy.ops.wm.save_as_mainfile(filepath=f"{B}/scene_{SCENE}.blend")
if MODE == "still":
    sc.frame_set(SF)
    sc.render.filepath = f"{B}/still_{SCENE}.png"
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = f"{B}/frames/{SCENE}_"
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(animation=True)
print("DONE", SCENE, MODE)
