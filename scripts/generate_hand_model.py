# -*- coding: utf-8 -*-
"""
플레밍 왼손 법칙 도식용 3D 화살표 + 라벨 생성 후 GLB로 내보내기.

[실행 방법 — Blender 3.x / 4.x]
1. Blender 실행 → 상단 메뉴 [Scripting] 워크스페이스로 이동.
2. [Text] 에디터에서 [New] → 이 파일 전체를 붙여 넣거나,
   [File] → [Open] 으로 이 스크립트를 연 뒤 [Run Script] (또는 Alt+P) 실행.
3. 또는 터미널에서 배치(헤드리스) 실행 예시:
   blender --background --python "C:/경로/elecric_fronend/scripts/generate_hand_model.py"

생성물: <프로젝트 루트>/public/models/flemings_left_hand.glb
"""

from __future__ import annotations

import bpy
from mathutils import Vector

# --- 출력 경로 (이 스크립트 기준 elecric_fronend 루트) ---
import pathlib

_SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
_PROJECT_FRONT = _SCRIPT_DIR.parent
_OUT_PATH = _PROJECT_FRONT / "public" / "models" / "flemings_left_hand.glb"


def _clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)
    for block in bpy.data.curves:
        bpy.data.curves.remove(block)


def _solid_material(name: str, color_rgba: tuple[float, float, float, float]):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color_rgba
        bsdf.inputs["Roughness"].default_value = 0.38
        bsdf.inputs["Metallic"].default_value = 0.05
    return mat


def _join_objects(objects: list[bpy.types.Object]) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    return bpy.context.active_object


def _create_shaft_cone_along_z(
    mat: bpy.types.Material,
    shaft_len: float = 2.4,
    shaft_radius: float = 0.11,
    cone_h: float = 0.42,
) -> bpy.types.Object:
    """+Z 방향으로 뻗는 실린더+원뿔 (원점에서 시작)."""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=shaft_radius,
        depth=shaft_len,
        location=(0.0, 0.0, shaft_len * 0.5),
    )
    shaft = bpy.context.active_object
    bpy.ops.mesh.primitive_cone_add(
        radius1=shaft_radius * 2.15,
        radius2=0.0,
        depth=cone_h,
        location=(0.0, 0.0, shaft_len + cone_h * 0.5),
    )
    cone = bpy.context.active_object
    for obj in (shaft, cone):
        if len(obj.data.materials) == 0:
            obj.data.materials.append(mat)
        else:
            obj.data.materials[0] = mat
    return _join_objects([shaft, cone])


def _orient_mesh_z_to(mesh: bpy.types.Object, direction: Vector) -> None:
    """메쉬의 국소 +Z 축이 `direction`(월드)을 향하도록 회전을 굽힌 뒤 적용."""
    z = Vector((0.0, 0.0, 1.0))
    d = direction.normalized()
    q = z.rotation_difference(d)
    mesh.rotation_euler = q.to_euler()
    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.transform_apply(rotation=True)


def _add_korean_label(
    text: str,
    offset: Vector,
    text_mat: bpy.types.Material,
    text_scale: float = 0.55,
    extrude: float = 0.045,
) -> bpy.types.Object:
    """화살표 끝 근처에 3D 텍스트 (한글 폰트는 OS에 따라 기본 폰트가 비어 있을 수 있음)."""
    bpy.ops.object.text_add(location=offset)
    tobj = bpy.context.active_object
    td = tobj.data
    assert isinstance(td, bpy.types.TextCurve)
    td.body = text
    td.align_x = "CENTER"
    td.align_y = "CENTER"
    td.extrude = extrude
    tobj.scale = (text_scale, text_scale, text_scale)
    if len(tobj.data.materials) == 0:
        tobj.data.materials.append(text_mat)
    else:
        tobj.data.materials[0] = text_mat
    return tobj


def _parent_keep_transform(child: bpy.types.Object, parent: bpy.types.Object) -> None:
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def _build_arrow_with_label(
    pivot_name: str,
    mesh_name: str,
    label_name: str,
    direction: Vector,
    rgb: tuple[float, float, float],
    label_text: str,
    label_offset_scale: float = 1.12,
) -> bpy.types.Object:
    """
    빈(Empty) `pivot_name`을 루트로 하고, 자식에 화살표 메쉬(`mesh_name`)와 라벨(`label_name`)을 둡니다.
    React에서는 Pivot을 회전하면 라벨·화살표가 함께 움직입니다.
    """
    mat_arrow = _solid_material(f"Mat_{mesh_name}_arrow", (*rgb, 1.0))
    mat_label = _solid_material(
        f"Mat_{mesh_name}_label",
        (max(rgb[0] * 0.35, 0.08), max(rgb[1] * 0.35, 0.08), max(rgb[2] * 0.35, 0.08), 1.0),
    )

    arrow = _create_shaft_cone_along_z(mat_arrow)
    arrow.name = mesh_name
    _orient_mesh_z_to(arrow, direction)

    d = direction.normalized()
    # 화살표 총 길이(실린더+원뿔) + 라벨 여백 — `_create_shaft_cone_along_z` 기본값과 일치시킬 것
    tip_dist = 2.4 + 0.42 + 0.35
    label_pos = d * tip_dist * label_offset_scale
    label = _add_korean_label(label_text, label_pos, mat_label)

    z_up = Vector((0.0, 0.0, 1.0))
    q_label = z_up.rotation_difference(d)
    label.rotation_euler = q_label.to_euler()
    label.name = label_name

    bpy.ops.object.empty_add(type="PLAIN_AXES", radius=0.04, location=(0.0, 0.0, 0.0))
    root = bpy.context.active_object
    root.name = pivot_name

    _parent_keep_transform(arrow, root)
    _parent_keep_transform(label, root)

    return root


def main() -> None:
    _clear_scene()

    # 엄지 F: +Z / 검지 B: +Y / 중지 I: +X  (블렌더 오른손 좌표)
    vec_f = Vector((0.0, 0.0, 1.0))
    vec_b = Vector((0.0, 1.0, 0.0))
    vec_i = Vector((1.0, 0.0, 0.0))

    _build_arrow_with_label("Pivot_F", "Arrow_F", "Label_F", vec_f, (0.92, 0.18, 0.16), "힘 (F)")
    _build_arrow_with_label("Pivot_B", "Arrow_B", "Label_B", vec_b, (0.15, 0.45, 0.95), "자계 (B)")
    _build_arrow_with_label("Pivot_I", "Arrow_I", "Label_I", vec_i, (0.12, 0.72, 0.28), "전류 (I)")

    # 단위 보조선(선택)
    bpy.ops.object.empty_add(type="PLAIN_AXES", radius=0.18, location=(0.0, 0.0, 0.0))
    bpy.context.active_object.name = "Origin"

    _OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Blender 5.x: 일부 키워드(예: export_colors)가 제거됨 — 최소 인자만 사용
    bpy.ops.export_scene.gltf(
        filepath=str(_OUT_PATH),
        export_format="GLB",
        export_apply=True,
        use_selection=False,
        export_materials="EXPORT",
    )
    print(f"[완료] GLB 저장: {_OUT_PATH}")


if __name__ == "__main__":
    main()
