import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

const useAuthStore = create((set) => ({
  user: null,
  profileImage: null,
  fullName: '',
  email: '',
  currency: '',

  setUser: (user) =>
    set({
      user,
      profileImage: user?.photoURL || null,
      fullName: user?.displayName || '',
      email: user?.email || '',

    }),

  setProfileImage: (photoURL) => set({ profileImage: photoURL }),

  setFullName: (fullName) => set({ fullName }),

  setEmail: (email)=> set({email }),

  setCurrency: (currency)=>set({currency}),

  listenToAuthChanges: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({
          user,
          profileImage: user.photoURL || null,
          fullName: user.displayName || '',
          email: user.email || '',
          currency: '',
        });
      } else {
        set({ user: null, profileImage: null, fullName: '', email: '' , currency: ''});
      }
    });
  },
}));

export default useAuthStore;
