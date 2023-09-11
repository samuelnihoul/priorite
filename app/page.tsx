'use client'
import { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID'
  });
}

const db = firebase.firestore();

export default function Home() {
  const [user, setUser] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [newPriority, setNewPriority] = useState('');

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    db.collection('priorities').orderBy('votes', 'desc').onSnapshot((snapshot) => {
      setPriorities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    });
  }, []);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  };

  const addPriority = () => {
    db.collection('priorities').add({
      name: newPriority,
      votes: 1
    });
    setNewPriority('');
  };

  const vote = (id, votes) => {
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