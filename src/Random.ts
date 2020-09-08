/**
 * Provides utility functions for randome numbers
 */
export namespace Random {

	/**
	 * Generates a random integer in the range of [from, toExclusivly)
	 * @param from - Left boundary
	 * @param toExclusivly - Right boundary
	 * @returns Generated random integer
	 */
	export function randomIntegerFromToExclusivly(from: number, toExclusivly: number): number {
		if(!Number.isInteger(from)) throw new Error(`Left boundary is no integer: ${from}`);
		if(!Number.isInteger(toExclusivly)) throw new Error(`Right boundary is no integer: ${toExclusivly}`);
		const difference = toExclusivly - from;
		return from + Math.floor(Math.random() * difference);
	}

	/**
	 * Generates a random integer in the range of [0, toExclusivly)
	 * @param toExclusivly - Right boundary
	 * @returns Generated random integer
	 */
	export function randomIntegerToExclusivly(toExclusivly: number): number {
		return Random.randomIntegerFromToExclusivly(0, toExclusivly);
	}

	/**
	 * Generates a random integer in the range of [from, toInclusivly]
	 * @param from - Left boundary
	 * @param toInclusivly - Right boundary
	 * @returns Generated random integer
	 */
	export function randomIntegerFromToInclusivly(from: number, toInclusivly: number): number {
		return Random.randomIntegerFromToExclusivly(from, toInclusivly + 1);
	}

	/**
	 * Generates a random integer in the range of [0, toInclusivly]
	 * @param toInclusivly - Right boundary
	 * @returns Generated random integer
	 */
	export function randomIntegerToInclusivly(toInclusivly: number): number {
		return Random.randomIntegerFromToExclusivly(0, toInclusivly + 1);
	}

}