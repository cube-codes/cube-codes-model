/**
 * Data of a triggered {@link Event} and received by a {@link EventListener}
 */
export interface EventData {

	/**
	 * Arbitrary information added by the triggerer
	 */
	readonly source?: object
}

/**
 * Handler that receives {@link EventData} of a triggered {@link Event}
 * @typeParam E - {@link EventData} of the {@link Event} that is listened for
 */
export interface EventListener<E extends EventData> {

	/**
	 * Function call
	 * @param e - Event data that is worked on
	 */
	(e: E): void

}

/**
 * Gateway enabling to fire/trigger an event with {@link EventData} and holding registered {@link EventListener}s
 * @typeParam E - {@link EventData} of the event that is fired/listened for
 */
export class Event<E extends EventData> {

	/**
	 * List of all registered listeners for this event
	 */
	private listeners = new Array<EventListener<E>>();

	/**
	 * Fires an event and thus executes the callback function of all registered {@link EventListener}s
	 * @param eventData - Data of the triggered event
	 */
	trigger(eventData: E) {
		this.listeners.forEach(function (listener) {
			listener.apply({}, [eventData]);
		});
	}

	/**
	 * Registeres a new {@link EventListener} to the event
	 * @param listener - {@link EventListener} to be registered
	 */
	on(listener: EventListener<E>) {
		this.listeners.push(listener);
	}

}