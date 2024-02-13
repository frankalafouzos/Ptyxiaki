import { useAuth, useHistory, useEffect } from 'react';
import useSignOut from 'react-auth-kit/hooks/useSignOut';

const Signout = () => {
    const signout = useSignOut();
    const history = useHistory();
    
    useEffect(() => {
        signout();
        history.push('/');
    }, [signout, history]);
}

module.exports = Signout;