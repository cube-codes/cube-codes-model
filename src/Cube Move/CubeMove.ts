import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { CubeMoveAngle } from "./CubeMoveAngle";

export class CubeMoveExport {

	constructor(readonly face: number,
		readonly sliceStart: number,
		readonly sliceEnd: number,
		readonly angle: number) { }

}

export class CubeMove implements Exportable<CubeMoveExport>, Equalizable<CubeMove>, Printable {

	constructor(spec: CubeSpecification,
		readonly face: CubeFace,
		readonly sliceStart: number,
		readonly sliceEnd: number,
		readonly angle: number | CubeMoveAngle) {
		if (!Number.isInteger(sliceStart) || sliceStart < 1 || sliceStart > spec.edgeLength) throw 'Invalid slice start';
		if (!Number.isInteger(sliceEnd) || sliceEnd < sliceStart || sliceEnd > spec.edgeLength) throw 'Invalid slice end';
		if (!Number.isInteger(angle)) throw 'Invalid angel';
	}

	static import(spec: CubeSpecification, value: CubeMoveExport): CubeMove {
		return new CubeMove(spec, CubeFace.import(value.face), value.sliceStart, value.sliceEnd, value.angle);
	}

	export(): CubeMoveExport {
		return new CubeMoveExport(this.face.export(), this.sliceStart, this.sliceEnd, this.angle);
	}

	equals(other: CubeMove): boolean {
		return this.face.equals(other.face) && this.sliceStart === other.sliceStart && this.sliceEnd === other.sliceEnd && this.angle === other.angle;
	}

	toString(): string {
		//TODO: ???
		return '';
	}

	getInverse(spec: CubeSpecification): CubeMove {
		return new CubeMove(spec, this.face, this.sliceStart, this.sliceEnd, -this.angle);
	}

}