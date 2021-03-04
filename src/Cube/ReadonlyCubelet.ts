import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubePart } from "../Cube Geometry/CubePart";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { Printable } from "../Interface/Printable";
import { Cube } from "./Cube";
import { CubeletLocation } from "./CubeletLocation";
import { CubeletOrientation } from "./CubeletOrientation";

export interface ReadonlyCubelet extends Printable {

	readonly cube: Cube

	readonly initialLocation: CubeletLocation

	readonly initialPart: CubePart

	readonly initialOrientation: CubeletOrientation

	readonly currentLocation: CubeletLocation

	readonly currentPart: CubePart

	readonly currentOrientation: CubeletOrientation

	readonly solvedLocation: CubeletLocation

	readonly solvedPart: CubePart

	readonly solvedOrientation: CubeletOrientation

	readonly type: CubePartType

	isSolved(): boolean

	getColorAt(currentFace: CubeFace): CubeFace

}