import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function useUser() {
    const authToken = localStorage.getItem('Token');
    const [user, setUser] = useState(null);

    const { data, error, mutate } = useSWR(
        authToken ? `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/me/` : null,
        url =>
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            }).then((res) => {
                if (!res.ok && res.status === 401) {
                  const error = new Error('Unauthorized user.');
                        error.info = res.json();
                        error.status = res.status;
                        throw error;
                }
                if (!res.ok) {
                    const error = new Error('An error occurred while fetching the data.');
                          error.info = res.json();
                          error.status = res.status;
                          throw error;
                  }
                return res.json();
              })
            .catch(error => {
                console.error(error);
            }),
        { revalidateOnFocus: false }
    );

    useEffect(() => {
        if (data) {
            setUser(data);
        }
        if (error) {
            setUser(null);
        }
    }, [data, error]);

    return { user, mutate, error };
}
