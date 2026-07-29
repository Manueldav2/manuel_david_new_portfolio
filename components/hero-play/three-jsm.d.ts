/**
 * three r170 ships RoundedBoxGeometry as an untyped example module. We use it
 * (rather than drei) so the /3 hero pulls zero extra dependencies for its
 * geometry: it lives inside the `three` package we already load.
 */
declare module "three/examples/jsm/geometries/RoundedBoxGeometry.js" {
  import { BoxGeometry } from "three";
  export class RoundedBoxGeometry extends BoxGeometry {
    constructor(
      width?: number,
      height?: number,
      depth?: number,
      segments?: number,
      radius?: number
    );
  }
}
