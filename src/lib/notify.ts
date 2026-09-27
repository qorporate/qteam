import { toast } from 'svelte-sonner';

const CONFIRM_TOAST_ID = 'confirm-action';
let settlePending: ((confirmed: boolean) => void) | undefined;

/**
 * Ask for confirmation in an action toast. Resolves false when the user cancels or dismisses it,
 * or when a newer confirmation replaces it.
 */
export function confirmAction({
	title,
	description,
	actionLabel,
	destructive = false
}: {
	title: string;
	description?: string;
	actionLabel: string;
	destructive?: boolean;
}): Promise<boolean> {
	settlePending?.(false);

	return new Promise((resolve) => {
		let settled = false;
		const settle = (confirmed: boolean) => {
			if (settled) return;
			settled = true;
			if (settlePending === settle) settlePending = undefined;
			resolve(confirmed);
		};
		settlePending = settle;

		toast(title, {
			id: CONFIRM_TOAST_ID,
			description,
			duration: Number.POSITIVE_INFINITY,
			action: { label: actionLabel, onClick: () => settle(true) },
			cancel: { label: 'Cancel', onClick: () => settle(false) },
			onDismiss: () => settle(false),
			classes: destructive ? { actionButton: 'bg-danger! hover:bg-danger/90!' } : undefined
		});
	});
}
