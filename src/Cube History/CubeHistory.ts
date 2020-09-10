import { Cube } from "../Cube/Cube";
import { Event, EventData } from "../Utilities/Event";
import { CubeMove } from "../Cube/CubeMove";
import { CubeState } from "../Cube/CubeState";

/**
 * Change of a {@link Cube}'s {@link CubeState} possibly through a {@link CubeMove} that is recorded by the {@link CubeHistory}
 */
export interface CubeHistoryChange {

	/**
	 * {@link CubeState} before the change
	 */
	readonly oldState: CubeState

	/**
	 * {@link CubeState} after the change
	 */
	readonly newState: CubeState

	/**
	 * Possible {@link CubeMove} while changing the {@link CubeState}
	 */
	readonly move?: CubeMove
}

/**
 * Data describing the event of moving within the {@link CubeHistory}
 */
export interface CubeHistoryMoved extends EventData {

	/**
	 * Current position within the {@link CubeHistory} before the move
	 */
	readonly from: number

	/**
	 * Signed count of {@link CubeHistoryChange}s within the {@link CubeHistory} that are stepped over by the move (= to - from)
	 */
	readonly by: number

	/**
	 * Current position within the {@link CubeHistory} after the move
	 */
	readonly to: number
}

/**
 * Data describing the event of recording a new {@link CubeHistoryChange} within the {@link CubeHistory}
 */
export interface CubeHistoryRecorded extends EventData {

	/**
	 * {@link CubeHistoryChange} that was recorded 
	 */
	readonly change: CubeHistoryChange

	/**
	 * Index of the newly recorded {@link CubeHistoryChange} within the {@link CubeHistory} and the new current position
	 */
	readonly position: number
}

/**
 * Data describing the event of cleaning some past of {@link CubeHistoryChange}s within the {@link CubeHistory}
 * 
 * The initial state was set to the final state after this past and was marked as the current position if the former was removed.
 */
export interface CubeHistoryPastCleaned extends EventData {

	/**
	 * Index of the {@link CubeHistoryChange}s within the {@link CubeHistory} that the cleaning ends with (this and all previous changes were removed)
	 */
	readonly to: number
}

/**
 * Data describing the event of cleaning some future of {@link CubeHistoryChange}s within the {@link CubeHistory}
 * 
 * The state before this future was marked as the current position if the former was removed.
 * 
 * This can happen when a new {@link CubeHistoryChange} is recorded while the current position of the {@link CubeHistory} is not at its end. As the history cannot hold multiple branches the old one has to be removed.
 */
export interface CubeHistoryFutureCleaned extends EventData {

	/**
	 * Index of the {@link CubeHistoryChange}s within the {@link CubeHistory} that the cleaning starts from (this and all further changes were removed)
	 */
	readonly from: number
}

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
			if (this.changes.length !== newChangeIndex) {
				this.cleanFutureFrom(newChangeIndex);
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
	 * Removes the {@link CubeHistoryChange}s up until inclusivly a specified position
	 * 
	 * The initial state is set to the final state after this past and is marked as the current position if the former was removed.
	 * @param position - Position up until inclusivly the history is removed
	 */
	cleanPastTo(position: number): void {

		if (!Number.isInteger(position) || position < 0 || position > this.changes.length - 1) throw 'Invalid position';

		this.initialState = this.getChangeByPosition(position).newState;

		this.changes.splice(0, position + 1);

		if (this.currentPosition <= position) {
			this.currentPosition = -1;
		}

		this.pastCleaned.trigger({ to: position });

	}

	/**
	 * Removes the {@link CubeHistoryChange}s from down inclusivly a specified position
	 * 
	 * The position before that future is marked as the current position if the former was removed.
	 * @param position - Position from down inclusivly the history is removed
	 */
	cleanFutureFrom(position: number): void {

		if (!Number.isInteger(position) || position < 0 || position > this.changes.length - 1) throw 'Invalid position';

		this.changes.splice(position, this.changes.length - position);

		if (this.currentPosition >= position) {
			this.currentPosition = position - 1;
		}

		this.futureCleaned.trigger({ from: position });

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