import { postEdgeFunction } from '@/lib/edgeFunction';

export type FeedbackKind = 'destek' | 'oneri';

export interface FeedbackInput {
  kind: FeedbackKind;
  message: string;
  contact: string;
}

export async function submitFeedback({ kind, message, contact }: FeedbackInput): Promise<void> {
  try {
    await postEdgeFunction('send-feedback', {
      kind,
      message: message.trim(),
      contact: contact.trim(),
    });
  } catch {
    throw new Error('Mesajınız gönderilemedi. Lütfen tekrar deneyin.');
  }
}
