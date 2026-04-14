/** 손가락 슬라이더 순서 (엄지 → 소지) */
export const FINGER_ORDER = ["thumb", "index", "middle", "ring", "pinky"];

/** Blender 스크립트에서 생성한 본 이름 (Bone_<Finger>_<1..3>) */
export const BONE_NAMES = {
  thumb: ["Bone_Thumb_1", "Bone_Thumb_2", "Bone_Thumb_3"],
  index: ["Bone_Index_1", "Bone_Index_2", "Bone_Index_3"],
  middle: ["Bone_Middle_1", "Bone_Middle_2", "Bone_Middle_3"],
  ring: ["Bone_Ring_1", "Bone_Ring_2", "Bone_Ring_3"],
  pinky: ["Bone_Pinky_1", "Bone_Pinky_2", "Bone_Pinky_3"],
};

/**
 * 굽힘 축·부호·마디별 최대 라디안.
 * GLB 축이 기대와 다르면 axis / sign / maxRad만 조정하면 됨.
 */
export const FLEX_CONFIG = {
  thumb: { axis: "x", sign: -1, maxRad: [0.55, 0.72, 0.82] },
  index: { axis: "z", sign: 1, maxRad: [0.75, 0.95, 1.05] },
  middle: { axis: "z", sign: 1, maxRad: [0.78, 0.98, 1.08] },
  ring: { axis: "z", sign: 1, maxRad: [0.72, 0.92, 1.02] },
  pinky: { axis: "z", sign: 1, maxRad: [0.68, 0.88, 0.98] },
};

export const INITIAL_FINGER_VALUES = Object.fromEntries(
  FINGER_ORDER.map((k) => [k, 0]),
);
