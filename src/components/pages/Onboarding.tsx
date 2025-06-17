import React, { useState } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    orientation: '',
    relationshipType: '',
    boundaries: [] as string[],
    noGos: [] as string[],
    safeWord: '',
    intensityLevel: 'sweet',
    healthInterests: [] as string[],
    notifications: {
      push: false,
      email: false,
      sms: false,
    },
    consentAcknowledged: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(item)
          ? currentArray.filter(i => i !== item)
          : [...currentArray, item]
      };
    });
  };

  // Step 1: Sexual Orientation & Relationship Type
  const OrientationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Sexual Orientation</h3>
        <div className="space-y-2">
          {[
            'Heterosexual',
            'Homosexual',
            'Bisexual',
            'Pansexual',
            'Asexual',
            'Other',
            'Prefer not to say'
          ].map((option) => (
            <button
              key={option}
              onClick={() => updateFormData('orientation', option.toLowerCase().replace(' ', '_'))}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                formData.orientation === option.toLowerCase().replace(' ', '_')
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <span className="font-sans text-sm">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Relationship Focus</h3>
        <div className="space-y-2">
          {[
            { id: 'sexual', label: 'Sexual intimacy focus', desc: 'Physical and sexual connection' },
            { id: 'asexual', label: 'Asexual relationship', desc: 'Emotional intimacy without sexual focus' },
            { id: 'mixed', label: 'Mixed approach', desc: 'Both sexual and non-sexual intimacy' },
            { id: 'exploring', label: 'Still exploring', desc: 'Learning what works for us' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => updateFormData('relationshipType', option.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                formData.relationshipType === option.id
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-sans text-sm font-medium">{option.label}</div>
              <div className="font-sans text-xs text-gray-400 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Boundaries & Consent
  const BoundariesStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Comfort Boundaries</h3>
        <p className="text-gray-400 text-xs mb-4">Select what you're comfortable exploring together:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Touch & massage',
            'Emotional intimacy',
            'Playful activities',
            'Light exploration',
            'Deep conversations',
            'Shared experiences',
            'Gift giving',
            'Quality time'
          ].map((boundary) => (
            <button
              key={boundary}
              onClick={() => toggleArrayItem('boundaries', boundary)}
              className={`p-3 rounded-lg border text-xs transition-colors ${
                formData.boundaries.includes(boundary)
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {boundary}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Safe Word</h3>
        <input
          type="text"
          placeholder="Choose a safe word..."
          value={formData.safeWord}
          onChange={(e) => updateFormData('safeWord', e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-sans text-sm"
        />
        <p className="text-gray-400 text-xs mt-2">A word to immediately stop any activity</p>
      </div>

      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Intensity Preference</h3>
        <div className="space-y-2">
          {[
            { id: 'sweet', label: 'Sweet & Gentle', desc: 'Tender, romantic, soft approach' },
            { id: 'flirty', label: 'Flirty & Playful', desc: 'Teasing, fun, light-hearted' },
            { id: 'spicy', label: 'Spicy & Bold', desc: 'More adventurous and passionate' },
            { id: 'wild', label: 'Wild & Intense', desc: 'Very passionate and explorative' }
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => updateFormData('intensityLevel', level.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                formData.intensityLevel === level.id
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-sans text-sm font-medium">{level.label}</div>
              <div className="font-sans text-xs text-gray-400 mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 3: Health & Wellness
  const HealthStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Health Interests</h3>
        <p className="text-gray-400 text-xs mb-4">What health topics interest you? (Optional)</p>
        <div className="space-y-2">
          {[
            'Sexual health education',
            'PrEP/PEP information',
            'STI testing reminders',
            'Mental health resources',
            'Telehealth connections',
            'Wellness tracking',
            'Relationship counseling',
            'Body positivity'
          ].map((interest) => (
            <button
              key={interest}
              onClick={() => toggleArrayItem('healthInterests', interest)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                formData.healthInterests.includes(interest)
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <span className="font-sans text-sm">{interest}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Privacy & Notifications
  const PrivacyStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-sans text-sm font-medium mb-3">Notification Preferences</h3>
        <p className="text-gray-400 text-xs mb-4">How would you like to receive discreet reminders?</p>
        
        <div className="space-y-3">
          {[
            { key: 'push', label: 'Push Notifications', desc: 'Discreet alerts on your device' },
            { key: 'email', label: 'Email Reminders', desc: 'Weekly wellness and connection emails' },
            { key: 'sms', label: 'Text Messages', desc: 'Rare, important health reminders only' }
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded-lg">
              <div>
                <div className="text-white font-sans text-sm font-medium">{option.label}</div>
                <div className="text-gray-400 text-xs">{option.desc}</div>
              </div>
              <button
                onClick={() => updateFormData('notifications', {
                  ...formData.notifications,
                  [option.key]: !formData.notifications[option.key as keyof typeof formData.notifications]
                })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.notifications[option.key as keyof typeof formData.notifications]
                    ? 'bg-slate-600'
                    : 'bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.notifications[option.key as keyof typeof formData.notifications]
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-red-deep bg-opacity-20 border border-red-deep rounded-lg">
          <h4 className="text-red-deep font-sans text-sm font-medium mb-2">Privacy Guarantee</h4>
          <ul className="text-gray-300 text-xs space-y-1">
            <li>• All data encrypted end-to-end</li>
            <li>• No sensitive content in notifications</li>
            <li>• Panic lock available anytime</li>
            <li>• Complete data deletion on request</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Step 5: Consent & Final Confirmation
  const ConsentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-white font-serif text-lg font-medium mb-4">Final Step</h3>
        <p className="text-gray-300 text-sm mb-6">Please review and confirm your consent</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
          <h4 className="text-white font-sans text-sm font-medium mb-2">Your Preferences Summary</h4>
          <div className="text-gray-300 text-xs space-y-1">
            <p>Orientation: {formData.orientation.replace('_', ' ')}</p>
            <p>Relationship Type: {formData.relationshipType}</p>
            <p>Intensity Level: {formData.intensityLevel}</p>
            <p>Boundaries: {formData.boundaries.length} selected</p>
            <p>Health Interests: {formData.healthInterests.length} selected</p>
          </div>
        </div>

        <button
          onClick={() => updateFormData('consentAcknowledged', !formData.consentAcknowledged)}
          className={`w-full p-4 rounded-lg border transition-colors ${
            formData.consentAcknowledged
              ? 'bg-slate-600 border-slate-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
              formData.consentAcknowledged ? 'bg-white border-white' : 'border-gray-400'
            }`}>
              {formData.consentAcknowledged && <span className="text-gray-900 text-xs">✓</span>}
            </div>
            <div className="text-left">
              <div className="font-sans text-sm font-medium">I consent and agree</div>
              <div className="font-sans text-xs text-gray-400 mt-1">
                I understand this is a private intimacy app, I'm 18+, and I consent to these preferences. 
                I can change or delete everything anytime.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const steps: OnboardingStep[] = [
    {
      id: 'orientation',
      title: 'Tell us about yourself',
      subtitle: 'Your orientation and relationship style (private & changeable)',
      component: <OrientationStep />
    },
    {
      id: 'boundaries',
      title: 'Set your boundaries',
      subtitle: 'Define what you\'re comfortable with (you control everything)',
      component: <BoundariesStep />
    },
    {
      id: 'health',
      title: 'Health & wellness',
      subtitle: 'Optional health interests and education preferences',
      component: <HealthStep />
    },
    {
      id: 'privacy',
      title: 'Privacy & notifications',
      subtitle: 'How you want to stay connected (always discreet)',
      component: <PrivacyStep />
    },
    {
      id: 'consent',
      title: 'Consent & confirmation',
      subtitle: 'Review your choices and provide final consent',
      component: <ConsentStep />
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep === 0 ? formData.orientation && formData.relationshipType :
                     currentStep === 1 ? formData.boundaries.length > 0 && formData.safeWord :
                     currentStep === 4 ? formData.consentAcknowledged :
                     true;

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs font-sans">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-gray-400 text-xs font-sans">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div 
              className="bg-slate-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <h2 className="text-white font-serif text-xl mb-2">{currentStepData.title}</h2>
          <p className="text-gray-400 font-sans text-sm mb-6">{currentStepData.subtitle}</p>
          {currentStepData.component}
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white font-sans py-3 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          
          <button
            onClick={() => {
              if (isLastStep) {
                // Complete onboarding
                console.log('Onboarding complete:', formData);
                // Navigate to home or partner invitation
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
            disabled={!canProceed}
            className={`flex-1 font-sans py-3 px-6 rounded-lg transition-colors ${
              canProceed
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 