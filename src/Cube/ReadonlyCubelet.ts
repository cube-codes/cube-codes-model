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

	getInitialPart():CubePart; //those also contain all colors

	readonly currentLocation: CubeletLocation

	getCurrentPart():CubePart; 

	readonly currentOrientation: CubeletOrientation

	readonly type: CubePartType

	isSolved(): boolean

	getSolvedLocation(): CubeletLocation;

	getSolvedPart():CubePart;
	
	getColorAt(currentFace:CubeFace):CubeFace;
}