interface BethelLogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  subtitle?: string;
}

export function BethelLogo({ variant = 'full', className = '', subtitle = 'Suporte' }: BethelLogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Símbolo Beth hebraico estilizado */}
        <path
          d="M25 20 L25 80 L75 80 C 85 80 90 75 90 65 L90 50 C 90 45 87 40 75 40 L35 40 L35 30 C 35 25 40 20 50 20 L75 20"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Ícone */}
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
        >
          <path
            d="M25 20 L25 80 L75 80 C 85 80 90 75 90 65 L90 50 C 90 45 87 40 75 40 L35 40 L35 30 C 35 25 40 20 50 20 L75 20"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Texto */}
      <div className="flex flex-col">
        <span className="text-xl font-bold leading-tight">Bethel</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground leading-tight">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
