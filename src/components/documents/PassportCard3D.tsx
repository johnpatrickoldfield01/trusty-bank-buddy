import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface PassportCard3DProps {
  country: string;
  countryCode: string;
  documentNumber: string;
  holderName: string;
  nationality: string;
  dateOfBirth: string;
  sex: string;
  placeOfBirth: string;
  issueDate: string;
  expiryDate: string;
  authority: string;
  passportColor?: string;
}

const PassportCard3D: React.FC<PassportCard3DProps> = ({
  country,
  countryCode,
  documentNumber,
  holderName,
  nationality,
  dateOfBirth,
  sex,
  placeOfBirth,
  issueDate,
  expiryDate,
  authority,
  passportColor = '#006400'
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div
        className={`relative w-full cursor-pointer transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Passport */}
        <div
          className="absolute w-full backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <Card
            className="overflow-hidden shadow-2xl border-none"
            style={{
              background: `linear-gradient(135deg, ${passportColor} 0%, ${passportColor}dd 100%)`,
              aspectRatio: '3/4'
            }}
          >
            <div className="h-full flex flex-col items-center justify-between p-8 text-white">
              {/* National Coat of Arms */}
              <div className="text-center space-y-2">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30">
                  <span className="text-4xl">🇿🇦</span>
                </div>
                <h2 className="text-2xl font-bold tracking-wider">{country.toUpperCase()}</h2>
              </div>

              {/* Passport Text */}
              <div className="text-center space-y-1">
                <p className="text-sm font-light tracking-widest opacity-90">PASSPORT</p>
                <p className="text-xs font-light tracking-widest opacity-75">PASSEPORT</p>
              </div>

              {/* Biometric Symbol */}
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/30">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Back of Passport - Information Page */}
        <div
          className="absolute w-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <Card
            className="overflow-hidden shadow-2xl border-2"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              aspectRatio: '3/4'
            }}
          >
            <div className="h-full p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-gray-300 pb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600">PASSPORT / PASSEPORT</p>
                  <p className="text-lg font-bold text-gray-900">{countryCode}</p>
                </div>
                <div className="w-16 h-20 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
                  PHOTO
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Type / Type</p>
                  <p className="font-mono text-gray-900">P</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Surname / Nom</p>
                  <p className="font-semibold text-gray-900 uppercase">{holderName.split(' ').slice(1).join(' ')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium">Given Names / Prénoms</p>
                  <p className="font-semibold text-gray-900 uppercase">{holderName.split(' ')[0]}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nationality</p>
                    <p className="font-mono text-gray-900">{nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sex / Sexe</p>
                    <p className="font-mono text-gray-900">{sex}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                    <p className="font-mono text-gray-900">{dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Place of Birth</p>
                    <p className="font-mono text-gray-900">{placeOfBirth}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date of Issue</p>
                    <p className="font-mono text-gray-900">{issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date of Expiry</p>
                    <p className="font-mono text-gray-900">{expiryDate}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium">Passport No. / No. du passeport</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{documentNumber}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium">Authority</p>
                  <p className="font-mono text-xs text-gray-900">{authority}</p>
                </div>
              </div>

              {/* Machine Readable Zone */}
              <div className="mt-auto pt-3 border-t-2 border-gray-300">
                <div className="font-mono text-[10px] leading-tight text-gray-700 space-y-0.5">
                  <p>P&lt;{countryCode}&lt;{holderName.replace(/\s/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                  <p>{documentNumber}&lt;{countryCode}{dateOfBirth.replace(/-/g, '')}{sex}&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        Click to flip
      </p>
    </div>
  );
};

export default PassportCard3D;
