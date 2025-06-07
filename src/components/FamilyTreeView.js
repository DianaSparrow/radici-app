import React, { useState, useMemo } from 'react';
import { ArrowLeft, Settings, Trash2, Plus, Check } from 'lucide-react';
import { groupMembersByRelationship, relationshipLabels, getDocumentsForPerson } from '../utils/documentHelpers';

const FamilyTreeView = ({
  user,
  familyMembers,
  documents,
  setCurrentView,
  updateFamilyMember,
  addFamilyMember,
  removeFamilyMember
}) => {
  const [editingMember, setEditingMember] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberType, setNewMemberType] = useState('');

  const groupedMembers = useMemo(() => groupMembersByRelationship(familyMembers), [familyMembers]);

  const handleSaveMember = (member) => {
    updateFamilyMember(member.id, member);
    setEditingMember(null);
  };

  const handleAddMember = (memberData) => {
    addFamilyMember(memberData);
    setShowAddMember(false);
    setNewMemberType('');
  };

  const allBasicInfoComplete = useMemo(() => {
    return familyMembers.every(member => {
      if (member.relationship === 'italian_ancestor') {
        return member.firstName && member.birthLastName && member.birthMonth && member.birthDay && member.birthYear && member.birthLocation && member.isDeceased !== null;
      }
      return member.firstName && member.birthLastName && member.birthMonth && member.birthDay && member.birthYear && member.birthCity && member.birthState;
    });
  }, [familyMembers]);

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
        <h1 className="text-xl font-bold">Family Information</h1>
        <p className="text-sm opacity-90">Complete your family members' details</p>
      </div>

      <div className="p-6">
        {/* Progress Indicator */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Setup Progress</h3>
            <span className={`text-sm px-3 py-1 rounded-full ${
              allBasicInfoComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {allBasicInfoComplete ? 'Complete' : 'In Progress'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Fill in basic information for all family members before proceeding to documents.
          </p>
          {allBasicInfoComplete && (
            <button
              onClick={() => setCurrentView('documents')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
            >
              Continue to Documents →
            </button>
          )}
        </div>

        {/* Italian Ancestor Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">🇮🇹 Italian-born Ancestor</h3>
          <p className="text-green-700 text-sm">
            <strong>{user?.ancestorFirstName} {user?.ancestorBirthLastName}</strong> - {user?.ancestorType}
          </p>
          <p className="text-green-600 text-xs mt-1">
            All family members below must be able to trace their lineage to this ancestor
          </p>
        </div>

        {/* Family Groups */}
        {Object.entries(groupedMembers).map(([relationship, members]) => {
          if (members.length === 0) return null;
          
          return (
            <div key={relationship} className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {relationshipLabels[relationship]}
                  {members.length > 1 && relationship !== 'self' && relationship !== 'italian_ancestor' && ` (${members.length})`}
                </h3>
                {relationship !== 'self' && relationship !== 'spouse' && relationship !== 'italian_ancestor' && (
                  <button
                    onClick={() => {
                      setNewMemberType(relationship);
                      setShowAddMember(true);
                    }}
                    className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm transition-colors"
                  >
                    <Plus size={16} />
                    Add {relationship === 'child' ? 'Child' : relationship === 'sibling' ? 'Sibling' : 'Cousin'}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.id} className={`bg-white rounded-lg p-4 shadow-sm border ${
                    member.relationship === 'italian_ancestor' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}>
                    {editingMember === member.id ? (
                      <EditMemberForm 
                        member={member}
                        onSave={handleSaveMember}
                        onCancel={() => setEditingMember(null)}
                        setFamilyMembers={(updater) => {
                          const newMembers = updater(familyMembers);
                          const updatedMember = newMembers.find(m => m.id === member.id);
                          if (updatedMember) {
                            Object.assign(member, updatedMember);
                          }
                        }}
                      />
                    ) : (
                      <MemberDisplay 
                        member={member}
                        groupedMembers={groupedMembers}
                        onEdit={() => setEditingMember(member.id)}
                        onRemove={() => removeFamilyMember(member.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add Family Member Modal */}
        {showAddMember && (
          <AddMemberModal 
            memberType={newMemberType}
            user={user}
            onAdd={handleAddMember}
            onCancel={() => {
              setShowAddMember(false);
              setNewMemberType('');
            }}
          />
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setNewMemberType('child');
                setShowAddMember(true);
              }}
              className="bg-blue-50 text-blue-700 py-3 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Child
            </button>
            <button
              onClick={() => {
                setNewMemberType('sibling');
                setShowAddMember(true);
              }}
              className="bg-green-50 text-green-700 py-3 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Sibling
            </button>
          </div>
          <button
            onClick={() => {
              setNewMemberType('cousin');
              setShowAddMember(true);
            }}
            className="w-full mt-3 bg-purple-50 text-purple-700 py-3 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add Cousin
          </button>
        </div>
      </div>
    </div>
  );
};

const MemberDisplay = ({ member, groupedMembers, onEdit, onRemove }) => {
  const formatMemberDisplayName = (member, groupedMembers) => {
    if (member.firstName && member.birthLastName) {
      return `${member.firstName} ${member.birthLastName}`;
    }
    if (member.name) return member.name; // Fallback for old data
    
    const relationshipGroup = groupedMembers[member.relationship] || [];
    const baseTitle = member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1).replace('_', ' ');
    
    if (relationshipGroup.length > 1) {
      const index = relationshipGroup.findIndex(m => m.id === member.id) + 1;
      return `${baseTitle} #${index}`;
    }
    
    return baseTitle;
  };

  const isIncomplete = (!member.firstName && !member.name) || !member.birthLastName || !member.birthMonth || !member.birthDay || !member.birthYear || 
    (member.relationship === 'italian_ancestor' ? 
      (member.isDeceased === null || !member.birthLocation) : 
      (!member.birthCity || !member.birthState));

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-medium ${isIncomplete ? 'text-amber-700' : 'text-gray-800'}`}>
            {formatMemberDisplayName(member, groupedMembers)}
            {member.isPrimary && ' (You)'}
            {member.isAncestor && (
              <span>
                {' 🇮🇹'}
                {member.isDeceased === false && ' (Living)'}
                {member.isDeceased === true && ' (Deceased)'}
              </span>
            )}
            {isIncomplete && <span className="text-amber-600 ml-2">⚠️</span>}
          </h4>
        </div>
        <p className="text-sm text-gray-600 capitalize">
          {member.relationship === 'italian_ancestor' ? 'Italian Ancestor' : member.relationship}
        </p>
        {(member.birthMonth || member.birthDay || member.birthYear || member.birthLocation || member.birthCity || member.birthState) && (
          <p className="text-xs text-gray-500 mt-1">
            {(member.birthMonth && member.birthDay && member.birthYear) && 
              `Born ${member.birthMonth}/${member.birthDay}/${member.birthYear}`}
            {(member.birthMonth && member.birthDay && member.birthYear) && (member.birthLocation || (member.birthCity && member.birthState)) && ' in '}
            {member.relationship === 'italian_ancestor' ? 
              member.birthLocation : 
              (member.birthCity && member.birthState && `${member.birthCity}, ${member.birthState}`)
            }
          </p>
        )}
        {isIncomplete && (
          <p className="text-xs text-amber-600 mt-1">
            Missing: {[
              (!member.firstName && !member.name) && 'first name',
              !member.birthLastName && 'last name at birth',
              !member.birthMonth && 'birth month',
              !member.birthDay && 'birth day',
              !member.birthYear && 'birth year',
              member.relationship === 'italian_ancestor' ? 
                ([
                  !member.birthLocation && 'birth location',
                  member.isDeceased === null && 'living status'
                ].filter(Boolean)) :
                ([
                  !member.birthCity && 'birth city',
                  !member.birthState && 'birth state'
                ].filter(Boolean))
            ].flat().filter(Boolean).join(', ')}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-700 px-2 py-1 transition-colors flex items-center gap-1"
        >
          <Settings size={16} />
          <span className="text-sm font-medium">Edit</span>
        </button>
        {!member.isPrimary && !member.isAncestor && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 p-1 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const EditMemberForm = ({ member, onSave, onCancel, setFamilyMembers }) => {
  const [localMember, setLocalMember] = useState(member);

  const handleSave = () => {
    // Update the legacy name field for backwards compatibility
    const fullName = `${localMember.firstName || ''} ${localMember.birthLastName || ''}`.trim();
    const updatedMember = { ...localMember, name: fullName };
    onSave(updatedMember);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={localMember.firstName || ''}
          onChange={(e) => setLocalMember(prev => ({...prev, firstName: e.target.value}))}
          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          placeholder="First & middle names"
        />
        <input
          type="text"
          value={localMember.birthLastName || ''}
          onChange={(e) => setLocalMember(prev => ({...prev, birthLastName: e.target.value}))}
          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          placeholder="Last name at birth"
        />
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1">
          <input
            type="text"
            value={member.birthMonth || ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ''); // Only digits
              if (value.length === 1 && parseInt(value) > 0) {
                value = '0' + value; // Add leading zero
              }
              if (parseInt(value) > 12) value = '12'; // Max 12
              setFamilyMembers(prev => 
                prev.map(m => m.id === member.id ? {...m, birthMonth: value} : m)
              );
            }}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
            placeholder="MM"
            maxLength="2"
          />
          <input
            type="text"
            value={member.birthDay || ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ''); // Only digits
              if (value.length === 1 && parseInt(value) > 0) {
                value = '0' + value; // Add leading zero
              }
              if (parseInt(value) > 31) value = '31'; // Max 31
              setFamilyMembers(prev => 
                prev.map(m => m.id === member.id ? {...m, birthDay: value} : m)
              );
            }}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
            placeholder="DD"
            maxLength="2"
          />
          <input
            type="text"
            value={member.birthYear || ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ''); // Only digits
              if (value.length > 4) value = value.slice(0, 4); // Max 4 digits
              setFamilyMembers(prev => 
                prev.map(m => m.id === member.id ? {...m, birthYear: value} : m)
              );
            }}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
            placeholder="YYYY"
            maxLength="4"
          />
        </div>
        
        {/* Location Fields - Conditional based on relationship */}
        {member.relationship === 'italian_ancestor' ? (
          <input
            type="text"
            value={member.birthLocation || ''}
            onChange={(e) => setFamilyMembers(prev => 
              prev.map(m => m.id === member.id ? {...m, birthLocation: e.target.value} : m)
            )}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
            placeholder="Italian city/province"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={member.birthCity || ''}
              onChange={(e) => setFamilyMembers(prev => 
                prev.map(m => m.id === member.id ? {...m, birthCity: e.target.value} : m)
              )}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
              placeholder="US City"
            />
            <input
              type="text"
              value={member.birthState || ''}
              onChange={(e) => {
                let value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ''); // Only letters, uppercase
                if (value.length > 2) value = value.slice(0, 2); // Max 2 characters
                setFamilyMembers(prev => 
                  prev.map(m => m.id === member.id ? {...m, birthState: value} : m)
                );
              }}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
              placeholder="ST"
              maxLength="2"
            />
          </div>
        )}
      </div>
      
      {member.relationship === 'italian_ancestor' && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Is {(member.firstName && member.birthLastName) ? `${member.firstName} ${member.birthLastName}` : 'this ancestor'} still living?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name={`deceased-${member.id}`}
                checked={member.isDeceased === false}
                onChange={() => setFamilyMembers(prev => 
                  prev.map(m => m.id === member.id ? {...m, isDeceased: false} : m)
                )}
                className="mr-2"
              />
              <span className="text-sm">Yes, still living</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`deceased-${member.id}`}
                checked={member.isDeceased === true}
                onChange={() => setFamilyMembers(prev => 
                  prev.map(m => m.id === member.id ? {...m, isDeceased: true} : m)
                )}
                className="mr-2"
              />
              <span className="text-sm">Deceased</span>
            </label>
          </div>
          {member.isDeceased === false && (
            <p className="text-xs text-blue-600 mt-2">
              ✓ Death certificate not required for living ancestors
            </p>
          )}
          {member.isDeceased === true && (
            <p className="text-xs text-orange-600 mt-2">
              Death certificate will be added to document list
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
        >
          <Check size={16} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const AddMemberModal = ({ memberType, user, onAdd, onCancel }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const firstName = formData.get('firstName');
    const birthLastName = formData.get('birthLastName');
    const fullName = `${firstName} ${birthLastName}`.trim();
    
    onAdd({
      firstName,
      birthLastName,
      name: fullName, // For backwards compatibility
      relationship: memberType,
      birthMonth: formData.get('birthMonth'),
      birthDay: formData.get('birthDay'),
      birthYear: formData.get('birthYear'),
      birthCity: formData.get('birthCity'),
      birthState: formData.get('birthState')
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">
          Add {memberType === 'child' ? 'Child' : memberType === 'sibling' ? 'Sibling' : 'Cousin'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="firstName"
                type="text"
                placeholder="First & middle names"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                required
              />
              <input
                name="birthLastName"
                type="text"
                placeholder="Last name at birth"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input
                name="birthMonth"
                type="text"
                placeholder="MM"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
                maxLength="2"
              />
              <input
                name="birthDay"
                type="text"
                placeholder="DD"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
                maxLength="2"
              />
              <input
                name="birthYear"
                type="text"
                placeholder="YYYY"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-center"
                maxLength="4"
              />
              <input
                name="birthState"
                type="text"
                placeholder="Birth state/country"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              This {memberType} must be able to trace their lineage to <strong>{user?.ancestorFirstName} {user?.ancestorBirthLastName}</strong>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyTreeView;
