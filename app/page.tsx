'use client'
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { signOut, GoogleAuthProvider, onAuthStateChanged, getAuth, signInWithPopup, User } from 'firebase/auth';
import { addDoc, updateDoc, doc, getDoc, getFirestore, query, collection, orderBy, onSnapshot } from 'firebase/firestore';

interface Priority {
  id: string;
  name: string;
  votes: number;
}

// Initialize Firebase
const app = initializeApp({
  apiKey: 'AIzaSyApX_yIFUXlbiAqFkIk2jP5IghqjNSPyk4',
  authDomain: 'priorite-7dfa1.firebaseapp.com',
  projectId: 'priorite-7dfa1'
});

const db = getFirestore(app);

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState<string>('');

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'priorities'), orderBy('votes', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPriorities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Priority)));
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider);
  };
  const logout = async () => {
    const auth = getAuth();
    await signOut(auth)
    setUser(null)
  }

  const addPriority = async () => {
    await addDoc(collection(db, 'priorities'), {
      name: newPriority,
      votes: 1
    });
    setNewPriority('');
  };

  const vote = async (id: string, votes: number) => {
    const priorityRef = doc(db, 'priorities', id);
    const priority = await getDoc(priorityRef);
    const voters = priority.data()?.voters || [];

    if (!voters.includes(user?.uid)) {
      await updateDoc(priorityRef, {
        votes: votes + 1,
        voters: [...voters, user?.uid]
      });
    } else {
      // User has already voted
      alert("You've already voted for this priority.");
    }
  };

  return (
    <div className='container mx-auto w-full h-[80%]'>
      <div className='flex justify-between items-center'>
        <h1>Welcome {user ? ', ' + user.displayName : ''}</h1>
        {user ? (
          <button onClick={logout} className='text-right'>Logout</button>
        ) : (
          <button onClick={signInWithGoogle} className='text-right h-[3rem]'>Sign in with Google</button>
        )}
      </div>
      {user && (
        <div>
          <input type='text' value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className='border rounded' />
          <button onClick={addPriority} className='ml-2 bg-blue-500 text-white rounded px-1'>Add Priority</button>
          <ul>
            {priorities.map(priority => (
              <li key={priority.id} className='my-2'>
                {priority.name} ({priority.votes} votes)
                <button onClick={() => vote(priority.id, priority.votes)} className='px-1 ml-2 bg-green-500 text-white rounded'>Vote Up</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export default Home; 
