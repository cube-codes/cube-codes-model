import { CubeState } from "../Cube State/CubeState"
import { Cube } from "../Cube/Cube"
import { Event } from "../Events/Event"
import { CubeHistoryChange } from "./CubeHistoryChange"
import { CubeHistoryFutureCleaned } from "./CubeHistoryFutureCleaned"
import { CubeHistoryMoved } from "./CubeHistoryMoved"
import { CubeHistoryPastCleaned } from "./CubeHistoryPastCleaned"
import { CubeHistoryRecorded } from "./CubeHistoryRecorded"

/**
 * History holding all changes to one specific {@link Cube}
 * 
 * Each {@link CubeHistoryChange} describes a recorded change of the {@link CubeState}. They are kept in an ordered list and the first {@link CubeHistoryChange} (position = 0) describes the change away from the initial {@link CubeState} when the history was created, while position = -1 stands for this initial state.
 * As it is possible to move around within the history, the current position denotes the index within the list of the {@link CubeHistoryChange} that lead to the current {@link CubeState}.
 * While moving around changes this current position, the specified {@link Cube} is updated accordingly. E.g. moving backwards will play the inverse of possible {@link CubeMove}s of the {@link CubeHistoryChange}s on the {@link Cube}, too.
 * 
 * The history can be cleaned either from the beginning up to a position or from one on until the end.
 * 
 * Beeing a simple list of {@link CubeHistoryChange}s the history cannot keep multiple different branches. That's why before a new {@link CubeHistoryChange} is recorded while the current position is not at the end of the list, the old future has to be removed/cleaned.
 * 
 * As the history must differentiate changes of the {@link CubeState} that are based on moves within the history on the one side and real new changes to be recorded on the other side, the history sets a number-property 'history' in the 'source' parameter of the {@link Cube}'s commands (denoting the jump in the list) to tell apart these two cases when listening to changes of the {@link CubeState}.
 */
export class CubeHistory {

	/**
	 * Event of moving within the {@link CubeHistory}
	 * @event
	 */
	readonly moved = new Event<CubeHistoryMoved>()

	/**
	 * Event of recording a new {@link CubeHistoryChange} within the {@link CubeHistory}
	 * @event
	 */
	readonly recorded = new Event<CubeHistoryRecorded>()

	/**
	 * Event of cleaning the past of {@link CubeHistoryChange}s within the {@link CubeHistory}
	 * @event
	 */
	readonly pastCleaned = new Event<CubeHistoryPastCleaned>()

	/**
	 * Event of cleaning the future of {@link CubeHistoryChange}s within the {@link CubeHistory}
	 * @event
	 */
	readonly futureCleaned = new Event<CubeHistoryFutureCleaned>()

	/**
	 * {@link Cube} that is listened on for {@link CubeHistoryChange}s of its {@link CubeState}
	 */
	private readonly cube: Cube

	/**
	 * Initial {@link CubeState} when the history started to listen on the {@link Cube}
	 */
	private initialState: CubeState

	/**
	 * List of recorded {@link CubeHistoryChange}s describing changes of the {@link Cube}'s {@link CubeState}s
	 */
	private readonly changes: Array<CubeHistoryChange>

	/**
	 * Current position within the history and index of the {@link CubeHistoryChange} within the list that lead to the current {@link Cube}'s {@link CubeState}
	 */
	private currentPosition: number

	/**
	 * Constructs a new history listening to the changes of the {@link CubeState} of the specified {@link Cube}, starting with a empty list of {@link CubeHistoryChange}s and a current position = -1
	 * @param cube - {@link Cube} this history is listening on
	 * @returns Newly created history
	 */
	constructor(cube: Cube) {

		this.cube = cube
		this.initialState = this.cube.getState();
		this.changes = new Array();
		this.currentPosition = -1;

		this.cube.stateChanged.on(e => {

			// If the change was triggered by the history, do not record but move only
			if (e.source && typeof e.source.history === 'number') {
				const oldChangeIndex = this.currentPosition;
				this.currentPosition += e.source.history;
				this.moved.trigger({ from: oldChangeIndex, by: e.source.history, to: this.currentPosition });
				return;
			}

			const newChangeIndex = this.currentPosition + 1;

			// If we are currently not at the end, clean/remove the history ahead of us
			if(this.changes.length !== newChangeIndex) {
				this.cleanFutureAfter(this.currentPosition);
			}

			// Record change and move
			const newChange: CubeHistoryChange = { oldState: e.oldState, newState: e.newState, move: e.move };
			this.changes.push(newChange);
			this.recorded.trigger({ change: newChange, position: newChangeIndex });
			const oldChangeIndex = this.currentPosition;
			this.currentPosition = newChangeIndex;
			this.moved.trigger({ from: oldChangeIndex, by: 1, to: this.currentPosition });

		});

	}

	/**
	 * Whether the current position is at the beginning of the history (= -1)
	 * @returns (explanation above)
	 */
	isAtStart(): boolean {
		return this.currentPosition <= -1;
	}

	/**
	 * Whether the current position is at the end of the history (= list length - 1)
	 * @returns (explanation above)
	 */
	isAtEnd(): boolean {
		return this.currentPosition >= this.changes.length - 1;
	}

	/**
	 * Reads the current position within the history
	 * @returns (explanation above)
	 */
	getCurrentPosition(): number {
		return this.currentPosition;
	}

	/**
	 * Reads the last {@link CubeHistoryChange} leading historically to the current {@link Cube}'s {@link CubeState}
	 * @returns (explanation above)
	 */
	getLastChange(): CubeHistoryChange {
		return this.changes[this.currentPosition];
	}

	/**
	 * Reads the {@link CubeHistoryChange} that lead historically to the {@link Cube}'s {@link CubeState} of the specified position
	 * @param position - Position of the {@link CubeState} whoose creating {@link CubeHistoryChange} is read
	 * @returns (explanation above)
	 */
	getChangeByPosition(position: number): CubeHistoryChange {

		if (!Number.isInteger(position) || position < 0 || position > this.changes.length - 1) throw 'Invalid position';

		return this.changes[position];

	}

	/**
	 * Removes the {@link CubeHistoryChange}s up until exclusivly a specified position
	 * 
	 * The initial state is set to the final state of "position" and is marked as the current position if the former was removed.
	 * @param position - Position up until exclusivly the history is removed
	 */
	cleanPastBefore(position: number) {

		if(!Number.isInteger(position) || position < -1 || position > this.changes.length - 1) throw 'Invalid position';
	
		if(position <= -1) return;

		this.initialState = this.getChangeByPosition(position).newState;

		this.changes.splice(0, position + 1);

		if (this.currentPosition <= position) {
			this.currentPosition = -1;
		}

		this.pastCleaned.trigger({before: position});

	}

	/**
	 * Removes the {@link CubeHistoryChange}s from down exclusivly a specified position
	 * 
	 * "positon" is marked as the current position if the former was removed.
	 * @param position - Position from down exclusivly the history is removed
	 */
	cleanFutureAfter(position: number) {

		if(!Number.isInteger(position) || position < -1 || position > this.changes.length - 1) throw 'Invalid position';

		this.changes.splice(position + 1, this.changes.length - position - 1);

		if(this.currentPosition > position) {
			this.currentPosition = position;
		}

		this.futureCleaned.trigger({after: position});

	}

	/**
	 * Executes the inverse of the last {@link CubeHistoryChange} within the history with a {@link CubeMove}
	 */
	stepBack(): void {

		if (this.isAtStart()) throw new Error('Cannot go back further');

		const currentChange = this.changes[this.currentPosition];
		if (currentChange.move) {
			this.cube.move(currentChange.move.getInverse(), {
				history: -1
			});
		} else {
			this.cube.setState(currentChange.oldState, {
				history: -1
			});
		}

	}

	/**
	 * Executes the next {@link CubeHistoryChange} within the history with a {@link CubeMove}
	 */
	stepAhead(): void {

		if (this.isAtEnd()) throw new Error('Cannot go ahead further');

		const nextChange = this.changes[this.currentPosition + 1];
		if (nextChange.move) {
			this.cube.move(nextChange.move, {
				history: 1
			});
		} else {
			this.cube.setState(nextChange.newState, {
				history: 1
			});
		}

	}

	/**
	 * Jumps back the initial position (= -1) within the history and updates the {@link Cube}'s {@link CubeState} without a {@link CubeMove} (setState)
	 */
	jumpToStart(): void {

		if (this.currentPosition <= -1) return;

		this.cube.setState(this.initialState, {
			history: -this.currentPosition - 1
		});

	}

	/**
	 * Jumps ahead the final position (= list length - 1) within the history and updates the {@link Cube}'s {@link CubeState} without a {@link CubeMove} (setState)
	 */
	jumpToEnd(): void {

		if (this.currentPosition >= this.changes.length - 1) return;

		if (this.changes.length === 0) {
			return;
		}

		const lastChange = this.changes[this.changes.length - 1];
		this.cube.setState(lastChange.newState, {
			history: this.changes.length - 1 - this.currentPosition
		});

	}

	/**
	 * Jumps to the specified position within the history and updates the {@link Cube}'s {@link CubeState} without a {@link CubeMove} (setState)
	 */
	jumpToIndex(newPosition: number): void {

		if (!Number.isInteger(newPosition) || newPosition < -1 || newPosition > this.changes.length - 1) throw new Error(`Invalid position: ${newPosition}`);

		if (newPosition === -1) {
			this.jumpToStart();
			return;
		}

		const newChange = this.changes[newPosition];
		this.cube.setState(newChange.newState, {
			history: newPosition - this.currentPosition
		});

	}

}