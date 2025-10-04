 
export const getUserTokens = async (address: string) => {
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/tokens/${address}`)
        return await result.json();    
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getToken = async (id: string) => {
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/token/${id}`)
        return await result.json();    
    } catch (error) {
        console.log(error);
        return [];
    }
}