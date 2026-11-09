'use client';
export {Dialog as Sheet, DialogTitle as SheetTitle, DialogDescription as SheetDescription, DialogClose as SheetClose} from './dialog';
import type {ComponentProps} from 'react';
import {DialogContent} from './dialog';

/** Side panel variant of the dialog, used for the mobile menu. */
export function SheetContent(props: Omit<ComponentProps<typeof DialogContent>, 'variant'>) {
  return <DialogContent {...props} variant="sheet" />;
}
