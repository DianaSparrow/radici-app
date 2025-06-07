import React from 'react';
import { ArrowLeft, Trash2, Download, Upload, Info, Users, FileText } from 'lucide-react';

const SettingsView = ({ 
  user, 
  familyMembers, 
  documents, 
  progressStats,
  setCurrentView, 
  clearAllData 
}) => {
  const handleExportData = () => {
    const exportData = {
      user,
      familyMembers,
      documents,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `radici-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Basic validation
        if (!importData.user || !importData.familyMembers || !importData.documents) {
          alert('Invalid data file format');
          return;
        }

        if (window.confirm('This will replace all current data. Are you sure you want to continue?')) {
          // Note: In a real app, this would call import handlers passed as props
          alert('Import functionality would be implemented here');
        }
      } catch (error) {
        alert('Error reading file: Invalid JSON format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-white mb-2 flex items-center hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm opacity-90">Manage your data and app preferences</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Account Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info size={20} />
            Account Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Your Name</span>
              <span className="font-medium">{user?.firstName} {user?.birthLastName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Italian Ancestor</span>
              <span className="font-medium">{user?.ancestorFirstName} {user?.ancestorBirthLastName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Relationship</span>
              <span className="font-medium capitalize">{user?.ancestorType}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Account Created</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Data Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{familyMembers.length}</div>
              <div className="text-sm text-blue-600">Family Members</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{documents.length}</div>
              <div className="text-sm text-green-600">Total Documents</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-bold text-gray-800">{progressStats.progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressStats.progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {progressStats.completedDocs} of {progressStats.totalDocs} documents complete
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
          
          {/* Export Data */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Export Your Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Download a backup of all your family and document information.
            </p>
            <button
              onClick={handleExportData}
              className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={16} />
              Export Data
            </button>
          </div>

          {/* Import Data */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">Import Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Restore from a previously exported backup file.
            </p>
            <label className="w-full bg-gray-500 text-white font-medium py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <Upload size={16} />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          {/* Clear Data */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Clear All Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              This will permanently remove all your family and document information from this session.
            </p>
            <button
              onClick={clearAllData}
              className="w-full bg-red-500 text-white font-medium py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">About Radici.ai</h3>
          <div className="flex items-start space-x-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-4 bg-green-500 rounded-t-full"></div>
                <div className="w-4 h-3 bg-green-400 rounded-full mx-auto -mt-1"></div>
              </div>
            </div>
            <div>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Radici</strong> means "roots" in Italian. We help you trace your Italian roots 
                and organize your citizenship application documents.
              </p>
              <p className="text-gray-600 text-sm mb-3">
                All data is stored in memory during this session for privacy and security.
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>Version 1.0</div>
                <div>Your Italian Roots, Your Rights</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Privacy & Security</h4>
          <p className="text-blue-700 text-sm">
            Your data is stored locally in your browser session and is not transmitted to any servers. 
            When you close this application, your data will be lost unless you export it first.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCurrentView('family-tree')}
              className="bg-green-50 text-green-700 font-medium py-3 rounded-lg hover:bg-green-100 transition-colors"
            >
              Edit Family
            </button>
            <button
              onClick={() => setCurrentView('documents')}
              className="bg-yellow-50 text-yellow-700 font-medium py-3 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              Manage Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
