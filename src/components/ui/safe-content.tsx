interface SafeContentProps {
  content: string;
  className?: string;
  preserveWhitespace?: boolean;
}

/**
 * SafeContent component - Displays user-generated content safely
 * React automatically escapes HTML, providing XSS protection
 * No need for manual sanitization or dangerouslySetInnerHTML
 */
export function SafeContent({ content, className, preserveWhitespace = true }: SafeContentProps) {
  return (
    <div
      className={className}
      style={preserveWhitespace ? { whiteSpace: 'pre-wrap' } : undefined}
    >
      {content}
    </div>
  );
}
