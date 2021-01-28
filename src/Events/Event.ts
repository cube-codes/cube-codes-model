import { EventData } from "./EventData";
import { EventListener } from "./EventListener";

/**
 * Gateway enabling to fire/trigger an event with {@link EventData} and holding registered {@link EventListener}s
 * @typeParam E - {@link EventData} of the event that is fired/listened for
 */
export class Event<E extends EventData> {

	/**
	 * List of all registered listeners for this event
	 */
	#listeners = new Array<EventListener<E>>();

	/**
	 * Fires an event and thus executes the callback function of all registered {@link EventListener}s
	 * @param eventData - Data of the triggered event
	 */
	trigger(eventData: E): void {
		this.#listeners.forEach(listener => listener.apply({}, [eventData]));
	}

	/**
	 * Registeres a new {@link EventListener} to the event
	 * @param listener - {@link EventListener} to be registered
	 */
	on(listener: EventListener<E>): void {
		this.#listeners.push(listener);
	}

}