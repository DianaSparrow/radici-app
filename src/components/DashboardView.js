import React from 'react';
import { getPersonProgress, formatMemberDisplayName, groupMembersByRelationship } from '../utils/documentHelpers';

const DashboardView = ({ 
  user, 
  familyMembers, 
  documents, 
  progressStats, 
  setCurrentView 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
        <div className="flex items-center mb-2">
          <div className="relative mr-3">
            <div className="w-3 h-3 bg-red-300 rounded-full"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-4 bg-green-300 rounded-t-full"></div>
              <div className="w-4 h-3 bg-green-200 rounded-full mx-auto -mt-1"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Ciao, {user?.firstName}!</h1>
        </div>
        <p className="opacity-90">Document management dashboard</p>
      </div>

      <div className="p-6">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Overall Progress</h2>
            <span className="text-2xl font-bold text-yellow-700">{progressStats.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressStats.progressPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{progressStats.completedDocs}</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{progressStats.inProgressDocs}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">{progressStats.totalDocs}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Family Members</h3>
          {familyMembers.map(person => {
            const progress = getPersonProgress(person.id, documents);
            const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
            const groupedMembers = groupMembersByRelationship(familyMembers);
            const displayName = formatMemberDisplayName(person, groupedMembers);
            
            return (
              <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {displayName}
                        {person.isPrimary && ' (You)'}
                        {person.isAncestor && (
                          <span>
                            {' 🇮🇹'}
                            {person.isDeceased === false && ' (Living)'}
                            {person.isDeceased === true && ' (Deceased)'}
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        ID: {person.id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {person.relationship === 'italian_ancestor' ? 'Italian Ancestor' : person.relationship}
                    </p>
                    {(person.birthYear || person.birthState) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {person.birthYear && `Born ${person.birthYear}`}
                        {person.birthYear && person.birthState && ' in '}
                        {person.birthState}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">{progress.completed}/{progress.total}</div>
                    <div className="text-xs text-gray-500">{progressPercent}% complete</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{familyMembers.length}</div>
              <div className="text-xs text-blue-600">Family Members</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {familyMembers.filter(m => m.relationship === 'italian_ancestor').length}
              </div>
              <div className="text-xs text-purple-600">Italian Ancestors</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setCurrentView('documents')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-sm"
          >
            Manage Documents
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCurrentView('family-tree')}
              className="bg-blue-50 text-blue-700 font-medium py-3 rounded-lg hover:bg-blue-100 transition-all duration-200"
            >
              Edit Family
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="bg-gray-50 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Next Steps */}
        {progressStats.totalDocs > 0 && progressStats.completedDocs < progressStats.totalDocs && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Next Steps</h4>
            <p className="text-yellow-700 text-sm mb-3">
              You have {progressStats.totalDocs - progressStats.completedDocs} documents remaining to complete your application.
            </p>
            <button
              onClick={() => setCurrentView('documents')}
              className="text-yellow-700 hover:text-yellow-800 text-sm font-medium underline"
            >
              Continue with documents →
            </button>
          </div>
        )}

        {/* Completion Celebration */}
        {progressStats.totalDocs > 0 && progressStats.completedDocs === progressStats.totalDocs && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h4 className="font-semibold text-green-800 mb-2">All Documents Complete!</h4>
            <p className="text-green-700 text-sm">
              Congratulations! You've gathered all required documents for your Italian citizenship application.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
