import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useReportStore = create(
    persist(
        (set) => ({
            incidentDetails: {
                date: '',
                location: '',
                department: '',
                nature: [],
                description: '',
                frequency: '',
            },
            accusedDetails: {
                designation: '',
                gender: '',
                department: '',
            },
            evidenceFiles: [], // Volatile: holds actual file objects
            contactDetails: {
                phone: '',
                language: '',
            },

            setIncidentDetails: (updates) => set((state) => ({
                incidentDetails: { ...state.incidentDetails, ...updates }
            })),

            setAccusedDetails: (updates) => set((state) => ({
                accusedDetails: { ...state.accusedDetails, ...updates }
            })),

            setEvidenceFiles: (files) => set({ evidenceFiles: files }),

            setContactDetails: (updates) => set((state) => ({
                contactDetails: { ...state.contactDetails, ...updates }
            })),

            clearReportDraft: () => set({
                incidentDetails: { date: '', location: '', department: '', nature: [], description: '', frequency: '' },
                accusedDetails: { designation: '', gender: '', department: '' },
                evidenceFiles: [],
                contactDetails: { phone: '', language: '' }
            }),
        }),
        {
            name: 'safevoice-draft', // localStorage key
            partialize: (state) => ({
                // We only persist text data. File objects cannot be persisted easily.
                incidentDetails: state.incidentDetails,
                accusedDetails: state.accusedDetails,
                contactDetails: state.contactDetails,
            }),
        }
    )
);
