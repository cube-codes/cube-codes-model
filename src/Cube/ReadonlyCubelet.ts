import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { Printable } from "../Interface/Printable";
import { Cube } from "./Cube";
import { CubeletLocation } from "./CubeletLocation";
import { CubeletOrientation } from "./CubeletOrientation";

export interface ReadonlyCubelet extends Printable {

	readonly cube: Cube

	readonly initialLocation: CubeletLocation

	readonly currentLocation: CubeletLocation

	readonly currentOrientation: CubeletOrientation

	readonly type: CubePartType

	isSolved(): boolean

	getSolvedLocation(): CubeletLocation;

	getColorAt(currentFace:CubeFace):CubeFace;
}