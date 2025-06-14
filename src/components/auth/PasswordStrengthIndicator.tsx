
import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
  const calculateStrength = (pass: string): number => {
    let score = 0;
    if (!pass) return 0;

    const checks = [
      pass.length > 7,
      /[a-z]/.test(pass),
      /[A-Z]/.test(pass),
      /\d/.test(pass),
      /[^a-zA-Z\d]/.test(pass),
    ];

    const passedChecks = checks.filter(Boolean).length;

    if (pass.length >= 12 && passedChecks >= 4) {
      score = 5;
    } else if (pass.length >= 8 && passedChecks >= 3) {
      score = 4;
    } else if (pass.length >= 8 && passedChecks >= 2) {
      score = 3;
    } else if (passedChecks >= 2) {
      score = 2;
    } else {
      score = 1;
    }
    
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const widthPercentage = strength * 20;

  return (
    <div className="space-y-1">
      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            strength > 0 ? strengthColors[strength - 1] : ''
          )}
          style={{ width: `${widthPercentage}%` }}
          role="meter"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Password strength: ${strength > 0 ? strengthLabels[strength - 1] : 'Very Weak'}`}
        />
      </div>
      {password && strength > 0 && (
        <p className="text-xs text-muted-foreground">
          Strength: <span className="font-semibold">{strengthLabels[strength - 1]}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
