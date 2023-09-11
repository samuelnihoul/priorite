import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, onAuthStateChanged, getAuth, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
  const [user, setUser] = useState<firebase.User | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState<string>('');

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    db.collection('priorities').orderBy('votes', 'desc').onSnapshot((snapshot) => {
      setPriorities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Priority)));
    });
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider);
  };

  const addPriority = () => {
    db.collection('priorities').add({
      name: newPriority,
      votes: 1
    });
    setNewPriority('');
  };

  const vote = (id: string, votes: number) => {
    db.collection('priorities').doc(id).update({
      votes: votes + 1
    });
  };

  return (
    <div>
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
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}

export default Home;