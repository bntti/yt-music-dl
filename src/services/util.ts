export const shortenString = (str: string): string => {
    if (str.length > 100) {
        return str.slice(0, 97).trim() + '...';
    }
    return str.trim();
};
