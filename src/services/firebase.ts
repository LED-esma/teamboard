import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../firebase/config';

// Types
export interface FirebaseDocument {
  id: string;
  title: string;
  url: string;
  type: 'google-drive' | 'google-sheets' | 'external' | 'uploaded';
  author: string;
  authorId: string;
  dateAdded: Timestamp;
  description?: string;
}

export interface FirebaseComment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: Timestamp;
  category: 'general' | 'documents' | 'planning' | 'ideas' | 'questions';
  title?: string;
  documentId?: string;
  taskId?: string;
  parentId?: string;
  tags: string[];
  isPinned?: boolean;
}

export interface FirebaseTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  assigneeId?: string;
  dueDate?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Authentication
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  onAuthStateChange: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Documents
export const firebaseDocuments = {
  getAll: async (): Promise<FirebaseDocument[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'documents'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseDocument[];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },

  add: async (document: Omit<FirebaseDocument, 'id' | 'dateAdded'>): Promise<string | null> => {
    try {
      const docRef = await addDoc(collection(db, 'documents'), {
        ...document,
        dateAdded: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<FirebaseDocument>): Promise<boolean> => {
    try {
      const docRef = doc(db, 'documents', id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'documents', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },

  // Real-time listener
  onSnapshot: (callback: (documents: FirebaseDocument[]) => void) => {
    return onSnapshot(collection(db, 'documents'), (snapshot) => {
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseDocument[];
      callback(documents);
    });
  }
};

// Comments
export const firebaseComments = {
  getAll: async (): Promise<FirebaseComment[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'comments'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseComment[];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },

  getByCategory: async (category: string): Promise<FirebaseComment[]> => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('category', '==', category),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseComment[];
    } catch (error) {
      console.error('Error getting comments by category:', error);
      return [];
    }
  },

  add: async (comment: Omit<FirebaseComment, 'id' | 'timestamp'>): Promise<string | null> => {
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        ...comment,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'comments', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  },

  // Real-time listener
  onSnapshot: (callback: (comments: FirebaseComment[]) => void) => {
    return onSnapshot(collection(db, 'comments'), (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseComment[];
      callback(comments);
    });
  }
};

// Tasks
export const firebaseTasks = {
  getAll: async (): Promise<FirebaseTask[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTask[];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  getByStatus: async (status: string): Promise<FirebaseTask[]> => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTask[];
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return [];
    }
  },

  add: async (task: Omit<FirebaseTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<FirebaseTask>): Promise<boolean> => {
    try {
      const docRef = doc(db, 'tasks', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'tasks', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  // Real-time listener
  onSnapshot: (callback: (tasks: FirebaseTask[]) => void) => {
    return onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTask[];
      callback(tasks);
    });
  }
}; 