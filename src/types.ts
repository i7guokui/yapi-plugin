import { JSX } from "solid-js";

export type EventWithElement<T extends HTMLElement, E extends Event = Event> = Parameters<JSX.EventHandler<T, E>>[0]