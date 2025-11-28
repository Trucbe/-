export enum ShapeType {
  SPHERE = 'Sphere',
  HEART = 'Heart',
  SATURN = 'Saturn',
  FLOWER = 'Flower',
  TORUS = 'Torus'
}

export interface ParticleConfig {
  color: string;
  size: number;
  count: number;
  shape: ShapeType;
}

export type HandGestureState = {
  isTracking: boolean;
  handDistance: number; // 0.0 to 1.0 (normalized)
  handsDetected: number;
};
