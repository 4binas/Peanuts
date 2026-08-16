import { createContext } from 'svelte';
import type { getGroupById } from '../group.remote';

export type Group = Awaited<ReturnType<typeof getGroupById>>;

export const [getGroup, setGroup] = createContext<() => Group | undefined>();
