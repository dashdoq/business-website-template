'use client';
import type {ComponentProps, ReactNode} from 'react';
import {Dialog as DialogPrimitive} from 'radix-ui';
import {X} from 'lucide-react';
import {useTranslation} from '@/app/i18n';

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

type ContentProps = ComponentProps<typeof DialogPrimitive.Content> & {children: ReactNode; variant?: 'panel' | 'sheet' | 'media'};

/** Accessible modal built on Radix Dialog; styling lives in app/styles/components.css. */
export function DialogContent({className = '', children, variant = 'panel', ...props}: ContentProps) {
  const t = useTranslation();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content className={`dialog dialog--${variant} ${className}`} {...props}>
        {children}
        <DialogPrimitive.Close className="dialog-close icon-button">
          <X size={20} aria-hidden="true" />
          <span className="sr-only">{t('Close')}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
