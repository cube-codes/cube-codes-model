import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { CubeMoveAngle } from "./CubeMoveAngle";
import { CubeMoveExporter } from "./CubeMoveExporter";

export class CubeMoveExport {

	constructor(readonly spec: string,
	readonly face: string,
	readonly sliceStart: number,
	readonly sliceCount: number,
	readonly angle: number) {}

}

export class CubeMove implements Exportable, Equalizable<CubeMove>, Printable {

	constructor(readonly spec: CubeSpecification,
		readonly face: CubeFace,
		readonly sliceStart: number,
		readonly sliceCount: number,
		readonly angle: number | CubeMoveAngle) {
		if (!Number.isInteger(sliceStart) || sliceStart < 1 || sliceStart > this.spec.edgeLength) throw 'Invalid slice start';
		if (!Number.isInteger(sliceCount) || sliceCount < 0 || sliceStart + sliceCount - 1 > this.spec.edgeLength) throw 'Invalid slice count';
		if (!Number.isInteger(angle)) throw 'Invalid angel';
	}

	static import(value: string): CubeMove {
		const exportValue = JSON.parse(value) as CubeMoveExport;
		return new CubeMove(CubeSpecification.import(exportValue.spec), CubeFace.import(exportValue.face), exportValue.sliceStart, exportValue.sliceCount, exportValue.angle);
	}

	export(): string {
		return JSON.stringify(new CubeMoveExport(this.spec.export(), this.face.export(), this.sliceStart, this.sliceCount, this.angle));
	}

	equals(other: CubeMove): boolean {
		return this.spec.equals(other.spec) && this.face.equals(other.face) && this.sliceStart === other.sliceStart && this.sliceCount === other.sliceCount && this.angle === other.angle;
	}

	toString(): string {
		const cubeMoveExporter = new CubeMoveExporter(this.spec);
		return `${cubeMoveExporter.stringify([this])}`;
	}

	getInverse(): CubeMove {
		return new CubeMove(this.spec, this.face, this.sliceStart, this.sliceCount, -this.angle);
	}

}