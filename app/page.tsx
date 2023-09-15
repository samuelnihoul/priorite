'use client'
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, onAuthStateChanged, getAuth, signInWithPopup, User } from 'firebase/auth';
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
    <div className='font-sans'>
      {user ? (
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <input type='text' value={newPriority} onChange={(e) => setNewPriority(e.target.value)} />
          <button onClick={addPriority}>Add Priority</button>
          <ul>
            {priorities.map(priority => (
              <li key={priority.id}>
                {priority.name} ({priority.votes} votes)
                <button onClick={() => vote(priority.id, priority.votes)}>Vote</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (<>
        <h1>Welcome</h1>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </>
      )}
    </div>
  );
}

export default Home;