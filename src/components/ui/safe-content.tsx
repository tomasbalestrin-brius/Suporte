import { sanitizeText } from '@/lib/sanitize';

interface SafeContentProps {
  content: string;
  className?: string;
  preserveWhitespace?: boolean;
}

/**
 * SafeContent component - Displays user-generated content safely
 * Automatically sanitizes content to prevent XSS attacks
 */
export function SafeContent({ content, className, preserveWhitespace = true }: SafeContentProps) {
  const sanitized = sanitizeText(content);

  return (
    <div
      className={className}
      style={preserveWhitespace ? { whiteSpace: 'pre-wrap' } : undefined}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
