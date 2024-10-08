'use client'
import PurchaseCredit from '@/components/stripe'
import { useState, useEffect, Suspense } from 'react';
import { signOut, GoogleAuthProvider, onAuthStateChanged, getAuth, signInWithPopup, User } from 'firebase/auth';
import { addDoc, updateDoc, doc, getDoc, getFirestore, query, collection, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { app, Priority, PrioriteUser } from '@/utils/firebase'

const db = getFirestore(app);

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState<string>('');
  const [userData, setUserData] = useState<PrioriteUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data() as PrioriteUser);
        } else {
          console.error('User data not found');
        }
      };
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'priorities'), orderBy('votes', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPriorities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Priority)));
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      credits: 0,
    });
  };
  const logout = async () => {
    const auth = getAuth();
    await signOut(auth)
    setUser(null)
  }

  const addPriority = async () => {
    if (!user) {
      alert("Please log in to interact with this list")
      return
    }
    await addDoc(collection(db, 'priorities'), {
      name: newPriority,
      votes: 1
    });
    setNewPriority('');
  };

  const vote = async (id: string, votes: number, isUp: boolean) => {
    if (!user) {
      alert("Please log in to vote")
      return
    }
    const priorityRef = doc(db, 'priorities', id);
    const priority = await getDoc(priorityRef);
    const voters = priority.data()?.voters || [];

    if (!voters.includes(user?.uid)) {
      await updateDoc(priorityRef, {
        votes: votes + (isUp ? 1 : -1),
        voters: [...voters, user?.uid]
      });
    } else {
      // User has already voted
      alert("You've already voted for this priority.");
    }
  };

  return (
    <div className='container mx-auto w-full h-full px-10'>
      <div className='flex justify-between items-center h-[10%]'>
        <span>Welcome {user ? ', ' + user.displayName : '🥸'}</span>
        {user ? (
          <button onClick={logout} className='text-right'>Logout</button>
        ) : (
          <button onClick={signInWithGoogle} className='text-right h-[3rem]'>Sign in with Google</button>
        )}
      </div>
      <h1 className="text-4xl font-bold text-center">Priorite</h1>
      <h2 className="text-3xl font-semibold text-center">Crowdsourced Developmental Priorities List</h2>
      {user && <p>You have {userData?.credits} credits.</p>}
      <div>
        <input type='text' value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className='border rounded' />
        <button onClick={addPriority} className='ml-2 bg-blue-500 text-white rounded px-1'>Add Priority</button>
        <ul>
          {priorities.map(priority => (
            <li key={priority.id} className='my-2'>
              <span className="rounded-full bg-white text-black mx-1 px-1">{priority.votes}</span>
              {priority.name}
              <button onClick={() => vote(priority.id, priority.votes, true)} className='px-1 ml-2 bg-purple-400 text-white rounded'>👍</button>
              <button onClick={() => vote(priority.id, priority.votes, false)} className='px-1 ml-2 bg-purple-600 text-white rounded'>👎</button>
            </li>
          ))}
        </ul>
        <Suspense fallback={<div>Loading...</div>}>
          {user && <PurchaseCredit username={user ? user.email : null}></PurchaseCredit>}
        </Suspense>
      </div>

    </div>
  );
}
export default Home; 
