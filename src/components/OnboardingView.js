import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { generateDocumentsForPerson } from '../utils/documentHelpers';

const OnboardingView = ({ onComplete, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    birthLastName: '',
    ancestorFirstName: '',
    ancestorBirthLastName: '',
    ancestorType: 'grandparent',
    includeFamily: [],
    familyCounts: {
      children: 1,
      siblings: 1,
      cousins: 1
    }
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First & middle names are required';
    if (!formData.birthLastName.trim()) newErrors.birthLastName = 'Last name at birth is required';
    if (!formData.ancestorFirstName.trim()) newErrors.ancestorFirstName = 'Ancestor first & middle names are required';
    if (!formData.ancestorBirthLastName.trim()) newErrors.ancestorBirthLastName = 'Ancestor last name at birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      // Create user data
      const userData = {
        firstName: formData.firstName.trim(),
        birthLastName: formData.birthLastName.trim(),
        ancestorFirstName: formData.ancestorFirstName.trim(),
        ancestorBirthLastName: formData.ancestorBirthLastName.trim(),
        ancestorType: formData.ancestorType,
        createdAt: new Date().toISOString()
      };

      // Create family members array starting with self
      const family = [{
        id: 1,
        name: `${formData.firstName.trim()} ${formData.birthLastName.trim()}`,
        relationship: 'self',
        birthYear: '',
        birthState: '',
        isPrimary: true
      }];

      // Add Italian ancestor
      family.push({
        id: 2,
        name: `${formData.ancestorFirstName.trim()} ${formData.ancestorBirthLastName.trim()}`,
        relationship: 'italian_ancestor',
        birthYear: '',
        birthState: 'Italy',
        isPrimary: false,
        isAncestor: true,
        isDeceased: null // Will be set later by user
      });

      let nextId = 3;
      
      // Add spouse (only one spouse allowed)
      if (formData.includeFamily.includes('spouse')) {
        family.push({
          id: nextId++,
          name: '',
          relationship: 'spouse',
          birthYear: '',
          birthState: '',
          isPrimary: false
        });
      }
      
      // Generate family members based on selections
      ['children', 'siblings', 'cousins'].forEach(familyType => {
        if (formData.includeFamily.includes(familyType)) {
          const count = formData.familyCounts[familyType];
          for (let i = 0; i < count; i++) {
            family.push({
              id: nextId++,
              name: '',
              relationship: familyType === 'children' ? 'child' : 
                          familyType === 'siblings' ? 'sibling' :
                          familyType === 'cousins' ? 'cousin' : familyType,
              birthYear: '',
              birthState: '',
              isPrimary: false
            });
          }
        }
      });

      // Generate required documents for each family member
      const allDocs = [];
      family.forEach(person => {
        const personDocs = generateDocumentsForPerson(person);
        allDocs.push(...personDocs);
      });

      // Call completion handler with all data
      onComplete({
        userData,
        familyData: family,
        documentsData: allDocs
      });
    } catch (error) {
      console.error('Error during onboarding:', error);
    }
  };

  const updateFamilyCount = (type, count) => {
    setFormData(prev => ({
      ...prev,
      familyCounts: {
        ...prev.familyCounts,
        [type]: Math.max(1, Math.min(10, count))
      }
    }));
  };

  const toggleFamilyMember = (type) => {
    setFormData(prev => ({
      ...prev,
      includeFamily: prev.includeFamily.includes(type)
        ? prev.includeFamily.filter(f => f !== type)
        : [...prev.includeFamily, type]
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-6 bg-green-500 rounded-t-full"></div>
                  <div className="w-6 h-4 bg-green-400 rounded-full mx-auto -mt-1"></div>
                  <div className="w-4 h-3 bg-green-400 rounded-full mx-auto -mt-1"></div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">radici.ai</h1>
            <p className="text-lg text-gray-700 font-medium mb-2">Your Italian Roots, Your Rights</p>
            <p className="text-gray-600">Your journey to Italian citizenship starts here</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First & middle names</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Marco Antonio"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last name at birth</label>
              <input
                type="text"
                value={formData.birthLastName}
                onChange={(e) => setFormData(prev => ({...prev, birthLastName: e.target.value}))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.birthLastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Rossi"
              />
              {errors.birthLastName && <p className="text-red-500 text-sm mt-1">{errors.birthLastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Italian Ancestor - First & middle names</label>
              <input
                type="text"
                value={formData.ancestorFirstName}
                onChange={(e) => setFormData(prev => ({...prev, ancestorFirstName: e.target.value}))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.ancestorFirstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Giuseppe"
              />
              {errors.ancestorFirstName && <p className="text-red-500 text-sm mt-1">{errors.ancestorFirstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Italian Ancestor - Last name at birth</label>
              <input
                type="text"
                value={formData.ancestorBirthLastName}
                onChange={(e) => setFormData(prev => ({...prev, ancestorBirthLastName: e.target.value}))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.ancestorBirthLastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Rossi"
              />
              {errors.ancestorBirthLastName && <p className="text-red-500 text-sm mt-1">{errors.ancestorBirthLastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to You</label>
              <select
                value={formData.ancestorType}
                onChange={(e) => setFormData(prev => ({...prev, ancestorType: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="parent">Parent</option>
                <option value="grandparent">Grandparent</option>
                <option value="great-grandparent">Great-grandparent</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Document Management</h2>
          <p className="text-gray-600">Whose documents would you like to manage?</p>
          <p className="text-xs text-gray-500 mt-2">Track documents for yourself and family members in your citizenship case</p>
        </div>

        <div className="space-y-4">
          {/* Spouse - Single checkbox, no counter */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includeFamily.includes('spouse')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev, 
                      includeFamily: [...prev.includeFamily, 'spouse']
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev, 
                      includeFamily: prev.includeFamily.filter(f => f !== 'spouse')
                    }));
                  }
                }}
                className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Spouse</span>
                <p className="text-xs text-gray-500">Your current spouse/partner</p>
              </div>
            </label>
          </div>

          {/* Children, Siblings, Cousins - With counters */}
          {['children', 'siblings', 'cousins'].map(familyType => (
            <div key={familyType} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.includeFamily.includes(familyType)}
                    onChange={() => toggleFamilyMember(familyType)}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <div>
                    <span className="text-gray-700 font-medium capitalize">{familyType}</span>
                    {familyType === 'cousins' && (
                      <p className="text-xs text-gray-500">Who share the same Italian ancestor</p>
                    )}
                    {familyType === 'children' && (
                      <p className="text-xs text-gray-500">All your children (biological, adopted, step)</p>
                    )}
                    {familyType === 'siblings' && (
                      <p className="text-xs text-gray-500">Brothers and sisters applying together</p>
                    )}
                  </div>
                </label>
              </div>
              
              {formData.includeFamily.includes(familyType) && (
                <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <button
                    onClick={() => updateFamilyCount(familyType, formData.familyCounts[familyType] - 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{formData.familyCounts[familyType]}</span>
                  <button
                    onClick={() => updateFamilyCount(familyType, formData.familyCounts[familyType] + 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Setting Up Your Documents...' : 'Create Document Checklist'}
          </button>
          <button
            onClick={() => setStep(1)}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-all duration-200"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
