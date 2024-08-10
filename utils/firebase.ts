import { initializeApp } from 'firebase/app';
// Initialize Firebase
export const app = initializeApp({
    apiKey: 'AIzaSyApX_yIFUXlbiAqFkIk2jP5IghqjNSPyk4',
    authDomain: 'priorite-7dfa1.firebaseapp.com',
    projectId: 'priorite-7dfa1'
});

export interface User {
    name: string;
    credits: number;
    id: string
}
export interface Priority {
    voters: string[];
    id: string;
    name: string;
    votes: number;
}