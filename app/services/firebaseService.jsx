import { useContext } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserDetailContext } from '../../context/userDetailContext';

export const SaveUser = async (user, email) => {
    const { setUserDetail } = useContext(UserDetailContext); 
    const data = {
        uid: user?.uid,
        email: email,
    };
    try {
        await setDoc(doc(db, 'users', user.uid), data);
        setUserDetail(data);
        console.log('User saved successfully:', data);
    } catch (error) {
        console.error('Error saving user:', error);
    }
};

export const getUserDetail = async (uid, setUserDetail) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserDetail(userData);
            console.log('User data fetched successfully:', userData);
        } else {
            console.log('No such user found!');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

export default { SaveUser, getUserDetail };